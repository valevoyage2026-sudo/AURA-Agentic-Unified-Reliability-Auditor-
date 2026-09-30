"""
Response Refinement / Self-Repair Agent (AGENTS.md §8).
Rewrites unreliable/contradicted claims, hedges borderline/insufficient evidence claims,
and leaves reliable claims untouched.
"""

import logging
from typing import Dict, List, Tuple, Any, Optional
from app.schemas.schemas import Claim, Evidence, VerificationResult

logger = logging.getLogger(__name__)


class SelfRepairAgent:
    """
    Self-Repair Agent responsible for targeted refinement of claims in original text.
    """

    def rewrite_claim(
        self,
        claim: Claim,
        verification: Optional[VerificationResult],
        evidence_list: List[Evidence]
    ) -> Tuple[str, str, str]:
        """
        Determines the replacement text and reason code for a single claim.
        Returns tuple of (replacement_text, reason_code, action_taken).
        """
        if not verification:
            # Default fallback for unverified / un-evaluated claims
            return (
                f"[Unverified claim: {claim.text}]",
                "UNVERIFIED_CLAIM_HEDGED",
                "hedged"
            )

        verdict = verification.verdict

        if verdict in ("supported", "n/a"):
            # Reliable / supported claims preserved verbatim
            return (claim.text, "VERBATIM_PRESERVED", "preserved")

        elif verdict in ("contradicted", "invalid"):
            # Claim is unreliable/invalid. Try to construct a rewrite using evidence if available.
            supporting_evidence = [
                ev for ev in evidence_list
                if ev.confidence >= 0.5 and ev.text.strip()
            ]
            if supporting_evidence:
                best_ev = max(supporting_evidence, key=lambda x: x.confidence)
                replacement = f"{best_ev.text.strip()} [Corrected based on source: {best_ev.source_id}]"
                return (replacement, "CONTRADICTION_REWRITTEN_WITH_EVIDENCE", "rewritten")
            else:
                # No safe evidence exists to rewrite with; remove claim and insert explicit uncertainty note
                replacement = f"[Claim removed due to unreliability/contradiction: {claim.text}]"
                return (replacement, "UNRELIABLE_CLAIM_REMOVED", "removed")

        elif verdict in ("insufficient_evidence", "weak_attribution"):
            # Hedge claim with explicit caveat
            replacement = f"[Insufficient evidence: {claim.text}]"
            return (replacement, "INSUFFICIENT_EVIDENCE_HEDGED", "hedged")

        else:
            # Fallback hedging
            replacement = f"[Caveat: {claim.text}]"
            return (replacement, "GENERAL_CAVEAT_ADDED", "hedged")

    def apply_edits(
        self,
        original_text: str,
        claims: List[Claim],
        verifications: Dict[str, VerificationResult],
        evidence: Dict[str, List[Evidence]]
    ) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Applies claim-level refinements to the original text.
        Returns (refined_text, list_of_edits).
        """
        if not claims:
            return (original_text, [])

        edits: List[Dict[str, Any]] = []
        # Sort claims by starting char span in reverse order to perform replacement without invalidating previous offsets
        sorted_claims = sorted(claims, key=lambda c: c.char_span[0], reverse=True)
        refined_text = original_text

        for claim in sorted_claims:
            # Find matching verification result for claim
            verdict_result: Optional[VerificationResult] = None
            for key, vres in verifications.items():
                if vres.claim_id == claim.id or key.startswith(f"{claim.id}_"):
                    verdict_result = vres
                    break

            ev_list = evidence.get(claim.id, [])
            replacement, reason, action = self.rewrite_claim(claim, verdict_result, ev_list)

            if action != "preserved":
                start_char, end_char = claim.char_span
                # Perform span replacement safely
                before = refined_text[:start_char]
                after = refined_text[end_char:]
                refined_text = f"{before}{replacement}{after}"

                edits.append({
                    "claim_id": claim.id,
                    "span": claim.char_span,
                    "original": claim.text,
                    "replacement": replacement,
                    "reason_code": reason,
                    "action": action
                })

        # Reverse edits list so it matches original reading order
        edits.reverse()
        return (refined_text, edits)
