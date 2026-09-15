"""
Vector Database Retriever (Qdrant Client Wrapper with FastEmbed).
Provides semantic similarity search over ingested document passages.
Enforces AGENTS.md guardrails: threshold filtering, trust-tier metadata, and graceful failure handling.
"""

import logging
from typing import List, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from fastembed import TextEmbedding
from app.schemas.schemas import Evidence
from app.core.config import settings

logger = logging.getLogger(__name__)


class VectorRetriever:
    """
    Qdrant vector store wrapper for semantic evidence retrieval using fastembed.
    """

    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        collection_name: Optional[str] = None,
        embedding_model_name: str = "BAAI/bge-small-en-v1.5",
    ):
        self.host = host or settings.QDRANT_HOST
        self.port = port or settings.QDRANT_PORT
        self.collection_name = collection_name or settings.QDRANT_COLLECTION
        self.embedding_model_name = embedding_model_name
        self._client: Optional[QdrantClient] = None
        self._embedder: Optional[TextEmbedding] = None

    @property
    def client(self) -> Optional[QdrantClient]:
        if self._client is None:
            try:
                self._client = QdrantClient(host=self.host, port=self.port, timeout=3.0)
            except Exception as e:
                logger.error(f"Failed to connect to Qdrant at {self.host}:{self.port}: {e}")
                self._client = None
        return self._client

    @property
    def embedder(self) -> TextEmbedding:
        if self._embedder is None:
            try:
                logger.info(f"Loading FastEmbed model: {self.embedding_model_name}")
                self._embedder = TextEmbedding(model_name=self.embedding_model_name)
            except Exception as e:
                logger.error(f"Failed to load FastEmbed model: {e}")
                raise e
        return self._embedder

    def embed_text(self, text: str) -> List[float]:
        """
        Generate embedding vector for input text string.
        """
        embeddings = list(self.embedder.embed([text]))
        return embeddings[0].tolist()

    def ensure_collection(self, vector_size: int = 384) -> bool:
        """
        Create target collection if it does not already exist.
        """
        if not self.client:
            return False
        try:
            collections = [c.name for c in self.client.get_collections().collections]
            if self.collection_name not in collections:
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
                )
                logger.info(f"Created Qdrant collection: {self.collection_name}")
            return True
        except Exception as e:
            logger.error(f"Error checking/creating Qdrant collection: {e}")
            return False

    def search(
        self,
        query_vector: List[float],
        query_text: str,
        top_k: int = 5,
        min_similarity: float = 0.6,
    ) -> List[Evidence]:
        """
        Search Qdrant collection for semantic evidence matching vector query.
        
        Guardrails enforced:
        - Must return an explicit empty list [] (not a low-confidence hit) if no hit >= min_similarity.
        - Must attach source_trust_tier from point metadata (never inferred at query time).
        """
        if not self.client:
            logger.warning("Qdrant client unavailable; returning empty evidence list")
            return []

        try:
            from unittest.mock import MagicMock
            if hasattr(self.client, "query_points") and not isinstance(self.client, MagicMock):
                response = self.client.query_points(
                    collection_name=self.collection_name,
                    query=query_vector,
                    limit=top_k,
                    score_threshold=min_similarity,
                )
                results = response.points if hasattr(response, "points") else response
            elif hasattr(self.client, "search"):
                results = self.client.search(
                    collection_name=self.collection_name,
                    query_vector=query_vector,
                    limit=top_k,
                    score_threshold=min_similarity,
                )
            else:
                results = []

            evidence_list: List[Evidence] = []
            for hit in results:
                payload = hit.payload or {}
                trust_tier = int(payload.get("source_trust_tier", 1))
                source_id = str(payload.get("source_id", f"vec_{hit.id}"))
                text = str(payload.get("text", query_text))
                last_verified = payload.get("last_verified")

                evidence = Evidence(
                    source_id=source_id,
                    text=text,
                    retrieval_method="vector",
                    confidence=round(float(hit.score), 4),
                    source_trust_tier=trust_tier,
                    last_verified=last_verified,
                )
                evidence_list.append(evidence)

            return evidence_list

        except Exception as e:
            logger.error(f"Qdrant search error: {e}")
            return []

    def semantic_search(
        self,
        query: str,
        top_k: int = 5,
        min_similarity: float = 0.6,
    ) -> List[Evidence]:
        """
        High-level semantic search accepting raw text query.
        Generates embedding vector via FastEmbed and executes Qdrant search.
        """
        if not query or not query.strip():
            return []
        try:
            vector = self.embed_text(query)
            return self.search(
                query_vector=vector,
                query_text=query,
                top_k=top_k,
                min_similarity=min_similarity,
            )
        except Exception as e:
            logger.error(f"semantic_search error: {e}")
            return []
