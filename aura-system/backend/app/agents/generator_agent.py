"""
Draft Generator Agent for AURA pipeline (Architecture.md §3.1).
Active in 'generate_and_audit' mode: generates an initial grounded candidate response
for a raw user query before claim decomposition and verification.
"""

import json
import logging
from typing import List, Optional
from app.core.llm import llm_client
from app.schemas.schemas import Evidence

logger = logging.getLogger(__name__)


class DraftGeneratorAgent:
    """
    Draft Generator produces candidate LLM responses for user queries
    in 'generate_and_audit' mode.
    """

    def __init__(self, model_name: str = "fixed-v1"):
        self.model_name = model_name

    def generate_candidate(self, query: str, context: Optional[List[Evidence]] = None) -> str:
        """
        Generates a candidate answer for a raw user query.
        Uses retrieved context passages if available for grounded drafting.
        """
        if not query or not query.strip():
            return ""

        context_passages = context or []
        context_str = ""
        if context_passages:
            context_str = "\n".join([
                f"- [Source {e.source_id}] {e.text.strip()}"
                for e in context_passages[:5]
                if e.text.strip()
            ])

        system_prompt = (
            "You are AURA's factual draft generator. "
            "Generate a clear, objective, factual response to the user query. "
            "Base your answer strictly on the provided context if provided. "
            "Avoid speculative claims or ungrounded assertions."
        )

        user_prompt = f"User Query: {query}\n"
        if context_str:
            user_prompt += f"\nRetrieved Knowledge Context:\n{context_str}\n"
        user_prompt += "\nPlease provide a direct, factual answer."

        # Attempt generation via Ollama LLM
        try:
            resp = llm_client.generate(
                prompt=user_prompt,
                system_prompt=system_prompt,
                json_format=False,
                temperature=0.0,
                timeout=5
            )
            if resp and resp.strip():
                return resp.strip()
        except Exception as err:
            logger.warning(f"DraftGeneratorAgent LLM call bypassed: {err}")

        # Grounded fallback if LLM is unavailable: synthesize from top evidence
        if context_passages:
            best_passages = [e.text.strip() for e in context_passages if e.confidence >= 0.5]
            if best_passages:
                return " ".join(best_passages[:2])

        # Default fallback for query
        return f"Regarding '{query}': Information has been retrieved for factual verification."
