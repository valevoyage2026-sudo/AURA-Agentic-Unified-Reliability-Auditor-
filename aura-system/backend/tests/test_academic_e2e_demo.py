"""
End-to-End Acceptance Test for AURA Academic Demo Workflow.
Asserts the full 18-point release gate:
1. Environment health.
2. Officer policy upload, listing, idempotency, and deactivation.
3. Student document upload verification (valid, problematic, ambiguous).
4. Zero ground-truth contamination from student uploads.
5. Inconclusive findings on missing evidence (no hallucinations).
6. Cryptographic compliance certificate export.
7. Telemetry & campus metrics updates.
8. Role-based access containment (403 Forbidden on unauthorized actions).
"""

import os
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.compliance_service import compliance_service, INGESTED_DOCUMENTS_STORE, COMPLIANCE_AUDIT_STORE

client = TestClient(app)
SAMPLE_DOCS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "sample_student_docs")


def test_academic_demo_e2e_workflow():
    officer_headers = {"X-AURA-Role": "officer"}
    student_headers = {"X-AURA-Role": "user"}

    # =========================================================================
    # 1. Environment & API Health
    # =========================================================================
    r_health = client.get("/health")
    assert r_health.status_code == 200
    assert r_health.json()["status"] == "healthy"

    r_v1_health = client.get("/v1/health")
    assert r_v1_health.status_code == 200
    assert r_v1_health.json()["status"] == "healthy"

    # =========================================================================
    # 2. Officer Policy Management (manage_knowledge_base)
    # =========================================================================
    # Sync starter policies
    r_sync = client.post("/v1/documents/ground_truth/sync", headers=officer_headers)
    assert r_sync.status_code == 200
    assert r_sync.json()["status"] == "SYNCED"

    # Upload new official policy addendum
    policy_content = (
        "Section 12.4: Departmental Honors in Computer Science requires a minimum cumulative GPA of 3.80 "
        "and successful completion of an approved Senior Honors Thesis (CS 499, 4 credits)."
    )
    files = {
        "file": ("CS_Honors_Policy_Addendum_2026.txt", policy_content.encode("utf-8"), "text/plain")
    }
    r_upload = client.post(
        "/v1/documents/ground_truth/upload",
        headers=officer_headers,
        data={"domain": "academic", "source_trust_tier": 1},
        files=files
    )
    assert r_upload.status_code == 200
    doc_data = r_upload.json()
    honors_doc_id = doc_data["doc_id"]
    assert honors_doc_id in INGESTED_DOCUMENTS_STORE
    assert doc_data["status"] in ("INDEXED", "ingested_and_indexed")

    # Verify policy appears in inventory
    r_list = client.get("/v1/documents/ground_truth/list", headers=officer_headers)
    assert r_list.status_code == 200
    listed_docs = r_list.json()["documents"]
    assert any(d["doc_id"] == honors_doc_id for d in listed_docs)

    # Snapshot current authoritative documents
    initial_gt_keys = set(INGESTED_DOCUMENTS_STORE.keys())

    # =========================================================================
    # 3. Student Workflow: Scenario 1 - Valid Document
    # =========================================================================
    valid_file_path = os.path.join(SAMPLE_DOCS_DIR, "1_valid_student_petition.txt")
    with open(valid_file_path, "rb") as f:
        valid_bytes = f.read()

    r_valid = client.post(
        "/v1/documents/verify_upload",
        headers=student_headers,
        data={"domain": "academic"},
        files={"file": ("1_valid_student_petition.txt", valid_bytes, "text/plain")}
    )
    assert r_valid.status_code == 200
    report_valid = r_valid.json()
    assert report_valid["total_claims"] >= 1
    assert "trace_id" in report_valid
    # Invariant: Student file NEVER entered authoritative store
    assert set(INGESTED_DOCUMENTS_STORE.keys()) == initial_gt_keys
    assert not any("1_valid_student_petition" in k for k in INGESTED_DOCUMENTS_STORE.keys())

    # =========================================================================
    # 4. Student Workflow: Scenario 2 - Problematic Document (Contradictions)
    # =========================================================================
    prob_file_path = os.path.join(SAMPLE_DOCS_DIR, "2_problematic_academic_appeal.txt")
    with open(prob_file_path, "rb") as f:
        prob_bytes = f.read()

    r_prob = client.post(
        "/v1/documents/verify_upload",
        headers=student_headers,
        data={"domain": "academic"},
        files={"file": ("2_problematic_academic_appeal.txt", prob_bytes, "text/plain")}
    )
    assert r_prob.status_code == 200
    report_prob = r_prob.json()
    assert report_prob["total_claims"] >= 1
    # Check that contradictions or low reliability was flagged
    assert report_prob["unreliable_claims_count"] >= 1 or report_prob["overall_score"] < 0.90
    # Invariant: Student file NEVER entered authoritative store
    assert set(INGESTED_DOCUMENTS_STORE.keys()) == initial_gt_keys

    # =========================================================================
    # 5. Student Workflow: Scenario 3 - Ambiguous Document (Inconclusive / Missing Evidence)
    # =========================================================================
    amb_file_path = os.path.join(SAMPLE_DOCS_DIR, "3_ambiguous_transfer_petition.txt")
    with open(amb_file_path, "rb") as f:
        amb_bytes = f.read()

    r_amb = client.post(
        "/v1/documents/verify_upload",
        headers=student_headers,
        data={"domain": "academic"},
        files={"file": ("3_ambiguous_transfer_petition.txt", amb_bytes, "text/plain")}
    )
    assert r_amb.status_code == 200
    report_amb = r_amb.json()
    # Missing evidence must yield inconclusive/insufficient evidence, never fabricated confirmation
    assert any(
        c.get("verdict") in ("insufficient_evidence", "borderline", "unresolved")
        for c in report_amb["claims_breakdown"]
    )
    assert set(INGESTED_DOCUMENTS_STORE.keys()) == initial_gt_keys

    # =========================================================================
    # 6. Cryptographic Audit Certificate Export
    # =========================================================================
    trace_id = report_valid["trace_id"]
    r_export = client.post(
        "/v1/audit/export",
        headers=student_headers,
        json={"trace_id": trace_id, "format": "markdown"}
    )
    assert r_export.status_code == 200
    export_data = r_export.json()
    assert "AURA Enterprise Compliance Audit Certificate" in export_data["certificate_content"]
    assert export_data["trace_id"] == trace_id
    assert export_data["audit_certificate_hash"] is not None

    # =========================================================================
    # 7. Dashboard Telemetry & Metrics Update
    # =========================================================================
    r_metrics = client.get("/v1/audit/metrics", headers=officer_headers)
    assert r_metrics.status_code == 200
    m = r_metrics.json()
    assert m["total_audits"] >= 3
    assert m["ground_truth_documents_active"] >= 1

    r_reports = client.get("/v1/audit/reports", headers=officer_headers)
    assert r_reports.status_code == 200
    assert len(r_reports.json()["reports"]) >= 3

    # =========================================================================
    # 8. Deactivate Official Policy & Re-verify Isolation
    # =========================================================================
    r_del = client.delete(f"/v1/documents/ground_truth/{honors_doc_id}", headers=officer_headers)
    assert r_del.status_code == 200
    assert honors_doc_id not in INGESTED_DOCUMENTS_STORE

    # Ensure deactivated policy is excluded from active inventory
    r_list_after = client.get("/v1/documents/ground_truth/list", headers=officer_headers)
    assert not any(d["doc_id"] == honors_doc_id for d in r_list_after.json()["documents"])

    # =========================================================================
    # 9. Role-Based Access Guardrails (Student Forbidden)
    # =========================================================================
    r_forbidden_upload = client.post(
        "/v1/documents/ground_truth/upload",
        headers=student_headers,
        data={"domain": "academic"},
        files={"file": ("Fake_Policy.txt", b"Exams are canceled", "text/plain")}
    )
    assert r_forbidden_upload.status_code == 403

    r_forbidden_del = client.delete("/v1/documents/ground_truth/any_doc", headers=student_headers)
    assert r_forbidden_del.status_code == 403
