from typing import List, Optional

from pydantic import BaseModel


FEATURE_VERSION = "ANCLORA-FCCC-001.v1"


class ScopeMetadata(BaseModel):
    org_id: str
    role: str


class KPIValue(BaseModel):
    label: str
    value: float
    unit: str
    trend: Optional[float] = None


class CommandCenterSnapshotResponse(BaseModel):
    version: str = FEATURE_VERSION
    scope: ScopeMetadata
    commercial_kpis: List[KPIValue]
    productivity_kpis: List[KPIValue]
    budget_status: str
    burn_pct: Optional[float] = None
    monthly_budget_eur: Optional[float] = None
    current_usage_eur: Optional[float] = None
    cost_visibility: str


class TrendPoint(BaseModel):
    period: str
    leads_created: int
    tasks_completed: int
    cost_eur: float


class CommandCenterTrendsResponse(BaseModel):
    version: str = FEATURE_VERSION
    scope: ScopeMetadata
    months: int
    points: List[TrendPoint]
