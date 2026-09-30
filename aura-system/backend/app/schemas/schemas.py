"""
Shared data contracts for AURA pipeline as specified in AGENTS.md and Architecture.md.
Frozen by Dev 4 for Week 1 foundation.
"""

from typing import Literal, Optional, List, Dict
from pydantic import BaseModel, Field


ClaimType = Literal["factual-atomic", "factual-compound", "citation", "subjective", "unverifiable"]


class Claim(BaseModel):
    id: str = Field(description="Canonical claim identifier, e.g., claim_a1b2c3d4e5f6")
    text: str = Field(description="Verbatim text span extracted from original text")
    type: ClaimType
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


DomainProfile = Literal["general", "legal", "financial", "healthcare", "regulatory"]


class DocumentIngestRequest(BaseModel):
    title: str = Field(description="Title of document or regulatory filing")
    domain: DomainProfile = Field(default="general", description="Target domain for compliance rules")
    content: str = Field(description="Raw text or formatted text of document")
    source_trust_tier: int = Field(default=1, ge=1, le=3, description="1=Primary/Curated, 2=Secondary, 3=Unvetted")
    metadata: Dict[str, str] = Field(default_factory=dict, description="Custom document metadata tags")


class DocumentIngestResponse(BaseModel):
    doc_id: str
    title: str
    domain: DomainProfile
    total_chunks: int
    source_trust_tier: int
    status: str
    timestamp: str


class AuditReportRequest(BaseModel):
    document_text: str = Field(description="High-stakes report or document content to audit")
    domain: DomainProfile = Field(default="general")
    title: Optional[str] = Field(default="Untitled High-Stakes Audit Report")


class ComplianceAuditReport(BaseModel):
    trace_id: str
    document_title: str
    domain: DomainProfile
    overall_score: float
    bucket: Literal["reliable", "borderline", "unreliable", "unresolved"]
    total_claims: int
    reliable_claims_count: int
    borderline_claims_count: int
    unreliable_claims_count: int
    claims_breakdown: List[Dict]
    audit_hash: str
    timestamp: str


class AuditExportRequest(BaseModel):
    trace_id: str
    format: Literal["json", "markdown"] = "json"


class AuditExportResponse(BaseModel):
    trace_id: str
    format: Literal["json", "markdown"]
    audit_certificate_hash: str
    certificate_content: str
    timestamp: str


class LinkIngestRequest(BaseModel):
    url: str = Field(description="Web URL or regulatory reference link to ingest")
    title: Optional[str] = Field(default=None, description="Optional title for link resource")
    domain: DomainProfile = Field(default="general")
    source_trust_tier: int = Field(default=1, ge=1, le=3)


# --- Agent Configuration Models ---

class OrchestratorConfig(BaseModel):
    max_iterations: int = Field(default=2, ge=1, le=10)
    mode: Literal["generate_and_audit", "audit_only"] = "audit_only"
    audit_store_persist: bool = True


class PlannerConfig(BaseModel):
    granularity: Literal["atomic", "clause-level", "table-level"] = "clause-level"
    model_name: str = Field(default="gemini-1.5-pro")


class RetrievalConfig(BaseModel):
    min_similarity: float = Field(default=0.75, ge=0.0, le=1.0)
    top_k: int = Field(default=5, ge=1, le=20)
    graph_max_depth: int = Field(default=2, ge=1, le=5)
    source_trust_tier_min: int = Field(default=1, ge=1, le=3)


class FactAgentConfig(BaseModel):
    temperature: float = Field(default=0.0, ge=0.0, le=1.0)
    strictly_evidence_bound: bool = True
    model_name: str = Field(default="gemini-1.5-pro")


class CitationAgentConfig(BaseModel):
    entailment_strictness: Literal["strict_passage", "topic_relevance"] = "strict_passage"
    unresolvable_as_invalid: bool = True


class LogicAgentConfig(BaseModel):
    numeric_date_tolerance: float = Field(default=0.0, ge=0.0, le=0.1)
    strict_contradiction_override: bool = True


class EvaluatorConfig(BaseModel):
    weight_fact: float = Field(default=0.5, ge=0.0, le=1.0)
    weight_citation: float = Field(default=0.2, ge=0.0, le=1.0)
    weight_contradiction: float = Field(default=0.3, ge=0.0, le=1.0)
    threshold_reliable: float = Field(default=0.75, ge=0.0, le=1.0)
    threshold_borderline: float = Field(default=0.50, ge=0.0, le=1.0)


class SelfRepairConfig(BaseModel):
    hedging_strategy: Literal["explicit_uncertainty_note", "evidence_rewrite"] = "explicit_uncertainty_note"
    max_repairs: int = Field(default=2, ge=1, le=5)


class PipelineConfig(BaseModel):
    orchestrator: OrchestratorConfig = Field(default_factory=OrchestratorConfig)
    planner: PlannerConfig = Field(default_factory=PlannerConfig)
    retrieval: RetrievalConfig = Field(default_factory=RetrievalConfig)
    fact_agent: FactAgentConfig = Field(default_factory=FactAgentConfig)
    citation_agent: CitationAgentConfig = Field(default_factory=CitationAgentConfig)
    logic_agent: LogicAgentConfig = Field(default_factory=LogicAgentConfig)
    evaluator: EvaluatorConfig = Field(default_factory=EvaluatorConfig)
    self_repair: SelfRepairConfig = Field(default_factory=SelfRepairConfig)


