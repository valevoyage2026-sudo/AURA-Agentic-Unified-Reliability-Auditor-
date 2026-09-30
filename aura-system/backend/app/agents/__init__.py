"""
AURA Agents Package.
Exposes Verification Agents and Evaluator.
"""

from app.agents.base import BaseVerificationAgent
from app.agents.fact_agent import FactVerificationAgent
from app.agents.citation_agent import CitationVerificationAgent
from app.agents.logic_agent import ContradictionAgent
from app.agents.evaluator_agent import EvaluatorAgent
from app.agents.skills import (
    check_entailment,
    check_citation_exists,
    detect_numeric_date_conflict,
    detect_logical_conflict,
    aggregate_verdicts,
    renormalize_weights,
)

__all__ = [
    "BaseVerificationAgent",
    "FactVerificationAgent",
    "CitationVerificationAgent",
    "ContradictionAgent",
    "EvaluatorAgent",
    "check_entailment",
    "check_citation_exists",
    "detect_numeric_date_conflict",
    "detect_logical_conflict",
    "aggregate_verdicts",
    "renormalize_weights",
]
