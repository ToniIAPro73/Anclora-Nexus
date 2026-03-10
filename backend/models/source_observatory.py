from typing import List

from pydantic import BaseModel


FEATURE_VERSION = "ANCLORA-SPO-001.v1_1"


class ScopeMetadata(BaseModel):
    org_id: str
    role: str


class SourceScorecard(BaseModel):
    source_key: str
    total_events: int
    success_events: int
    duplicate_events: int
    error_events: int
    success_rate_pct: float
    lead_count: int
    property_count: int
    seller_count: int
    processed_events: int
    rejected_events: int
    failed_events: int
    created_entities: int
    freshness_hours: float | None
    latest_event_at: str | None
    operational_status: str
    entity_types: List[str]


class ObservatorySummary(BaseModel):
    total_sources: int
    healthy_sources: int
    warning_sources: int
    critical_sources: int
    stale_sources: int
    total_events: int
    total_created_entities: int
    total_failures: int


class ObservatoryOverviewResponse(BaseModel):
    version: str = FEATURE_VERSION
    scope: ScopeMetadata
    summary: ObservatorySummary
    items: List[SourceScorecard]
    total: int


class RankingItem(BaseModel):
    source_key: str
    score: float
    success_rate_pct: float
    lead_count: int
    created_entities: int
    freshness_hours: float | None
    operational_status: str


class ObservatoryRankingResponse(BaseModel):
    version: str = FEATURE_VERSION
    scope: ScopeMetadata
    items: List[RankingItem]
    total: int


class TrendPoint(BaseModel):
    period: str
    source_key: str
    events: int
    success_rate_pct: float
    processed_events: int
    failed_events: int
    created_entities: int


class ObservatoryTrendsResponse(BaseModel):
    version: str = FEATURE_VERSION
    scope: ScopeMetadata
    months: int
    points: List[TrendPoint]
