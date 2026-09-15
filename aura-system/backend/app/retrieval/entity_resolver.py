"""
Named Entity Resolver for AURA Knowledge Graph Lookup.
Extracts named entities, proper nouns, acronyms, and domain concepts from claim text.
"""

import re
import logging
from typing import List

logger = logging.getLogger(__name__)

# Common stop words to exclude from entity linking
STOP_WORDS = {
    "The", "A", "An", "In", "On", "At", "For", "To", "Of", "With", "By",
    "From", "As", "Is", "Are", "Was", "Were", "Be", "Been", "Being",
    "Have", "Has", "Had", "Do", "Does", "Did", "But", "And", "Or", "If",
    "This", "That", "These", "Those", "It", "Its", "They", "Their", "We",
}


def resolve_entities(text: str) -> List[str]:
    """
    Extract candidate named entities and domain terms from claim text string.
    Returns deduplicated list of entity strings.
    """
    if not text or not text.strip():
        return []

    entities = []

    # 1. Match multi-word title case sequences (e.g., "Agentic Unified Reliability Auditor", "FastAPI Framework")
    multi_word_pattern = r'\b[A-Z][a-z0-9]+(?:\s+[A-Z][a-z0-9]+)+\b'
    multi_words = re.findall(multi_word_pattern, text)
    for mw in multi_words:
        if mw not in STOP_WORDS:
            entities.append(mw)

    # 2. Match CamelCase or mixed-case identifiers (e.g., "LangGraph", "Qdrant", "PostgreSQL", "Neo4j")
    camel_case_pattern = r'\b[A-Z][a-z0-9]+[A-Z][a-zA-Z0-9]*\b'
    camel_words = re.findall(camel_case_pattern, text)
    for cw in camel_words:
        entities.append(cw)

    # 3. Match single capitalized words / acronyms (e.g., "AURA", "LLM", "RAG")
    single_word_pattern = r'\b[A-Z]{2,}\b|\b[A-Z][a-z0-9]{2,}\b'
    single_words = re.findall(single_word_pattern, text)
    for sw in single_words:
        if sw not in STOP_WORDS and len(sw) > 1:
            entities.append(sw)

    # Deduplicate while preserving order
    seen = set()
    deduped = []
    for ent in entities:
        if ent.lower() not in seen:
            seen.add(ent.lower())
            deduped.append(ent)

    return deduped
