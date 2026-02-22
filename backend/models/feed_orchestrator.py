from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


FeedFormat = Literal["xml", "json"]
FeedStatus = Literal["healthy", "warning", "blocked"]


class FeedValidationIssue(BaseModel):
    property_id: str
    field: str
    severity: Literal["warning", "error"]
    message: str


class FeedChannelSummary(BaseModel):
    channel: str
    format: FeedFormat
    is_enabled: bool = True
    status: FeedStatus
    total_candidates: int
    ready_to_publish: int
    warnings: int
    errors: int
    latest_run_at: Optional[datetime] = None


class FeedWorkspaceResponse(BaseModel):
    generated_at: datetime
    channels: List[FeedChannelSummary]
    totals: Dict[str, int]


class FeedValidationResponse(BaseModel):
    channel: str
    generated_at: datetime
    total_candidates: int
    ready_to_publish: int
    warnings: int
    errors: int
    issues: List[FeedValidationIssue] = Field(default_factory=list)


class FeedPublishRequest(BaseModel):
    dry_run: bool = False
    max_items: int = Field(default=100, ge=1, le=500)


class FeedPublishResponse(BaseModel):
    run_id: str
    channel: str
    dry_run: bool
    status: Literal["success", "partial", "failed"]
    published_count: int
    rejected_count: int
    error_count: int
    generated_at: datetime
    sample_payload: Dict[str, Any] = Field(default_factory=dict)
    issues: List[FeedValidationIssue] = Field(default_factory=list)


class FeedRunItem(BaseModel):
    run_id: str
    channel: str
    status: str
    dry_run: bool
    published_count: int
    rejected_count: int
    generated_at: datetime


class FeedRunListResponse(BaseModel):
    items: List[FeedRunItem]
    total: int


class FeedChannelConfigResponse(BaseModel):
    channel: str
    format: FeedFormat
    is_enabled: bool
    max_items_per_run: int
    rules_json: Dict[str, Any] = Field(default_factory=dict)


class FeedChannelConfigUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    max_items_per_run: Optional[int] = Field(default=None, ge=1, le=10000)
    rules_json: Optional[Dict[str, Any]] = None
