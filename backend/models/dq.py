from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum

class EntityType(str, Enum):
    LEAD = "lead"
    PROPERTY = "property"

class IssueType(str, Enum):
    MISSING_FIELD = "missing_field"
    INVALID_FORMAT = "invalid_format"
    INCONSISTENT_VALUE = "inconsistent_value"
    DUPLICATE_CANDIDATE = "duplicate_candidate"

class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class IssueStatus(str, Enum):
    OPEN = "open"
    IN_REVIEW = "in_review"
    RESOLVED = "resolved"
    IGNORED = "ignored"

class CandidateStatus(str, Enum):
    AUTO_LINK = "auto_link"
    SUGGESTED_MERGE = "suggested_merge"
    APPROVED_MERGE = "approved_merge"
    REJECTED_MERGE = "rejected_merge"

class ResolutionAction(str, Enum):
    APPROVE_MERGE = "approve_merge"
    REJECT_MERGE = "reject_merge"
    MARK_DUPLICATE = "mark_duplicate"
    UNDO_MERGE = "undo_merge"

class DQQualityIssue(BaseModel):
    id: UUID
    org_id: UUID
    entity_type: EntityType
    entity_id: UUID
    issue_type: IssueType
    severity: Severity
    issue_payload: Dict[str, Any] = {}
    status: IssueStatus
    created_at: datetime
    updated_at: datetime

class DQEntityCandidate(BaseModel):
    id: UUID
    org_id: UUID
    entity_type: EntityType
    left_entity_id: UUID
    right_entity_id: UUID
    similarity_score: float = Field(..., ge=0, le=100)
    signals: Dict[str, Any] = {}
    status: CandidateStatus
    created_at: datetime
    updated_at: datetime

class DQResolutionLog(BaseModel):
    id: UUID
    org_id: UUID
    entity_type: EntityType
    candidate_id: Optional[UUID] = None
    action: ResolutionAction
    actor_user_id: Optional[UUID] = None
    details: Dict[str, Any] = {}
    created_at: datetime

class DQResolveRequest(BaseModel):
    candidate_id: UUID
    action: ResolutionAction
    details: Optional[Dict[str, Any]] = None

class DQMetricsResponse(BaseModel):
    total_issues: int
    open_issues: int
    critical_issues: int
    total_candidates: int
    suggested_merges: int
    last_recompute_at: Optional[datetime] = None

class DQIssuesResponse(BaseModel):
    issues: List[DQQualityIssue]
    total_count: int
