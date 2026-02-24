from typing import List

from pydantic import BaseModel


FEATURE_VERSION = "ANCLORA-SPO-001.v1"


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


class ObservatoryOverviewResponse(BaseModel):
    version: str = FEATURE_VERSION
    scope: ScopeMetadata
    items: List[SourceScorecard]
    total: int


class RankingItem(BaseModel):
    source_key: str
    score: float
    success_rate_pct: float
    lead_count: int


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


class ObservatoryTrendsResponse(BaseModel):
    version: str = FEATURE_VERSION
    scope: ScopeMetadata
    months: int
    points: List[TrendPoint]
