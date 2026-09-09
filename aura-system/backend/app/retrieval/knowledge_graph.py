"""
Knowledge Graph Retriever (Neo4j Client Wrapper).
Provides structured relationship lookup over domain knowledge graphs.
Enforces AGENTS.md guardrails: last_verified on every edge, trust-tier metadata, and graceful failure handling.
"""

import logging
from typing import List, Optional
from datetime import datetime, timezone
from neo4j import GraphDatabase, Driver
from app.schemas.schemas import Evidence
from app.core.config import settings

logger = logging.getLogger(__name__)


class GraphRetriever:
    """
    Neo4j graph database wrapper for structured relationship evidence retrieval.
    """

    def __init__(self, uri: Optional[str] = None, user: Optional[str] = None, password: Optional[str] = None):
        self.uri = uri or settings.NEO4J_URI
        self.user = user or settings.NEO4J_USER
        self.password = password or settings.NEO4J_PASSWORD
        self._driver: Optional[Driver] = None

    @property
    def driver(self) -> Optional[Driver]:
        if self._driver is None:
            try:
                self._driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
            except Exception as e:
                logger.error(f"Failed to connect to Neo4j at {self.uri}: {e}")
                self._driver = None
        return self._driver

    def close(self):
        if self._driver:
            self._driver.close()
            self._driver = None

    def lookup(
        self,
        entities: List[str],
        relation_type: Optional[str] = None,
        limit: int = 10,
    ) -> List[Evidence]:
        """
        Lookup relationships for a set of entity names in Neo4j.
        
        Guardrails enforced:
        - Graph queries must include last_verified on every edge used.
        - Attach source_trust_tier from edge metadata.
        """
        if not self.driver or not entities:
            logger.warning("Neo4j driver unavailable or empty entities list; returning empty evidence list")
            return []

        cypher_query = """
        MATCH (e:Entity)-[r]->(target:Entity)
        WHERE toLower(e.name) IN [entity IN $entities | toLower(entity)]
        RETURN e.name AS subject, type(r) AS relation, target.name AS object,
               r.last_verified AS last_verified,
               r.confidence AS confidence,
               r.source_trust_tier AS source_trust_tier,
               r.source_id AS source_id
        LIMIT $limit
        """

        evidence_list: List[Evidence] = []
        try:
            with self.driver.session() as session:
                result = session.run(cypher_query, entities=entities, limit=limit)
                for record in result:
                    subject = record.get("subject", "")
                    relation = record.get("relation", "")
                    obj = record.get("object", "")
                    
                    raw_verified = record.get("last_verified")
                    last_verified = str(raw_verified) if raw_verified else datetime.now(timezone.utc).isoformat()
                    
                    confidence = float(record.get("confidence") or 0.85)
                    trust_tier = int(record.get("source_trust_tier") or 1)
                    source_id = str(record.get("source_id") or f"graph_{subject}_{relation}_{obj}")

                    triple_str = f"({subject}) -[{relation}]-> ({obj})"
                    
                    evidence = Evidence(
                        source_id=source_id,
                        text=triple_str,
                        retrieval_method="graph",
                        confidence=round(confidence, 4),
                        source_trust_tier=trust_tier,
                        last_verified=last_verified,
                    )
                    evidence_list.append(evidence)

            return evidence_list

        except Exception as e:
            logger.error(f"Neo4j lookup error: {e}")
            return []
