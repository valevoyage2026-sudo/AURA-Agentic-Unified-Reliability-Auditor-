"""
Hybrid Retrieval Agent combining Qdrant (semantic) and Neo4j (structured) stores.
Enforces AGENTS.md guardrails and failure modes:
- Returns combined list of Evidence objects with trust weighting applied.
- If either store is unreachable, returns whatever the other store yields with partial_retrieval: True.
"""

import logging
from typing import List, Optional, Dict, Any
from app.schemas.schemas import Evidence
from app.retrieval.vector_store import VectorRetriever
from app.retrieval.knowledge_graph import GraphRetriever
from app.retrieval.trust_weighting import apply_trust_weighting
from app.retrieval.entity_resolver import resolve_entities

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
        apply_weighting: bool = True,
    ) -> Dict[str, Any]:
        """
        Execute multi-store evidence retrieval for a given claim query text.
        
        Returns:
            Dict containing:
            - 'evidence': List[Evidence] (with trust weighting applied)
            - 'partial_retrieval': bool (True if one of the stores failed/was unreachable)
            - 'sources_contacted': List[str]
            - 'entities_resolved': List[str]
        """
        raw_evidence: List[Evidence] = []
        partial_retrieval = False
        sources_contacted = []

        # Auto-resolve entities if none provided explicitly
        if entities is None and query_text:
            entities = resolve_entities(query_text)

        # 1. Vector Semantic Search
        if query_text:
            try:
                if query_vector is None and self.vector_store.client:
                    vec_evidence = self.vector_store.semantic_search(
                        query=query_text,
                        top_k=top_k,
                        min_similarity=min_similarity,
                    )
                elif query_vector:
                    vec_evidence = self.vector_store.search(
                        query_vector=query_vector,
                        query_text=query_text,
                        top_k=top_k,
                        min_similarity=min_similarity,
                    )
                else:
                    vec_evidence = []
                    
                raw_evidence.extend(vec_evidence)
                sources_contacted.append("qdrant")
            except Exception as e:
                logger.error(f"Vector retrieval failure: {e}")
                partial_retrieval = True

        # 2. Graph Relationship Lookup
        if entities:
            try:
                graph_evidence = self.graph_store.graph_lookup(entities=entities)
                raw_evidence.extend(graph_evidence)
                sources_contacted.append("neo4j")
            except Exception as e:
                logger.error(f"Graph retrieval failure: {e}")
                partial_retrieval = True

        if not self.vector_store.client or not self.graph_store.driver:
            partial_retrieval = True

        # Apply trust weighting and staleness decay
        final_evidence = apply_trust_weighting(raw_evidence) if apply_weighting else raw_evidence

        return {
            "evidence": final_evidence,
            "partial_retrieval": partial_retrieval,
            "sources_contacted": sources_contacted,
            "entities_resolved": entities or [],
        }
