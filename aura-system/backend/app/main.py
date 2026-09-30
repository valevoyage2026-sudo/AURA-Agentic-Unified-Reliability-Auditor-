from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.schemas import (
    DocumentIngestRequest,
    DocumentIngestResponse,
    AuditReportRequest,
    ComplianceAuditReport,
    AuditExportRequest,
    AuditExportResponse,
    LinkIngestRequest,
    PipelineConfig,
    VerifyRequest,
    VerifyResponse,
    AuraState
)
from app.core.compliance_service import compliance_service
from app.graph.workflow import app_graph

app = FastAPI(
    title="AURA - Enterprise Agentic Reliability & Compliance Auditor",
    version="0.2.0",
    description="AURA System API Backend for Enterprise High-Stakes Document Auditing"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        domain=domain if domain in ("financial", "legal", "healthcare", "regulatory") else "general",
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

@app.post("/v1/verify", response_model=VerifyResponse)
def verify_pipeline(req: VerifyRequest):
    """Runs standard LangGraph multi-agent verification graph."""
    import uuid
    trace_id = f"trace_{uuid.uuid4().hex[:12]}"
    initial_state = AuraState(
        original_text=req.text,
        mode=req.mode,
        trace_id=trace_id
    )
    final_output = app_graph.invoke(initial_state)
    
    # Handle dict or state output
    if isinstance(final_output, dict):
        state_obj = AuraState(**final_output) if "original_text" in final_output else initial_state
        reliability = final_output.get("reliability")
    else:
        state_obj = final_output
        reliability = getattr(final_output, "reliability", None)
        
    return VerifyResponse(
        trace_id=trace_id,
        status="completed",
        reliability=reliability,
        state=state_obj
    )

