"""
Fact Verification Agent for AURA pipeline.
Determines whether a claim is supported, contradicted, or unsupported by retrieved evidence.
Enforces guardrails from AGENTS.md §4.
"""

from typing import List
from app.agents.base import BaseVerificationAgent
from app.agents.skills import check_entailment
from app.schemas.schemas import Claim, Evidence, VerificationResult


class FactVerificationAgent(BaseVerificationAgent):
    """
    Fact Verification Agent.
    Evaluates factual atomic/compound claims against retrieved vector/graph evidence.
    """

    def __init__(self, model_name: str = "fixed-v1"):
        super().__init__(agent_name="fact", model_name=model_name)

    def run(self, claim: Claim, evidence: List[Evidence]) -> VerificationResult:
        """
        Runs factual verification on claim using retrieved evidence.
        """
        try:
            # Guardrail 1: Empty evidence list -> MUST return insufficient_evidence, NEVER contradicted.
            if not evidence:
                return VerificationResult(
                    claim_id=claim.id,
                    agent="fact",
                    verdict="insufficient_evidence",
                    confidence=0.0,
                    evidence_refs=[],
                    rationale="Insufficient evidence: No retrieved evidence available to verify claim."
                )

            # Perform evidence-bound entailment check
            verdict, confidence, evidence_refs, rationale = check_entailment(claim.text, evidence)

            # Guardrail 2: rationale must cite specific evidence_refs if refs are present
            if evidence_refs and not any(ref in rationale for ref in evidence_refs):
                rationale = f"{rationale} (Evidence refs: {', '.join(evidence_refs)})"

            return VerificationResult(
                claim_id=claim.id,
                agent="fact",
                verdict=verdict,
                confidence=confidence,
                evidence_refs=evidence_refs,
                rationale=rationale
            )

        except Exception as err:
            # Fallback mode on malformed execution
            return VerificationResult(
                claim_id=claim.id,
                agent="fact",
                verdict="insufficient_evidence",
                confidence=0.0,
                evidence_refs=[],
                rationale=f"verification_error: {str(err)}"
            )
