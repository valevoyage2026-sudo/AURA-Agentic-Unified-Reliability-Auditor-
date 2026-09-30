"""
Citation Verification Agent for AURA pipeline.
Validates that cited sources exist, are retrievable, and support the attached claim.
Enforces guardrails from AGENTS.md §5.
"""

import re
from typing import List
from app.agents.base import BaseVerificationAgent
from app.agents.skills import check_citation_exists
from app.schemas.schemas import Claim, Evidence, VerificationResult


class CitationVerificationAgent(BaseVerificationAgent):
    """
    Citation Verification Agent.
    Evaluates citation-type claims against source references and retrieved passages.
    """

    def __init__(self, model_name: str = "fixed-v1"):
        super().__init__(agent_name="citation", model_name=model_name)

    def _extract_source_ref(self, claim_text: str) -> str:
        """Helper to extract citation bracket or source name from claim text."""
        match = re.search(r'\[(.*?)\]', claim_text)
        if match:
            return match.group(1).strip()
        return claim_text.strip()

    def run(self, claim: Claim, evidence: List[Evidence]) -> VerificationResult:
        """
        Runs citation verification on claim using retrieved evidence.
        """
        try:
            source_ref = self._extract_source_ref(claim.text)

            # Guardrail 1: Non-existent or empty evidence -> ALWAYS invalid
            if not evidence:
                return VerificationResult(
                    claim_id=claim.id,
                    agent="citation",
                    verdict="invalid",
                    confidence=0.0,
                    evidence_refs=[],
                    rationale=f"Citation '{source_ref}' is unresolvable or unretrievable."
                )

            verdict, confidence, evidence_refs, rationale = check_citation_exists(source_ref, evidence)

            return VerificationResult(
                claim_id=claim.id,
                agent="citation",
                verdict=verdict,
                confidence=confidence,
                evidence_refs=evidence_refs,
                rationale=rationale
            )

        except Exception as err:
            return VerificationResult(
                claim_id=claim.id,
                agent="citation",
                verdict="n/a",
                confidence=0.0,
                evidence_refs=[],
                rationale=f"citation_fetch_error: {str(err)}"
            )
