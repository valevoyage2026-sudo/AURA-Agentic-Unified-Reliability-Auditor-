"""
Self-Repair node and conditional routing for AURA LangGraph workflow.
"""

from typing import Any, Dict, List
from app.schemas.schemas import AuraState
from app.agents.self_repair import SelfRepairAgent


def repair_node(state: AuraState) -> Dict[str, Any]:
    """
    Repair Node: Applies Self-Repair Agent to rewrite unreliable claims
    and hedge borderline/insufficient evidence claims (AGENTS.md §8).
    Increments state.iteration for bounded loop enforcement.
    """
    repair_agent = SelfRepairAgent()
    refined_text, new_edits = repair_agent.apply_edits(
        original_text=state.original_text,
        claims=state.claims,
        verifications=state.verifications,
        evidence=state.evidence
    )
    new_iteration = state.iteration + 1
    total_edits = list(state.edits) + new_edits

    return {
        "original_text": refined_text,
        "refined_text": refined_text,
        "edits": total_edits,
        "iteration": new_iteration
    }


def route_after_repair(state: AuraState) -> str:
    """
    Conditional routing edge after repair.
    - If iteration < max_iterations, mode is 'generate_and_audit', and edits were made:
      loops back to 'plan' to re-decompose and verify the refined text.
    - Otherwise routes to 'response' for terminal generation.
    """
    if state.iteration < state.max_iterations and state.mode == "generate_and_audit" and state.edits:
        return "to_recheck"
    return "to_response"
