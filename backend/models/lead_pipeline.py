"""Pydantic models for lead pipeline reporting and staleness detection.

Supports pipeline metrics endpoint and Command Center event emission
(Requirements 14.1, 14.2, 14.3, 14.4).
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class TemperatureMetrics(BaseModel):
    """Leads grouped by temperature."""

    cold: int = 0
    warm: int = 0
    hot: int = 0


class OwnerMetrics(BaseModel):
    """Lead count per assigned owner."""

    owner_id: Optional[str] = None
    owner_name: Optional[str] = None
    count: int = 0


class FunnelStage(BaseModel):
    """A single conversion funnel stage."""

    stage: str
    count: int = 0


class StaleLeadInfo(BaseModel):
    """A lead flagged as stale."""

    lead_id: str
    contact_name: str
    assigned_owner: Optional[str] = None
    temperature: str
    created_at: str
    days_since_creation: float


class PipelineMetricsResponse(BaseModel):
    """Response body for GET /api/v1/leads/metrics."""

    total_leads: int = 0
    by_temperature: TemperatureMetrics = Field(default_factory=TemperatureMetrics)
    by_owner: list[OwnerMetrics] = Field(default_factory=list)
    conversion_funnel: list[FunnelStage] = Field(default_factory=list)
    stale_leads: list[StaleLeadInfo] = Field(default_factory=list)
    stale_count: int = 0


class LeadPipelineEvent(BaseModel):
    """Event emitted to Command Center on temperature/owner changes."""

    event_type: Literal["temperature_change", "owner_change"]
    lead_id: str
    org_id: str
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    timestamp: str
