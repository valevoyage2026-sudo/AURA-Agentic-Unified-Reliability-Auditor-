"""
Claim Decomposition / Planner Agent for AURA pipeline.
Converts raw LLM response text into typed Claim objects with verbatim character spans.
Enforces guardrails and taxonomy rules from AGENTS.md §2 and Architecture.md §3.3.
"""

import hashlib
import re
from typing import List, Tuple
from app.schemas.schemas import Claim, ClaimType


# Heuristic Regex Patterns for Taxonomy Classification
ABBREVIATIONS_AND_ORDINALS = re.compile(
    r'^(?:'
    r'\d{1,3}'                             # Ordinal numbers: 1, 2, 10, 100
    r'|[A-Za-z]'                           # Single letters: A, b, C
    r'|[ivxIVX]{1,4}'                      # Roman numerals: i, ii, iii, iv, v, vi, IX
    r'|Dr|Mr|Mrs|Ms|Prof|Sr|Jr|vs|eg|ie|fig|no|vol|pp|etc|al|St' # Common abbreviations
    r')$',
    re.IGNORECASE
)

CITATION_PATTERNS = [
    re.compile(r'\baccording to\b', re.IGNORECASE),
    re.compile(r'\bsource\s*:', re.IGNORECASE),
    re.compile(r'\bcited by\b', re.IGNORECASE),
    re.compile(r'\bper\s+\[', re.IGNORECASE),
    re.compile(r'\b(?:as\s+)?described in\b', re.IGNORECASE),
    re.compile(r'\[[A-Za-z0-9_\-\.\s]+\]'),  # e.g., [Smith et al., 2021] or [1]
    re.compile(r'https?://\S+'),
    re.compile(r'\b(?:et al\.|paper|report|study|journal|article|docs|documentation)\b', re.IGNORECASE),
]

SUBJECTIVE_PATTERNS = [
    re.compile(r'\bi think\b', re.IGNORECASE),
    re.compile(r'\bi believe\b', re.IGNORECASE),
    re.compile(r'\bin my opinion\b', re.IGNORECASE),
    re.compile(r'\bin our opinion\b', re.IGNORECASE),
    re.compile(r'\bmy view\b', re.IGNORECASE),
    re.compile(r'\bthe best\b', re.IGNORECASE),
    re.compile(r'\bthe worst\b', re.IGNORECASE),
    re.compile(r'\bbeautiful\b', re.IGNORECASE),
    re.compile(r'\bexcellent\b', re.IGNORECASE),
    re.compile(r'\bterrible\b', re.IGNORECASE),
    re.compile(r'\bawesome\b', re.IGNORECASE),
    re.compile(r'\bhorrible\b', re.IGNORECASE),
    re.compile(r'\bgreatest\b', re.IGNORECASE),
    re.compile(r'\bfavorite\b', re.IGNORECASE),
    re.compile(r'\bshould be\b', re.IGNORECASE),
]

UNVERIFIABLE_PATTERNS = [
    re.compile(r'\bwill (?:solve|end|destroy|save|cure)\b.*\bby 20\d{2}\b', re.IGNORECASE),
    re.compile(r'\bunknowable\b', re.IGNORECASE),
    re.compile(r'\bimpossible to (?:verify|know|prove)\b', re.IGNORECASE),
    re.compile(r'\bintrospective state\b', re.IGNORECASE),
]


def _generate_claim_id(text_span: str, start: int, end: int) -> str:
    """Generates a deterministic canonical claim ID based on content and span offset."""
    raw_key = f"{start}:{end}:{text_span}"
    digest = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()[:10]
    return f"claim_{digest}"


def classify_claim_type(claim_text: str) -> ClaimType:
    """
    Classifies claim text into one of the 5 taxonomy types:
    - factual-atomic
    - factual-compound
    - citation
    - subjective
    - unverifiable
    """
    # 1. Check Citation
    for pattern in CITATION_PATTERNS:
        if pattern.search(claim_text):
            return "citation"

    # 2. Check Subjective / Opinion
    for pattern in SUBJECTIVE_PATTERNS:
        if pattern.search(claim_text):
            return "subjective"

    # 3. Check Unverifiable
    for pattern in UNVERIFIABLE_PATTERNS:
        if pattern.search(claim_text):
            return "unverifiable"

    # 4. Factual Compound vs Factual Atomic
    # Heuristic: Conjunctions connecting multiple clauses (e.g. ' and ', ' while ')
    if re.search(r'\b(?:and|while|whereas|as well as)\b', claim_text, re.IGNORECASE) and len(claim_text.split()) > 12:
        return "factual-compound"

    return "factual-atomic"


def _get_preceding_word(text: str, pos: int) -> str:
    """Gets the word immediately preceding position `pos` in `text`."""
    sub = text[:pos]
    match = re.search(r'([A-Za-z0-9]+)\s*$', sub)
    return match.group(1) if match else ""


def _is_abbreviation_or_ordinal(prefix_word: str) -> bool:
    """Checks if the word immediately preceding a delimiter is a bullet ordinal or abbreviation."""
    cleaned = prefix_word.strip()
    return bool(ABBREVIATIONS_AND_ORDINALS.match(cleaned))


def _extract_raw_spans(text: str) -> List[Tuple[int, int, str]]:
    """
    Extracts candidate sentence/clause spans while strictly preserving verbatim substring offsets.
    Guarantees text[start:end] == span_text for every returned span.
    Handles ordinal prefixes (1., 2.), bullet points, decimals, and standard abbreviations.
    """
    if not text:
        return []

    spans: List[Tuple[int, int, str]] = []

    # 1. Check for explicit citation prefix splitting, e.g., "According to X, Y"
    citation_prefix_match = re.match(
        r'^((?:According to|Per|As reported by|Source:)\s+[^,]+,\s*)(.+)$',
        text,
        re.IGNORECASE | re.DOTALL,
    )
    if citation_prefix_match:
        p1_text = citation_prefix_match.group(1)
        p2_text = citation_prefix_match.group(2)
        spans.append((0, len(p1_text), p1_text))
        spans.append((len(p1_text), len(text), p2_text))
        return spans

    # 2. Sentence boundary extraction ignoring abbreviations and ordinal prefixes
    curr_start = 0
    n = len(text)
    boundary_pattern = re.compile(r'[.!?]+(?=\s+|\n|$)', re.DOTALL)

    for match in boundary_pattern.finditer(text):
        punc_start, punc_end = match.span()
        preceding_word = _get_preceding_word(text, punc_start)

        # Skip splitting if punctuation follows an ordinal prefix (1., 2.) or abbreviation
        if punc_end < n and _is_abbreviation_or_ordinal(preceding_word):
            continue

        raw_span = text[curr_start:punc_end]
        l_stripped = raw_span.lstrip()
        if l_stripped:
            leading_offset = len(raw_span) - len(l_stripped)
            real_start = curr_start + leading_offset
            r_stripped = l_stripped.rstrip()
            real_end = real_start + len(r_stripped)

            span_str = text[real_start:real_end]
            if span_str:
                spans.append((real_start, real_end, span_str))

        curr_start = punc_end

    # Capture remaining tail if text doesn't end with sentence punctuation
    if curr_start < n:
        raw_span = text[curr_start:n]
        l_stripped = raw_span.lstrip()
        if l_stripped:
            leading_offset = len(raw_span) - len(l_stripped)
            real_start = curr_start + leading_offset
            r_stripped = l_stripped.rstrip()
            real_end = real_start + len(r_stripped)

            span_str = text[real_start:real_end]
            if span_str:
                spans.append((real_start, real_end, span_str))

    return spans


def decompose_claims(text: str) -> List[Claim]:
    """
    Primary entry point for Planner claim decomposition.
    Splits input text into atomic/compound typed Claim objects with exact character spans.

    Guarantees:
    - Every claim.text == text[start:end]
    - Empty/whitespace/malformed input falls back safely to 1 factual-compound claim covering full text
    - Bullet ordinal prefixes (1., 2.) and non-alphabetic fragments are not parsed as standalone claims
    - Claim IDs are deterministic
    """
    # Fallback for empty or whitespace-only input
    if not text or not text.strip():
        full_span = (0, len(text))
        claim_id = _generate_claim_id(text, 0, len(text))
        return [
            Claim(
                id=claim_id,
                text=text,
                type="factual-compound",
                char_span=full_span,
                depends_on=[]
            )
        ]

    try:
        raw_spans = _extract_raw_spans(text)

        claims: List[Claim] = []
        for start, end, span_text in raw_spans:
            # Double-check invariant: text[start:end] MUST equal span_text
            assert text[start:end] == span_text, f"Span mismatch: text[{start}:{end}] != '{span_text}'"

            # Filter out non-claim spans lacking sufficient alphabetic content (e.g. "2.", "---", "(a)")
            if len(re.findall(r'[a-zA-Z]', span_text)) < 2:
                continue

            claim_type = classify_claim_type(span_text)
            claim_id = _generate_claim_id(span_text, start, end)

            claims.append(
                Claim(
                    id=claim_id,
                    text=span_text,
                    type=claim_type,
                    char_span=(start, end),
                    depends_on=[]
                )
            )

        # Fallback if parsing returned no valid claims
        if not claims:
            full_span = (0, len(text))
            claim_id = _generate_claim_id(text, 0, len(text))
            return [
                Claim(
                    id=claim_id,
                    text=text,
                    type="factual-compound",
                    char_span=full_span,
                    depends_on=[]
                )
            ]

        return claims

    except Exception:
        # Robust fallback on unexpected errors during parsing
        full_span = (0, len(text))
        claim_id = _generate_claim_id(text, 0, len(text))
        return [
            Claim(
                id=claim_id,
                text=text,
                type="factual-compound",
                char_span=full_span,
                depends_on=[]
            )
        ]

