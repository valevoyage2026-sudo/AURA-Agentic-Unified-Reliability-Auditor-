"""
Unit and Integration Tests for AURA Enterprise Compliance Auditor.
Tests Document Ingestion, Domain Rules, Audit Report Generation, and Audit Certificate Export.
"""

import pytest
from app.schemas.schemas import (
    DocumentIngestRequest,
    AuditReportRequest,
    AuditExportRequest
)
from app.core.compliance_service import compliance_service, INGESTED_DOCUMENTS_STORE, COMPLIANCE_AUDIT_STORE
from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)


def test_document_ingestion():
    """Test ingesting high-stakes legal document into knowledge repository."""
    req = DocumentIngestRequest(
        title="Master Services Agreement (MSA) 2026",
        domain="legal",
        content="Section 4.1: Data processing must comply with GDPR and HIPAA mandates. Section 8.2: Maximum liability is capped at $5,000,000.",
        source_trust_tier=1,
        metadata={"author": "Legal Dept", "version": "v2.1"}
    )
    res = compliance_service.ingest_document(req)
    
    assert res.status == "ingested_and_indexed"
    assert res.domain == "legal"
    assert res.title == "Master Services Agreement (MSA) 2026"
    assert res.total_chunks >= 1
    assert res.doc_id in INGESTED_DOCUMENTS_STORE


def test_compliance_audit_report_financial_domain():
    """Test running high-stakes financial compliance audit report."""
    # First ingest ground truth financial statement
    ingest_req = DocumentIngestRequest(
        title="Form 10-Q Financial Filing",
        domain="financial",
        content="Q3 Revenue was $45.2M. Operating margin expanded to 24%. Net Income reached $8.5M.",
        source_trust_tier=1
    )
    compliance_service.ingest_document(ingest_req)
    
    # Audit report with matching and contradictory financial claims
    audit_req = AuditReportRequest(
        title="Q3 Executive Financial Summary",
        domain="financial",
        document_text="Q3 Revenue was $45.2M. However operating margin declined to 5%."
    )
    report = compliance_service.audit_report(audit_req)
    
    assert report.domain == "financial"
    assert report.document_title == "Q3 Executive Financial Summary"
    assert report.total_claims >= 1
    assert report.audit_hash is not None
    assert report.trace_id in COMPLIANCE_AUDIT_STORE


def test_export_compliance_audit_certificate_markdown():
    """Test exporting signed compliance audit certificate in Markdown format."""
    # Run audit first
    audit_req = AuditReportRequest(
        title="SOC 2 Type II Security Report",
        domain="regulatory",
        document_text="Encryption at rest uses AES-256 standards. Multi-factor authentication is mandatory for all administrative access."
    )
    report = compliance_service.audit_report(audit_req)
    
    export_req = AuditExportRequest(
        trace_id=report.trace_id,
        format="markdown"
    )
    export_res = compliance_service.export_audit_certificate(export_req)
    
    assert export_res.trace_id == report.trace_id
    assert export_res.format == "markdown"
    assert "AURA Enterprise Compliance Audit Certificate" in export_res.certificate_content
    assert export_res.audit_certificate_hash == report.audit_hash


def test_fastapi_compliance_endpoints():
    """Integration test for FastAPI compliance endpoints."""
    # 1. Ingest via API
    ingest_payload = {
        "title": "Clinical Trial Audit Protocol",
        "domain": "healthcare",
        "content": "Patient dosage administered was 50mg daily. Primary endpoint efficacy was achieved at day 14.",
        "source_trust_tier": 1
    }
    r1 = client.post("/v1/documents/ingest", json=ingest_payload)
    assert r1.status_code == 200
    d1 = r1.json()
    assert d1["status"] == "ingested_and_indexed"

    # 2. Audit via API
    audit_payload = {
        "title": "Clinical Audit Summary",
        "domain": "healthcare",
        "document_text": "Patient dosage administered was 50mg daily."
    }
    r2 = client.post("/v1/audit/report", json=audit_payload)
    assert r2.status_code == 200
    d2 = r2.json()
    trace_id = d2["trace_id"]
    assert d2["domain"] == "healthcare"

    # 3. Export via API
    export_payload = {
        "trace_id": trace_id,
        "format": "json"
    }
    r3 = client.post("/v1/audit/export", json=export_payload)
    assert r3.status_code == 200
    d3 = r3.json()
    assert d3["trace_id"] == trace_id
    assert d3["format"] == "json"


def test_link_ingestion_and_file_upload_endpoints():
    """Test URL link ingestion and multipart CSV/PDF file upload endpoints."""
    # Test Link Ingestion
    link_payload = {
        "url": "https://sec.gov/edgar/data/10q_filing_2026.html",
        "title": "SEC EDGAR 10-Q filing link",
        "domain": "financial",
        "source_trust_tier": 1
    }
    r1 = client.post("/v1/documents/ingest_link", json=link_payload)
    assert r1.status_code == 200
    d1 = r1.json()
    assert "link_financial_" in d1["doc_id"]
    assert d1["status"] == "ingested_and_indexed"

    # Test File Upload (e.g. CSV / PDF / TXT)
    file_content = b"Revenue,Margin,NetIncome\n$45.2M,24%,$8.5M"
    r2 = client.post(
        "/v1/documents/upload_file",
        files={"file": ("q3_balance_sheet.csv", file_content, "text/csv")},
        data={"domain": "financial", "source_trust_tier": 1}
    )
    assert r2.status_code == 200
    d2 = r2.json()
    assert d2["title"] == "q3_balance_sheet.csv"
    assert d2["status"] == "ingested_and_indexed"


def test_agent_pipeline_configuration_endpoints():
    """Test GET and POST agent configuration endpoints."""
    # 1. Get initial pipeline config
    r1 = client.get("/v1/config/pipeline")
    assert r1.status_code == 200
    cfg = r1.json()
    assert cfg["orchestrator"]["max_iterations"] == 2
    assert cfg["evaluator"]["threshold_reliable"] == 0.75

    # 2. Update agent configs (e.g. set max_iterations=3, threshold_reliable=0.80)
    cfg["orchestrator"]["max_iterations"] = 3
    cfg["evaluator"]["threshold_reliable"] = 0.80
    r2 = client.post("/v1/config/pipeline", json=cfg)
    assert r2.status_code == 200
    updated = r2.json()
    assert updated["orchestrator"]["max_iterations"] == 3
    assert updated["evaluator"]["threshold_reliable"] == 0.80

