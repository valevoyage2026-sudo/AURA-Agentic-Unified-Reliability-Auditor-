"""
LangGraph StateGraph Workflow for AURA pipeline (Task 2).
Defines node functions (plan_node, retrieve_node, verify_node, evaluate_node)
and compiles the basic linear StateGraph structure.
"""

from typing import Any, Dict, List
from langgraph.graph import StateGraph, START, END

from app.schemas.schemas import AuraState, Claim, Evidence, VerificationResult, ReliabilityReport
from app.graph.planner import decompose_claims
from app.agents.fact_agent import FactVerificationAgent
from app.agents.citation_agent import CitationVerificationAgent
from app.agents.evaluator_agent import EvaluatorAgent

try:
    from app.retrieval.hybrid_retriever import HybridRetriever
except ImportError:
    # Fallback placeholder if retrieval dependencies (fastembed) are not present in test environment
    class HybridRetriever:  # type: ignore
        def __init__(self, *args, **kwargs):
            pass

        def retrieve(self, query_text: str, **kwargs) -> Dict[str, Any]:
            return {"evidence": [], "partial_retrieval": True}


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


def verify_node(state: AuraState) -> Dict[str, Any]:
    """
    Verify Node: Evaluates claims against retrieved evidence using specific agents.
    Skips subjective and unverifiable claims.
    """
    verification_map: Dict[str, VerificationResult] = {}
    fact_agent = FactVerificationAgent()
    citation_agent = CitationVerificationAgent()

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
        elif claim.type in ("subjective", "unverifiable"):
            continue

    return {"verifications": verification_map}


def evaluate_node(state: AuraState) -> Dict[str, Any]:
    """
    Evaluate Node: Aggregates verification results into a ReliabilityReport.
    """
    verifications = list(state.verifications.values())
    evaluator = EvaluatorAgent()
    report = evaluator.evaluate(verifications)
    return {"reliability": report}


# Construct StateGraph
workflow = StateGraph(AuraState)

workflow.add_node("plan", plan_node)
workflow.add_node("retrieve", retrieve_node)
workflow.add_node("verify", verify_node)
workflow.add_node("evaluate", evaluate_node)

workflow.add_edge(START, "plan")
workflow.add_edge("plan", "retrieve")
workflow.add_edge("retrieve", "verify")
workflow.add_edge("verify", "evaluate")
workflow.add_edge("evaluate", END)

# Compiled graph object
app_graph = workflow.compile()
