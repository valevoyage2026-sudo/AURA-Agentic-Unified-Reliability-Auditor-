"""
API Integration Tests for AURA Verification & Audit Endpoints (Dev 4).
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "AURA" in data["system"]


def test_health_check_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_v1_health_endpoint():
    response = client.get("/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "max_iterations" in data


def test_verify_empty_text():
    response = client.post("/v1/verify", json={"text": "   ", "mode": "audit_only"})
    assert response.status_code == 400
    assert "cannot be empty" in response.json()["detail"]


def test_verify_valid_response():
    sample_text = "The Eiffel Tower was completed in 1889 in Paris, France."
    response = client.post("/v1/verify", json={"text": sample_text, "mode": "audit_only"})
    assert response.status_code == 200
    data = response.json()

    assert "trace_id" in data
    assert data["trace_id"].startswith("trace_")
    assert data["status"] == "completed"
    assert "reliability_score" in data
    assert "reliability_bucket" in data
    assert "reliability_summary" in data
    assert "final_text" in data
    assert "claims_breakdown" in data

    # Retrieve audit trace
    trace_id = data["trace_id"]
    audit_res = client.get(f"/v1/audit/{trace_id}")
    assert audit_res.status_code == 200
    audit_data = audit_res.json()
    assert audit_data["trace_id"] == trace_id
    assert len(audit_data["events"]) >= 2


def test_audit_not_found():
    response = client.get("/v1/audit/non_existent_trace_99999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
