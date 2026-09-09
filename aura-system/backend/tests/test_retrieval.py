"""
Unit and Contract Tests for Dev 2 Knowledge & Retrieval Layer.
Asserts guardrails specified in AGENTS.md and Aura_Week1_Implementation_plan.md.
"""

import pytest
from unittest.mock import MagicMock
from app.schemas.schemas import Evidence
from app.retrieval.vector_store import VectorRetriever
from app.retrieval.knowledge_graph import GraphRetriever
from app.retrieval.hybrid_retriever import HybridRetriever


def test_vector_retriever_empty_list_when_below_threshold():
    """
    Guardrail Test: When no vector hit crosses min_similarity threshold,
    VectorRetriever must return an explicit empty list [], NOT a low-confidence hit.
    """
    mock_qdrant_client = MagicMock()
    mock_qdrant_client.search.return_value = []

    retriever = VectorRetriever()
    retriever._client = mock_qdrant_client

    results = retriever.search(
        query_vector=[0.1] * 384,
        query_text="nonexistent concept",
        min_similarity=0.85,
    )

    assert results == []
    assert isinstance(results, list)


def test_vector_retriever_source_trust_tier_attachment():
    """
    Guardrail Test: Vector search must attach source_trust_tier from ingestion-time payload metadata.
    """
    mock_hit = MagicMock()
    mock_hit.id = "p1"
    mock_hit.score = 0.91
    mock_hit.payload = {
        "source_id": "doc_curated_01",
        "text": "Valid factual statement",
        "source_trust_tier": 1,
        "last_verified": "2026-09-09T00:00:00Z",
    }

    mock_qdrant_client = MagicMock()
    mock_qdrant_client.search.return_value = [mock_hit]

    retriever = VectorRetriever()
    retriever._client = mock_qdrant_client

    results = retriever.search(
        query_vector=[0.1] * 384,
        query_text="Valid statement",
        min_similarity=0.6,
    )

    assert len(results) == 1
    evidence = results[0]
    assert isinstance(evidence, Evidence)
    assert evidence.source_trust_tier == 1
    assert evidence.retrieval_method == "vector"
    assert evidence.confidence == 0.91
    assert evidence.source_id == "doc_curated_01"


def test_graph_retriever_edge_last_verified():
    """
    Guardrail Test: Graph queries must include last_verified on every edge used.
    """
    mock_session = MagicMock()
    mock_record = {
        "subject": "AURA",
        "relation": "USES",
        "object": "LangGraph",
        "last_verified": "2026-09-09T12:00:00Z",
        "confidence": 0.95,
        "source_trust_tier": 1,
        "source_id": "edge_001",
    }
    mock_session.run.return_value = [mock_record]

    mock_driver = MagicMock()
    mock_driver.session.return_value.__enter__.return_value = mock_session

    retriever = GraphRetriever()
    retriever._driver = mock_driver

    results = retriever.lookup(entities=["AURA"])

    assert len(results) == 1
    evidence = results[0]
    assert evidence.retrieval_method == "graph"
    assert evidence.last_verified == "2026-09-09T12:00:00Z"
    assert evidence.text == "(AURA) -[USES]-> (LangGraph)"


def test_hybrid_retriever_unreachable_store_fallback():
    """
    Failure Mode Test: If either store is unreachable, return whatever the other store
    yields with a partial_retrieval: True flag rather than throwing an exception.
    """
    mock_vector = MagicMock()
    mock_vector.search.side_effect = Exception("Qdrant store down")

    mock_graph = MagicMock()
    mock_graph.lookup.return_value = [
        Evidence(
            source_id="g1",
            text="(AURA) -[USES]-> (FastAPI)",
            retrieval_method="graph",
            confidence=0.9,
            source_trust_tier=1,
            last_verified="2026-09-09T12:00:00Z",
        )
    ]

    hybrid = HybridRetriever(vector_retriever=mock_vector, graph_retriever=mock_graph)

    res = hybrid.retrieve(
        query_text="AURA architecture",
        query_vector=[0.1] * 384,
        entities=["AURA"],
    )

    assert res["partial_retrieval"] is True
    assert len(res["evidence"]) == 1
    assert res["evidence"][0].source_id == "g1"
