"""
Contradiction / Logic Agent for AURA pipeline.
Detects internal contradictions between claims, and claim-vs-evidence numeric/date/entity conflicts.
Enforces guardrails from AGENTS.md §6.
"""

from typing import List, Optional
from app.agents.base import BaseVerificationAgent
from app.agents.skills import detect_numeric_date_conflict, detect_logical_conflict
from app.schemas.schemas import Claim, Evidence, VerificationResult


class ContradictionAgent(BaseVerificationAgent):
    """
    Contradiction / Logic Agent.
    Evaluates claims and evidence for logical, date, or numeric conflicts.
    """

    def __init__(self, model_name: str = "fixed-v1"):
        super().__init__(agent_name="contradiction", model_name=model_name)

    def run(self, claim: Claim, evidence: List[Evidence]) -> VerificationResult:
        """
        Runs contradiction check on a single claim against retrieved evidence passages.
        """
        try:
            if not evidence:
                return VerificationResult(
                    claim_id=claim.id,
                    agent="contradiction",
                    verdict="n/a",
                    confidence=0.0,
                    evidence_refs=[],
                    rationale="No evidence available for contradiction check."
                )

            contradicting_refs = []
            for ev in evidence:
                if detect_numeric_date_conflict(claim.text, ev.text) or detect_logical_conflict(claim.text, ev.text):
                    contradicting_refs.append(ev.source_id)

            if contradicting_refs:
                return VerificationResult(
                    claim_id=claim.id,
                    agent="contradiction",
                    verdict="contradicted",
                    confidence=0.85,
                    evidence_refs=contradicting_refs,
                    rationale=f"Contradiction detected for claim '{claim.id}' with evidence sources: {', '.join(contradicting_refs)}"
                )

            return VerificationResult(
                claim_id=claim.id,
                agent="contradiction",
                verdict="supported",
                confidence=0.8,
                evidence_refs=[e.source_id for e in evidence],
                rationale=f"No contradiction found between claim '{claim.id}' and retrieved evidence."
            )

        except Exception as err:
            # Guardrail: ambiguous/error cases default to n/a rather than false-positive contradicted
            return VerificationResult(
                claim_id=claim.id,
                agent="contradiction",
                verdict="n/a",
                confidence=0.0,
                evidence_refs=[],
                rationale=f"contradiction_check_error: {str(err)}"
            )

    def run_pair_check(self, claim_a: Claim, claim_b: Claim) -> Optional[VerificationResult]:
        """
        Checks for internal contradiction between two claims in the claim set.
        """
        try:
            if detect_numeric_date_conflict(claim_a.text, claim_b.text) or detect_logical_conflict(claim_a.text, claim_b.text):
                return VerificationResult(
                    claim_id=claim_a.id,
                    agent="contradiction",
                    verdict="contradicted",
                    confidence=0.9,
                    evidence_refs=[claim_b.id],
                    rationale=f"Internal contradiction detected between claim '{claim_a.id}' and claim '{claim_b.id}'"
                )
            return None
        except Exception:
            return None
