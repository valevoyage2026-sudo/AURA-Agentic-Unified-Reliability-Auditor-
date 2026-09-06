"""
Shared data contracts for AURA pipeline as specified in AGENTS.md and Architecture.md.
Frozen by Dev 4 for Week 1 foundation.
"""

from typing import Literal, Optional, List, Dict
from pydantic import BaseModel, Field


class Claim(BaseModel):
    id: str = Field(description="Canonical claim identifier, e.g., claim_a1b2c3d4e5f6")
    text: str = Field(description="Verbatim text span extracted from original text")
    type: Literal["factual-atomic", "factual-compound", "citation", "subjective", "unverifiable"]
    char_span: tuple[int, int] = Field(description="Span offset (start_char, end_char) in original text")
    depends_on: List[str] = Field(default_factory=list, description="IDs of parent claims if decomposed")


class Evidence(BaseModel):
    source_id: str = Field(description="ID of document or graph node source")
    text: str = Field(description="Extracted passage text or relationship triple string")
    retrieval_method: Literal["vector", "graph"]
    confidence: float = Field(ge=0.0, le=1.0, description="Similarity or path strength score")
    source_trust_tier: int = Field(ge=1, le=3, description="1=primary/curated, 2=secondary, 3=unvetted")
    last_verified: Optional[str] = Field(default=None, description="ISO timestamp of last verification")


class VerificationResult(BaseModel):
    claim_id: str
    agent: Literal["fact", "citation", "contradiction"]
    verdict: Literal["supported", "contradicted", "insufficient_evidence", "invalid", "weak_attribution", "n/a"]
    confidence: float = Field(ge=0.0, le=1.0)
    evidence_refs: List[str] = Field(default_factory=list, description="IDs of Evidence items used")
    rationale: str = Field(description="Short audit explanation of the verdict")


class ReliabilityReport(BaseModel):
    score: float = Field(ge=0.0, le=1.0)
    bucket: Literal["reliable", "borderline", "unreliable", "unresolved"]
    contributing_agents: List[str] = Field(default_factory=list)


class AuraState(BaseModel):
    mode: Literal["generate_and_audit", "audit_only"] = "audit_only"
    original_text: str
    claims: List[Claim] = Field(default_factory=list)
    evidence: Dict[str, List[Evidence]] = Field(default_factory=dict)
    verifications: Dict[str, VerificationResult] = Field(default_factory=dict)
    reliability: Optional[ReliabilityReport] = None
    iteration: int = 0
    max_iterations: int = 2
    trace_id: str


class VerifyRequest(BaseModel):
    text: str = Field(description="Text or LLM response to be audited")
    mode: Literal["generate_and_audit", "audit_only"] = "audit_only"


class VerifyResponse(BaseModel):
    trace_id: str
    status: str
    reliability: Optional[ReliabilityReport]
    state: AuraState
