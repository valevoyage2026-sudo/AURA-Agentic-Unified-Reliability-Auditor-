"""
Sample Corpus Ingestion Script for AURA Knowledge & Retrieval Layer.
Populates Qdrant vector database and structured knowledge graph with sample domain evidence.
Attaches source_trust_tier and last_verified metadata at ingestion time.
"""

import logging
from datetime import datetime, timezone
from qdrant_client.models import PointStruct
from app.retrieval.vector_store import VectorRetriever
from app.retrieval.knowledge_graph import GraphRetriever

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


SAMPLE_PASSAGES = [
    {
        "id": 1,
        "vector": [0.1] * 384,
        "source_id": "doc_sec_10k_2024",
        "text": "AURA is an Agentic Unified Reliability Auditor designed to verify LLM response accuracy.",
        "source_trust_tier": 1,
        "last_verified": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": 2,
        "vector": [0.2] * 384,
        "source_id": "doc_wiki_aura",
        "text": "The AURA architecture uses a 4-layer verification pipeline including LangGraph and Neo4j.",
        "source_trust_tier": 2,
        "last_verified": datetime.now(timezone.utc).isoformat(),
    },
    {
        "id": 3,
        "vector": [0.3] * 384,
        "source_id": "unvetted_blog_post",
        "text": "AURA was invented in 1990 by ancient computer scientists.",
        "source_trust_tier": 3,
        "last_verified": datetime.now(timezone.utc).isoformat(),
    },
]


def ingest_qdrant(vector_retriever: VectorRetriever):
    if not vector_retriever.ensure_collection(vector_size=384):
        logger.warning("Skipping Qdrant ingestion: store unavailable")
        return

    points = [
        PointStruct(
            id=item["id"],
            vector=item["vector"],
            payload={
                "source_id": item["source_id"],
                "text": item["text"],
                "source_trust_tier": item["source_trust_tier"],
                "last_verified": item["last_verified"],
            },
        )
        for item in SAMPLE_PASSAGES
    ]

    try:
        vector_retriever.client.upsert(
            collection_name=vector_retriever.collection_name,
            points=points,
        )
        logger.info(f"Successfully ingested {len(points)} points into Qdrant collection: {vector_retriever.collection_name}")
    except Exception as e:
        logger.error(f"Failed to upsert points into Qdrant: {e}")


def ingest_graph(graph_retriever: GraphRetriever):
    """Populates structured graph retriever with sample entity relations."""
    try:
        graph_retriever.add_relation(
            subject="AURA",
            relation="USES",
            obj="LangGraph",
            confidence=0.95,
            source_trust_tier=1,
            source_id="graph_spec_01"
        )
        graph_retriever.add_relation(
            subject="AURA",
            relation="EXPOSES",
            obj="FastAPI",
            confidence=0.98,
            source_trust_tier=1,
            source_id="graph_spec_02"
        )
        logger.info("Successfully ingested sample entity graph relations")
    except Exception as e:
        logger.error(f"Failed to ingest entity relations: {e}")


def main():
    logger.info("Starting Dev 2 Knowledge & Retrieval ingestion pipeline...")
    vec_retriever = VectorRetriever()
    graph_retriever = GraphRetriever()

    ingest_qdrant(vec_retriever)
    ingest_graph(graph_retriever)
    graph_retriever.close()
    logger.info("Ingestion complete.")



if __name__ == "__main__":
    main()
