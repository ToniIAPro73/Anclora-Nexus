from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Optional

from backend.models.ingestion import HNWIQualificationTier, LeadIngestionPayload


PRIORITY_ZONES = (
    "andratx",
    "calvia",
    "calvià",
    "son vida",
    "deia",
    "deià",
    "valldemossa",
    "bendinat",
    "illetas",
    "portixol",
    "puerto portals",
    "portals",
)

PRIORITY_NATIONALITIES = {
    "german",
    "germany",
    "deutsch",
    "british",
    "uk",
    "united kingdom",
    "swedish",
    "norwegian",
    "danish",
    "nordic",
    "american",
    "united states",
    "usa",
    "french",
    "swiss",
}

INTENT_MARKERS = (
    "busco",
    "looking for",
    "looking to buy",
    "interested in",
    "relocating",
    "moving to mallorca",
    "sell my villa",
    "vendo",
    "fsbo",
    "for sale by owner",
    "property investor",
    "villa buyer",
)


@dataclass
class HNWILeadScore:
    score: int
    tier: str
    email_verified: bool
    outreach_ready: bool
    intent_signal: Optional[str]
    explanation: str


class HNWIProspectionScoringService:
    def score_lead(self, payload: LeadIngestionPayload) -> HNWILeadScore:
        if payload.qualification_score is not None:
            score = max(0, min(int(payload.qualification_score), 100))
            tier = payload.qualification_tier.value if payload.qualification_tier else self._tier_from_score(score)
            email_verified = bool(payload.email_verified)
            return HNWILeadScore(
                score=score,
                tier=tier,
                email_verified=email_verified,
                outreach_ready=score >= 70 and email_verified,
                intent_signal=payload.hnwi_intent_signal,
                explanation="manual_override",
            )

        score = 0
        reasons: list[str] = []

        if payload.budget and payload.budget >= 2_000_000:
            score += 30
            reasons.append("budget>=2M")

        zone = self._normalize(payload.zone_interest or self._extract_zone_from_payload(payload))
        if zone and self._contains_any(zone, PRIORITY_ZONES):
            score += 25
            reasons.append("priority_zone")

        nationality = self._normalize(payload.nationality)
        if nationality and self._contains_any(nationality, PRIORITY_NATIONALITIES):
            score += 20
            reasons.append("priority_nationality")

        intent_signal = payload.hnwi_intent_signal or self._extract_intent_signal(payload)
        if intent_signal:
            score += 25
            reasons.append("explicit_intent")

        email_verified = bool(payload.email_verified)
        if email_verified:
            score += 10
            reasons.append("email_verified")

        score = max(0, min(score, 100))
        tier = self._tier_from_score(score)
        return HNWILeadScore(
            score=score,
            tier=tier,
            email_verified=email_verified,
            outreach_ready=score >= 70 and email_verified,
            intent_signal=intent_signal,
            explanation="|".join(reasons) if reasons else "baseline",
        )

    def _tier_from_score(self, score: int) -> str:
        if score >= 70:
            return HNWIQualificationTier.HOT.value
        if score >= 45:
            return HNWIQualificationTier.WARM.value
        return HNWIQualificationTier.COLD.value

    def _extract_zone_from_payload(self, payload: LeadIngestionPayload) -> Optional[str]:
        candidates = [
            payload.property_interest,
            self._metadata_text(payload, "zone_interest"),
            self._metadata_text(payload, "location"),
        ]
        return next((item for item in candidates if item), None)

    def _extract_intent_signal(self, payload: LeadIngestionPayload) -> Optional[str]:
        text = " ".join(
            filter(
                None,
                [
                    payload.notes,
                    payload.property_interest,
                    self._metadata_text(payload, "notes"),
                    self._metadata_text(payload, "headline"),
                    self._metadata_text(payload, "signal_text"),
                ],
            )
        )
        normalized = self._normalize(text)
        if not normalized:
            return None
        for marker in INTENT_MARKERS:
            if marker in normalized:
                return marker
        return None

    def _metadata_text(self, payload: LeadIngestionPayload, key: str) -> Optional[str]:
        value = payload.metadata.get(key)
        return str(value).strip() if isinstance(value, str) and value.strip() else None

    def _contains_any(self, haystack: str, needles: Iterable[str]) -> bool:
        return any(needle in haystack for needle in needles)

    def _normalize(self, value: Optional[str]) -> str:
        return (value or "").strip().lower()


hnwi_scoring_service = HNWIProspectionScoringService()
