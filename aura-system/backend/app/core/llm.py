"""
Ollama LLM Provider for AURA Agents.
Connects to local Ollama instance (qwen3.5-9b-64k) for agent inference,
claim entailment verification, citation validation, and self-repair.
"""

import json
import logging
import urllib.request
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class OllamaLLM:
    """
    Ollama API Client powering AURA agents with local model qwen3.5-9b-64k.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        timeout: int = 180
    ):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.OLLAMA_MODEL or settings.DEFAULT_MODEL or "qwen3.5-9b-64k"
        self.timeout = timeout

    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        json_format: bool = True,
        temperature: float = 0.0,
        timeout: Optional[int] = 5
    ) -> str:
        """
        Sends generation request to local Ollama server with fast timeout.
        """
        url = f"{self.base_url}/api/generate"
        
        full_prompt = prompt
        if system_prompt:
            full_prompt = f"System: {system_prompt}\n\nUser: {prompt}"

        payload: Dict[str, Any] = {
            "model": self.model,
            "prompt": full_prompt,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }
        if json_format:
            payload["format"] = "json"

        call_timeout = timeout if timeout is not None else self.timeout

        data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"}
        )

        try:
            with urllib.request.urlopen(req, timeout=call_timeout) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                return result.get("response", "").strip()
        except Exception as err:
            logger.warning(f"Ollama fast call bypassed ({self.model}): {err}")
            return ""


llm_client = OllamaLLM()
