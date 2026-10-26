"""
Evaluator node and conditional routing for AURA LangGraph workflow.
"""

from typing import Any, Dict, List
from app.schemas.schemas import AuraState, VerificationResult, ReliabilityReport
from app.agents.evaluator_agent import EvaluatorAgent


def evaluate_node(state: AuraState) -> Dict[str, Any]:
    """
    Evaluate Node: Aggregates verification results into a ReliabilityReport.
    Pure deterministic logic (AGENTS.md §7).
    """
    verifications = list(state.verifications.values())
    evaluator = EvaluatorAgent()
    report = evaluator.evaluate(verifications)
    return {"reliability": report}


def route_after_evaluate(state: AuraState) -> str:
    """
    Conditional routing edge after evaluate/short-circuit.
    Enforces loop safety & iteration cap (AGENTS.md §1).
    - If iteration >= max_iterations: routes to 'response'
    - If bucket == 'reliable': routes to 'response'
    - If bucket in ('borderline', 'unreliable', 'unresolved'): routes to 'repair'
    """
    if state.iteration >= state.max_iterations:
        return "to_response"

    bucket = state.reliability.bucket if state.reliability else "unresolved"

    if bucket == "reliable":
        return "to_response"

    return "to_repair"
