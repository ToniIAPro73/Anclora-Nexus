from typing import Any, Dict, List, Optional

from pydantic import BaseModel


FEATURE_VERSION = "ANCLORA-FCCC-001.v1_1"


class ScopeMetadata(BaseModel):
    org_id: str
    role: str


class KPIValue(BaseModel):
    label: str
    value: float
    unit: str
    trend: Optional[float] = None


class OperationalAlertPreview(BaseModel):
    id: str
    alert_scope: str
    severity: str
    alert_type: str
    message: str
    created_at: str
    metadata_json: Dict[str, Any] = {}


class OperationalOverview(BaseModel):
    active_alerts: int
    critical_alerts: int
    degraded_sources: int
    stale_sources: int
    territorial_sync_status: str
    territorial_pipeline_status: str
    top_alerts: List[OperationalAlertPreview]


class PipelineOverview(BaseModel):
    seller_signals_processed: int
    sellers_total: int
    sellers_high_priority: int
    sellers_converted: int
    seller_conversion_rate: float
    supervised_sends_confirmed: int
    active_workbench_ready: int


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
    operational_overview: OperationalOverview
    pipeline_overview: PipelineOverview


class TrendPoint(BaseModel):
    period: str
    leads_created: int
    tasks_completed: int
    cost_eur: float
    active_alerts: int = 0
    critical_alerts: int = 0
    seller_signals_processed: int = 0
    sellers_created: int = 0
    supervised_sends_confirmed: int = 0


class CommandCenterTrendsResponse(BaseModel):
    version: str = FEATURE_VERSION
    scope: ScopeMetadata
    months: int
    points: List[TrendPoint]
