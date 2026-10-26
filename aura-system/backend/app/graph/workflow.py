"""
LangGraph StateGraph Workflow for AURA pipeline.
Implements:
- Dual Modes: 'generate_and_audit' (query answering + iterative re-check) vs 'audit_only' (document auditing)
- All Verification Agents: FactVerificationAgent, CitationVerificationAgent, ContradictionAgent
- Bounded re-check loops, zero-evidence short-circuiting, self-repair, and response generation
Enforces guardrails from AGENTS.md §1, §4, §5, §6, §8, §9 and Architecture.md §3.1.
"""

from typing import Any, Dict, List, Optional
from langgraph.graph import StateGraph, START, END

from app.schemas.schemas import AuraState, Claim, Evidence, VerificationResult, ReliabilityReport
from app.graph.planner import decompose_claims
from app.graph.evaluator import evaluate_node, route_after_evaluate
from app.graph.repair import repair_node, route_after_repair
from app.agents.fact_agent import FactVerificationAgent
from app.agents.citation_agent import CitationVerificationAgent
from app.agents.logic_agent import ContradictionAgent
from app.agents.evaluator_agent import EvaluatorAgent
from app.agents.self_repair import SelfRepairAgent
from app.agents.response_generator import ResponseGenerator
from app.agents.generator_agent import DraftGeneratorAgent

try:
    from app.retrieval.hybrid_retriever import HybridRetriever
except ImportError:
    # Fallback placeholder if retrieval dependencies (fastembed) are not present in test environment
    class HybridRetriever:  # type: ignore
        def __init__(self, *args, **kwargs):
            pass

        def retrieve(self, query_text: str, **kwargs) -> Dict[str, Any]:
            return {"evidence": [], "partial_retrieval": True}


def generate_candidate_node(state: AuraState) -> Dict[str, Any]:
    """
    Generate Candidate Node (Architecture.md §3.1).
    In 'generate_and_audit' mode: generates an initial grounded candidate response
    for a raw user query before claim decomposition and verification.
    In 'audit_only' mode: no-op, passes through the input text directly.
    """
    if state.mode == "generate_and_audit" and state.candidate_text is None:
        retriever = HybridRetriever()
        res = retriever.retrieve(query_text=state.original_text)
        ev_context = res.get("evidence", [])

        generator = DraftGeneratorAgent()
        candidate = generator.generate_candidate(query=state.original_text, context=ev_context)

        return {
            "query": state.original_text,
            "candidate_text": candidate,
            "original_text": candidate
        }

    return {}


def plan_node(state: AuraState) -> Dict[str, Any]:
    """
    Plan Node: Decomposes original_text into atomic typed claims.
    """
    claims = decompose_claims(state.original_text)
    return {"claims": claims}


def retrieve_node(state: AuraState) -> Dict[str, Any]:
    """
    Retrieve Node: Fetches evidence for each claim using HybridRetriever.
    """
    retriever = HybridRetriever()
    evidence_map: Dict[str, List[Evidence]] = {}

    for claim in state.claims:
        res = retriever.retrieve(query_text=claim.text)
        evidence_list = res.get("evidence", [])
        evidence_map[claim.id] = evidence_list

    return {"evidence": evidence_map}


def check_evidence_availability(state: AuraState) -> str:
    """
    Conditional edge: Checks if any evidence was retrieved across all claims.
    If zero evidence across all claims -> short_circuit directly to unresolved.
    """
    if not state.claims:
        return "zero_evidence"

    total_evidence_count = sum(len(evs) for evs in state.evidence.values())
    if total_evidence_count == 0:
        return "zero_evidence"

    return "has_evidence"


def short_circuit_node(state: AuraState) -> Dict[str, Any]:
    """
    Short Circuit Node: Bypasses LLM verification when zero evidence exists across all claims.
    Marks all claims as insufficient_evidence and overall reliability as unresolved.
    """
    verification_map: Dict[str, VerificationResult] = {}
    for claim in state.claims:
        key = f"{claim.id}_fact"
        verification_map[key] = VerificationResult(
            claim_id=claim.id,
            agent="fact",
            verdict="insufficient_evidence",
            confidence=0.0,
            evidence_refs=[],
            rationale="Zero evidence retrieved across all sources (short-circuit)."
        )

    report = ReliabilityReport(
        score=0.0,
        bucket="unresolved",
        contributing_agents=["fact"]
    )
    return {
        "verifications": verification_map,
        "reliability": report
    }


def verify_node(state: AuraState) -> Dict[str, Any]:
    """
    Verify Node: Evaluates claims against retrieved evidence using specific agents.
    Invokes FactVerificationAgent, CitationVerificationAgent, and ContradictionAgent (AGENTS.md §4, §5, §6).
    Skips subjective and unverifiable claims.
    """
    verification_map: Dict[str, VerificationResult] = {}
    fact_agent = FactVerificationAgent()
    citation_agent = CitationVerificationAgent()
    contradiction_agent = ContradictionAgent()

    # 1. Claim-level checks against evidence
    for claim in state.claims:
        ev_list = state.evidence.get(claim.id, [])
        if claim.type == "citation":
            result = citation_agent.run(claim, ev_list)
            key = f"{claim.id}_{result.agent}"
            verification_map[key] = result
        elif claim.type in ("factual-atomic", "factual-compound"):
            result = fact_agent.run(claim, ev_list)
            key = f"{claim.id}_{result.agent}"
            verification_map[key] = result

            # Contradiction check: claim vs evidence numeric/date/logical conflicts
            if ev_list:
                c_res = contradiction_agent.run(claim, ev_list)
                if c_res.verdict == "contradicted":
                    verification_map[f"{claim.id}_{c_res.agent}"] = c_res
        elif claim.type in ("subjective", "unverifiable"):
            continue

    # 2. Relational pairwise contradiction check across all claims in set (AGENTS.md §6)
    if len(state.claims) > 1:
        for i in range(len(state.claims)):
            for j in range(i + 1, len(state.claims)):
                pair_res = contradiction_agent.run_pair_check(state.claims[i], state.claims[j])
                if pair_res:
                    verification_map[f"{state.claims[i].id}_{state.claims[j].id}_contradiction"] = pair_res

    return {"verifications": verification_map}


def response_node(state: AuraState) -> Dict[str, Any]:
    """
    Response Node: Produces final user-facing text plus visible reliability summary
    and annotations, ensuring caveats are never stripped (AGENTS.md §9).
    """
    generator = ResponseGenerator()
    refined = state.refined_text or state.original_text
    response_payload = generator.generate_response(
        state=state,
        refined_text=refined,
        edits=state.edits
    )

    # Attach original user query if mode was generate_and_audit
    if state.query:
        response_payload["query"] = state.query
    response_payload["mode"] = state.mode

    return {
        "final_response": response_payload,
        "refined_text": refined
    }


# ==============================================================================
# LangGraph Workflow Definition & Compilation
# ==============================================================================

workflow = StateGraph(AuraState)

# Register Nodes
workflow.add_node("generate_candidate", generate_candidate_node)
workflow.add_node("plan", plan_node)
workflow.add_node("retrieve", retrieve_node)
workflow.add_node("short_circuit", short_circuit_node)
workflow.add_node("verify", verify_node)
workflow.add_node("evaluate", evaluate_node)
workflow.add_node("repair", repair_node)
workflow.add_node("response", response_node)

# Linear entry edges: START -> generate_candidate -> plan -> retrieve
workflow.add_edge(START, "generate_candidate")
workflow.add_edge("generate_candidate", "plan")
workflow.add_edge("plan", "retrieve")

# Conditional edge after retrieval: zero-evidence short-circuit vs verification
workflow.add_conditional_edges(
    "retrieve",
    check_evidence_availability,
    {
        "zero_evidence": "short_circuit",
        "has_evidence": "verify"
    }
)

# Verify proceeds to evaluate
workflow.add_edge("verify", "evaluate")

# Route after short-circuit: repair hedges unverified claims, or goes to response if capped
workflow.add_conditional_edges(
    "short_circuit",
    route_after_evaluate,
    {
        "to_repair": "repair",
        "to_response": "response"
    }
)

# Route after evaluation: reliable routes to response, unreliable/borderline routes to repair
workflow.add_conditional_edges(
    "evaluate",
    route_after_evaluate,
    {
        "to_repair": "repair",
        "to_response": "response"
    }
)

# Route after repair: loop back to plan for re-check if within iteration cap, else response
workflow.add_conditional_edges(
    "repair",
    route_after_repair,
    {
        "to_recheck": "plan",
        "to_response": "response"
    }
)

# Terminal edge
workflow.add_edge("response", END)

# Compiled LangGraph state machine
app_graph = workflow.compile()
