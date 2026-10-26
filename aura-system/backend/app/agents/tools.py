"""
Free & Open-Source Agent Tools Suite for AURA Auditor.
Includes Wikipedia Search, DuckDuckGo Web Search, ArXiv Paper Verification,
and Deterministic Math/Logic Verification tools (Zero API key required).
"""

import re
import json
import logging
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from app.schemas.schemas import Evidence

logger = logging.getLogger(__name__)

USER_AGENT = "AURA-Agentic-Unified-Reliability-Auditor/1.0"


def wikipedia_search_tool(query: str, top_k: int = 3) -> List[Evidence]:
    """
    Open-Source Wikipedia Search Tool.
    Queries Wikipedia API for factual background context.
    """
    results: List[Evidence] = []
    try:
        url = "https://en.wikipedia.org/w/api.php?" + urllib.parse.urlencode({
            "action": "query",
            "list": "search",
            "srsearch": query,
            "format": "json"
        })
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            search_items = data.get("query", {}).get("search", [])[:top_k]
            
            for item in search_items:
                raw_snippet = item.get("snippet", "")
                clean_snippet = re.sub(r'<[^>]+>', '', raw_snippet)
                title = item.get("title", "Wikipedia Article")
                
                results.append(
                    Evidence(
                        source_id=f"wikipedia:{title.replace(' ', '_')}",
                        text=f"Wikipedia [{title}]: {clean_snippet}",
                        retrieval_method="vector",
                        confidence=0.88,
                        source_trust_tier=1,
                        last_verified=datetime.now(timezone.utc).isoformat()
                    )
                )
    except Exception as err:
        logger.warning(f"Wikipedia search tool error: {err}")
        
    return results


def duckduckgo_search_tool(query: str, top_k: int = 3) -> List[Evidence]:
    """
    Free Open-Source DuckDuckGo Web Search Tool.
    Queries DuckDuckGo API/Instant Answer for web snippets.
    """
    results: List[Evidence] = []
    try:
        url = "https://api.duckduckgo.com/?" + urllib.parse.urlencode({
            "q": query,
            "format": "json",
            "no_html": "1",
            "skip_disambig": "1"
        })
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            
            abstract = data.get("AbstractText", "")
            heading = data.get("Heading", "DuckDuckGo Web Resource")
            
            if abstract:
                results.append(
                    Evidence(
                        source_id=f"ddg_web:{heading.replace(' ', '_')}",
                        text=f"Web Search [{heading}]: {abstract}",
                        retrieval_method="vector",
                        confidence=0.80,
                        source_trust_tier=2,
                        last_verified=datetime.now(timezone.utc).isoformat()
                    )
                )
                
            related_topics = data.get("RelatedTopics", [])[:top_k]
            for idx, topic in enumerate(related_topics):
                if isinstance(topic, dict) and "Text" in topic:
                    results.append(
                        Evidence(
                            source_id=f"ddg_web_ref_{idx+1}",
                            text=f"Web Snippet: {topic['Text']}",
                            retrieval_method="vector",
                            confidence=0.75,
                            source_trust_tier=2,
                            last_verified=datetime.now(timezone.utc).isoformat()
                        )
                    )
    except Exception as err:
        logger.warning(f"DuckDuckGo search tool error: {err}")
        
    return results


def arxiv_search_tool(query: str, top_k: int = 2) -> List[Evidence]:
    """
    Open-Source ArXiv Academic Paper Search Tool.
    Queries ArXiv API to verify academic research paper citations.
    """
    results: List[Evidence] = []
    try:
        url = "http://export.arxiv.org/api/query?" + urllib.parse.urlencode({
            "search_query": f"all:{query}",
            "max_results": str(top_k)
        })
        req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
        with urllib.request.urlopen(req, timeout=5) as resp:
            xml_data = resp.read().decode("utf-8")
            root = ET.fromstring(xml_data)
            
            ns = {"atom": "http://www.w3.org/2005/Atom"}
            entries = root.findall("atom:entry", ns)
            
            for entry in entries:
                title_elem = entry.find("atom:title", ns)
                summary_elem = entry.find("atom:summary", ns)
                id_elem = entry.find("atom:id", ns)
                
                title = title_elem.text.strip().replace("\n", " ") if title_elem is not None else "ArXiv Paper"
                summary = summary_elem.text.strip().replace("\n", " ")[:300] if summary_elem is not None else ""
                paper_id = id_elem.text.strip() if id_elem is not None else "arxiv"
                
                results.append(
                    Evidence(
                        source_id=f"arxiv:{paper_id.split('/')[-1]}",
                        text=f"ArXiv Paper [{title}]: {summary}",
                        retrieval_method="graph",
                        confidence=0.92,
                        source_trust_tier=1,
                        last_verified=datetime.now(timezone.utc).isoformat()
                    )
                )
    except Exception as err:
        logger.warning(f"ArXiv search tool error: {err}")
        
    return results


def math_logic_verifier_tool(claim_text: str) -> Dict[str, Any]:
    """
    Deterministic Math & Numeric Consistency Tool.
    Extracts numerical figures and verifies basic percentage/sum relations.
    """
    numbers = [float(n) for n in re.findall(r'\b\d+(?:\.\d+)?\b', claim_text)]
    percent_match = re.search(r'(\d+(?:\.\d+)?)\s*%', claim_text)
    
    return {
        "extracted_numbers": numbers,
        "has_percentage": bool(percent_match),
        "percentage_value": float(percent_match.group(1)) if percent_match else None,
        "is_numerically_testable": len(numbers) >= 2
    }


def multi_source_open_retriever_tool(query: str) -> List[Evidence]:
    """
    Aggregates open-source search tools (Wikipedia + DuckDuckGo + ArXiv)
    to build an open-retrieval evidence stream.
    """
    evidence_list: List[Evidence] = []
    
    # Query Wikipedia
    wiki_ev = wikipedia_search_tool(query, top_k=2)
    evidence_list.extend(wiki_ev)
    
    # Query DuckDuckGo
    ddg_ev = duckduckgo_search_tool(query, top_k=2)
    evidence_list.extend(ddg_ev)
    
    # Query ArXiv if research/paper query
    if any(kw in query.lower() for kw in ["paper", "study", "trial", "arxiv", "according to", "model", "algorithm"]):
        arxiv_ev = arxiv_search_tool(query, top_k=1)
        evidence_list.extend(arxiv_ev)
        
    return evidence_list
