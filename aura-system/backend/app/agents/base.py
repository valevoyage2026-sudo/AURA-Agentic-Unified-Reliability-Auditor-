"""
Base Verification Agent interface as specified in AGENTS.md and Aura_Week1_Implementation_plan.md.
All verification agents inherit from BaseVerificationAgent and enforce a uniform interface.
"""

from abc import ABC, abstractmethod
from typing import List, Optional
from app.schemas.schemas import Claim, Evidence, VerificationResult


class BaseVerificationAgent(ABC):
    """
    Abstract base class for all AURA Verification Agents (Fact, Citation, Contradiction).
    Enforces standard input (Claim, List[Evidence]) and output (VerificationResult) contracts.
    """

    def __init__(self, agent_name: str, model_name: Optional[str] = None) -> None:
        self.agent_name = agent_name
        self.model_name = model_name or "fixed-v1"

    @abstractmethod
    def run(self, claim: Claim, evidence: List[Evidence]) -> VerificationResult:
        """
        Executes verification logic for a given claim and retrieved evidence.
        Must return a valid VerificationResult and never raise an uncaught exception.
        """
        pass
