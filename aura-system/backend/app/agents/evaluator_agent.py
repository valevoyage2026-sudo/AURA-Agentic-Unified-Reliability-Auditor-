"""
Reliability / Evaluator Agent for AURA pipeline.
Aggregates all VerificationResults into a single ReliabilityReport per claim or overall state.
Purely deterministic Python code with fixed precedence rules and zero LLM calls, as required by AGENTS.md §7.
"""

from typing import List, Dict
from app.agents.skills import aggregate_verdicts
from app.schemas.schemas import VerificationResult, ReliabilityReport


class EvaluatorAgent:
    """
    Reliability / Evaluator Agent.
    Aggregates verification results into a deterministic ReliabilityReport.
    """

    def evaluate(self, verifications: List[VerificationResult]) -> ReliabilityReport:
        """
        Runs deterministic aggregation over verification results.
        """
        return aggregate_verdicts(verifications)

    def evaluate_by_claim(self, verifications: List[VerificationResult]) -> Dict[str, ReliabilityReport]:
        """
        Computes reliability report aggregated per claim_id.
        """
        by_claim: Dict[str, List[VerificationResult]] = {}
        for v in verifications:
            by_claim.setdefault(v.claim_id, []).append(v)

        return {claim_id: aggregate_verdicts(results) for claim_id, results in by_claim.items()}
