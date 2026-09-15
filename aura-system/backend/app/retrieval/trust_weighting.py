"""
Trust Weighting & Confidence Adjustment Engine for AURA Evidence.
Applies deterministic confidence scaling based on ingestion-time trust-tier metadata and evidence freshness.
"""

import logging
from typing import List
from datetime import datetime, timezone
from app.schemas.schemas import Evidence

logger = logging.getLogger(__name__)

# Multipliers per source trust tier
TRUST_TIER_MULTIPLIERS = {
    1: 1.00,  # Primary / Curated / Gold standard
    2: 0.85,  # Secondary / Verified doc
    3: 0.60,  # Unvetted / Community / Web crawl
}


def calculate_staleness_factor(last_verified_iso: str, max_age_days: int = 30) -> float:
    """
    Calculate staleness decay factor for evidence based on ISO last_verified timestamp.
    Returns a factor between 0.5 (very stale) and 1.0 (fresh).
    """
    if not last_verified_iso:
        return 1.0
    try:
        # Parse ISO string
        if last_verified_iso.endswith("Z"):
            last_verified_iso = last_verified_iso[:-1] + "+00:00"
        dt = datetime.fromisoformat(last_verified_iso)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        
        now = datetime.now(timezone.utc)
        age_days = (now - dt).total_seconds() / 86400.0
        
        if age_days <= max_age_days:
            return 1.0
        else:
            # Decay 5% per 30 days past threshold, floor at 0.5
            extra_periods = (age_days - max_age_days) / 30.0
            factor = 1.0 - (extra_periods * 0.05)
            return max(0.5, round(factor, 4))
    except Exception as e:
        logger.warning(f"Error parsing last_verified timestamp '{last_verified_iso}': {e}")
        return 1.0


def apply_trust_weighting(evidence_list: List[Evidence]) -> List[Evidence]:
    """
    Apply source_trust_tier weighting and staleness decay to a list of Evidence objects.
    Returns new list of Evidence objects with adjusted confidence scores.
    """
    weighted_list: List[Evidence] = []
    
    for item in evidence_list:
        tier_multiplier = TRUST_TIER_MULTIPLIERS.get(item.source_trust_tier, 0.60)
        staleness_factor = calculate_staleness_factor(item.last_verified) if item.last_verified else 1.0
        
        # Calculate final adjusted confidence
        adjusted_conf = round(max(0.0, min(1.0, item.confidence * tier_multiplier * staleness_factor)), 4)
        
        # Return new Evidence with updated confidence score
        weighted_item = Evidence(
            source_id=item.source_id,
            text=item.text,
            retrieval_method=item.retrieval_method,
            confidence=adjusted_conf,
            source_trust_tier=item.source_trust_tier,
            last_verified=item.last_verified,
        )
        weighted_list.append(weighted_item)
        
    return weighted_list
