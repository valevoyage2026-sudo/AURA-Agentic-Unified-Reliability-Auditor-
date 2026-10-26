from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.schemas import (
    DocumentIngestRequest,
    DocumentIngestResponse,
    DocumentListItem,
    DocumentListResponse,
    DeleteDocumentResponse,
    SyncCampusDocsResponse,
    AuditReportListItem,
    AuditReportsListResponse,
    CampusMetricsResponse,
    AuditReportRequest,
    ComplianceAuditReport,
    AuditExportRequest,
    AuditExportResponse,
    LinkIngestRequest,
    PipelineConfig,
    DomainProfile
)
from app.core.compliance_service import compliance_service
from app.core.auth import (
    require_knowledge_admin,
    require_document_auditor,
    require_telemetry_viewer,
    AuthenticatedUser,
    get_current_user
)
from app.api.v1.router import api_v1_router

app = FastAPI(
    title="AURA - Enterprise Agentic Reliability & Compliance Auditor",
    version="0.2.0",
    description="AURA System API Backend for Enterprise High-Stakes Document Auditing"
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "AURA Enterprise Agentic Unified Reliability & Compliance Auditor",
        "positioning": "Enterprise High-Stakes Report & Compliance Auditor"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/v1/documents/ingest", response_model=DocumentIngestResponse)
def ingest_document(req: DocumentIngestRequest):
    """Ingests high-stakes document text into knowledge repository."""
    return compliance_service.ingest_document(req)

@app.post("/v1/documents/ingest_link", response_model=DocumentIngestResponse)
def ingest_link(req: LinkIngestRequest):
    """Ingests external URL or regulatory web link resource."""
    return compliance_service.ingest_link(req)

@app.post("/v1/documents/upload_file", response_model=DocumentIngestResponse)
async def upload_file(
    file: UploadFile = File(...),
    domain: str = Form("general"),
    source_trust_tier: int = Form(1)
):
    """Ingests uploaded document file (CSV, PDF, TXT, MD) into knowledge base."""
    contents = await file.read()
    try:
        text_content = contents.decode("utf-8", errors="ignore")
    except Exception:
        text_content = f"Binary resource file: {file.filename} (Size: {len(contents)} bytes)"

    ingest_req = DocumentIngestRequest(
        title=file.filename or "Uploaded Resource File",
        domain=domain if domain in ("financial", "academic", "legal", "healthcare", "regulatory") else "general",
        content=text_content,
        source_trust_tier=source_trust_tier,
        metadata={"filename": file.filename or "file", "size_bytes": str(len(contents))}
    )
    return compliance_service.ingest_document(ingest_req)

@app.get("/v1/config/pipeline", response_model=PipelineConfig)
def get_pipeline_config():
    """Gets configuration for every agent in the AURA pipeline."""
    return compliance_service.get_pipeline_config()

@app.post("/v1/config/pipeline", response_model=PipelineConfig)
def update_pipeline_config(config: PipelineConfig):
    """Updates configuration settings for every agent in the AURA pipeline."""
    return compliance_service.update_pipeline_config(config)

@app.post("/v1/audit/report", response_model=ComplianceAuditReport)
def generate_audit_report(req: AuditReportRequest):
    """Audits a high-stakes report against domain rules and ground truth evidence."""
    return compliance_service.audit_report(req)

@app.post("/v1/audit/export", response_model=AuditExportResponse)
def export_audit_certificate(req: AuditExportRequest):
    """Exports a cryptographically signed compliance audit certificate (JSON or Markdown)."""
    return compliance_service.export_audit_certificate(req)


# ==============================================================================
# Ground-Truth Administration Endpoints (Officer Only - manage_knowledge_base)
# ==============================================================================

@app.post("/v1/documents/ground_truth/upload", response_model=DocumentIngestResponse)
async def upload_ground_truth(
    file: UploadFile = File(...),
    domain: str = Form("academic"),
    source_trust_tier: int = Form(1),
    user: AuthenticatedUser = Depends(require_knowledge_admin)
):
    """
    Officer-only endpoint: Ingests an official university policy document into authoritative ground truth.
    Chunks, embeds, and indexes into Qdrant & Knowledge Vault.
    """
    contents = await file.read()
    try:
        text_content = contents.decode("utf-8", errors="ignore")
    except Exception:
        text_content = f"Binary resource file: {file.filename} (Size: {len(contents)} bytes)"

    ingest_req = DocumentIngestRequest(
        title=file.filename or "Official Campus Policy",
        domain=domain if domain in ("financial", "academic", "legal", "healthcare", "regulatory") else "academic",
        content=text_content,
        source_trust_tier=source_trust_tier,
        metadata={"filename": file.filename or "policy", "uploader_role": "officer", "size_bytes": str(len(contents))}
    )
    return compliance_service.ingest_document(ingest_req)


@app.get("/v1/documents/ground_truth/list", response_model=DocumentListResponse)
def list_ground_truth_documents(
    domain: Optional[str] = None,
    user: AuthenticatedUser = Depends(require_knowledge_admin)
):
    """Officer-only: Returns inventory of all active ground truth documents."""
    return compliance_service.list_ground_truth_documents(domain=domain)


@app.get("/v1/documents/ground_truth/{doc_id}", response_model=DocumentListItem)
def get_ground_truth_document(
    doc_id: str,
    user: AuthenticatedUser = Depends(require_knowledge_admin)
):
    """Officer-only: Retrieves metadata for a specific ground truth document."""
    doc = compliance_service.get_ground_truth_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Ground truth document '{doc_id}' not found.")
    return doc


@app.delete("/v1/documents/ground_truth/{doc_id}", response_model=DeleteDocumentResponse)
def delete_ground_truth_document(
    doc_id: str,
    user: AuthenticatedUser = Depends(require_knowledge_admin)
):
    """Officer-only: Deactivates and removes a ground truth document from authoritative retrieval."""
    return compliance_service.delete_ground_truth_document(doc_id)


@app.post("/v1/documents/ground_truth/sync", response_model=SyncCampusDocsResponse)
def sync_ground_truth(
    user: AuthenticatedUser = Depends(require_knowledge_admin)
):
    """Officer-only: Idempotently reconciles ground truth policies from campus_docs directory."""
    return compliance_service.sync_ground_truth_documents()


# ==============================================================================
# Student & User Document Verification Endpoint (audit_documents)
# ==============================================================================

@app.post("/v1/documents/verify_upload", response_model=ComplianceAuditReport)
async def verify_uploaded_document(
    file: UploadFile = File(...),
    domain: str = Form("academic"),
    user: AuthenticatedUser = Depends(require_document_auditor)
):
    """
    Student / User endpoint: Parses an uploaded document and audits its claims against authoritative ground truth.
    CRITICAL INVARIANT: The submitted document is NEVER indexed or persisted as ground truth.
    """
    contents = await file.read()
    return compliance_service.verify_uploaded_document(
        file_bytes=contents,
        filename=file.filename or "student_document",
        domain=domain if domain in ("financial", "academic", "legal", "healthcare", "regulatory") else "academic"
    )


# ==============================================================================
# Audit History & Campus Telemetry Endpoints
# ==============================================================================

@app.get("/v1/audit/reports", response_model=AuditReportsListResponse)
def list_audit_reports(
    domain: Optional[str] = None,
    user: AuthenticatedUser = Depends(get_current_user)
):
    """Lists executed audit reports within the caller's authorized scope."""
    return compliance_service.list_audit_reports(domain=domain)


@app.get("/v1/audit/metrics", response_model=CampusMetricsResponse)
def get_campus_metrics(
    user: AuthenticatedUser = Depends(require_telemetry_viewer)
):
    """Officer-only: Returns aggregated campus compliance metrics."""
    return compliance_service.get_campus_metrics()


# Mount legacy and core verification router at the end to ensure literal path routes take precedence
app.include_router(api_v1_router)




