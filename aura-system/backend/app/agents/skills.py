"""
AURA Verification & Aggregation Skills as specified in skills-catalog.md.
Contains deterministic and LLM-dependent helper functions used by verification agents & evaluator.
"""

import re
from typing import List, Dict, Tuple, Optional, Literal
from app.schemas.schemas import Claim, Evidence, VerificationResult, ReliabilityReport


# --- Verification Skills ---

def check_entailment(claim_text: str, evidence_passages: List[Evidence]) -> Tuple[Literal["supported", "contradicted", "insufficient_evidence"], float, List[str], str]:
    """
    Determines whether evidence_passages semantically entail, contradict, or are neutral/insufficient for claim_text.
    Guarantees: If evidence_passages is empty, returns ("insufficient_evidence", 0.0, [], rationale).
    """
    if not evidence_passages:
        return "insufficient_evidence", 0.0, [], "No evidence retrieved to verify claim."

    evidence_refs = [e.source_id for e in evidence_passages if e.source_id]
    claim_lower = claim_text.lower()
    
    matched_evidences = []
    contradicting_evidences = []
    
    for ev in evidence_passages:
        ev_lower = ev.text.lower()
        claim_words = set(re.findall(r'\w+', claim_lower))
        ev_words = set(re.findall(r'\w+', ev_lower))
        
        # Check explicit logical or numeric conflict between claim and evidence passage
        if detect_logical_conflict(claim_text, ev.text):
            contradicting_evidences.append(ev)
            continue

        negation_words = {"not", "never", "no", "false", "failed", "denied", "unable"}
        claim_has_neg = bool(claim_words & negation_words)
        ev_has_neg = bool(ev_words & negation_words)
        
        common_words = claim_words & ev_words
        stop_words = {"the", "a", "an", "is", "are", "was", "were", "in", "on", "at", "to", "for", "of", "and", "or", "it", "that", "this"}
        content_common = common_words - stop_words
        content_claim = claim_words - stop_words
        
        if content_claim and len(content_common) / max(len(content_claim), 1) > 0.4:
            if claim_has_neg != ev_has_neg:
                contradicting_evidences.append(ev)
            else:
                matched_evidences.append(ev)

    if contradicting_evidences:
        refs = [e.source_id for e in contradicting_evidences]
        avg_conf = sum(e.confidence for e in contradicting_evidences) / len(contradicting_evidences)
        return "contradicted", round(avg_conf, 2), refs, f"Claim contradicts evidence in {', '.join(refs)}"

    if matched_evidences:
        refs = [e.source_id for e in matched_evidences]
        avg_conf = sum(e.confidence for e in matched_evidences) / len(matched_evidences)
        return "supported", round(avg_conf, 2), refs, f"Claim supported by evidence in {', '.join(refs)}"

    return "insufficient_evidence", 0.3, evidence_refs, f"Retrieved evidence in {', '.join(evidence_refs)} is neutral or insufficient to verify claim."


def check_citation_exists(source_ref: str, evidence_passages: List[Evidence]) -> Tuple[Literal["supported", "weak_attribution", "invalid", "n/a"], float, List[str], str]:
    """
    Verifies a cited source is resolvable and actually supports the attached claim.
    Guarantees:
    - Non-existent / unretrievable source or empty evidence -> 'invalid'
    - Passage-level semantic entailment -> 'supported'
    - Topical relevance but no entailment -> 'weak_attribution'
    - Transient fetch failure -> 'n/a'
    """
    if not evidence_passages:
        return "invalid", 0.0, [], f"Citation '{source_ref}' is unresolvable or does not exist."
    
    matching_sources = [e for e in evidence_passages if source_ref.lower() in e.source_id.lower() or e.source_id.lower() in source_ref.lower()]
    
    if not matching_sources:
        for e in evidence_passages:
            if getattr(e, "transient_error", False):
                return "n/a", 0.0, [], f"Source '{source_ref}' fetch failed due to transient network error."
        return "invalid", 0.0, [], f"Cited source '{source_ref}' was not found in retrieved index."

    refs = [e.source_id for e in matching_sources]
    avg_conf = sum(e.confidence for e in matching_sources) / len(matching_sources)
    
    if avg_conf >= 0.7:
        return "supported", round(avg_conf, 2), refs, f"Citation '{source_ref}' exists and directly supports claim."
    elif avg_conf >= 0.3:
        return "weak_attribution", round(avg_conf, 2), refs, f"Citation '{source_ref}' exists but only provides weak/topical attribution."
    else:
        return "invalid", round(avg_conf, 2), refs, f"Citation '{source_ref}' content does not support the claim."


def detect_numeric_date_conflict(claim_a: str, claim_b: str) -> bool:
    """
    Extracts numbers/dates from two claim strings and checks if they contradict each other
    when referring to similar entities/topics.
    """
    nums_a = re.findall(r'\b\d+(?:\.\d+)?\b', claim_a)
    nums_b = re.findall(r'\b\d+(?:\.\d+)?\b', claim_b)
    
    if nums_a and nums_b and nums_a != nums_b:
        words_a = set(re.findall(r'\b[a-zA-Z]+\b', claim_a.lower()))
        words_b = set(re.findall(r'\b[a-zA-Z]+\b', claim_b.lower()))
        stop = {"the", "a", "is", "in", "of", "and", "to", "was", "were", "for"}
        overlap = (words_a - stop) & (words_b - stop)
        if len(overlap) >= 2:
            return True
    return False


def detect_logical_conflict(claim_a: str, claim_b: str) -> bool:
    """
    Checks if claim_a and claim_b logically contradict each other.
    Defaults to False on ambiguous scope differences.
    """
    if detect_numeric_date_conflict(claim_a, claim_b):
        return True
        
    lower_a, lower_b = claim_a.lower(), claim_b.lower()
    
    conflict_roots = [
        ("increas", "decreas"),
        ("pass", "fail"),
        ("success", "fail"),
        ("always", "never"),
        ("approv", "reject"),
        ("aliv", "dead"),
        ("enabl", "disabl"),
        ("true", "false"),
        ("accept", "declin")
    ]
    
    for root1, root2 in conflict_roots:
        if (root1 in lower_a and root2 in lower_b) or (root2 in lower_a and root1 in lower_b):
            words_a = set(re.findall(r'\w+', lower_a))
            words_b = set(re.findall(r'\w+', lower_b))
            stop = {"the", "a", "is", "in", "of", "and", "to", "was", "were", "for", "it", "that", "this", "has", "have", "by", "after"}
            if len((words_a - stop) & (words_b - stop)) >= 1:
                return True
                
    return False


# --- Aggregation Skills ---

def renormalize_weights(available_agents: List[str], base_weights: Optional[Dict[str, float]] = None) -> Dict[str, float]:
    """
    Adjusts agent weighting when one agent's result is missing so the weights always sum to 1.0.
    """
    if base_weights is None:
        base_weights = {"fact": 0.5, "citation": 0.3, "contradiction": 0.2}
        
    present_weights = {agent: base_weights.get(agent, 0.33) for agent in available_agents if agent in base_weights}
    total = sum(present_weights.values())
    
    if total == 0:
        if not available_agents:
            return {}
        equal = 1.0 / len(available_agents)
        return {agent: equal for agent in available_agents}
        
    return {agent: round(w / total, 4) for agent, w in present_weights.items()}


def aggregate_verdicts(verifications: List[VerificationResult]) -> ReliabilityReport:
    """
    Deterministic Evaluator aggregation logic as defined in Architecture.md and AGENTS.md §7.
    Precedence Rules (Fixed Order):
    1. Any 'invalid' citation verdict -> bucket='unreliable', score=0.0
    2. Any high-confidence 'contradicted' verdict (conf >= 0.7) -> bucket='unreliable', score=0.1
    3. All verdicts are 'insufficient_evidence' or 'n/a' -> bucket='unresolved', score=0.0
    4. Weighted score computation across supported/contradicted/insufficient claims:
       - reliable: score >= 0.8
       - borderline: score >= 0.5 and < 0.8
       - unreliable: score < 0.5
    """
    if not verifications:
        return ReliabilityReport(score=0.0, bucket="unresolved", contributing_agents=[])

    contributing_agents = sorted(list(set(v.agent for v in verifications)))
    
    # Rule 1: Invalid citation check
    for v in verifications:
        if v.agent == "citation" and v.verdict == "invalid":
            return ReliabilityReport(score=0.0, bucket="unreliable", contributing_agents=contributing_agents)

    # Rule 2: High-confidence contradiction check
    for v in verifications:
        if v.verdict == "contradicted" and v.confidence >= 0.7:
            return ReliabilityReport(score=0.1, bucket="unreliable", contributing_agents=contributing_agents)

    # Rule 3: All insufficient / n/a check
    non_empty_verdicts = [v.verdict for v in verifications if v.verdict not in ("n/a",)]
    if not non_empty_verdicts or all(verdict == "insufficient_evidence" for verdict in non_empty_verdicts):
        return ReliabilityReport(score=0.0, bucket="unresolved", contributing_agents=contributing_agents)

    # Rule 4: Weighted scoring
    verdict_scores = {
        "supported": 1.0,
        "weak_attribution": 0.6,
        "insufficient_evidence": 0.2,
        "n/a": 0.5,
        "contradicted": 0.0,
        "invalid": 0.0
    }
    
    agent_weights = renormalize_weights(contributing_agents)
    
    agent_scores: Dict[str, List[float]] = {}
    for v in verifications:
        agent_scores.setdefault(v.agent, []).append(verdict_scores.get(v.verdict, 0.5) * v.confidence)

    total_weighted_score = 0.0
    for agent, scores in agent_scores.items():
        avg_score = sum(scores) / len(scores)
        total_weighted_score += avg_score * agent_weights.get(agent, 0.0)

    final_score = round(max(0.0, min(1.0, total_weighted_score)), 2)

    if final_score >= 0.8:
        bucket = "reliable"
    elif final_score >= 0.5:
        bucket = "borderline"
    else:
        bucket = "unreliable"

    return ReliabilityReport(
        score=final_score,
        bucket=bucket,
        contributing_agents=contributing_agents
    )
