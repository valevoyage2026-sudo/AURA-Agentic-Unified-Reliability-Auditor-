"""
Comprehensive Unit Tests for Dev 3: Verification Agents & Evaluator Agent.
Tests guardrails, deterministic precedence rules, and skills contracts without external LLM API calls.
"""

import pytest
from app.schemas.schemas import Claim, Evidence, VerificationResult, ReliabilityReport
from app.agents.fact_agent import FactVerificationAgent
from app.agents.citation_agent import CitationVerificationAgent
from app.agents.logic_agent import ContradictionAgent
from app.agents.evaluator_agent import EvaluatorAgent
from app.agents.skills import renormalize_weights, aggregate_verdicts, detect_numeric_date_conflict, detect_logical_conflict


# --- Fact Verification Agent Tests ---

def test_fact_agent_empty_evidence_guardrail():
    """Guardrail 1: If Evidence list is empty, must return insufficient_evidence, never contradicted."""
    agent = FactVerificationAgent()
    claim = Claim(
        id="claim_001",
        text="The server latency was 15ms in production.",
        type="factual-atomic",
        char_span=(0, 42)
    )
    result = agent.run(claim, [])
    assert result.verdict == "insufficient_evidence"
    assert result.confidence == 0.0
    assert result.evidence_refs == []
    assert "Insufficient evidence" in result.rationale


def test_fact_agent_supported_claim():
    agent = FactVerificationAgent()
    claim = Claim(
        id="claim_002",
        text="AURA uses Qdrant for vector retrieval.",
        type="factual-atomic",
        char_span=(0, 38)
    )
    evidence = [
        Evidence(
            source_id="doc_qdrant_01",
            text="AURA uses Qdrant for vector retrieval and semantic search.",
            retrieval_method="vector",
            confidence=0.9,
            source_trust_tier=1
        )
    ]
    result = agent.run(claim, evidence)
    assert result.verdict == "supported"
    assert "doc_qdrant_01" in result.evidence_refs
    assert "doc_qdrant_01" in result.rationale


def test_fact_agent_contradicted_claim():
    agent = FactVerificationAgent()
    claim = Claim(
        id="claim_003",
        text="The database migration failed completely.",
        type="factual-atomic",
        char_span=(0, 40)
    )
    evidence = [
        Evidence(
            source_id="doc_db_01",
            text="The database migration was executed with full success.",
            retrieval_method="vector",
            confidence=0.88,
            source_trust_tier=1
        )
    ]
    result = agent.run(claim, evidence)
    assert result.verdict == "contradicted"
    assert "doc_db_01" in result.evidence_refs


# --- Citation Verification Agent Tests ---

def test_citation_agent_unresolvable_citation():
    """Guardrail: Non-existent or empty evidence is ALWAYS invalid."""
    agent = CitationVerificationAgent()
    claim = Claim(
        id="claim_cit_01",
        text="According to [paper_xyz_2026], latency dropped by 50%.",
        type="citation",
        char_span=(0, 52)
    )
    result = agent.run(claim, [])
    assert result.verdict == "invalid"
    assert result.confidence == 0.0
    assert result.evidence_refs == []


def test_citation_agent_supported():
    agent = CitationVerificationAgent()
    claim = Claim(
        id="claim_cit_02",
        text="As described in [Qdrant_Docs], index size is optimized.",
        type="citation",
        char_span=(0, 54)
    )
    evidence = [
        Evidence(
            source_id="Qdrant_Docs",
            text="Qdrant_Docs states that index size is optimized for HNSW.",
            retrieval_method="vector",
            confidence=0.85,
            source_trust_tier=1
        )
    ]
    result = agent.run(claim, evidence)
    assert result.verdict == "supported"
    assert "Qdrant_Docs" in result.evidence_refs


def test_citation_agent_weak_attribution():
    agent = CitationVerificationAgent()
    claim = Claim(
        id="claim_cit_03",
        text="Per [Architecture_Spec], postgres is used for audit.",
        type="citation",
        char_span=(0, 50)
    )
    evidence = [
        Evidence(
            source_id="Architecture_Spec",
            text="Architecture_Spec discusses database setups.",
            retrieval_method="vector",
            confidence=0.45,
            source_trust_tier=2
        )
    ]
    result = agent.run(claim, evidence)
    assert result.verdict == "weak_attribution"


# --- Contradiction Agent Tests ---

def test_contradiction_numeric_date_conflict():
    assert detect_numeric_date_conflict(
        "The project launched in 2021 with 50 nodes.",
        "The project launched in 2024 with 500 nodes."
    ) is True


def test_contradiction_logical_conflict():
    assert detect_logical_conflict(
        "The deployment passed all tests.",
        "The deployment failed all tests."
    ) is True


def test_contradiction_agent_detection():
    agent = ContradictionAgent()
    claim = Claim(
        id="claim_logic_01",
        text="System latency decreased by 80% after optimization.",
        type="factual-atomic",
        char_span=(0, 51)
    )
    evidence = [
        Evidence(
            source_id="perf_metrics",
            text="System latency increased by 80% after deployment.",
            retrieval_method="vector",
            confidence=0.9,
            source_trust_tier=1
        )
    ]
    result = agent.run(claim, evidence)
    assert result.verdict == "contradicted"
    assert "perf_metrics" in result.evidence_refs


# --- Evaluator Agent & Aggregation Determinism Tests ---

def test_evaluator_invalid_citation_precedence():
    """Precedence Rule 1: Any invalid citation verdict -> bucket='unreliable', score=0.0."""
    evaluator = EvaluatorAgent()
    verifications = [
        VerificationResult(
            claim_id="c1",
            agent="fact",
            verdict="supported",
            confidence=0.9,
            evidence_refs=["doc1"],
            rationale="Supported"
        ),
        VerificationResult(
            claim_id="c2",
            agent="citation",
            verdict="invalid",
            confidence=0.0,
            evidence_refs=[],
            rationale="Unresolvable citation"
        )
    ]
    report = evaluator.evaluate(verifications)
    assert report.bucket == "unreliable"
    assert report.score == 0.0


def test_evaluator_high_confidence_contradiction_precedence():
    """Precedence Rule 2: High-confidence contradiction -> bucket='unreliable'."""
    evaluator = EvaluatorAgent()
    verifications = [
        VerificationResult(
            claim_id="c1",
            agent="fact",
            verdict="supported",
            confidence=0.95,
            evidence_refs=["doc1"],
            rationale="Supported"
        ),
        VerificationResult(
            claim_id="c2",
            agent="contradiction",
            verdict="contradicted",
            confidence=0.85,
            evidence_refs=["doc2"],
            rationale="High confidence contradiction"
        )
    ]
    report = evaluator.evaluate(verifications)
    assert report.bucket == "unreliable"
    assert report.score == 0.1


def test_evaluator_all_insufficient_evidence():
    """Precedence Rule 3: All insufficient evidence -> bucket='unresolved'."""
    evaluator = EvaluatorAgent()
    verifications = [
        VerificationResult(
            claim_id="c1",
            agent="fact",
            verdict="insufficient_evidence",
            confidence=0.0,
            evidence_refs=[],
            rationale="No evidence"
        ),
        VerificationResult(
            claim_id="c2",
            agent="citation",
            verdict="insufficient_evidence",
            confidence=0.0,
            evidence_refs=[],
            rationale="No evidence"
        )
    ]
    report = evaluator.evaluate(verifications)
    assert report.bucket == "unresolved"
    assert report.score == 0.0


def test_evaluator_reliable_bucket():
    evaluator = EvaluatorAgent()
    verifications = [
        VerificationResult(
            claim_id="c1",
            agent="fact",
            verdict="supported",
            confidence=0.9,
            evidence_refs=["doc1"],
            rationale="Supported"
        ),
        VerificationResult(
            claim_id="c1",
            agent="citation",
            verdict="supported",
            confidence=0.9,
            evidence_refs=["doc1"],
            rationale="Supported"
        )
    ]
    report = evaluator.evaluate(verifications)
    assert report.bucket == "reliable"
    assert report.score >= 0.8


def test_renormalize_weights():
    weights = renormalize_weights(["fact", "contradiction"])
    assert sum(weights.values()) == pytest.approx(1.0)
    assert "citation" not in weights
    assert weights["fact"] > 0
    assert weights["contradiction"] > 0
