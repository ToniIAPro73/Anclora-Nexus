from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


FEATURE_VERSION = "ANCLORA-GAA-001.v1"


class AutomationRuleStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    DISABLED = "disabled"


class AutomationExecutionStatus(str, Enum):
    EXECUTED = "executed"
    BLOCKED = "blocked"


class ScopeMetadata(BaseModel):
    org_id: str
    role: str


class RuleCreateRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=120)
    event_type: str = Field(..., min_length=2, max_length=80)
    channel: str = Field(..., min_length=2, max_length=80)
    action_type: str = Field(..., min_length=2, max_length=80)
    schedule_cron: Optional[str] = Field(None, max_length=120)
    max_cost_eur_per_run: float = Field(0, ge=0, le=10000)
    requires_human_checkpoint: bool = True
    conditions: Dict[str, Any] = Field(default_factory=dict)


class RuleUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=120)
    status: Optional[AutomationRuleStatus] = None
    schedule_cron: Optional[str] = Field(None, max_length=120)
    max_cost_eur_per_run: Optional[float] = Field(None, ge=0, le=10000)
    requires_human_checkpoint: Optional[bool] = None
    conditions: Optional[Dict[str, Any]] = None


class RuleResponse(BaseModel):
    id: str
    org_id: str
    name: str
    status: AutomationRuleStatus
    event_type: str
    channel: str
    action_type: str
    schedule_cron: Optional[str]
    max_cost_eur_per_run: float
    requires_human_checkpoint: bool
    conditions: Dict[str, Any]
    created_at: datetime
    updated_at: datetime


class RuleListResponse(BaseModel):
    version: str = FEATURE_VERSION
    scope: ScopeMetadata
    items: List[RuleResponse]
    total: int


class DryRunRequest(BaseModel):
    event_payload: Dict[str, Any] = Field(default_factory=dict)
    cost_estimate_eur: float = Field(0, ge=0, le=10000)


class DryRunResponse(BaseModel):
    version: str = FEATURE_VERSION
    scope: ScopeMetadata
    rule_id: str
    decision: str
    reasons: List[str]
    guardrails: Dict[str, Any]


class ExecuteRequest(BaseModel):
    event_payload: Dict[str, Any] = Field(default_factory=dict)
    cost_estimate_eur: float = Field(0, ge=0, le=10000)
    confirm_human_checkpoint: bool = False


class ExecuteResponse(BaseModel):
    version: str = FEATURE_VERSION
    scope: ScopeMetadata
    rule_id: str
    execution_id: str
    status: AutomationExecutionStatus
    decision: str
    reasons: List[str]
    trace_id: str


class ExecutionLogItem(BaseModel):
    id: str
    org_id: str
    rule_id: str
    status: AutomationExecutionStatus
    decision: str
    reasons: List[str]
    cost_estimate_eur: float
    trace_id: str
    event_payload: Dict[str, Any]
    created_at: datetime


class ExecutionLogResponse(BaseModel):
    version: str = FEATURE_VERSION
    scope: ScopeMetadata
    items: List[ExecutionLogItem]
    total: int


class AlertItem(BaseModel):
    id: str
    org_id: str
    rule_id: str
    alert_type: str
    message: str
    is_active: bool
    created_at: datetime
    resolved_at: Optional[datetime]


class AlertListResponse(BaseModel):
    version: str = FEATURE_VERSION
    scope: ScopeMetadata
    items: List[AlertItem]
    total: int
