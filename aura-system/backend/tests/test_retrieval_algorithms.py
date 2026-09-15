"""
Unit Tests for Dev 2 Retrieval Algorithms (Day 3-4).
Asserts correctness of semantic search thresholding, graph lookup, trust weighting, and entity resolution.
"""

import pytest
from unittest.mock import MagicMock
from app.schemas.schemas import Evidence
from app.retrieval.vector_store import VectorRetriever
from app.retrieval.knowledge_graph import GraphRetriever
from app.retrieval.trust_weighting import apply_trust_weighting, TRUST_TIER_MULTIPLIERS
from app.retrieval.entity_resolver import resolve_entities
from app.retrieval.hybrid_retriever import HybridRetriever


def test_semantic_search_threshold_filtering():
    """
    Test that VectorRetriever.semantic_search filters results by min_similarity score.
    """
    mock_hit1 = MagicMock()
    mock_hit1.id = "1"
    mock_hit1.score = 0.85
    mock_hit1.payload = {"source_id": "s1", "text": "High similarity evidence", "source_trust_tier": 1}

    mock_qdrant = MagicMock()
    mock_qdrant.search.return_value = [mock_hit1]

    retriever = VectorRetriever()
    retriever._client = mock_qdrant
    retriever.embed_text = MagicMock(return_value=[0.1] * 384)

    results = retriever.semantic_search("high similarity query", min_similarity=0.8)

    assert len(results) == 1
    assert results[0].confidence == 0.85
    assert results[0].text == "High similarity evidence"


def test_graph_lookup_with_relation_type():
    """
    Test that GraphRetriever.graph_lookup accepts relation_type parameter and parses edges.
    """
    mock_session = MagicMock()
    mock_record = {
        "subject": "AURA",
        "relation": "USES",
        "object": "LangGraph",
        "last_verified": "2026-09-13T00:00:00Z",
        "confidence": 0.95,
        "source_trust_tier": 1,
        "source_id": "g_001",
    }
    mock_session.run.return_value = [mock_record]

    mock_driver = MagicMock()
    mock_driver.session.return_value.__enter__.return_value = mock_session

    retriever = GraphRetriever()
    retriever._driver = mock_driver

    results = retriever.graph_lookup(entities=["AURA"], relation_type="USES")

    assert len(results) == 1
    assert results[0].text == "(AURA) -[USES]-> (LangGraph)"
    assert results[0].last_verified == "2026-09-13T00:00:00Z"
    mock_session.run.assert_called_once()


def test_apply_trust_weighting_multipliers():
    """
    Test that apply_trust_weighting correctly scales confidence by source_trust_tier.
    """
    evidence_tier1 = Evidence(
        source_id="s1", text="Tier 1 text", retrieval_method="vector",
        confidence=0.90, source_trust_tier=1, last_verified="2026-09-13T00:00:00Z"
    )
    evidence_tier2 = Evidence(
        source_id="s2", text="Tier 2 text", retrieval_method="vector",
        confidence=0.90, source_trust_tier=2, last_verified="2026-09-13T00:00:00Z"
    )
    evidence_tier3 = Evidence(
        source_id="s3", text="Tier 3 text", retrieval_method="vector",
        confidence=0.90, source_trust_tier=3, last_verified="2026-09-13T00:00:00Z"
    )

    weighted = apply_trust_weighting([evidence_tier1, evidence_tier2, evidence_tier3])

    assert weighted[0].confidence == round(0.90 * 1.00, 4)  # Tier 1 = 0.90
    assert weighted[1].confidence == round(0.90 * 0.85, 4)  # Tier 2 = 0.765
    assert weighted[2].confidence == round(0.90 * 0.60, 4)  # Tier 3 = 0.54


def test_resolve_entities_extraction():
    """
    Test named entity linking extraction for Proper Nouns, CamelCase, and Acronyms.
    """
    text = "AURA uses LangGraph and Qdrant in PostgreSQL database."
    entities = resolve_entities(text)

    assert "AURA" in entities
    assert "LangGraph" in entities
    assert "Qdrant" in entities
    assert "PostgreSQL" in entities


def test_hybrid_retriever_auto_entity_resolution():
    """
    Test that HybridRetriever automatically resolves entities from claim text if none passed.
    """
    mock_vec = MagicMock()
    mock_vec.client = MagicMock()
    mock_vec.semantic_search.return_value = []

    mock_graph = MagicMock()
    mock_graph.driver = MagicMock()
    mock_graph.graph_lookup.return_value = []

    hybrid = HybridRetriever(vector_retriever=mock_vec, graph_retriever=mock_graph)

    res = hybrid.retrieve(query_text="AURA architecture uses LangGraph")

    assert "AURA" in res["entities_resolved"]
    assert "LangGraph" in res["entities_resolved"]
    mock_graph.graph_lookup.assert_called_once_with(entities=res["entities_resolved"])
