from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, condecimal

class BudgetResponse(BaseModel):
    org_id: str
    monthly_budget_eur: float
    warning_threshold_pct: float
    hard_stop_threshold_pct: float
    hard_stop_enabled: bool
    current_usage_eur: float
    current_usage_pct: float
    status: str  # "ok", "warning", "hard_stop"

class BudgetUpdate(BaseModel):
    monthly_budget_eur: Optional[float] = Field(None, ge=0)
    warning_threshold_pct: Optional[float] = Field(None, ge=1, le=100)
    hard_stop_threshold_pct: Optional[float] = Field(None, ge=1, le=200)
    hard_stop_enabled: Optional[bool] = None

class UsageEventSchema(BaseModel):
    capability_code: str
    provider: Optional[str] = None
    units: float = Field(..., ge=0)
    cost_eur: float = Field(..., ge=0)
    trace_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class UsageEventResponse(BaseModel):
    id: str
    org_id: str
    capability_code: str
    provider: Optional[str]
    units: float
    cost_eur: float
    trace_id: Optional[str]
    metadata: Dict[str, Any]
    created_at: datetime

class AlertResponse(BaseModel):
    id: str
    org_id: str
    alert_type: str
    month_key: str
    threshold_pct: float
    current_pct: float
    is_active: bool
    created_at: datetime
    resolved_at: Optional[datetime]
