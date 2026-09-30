"""
Response Generator Unit Tests (Dev 4).
Verifies response object formatting, reliability summary generation, caveat preservation, and iteration cap notices.
"""

import pytest
from app.agents.response_generator import ResponseGenerator
from app.schemas.schemas import AuraState, Claim, ReliabilityReport, VerificationResult


def test_response_generator_basic():
    gen = ResponseGenerator()
    state = AuraState(
        original_text="The Eiffel Tower was built in 1889.",
        trace_id="trace_resp_001",
        claims=[
            Claim(id="claim_001", text="The Eiffel Tower was built in 1889.", type="factual-atomic", char_span=(0, 35))
        ],
        verifications={
            "claim_001_fact": VerificationResult(
                claim_id="claim_001", agent="fact", verdict="supported", confidence=0.95, rationale="Valid"
            )
        },
        reliability=ReliabilityReport(score=0.95, bucket="reliable", contributing_agents=["fact"])
    )

    res = gen.generate_response(state, refined_text="The Eiffel Tower was built in 1889.", edits=[])

    assert res["trace_id"] == "trace_resp_001"
    assert res["reliability_score"] == 0.95
    assert res["reliability_bucket"] == "reliable"
    assert "RELIABLE" in res["reliability_summary"]
    assert len(res["claims_breakdown"]) == 1


def test_response_generator_iteration_cap_caveat():
    gen = ResponseGenerator()
    state = AuraState(
        original_text="Some unverified statement.",
        trace_id="trace_resp_002",
        iteration=2,
        max_iterations=2,
        claims=[
            Claim(id="claim_002", text="Some unverified statement.", type="factual-atomic", char_span=(0, 26))
        ],
        verifications={
            "claim_002_fact": VerificationResult(
                claim_id="claim_002", agent="fact", verdict="insufficient_evidence", confidence=0.0, rationale="No data"
            )
        },
        reliability=ReliabilityReport(score=0.0, bucket="unresolved", contributing_agents=["fact"])
    )

    res = gen.generate_response(state, refined_text="[Insufficient evidence: Some unverified statement.]", edits=[])

    assert res["max_iterations_reached"] is True
    assert "[CAVEAT] Pipeline reached maximum iteration cap" in res["reliability_summary"]
    assert res["reliability_bucket"] == "unresolved"
