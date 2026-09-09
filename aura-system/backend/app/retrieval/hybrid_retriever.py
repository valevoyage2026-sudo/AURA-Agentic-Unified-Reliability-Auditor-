"""
Hybrid Retrieval Agent combining Qdrant (semantic) and Neo4j (structured) stores.
Enforces AGENTS.md guardrails and failure modes:
- Returns combined list of Evidence objects.
- If either store is unreachable, returns whatever the other store yields with partial_retrieval: True.
"""

import logging
from typing import List, Optional, Dict, Any
from app.schemas.schemas import Evidence
from app.retrieval.vector_store import VectorRetriever
from app.retrieval.knowledge_graph import GraphRetriever

logger = logging.getLogger(__name__)


class HybridRetriever:
    """
    Hybrid retriever orchestrating vector semantic search and knowledge graph relationship lookup.
    """

    def __init__(self, vector_retriever: Optional[VectorRetriever] = None, graph_retriever: Optional[GraphRetriever] = None):
        self.vector_store = vector_retriever or VectorRetriever()
        self.graph_store = graph_retriever or GraphRetriever()

    def retrieve(
        self,
        query_text: str,
        query_vector: Optional[List[float]] = None,
        entities: Optional[List[str]] = None,
        top_k: int = 5,
        min_similarity: float = 0.6,
    ) -> Dict[str, Any]:
        """
        Execute multi-store evidence retrieval.
        
        Returns:
            Dict containing:
            - 'evidence': List[Evidence]
            - 'partial_retrieval': bool (True if one of the stores failed/was unreachable)
            - 'sources_contacted': List[str]
        """
        evidence_results: List[Evidence] = []
        partial_retrieval = False
        sources_contacted = []

        # 1. Vector Search
        if query_vector:
            try:
                vec_evidence = self.vector_store.search(
                    query_vector=query_vector,
                    query_text=query_text,
                    top_k=top_k,
                    min_similarity=min_similarity,
                )
                evidence_results.extend(vec_evidence)
                sources_contacted.append("qdrant")
            except Exception as e:
                logger.error(f"Vector retrieval failure: {e}")
                partial_retrieval = True

        # 2. Graph Lookup
        if entities:
            try:
                graph_evidence = self.graph_store.lookup(entities=entities)
                evidence_results.extend(graph_evidence)
                sources_contacted.append("neo4j")
            except Exception as e:
                logger.error(f"Graph retrieval failure: {e}")
                partial_retrieval = True

        if not self.vector_store.client or not self.graph_store.driver:
            partial_retrieval = True

        return {
            "evidence": evidence_results,
            "partial_retrieval": partial_retrieval,
            "sources_contacted": sources_contacted,
        }
