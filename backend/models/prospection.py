"""
Pydantic models for Prospection & Buyer Matching v1.
Feature: ANCLORA-PBM-001
"""

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator, model_validator


# ═══════════════════════════════════════════════════════════════════════════════
# ENUMS
# ═══════════════════════════════════════════════════════════════════════════════


class PropertyStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    NEGOTIATING = "negotiating"
    LISTED = "listed"
    DISCARDED = "discarded"


class BuyerStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    CLOSED = "closed"


class MatchStatus(str, Enum):
    CANDIDATE = "candidate"
    CONTACTED = "contacted"
    VIEWING = "viewing"
    NEGOTIATING = "negotiating"
    OFFER = "offer"
    CLOSED = "closed"
    DISCARDED = "discarded"


class ActivityType(str, Enum):
    CALL = "call"
    EMAIL = "email"
    VIEWING = "viewing"
    OFFER = "offer"
    NEGOTIATION = "negotiation"
    CLOSING = "closing"
    NOTE = "note"


# Allowed sources for property prospection (compliance)
ALLOWED_SOURCES: set[str] = {
    "idealista",
    "fotocasa",
    "rightmove",
    "kyero",
    "properstar",
    "inmobalia",
    "james_edition",
    "luxury_estate",
    "direct",
    "referral",
    "mls",
}


# ═══════════════════════════════════════════════════════════════════════════════
# SCORE MODELS
# ═══════════════════════════════════════════════════════════════════════════════


class ScoreBreakdown(BaseModel):
    """Individual factor contribution to a score."""

    factor: str
    weight: float = Field(ge=0, le=100)
    raw_value: float
    weighted_value: float = Field(ge=0, le=100)


class ScoreResult(BaseModel):
    """Result of a scoring computation."""

    score: float = Field(ge=0, le=100)
    breakdown: Dict[str, float]


# ═══════════════════════════════════════════════════════════════════════════════
# PROPERTY MODELS
# ═══════════════════════════════════════════════════════════════════════════════


class PropertyCreate(BaseModel):
    """Schema for creating a prospected property."""

    source: str
    source_url: Optional[str] = None
    title: Optional[str] = None
    zone: Optional[str] = None
    city: Optional[str] = None
    price: Optional[Decimal] = Field(default=None, ge=0)
    property_type: Optional[str] = None
    bedrooms: Optional[int] = Field(default=None, ge=0)
    bathrooms: Optional[int] = Field(default=None, ge=0)
    area_m2: Optional[Decimal] = Field(default=None, ge=0)
    status: PropertyStatus = PropertyStatus.NEW
    notes: Optional[str] = None

    @field_validator("source")
    @classmethod
    def validate_source(cls, v: str) -> str:
        """Validate source is from allowed list (compliance)."""
        normalized: str = v.lower().strip()
        if normalized not in ALLOWED_SOURCES:
            msg = f"Source '{v}' is not authorized. Allowed: {sorted(ALLOWED_SOURCES)}"
            raise ValueError(msg)
        return normalized


class PropertyUpdate(BaseModel):
    """Schema for updating a prospected property."""

    title: Optional[str] = None
    zone: Optional[str] = None
    city: Optional[str] = None
    price: Optional[Decimal] = Field(default=None, ge=0)
    property_type: Optional[str] = None
    bedrooms: Optional[int] = Field(default=None, ge=0)
    bathrooms: Optional[int] = Field(default=None, ge=0)
    area_m2: Optional[Decimal] = Field(default=None, ge=0)
    status: Optional[PropertyStatus] = None
    notes: Optional[str] = None


class PropertyResponse(BaseModel):
    """Response schema for a prospected property."""

    id: UUID
    org_id: UUID
    source: str
    source_url: Optional[str] = None
    title: Optional[str] = None
    zone: Optional[str] = None
    city: Optional[str] = None
    price: Optional[Decimal] = None
    property_type: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    area_m2: Optional[Decimal] = None
    high_ticket_score: Optional[Decimal] = None
    score_breakdown: Dict[str, Any] = Field(default_factory=dict)
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PropertyList(BaseModel):
    """Paginated list of properties."""

    items: List[PropertyResponse]
    total: int
    limit: int
    offset: int


# ═══════════════════════════════════════════════════════════════════════════════
# BUYER MODELS
# ═══════════════════════════════════════════════════════════════════════════════


class BuyerCreate(BaseModel):
    """Schema for creating a buyer profile."""

    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    budget_min: Optional[Decimal] = Field(default=None, ge=0)
    budget_max: Optional[Decimal] = Field(default=None, ge=0)
    preferred_zones: List[str] = Field(default_factory=list)
    preferred_types: List[str] = Field(default_factory=list)
    required_features: Dict[str, Any] = Field(default_factory=dict)
    purchase_horizon: Optional[str] = None
    motivation_score: Optional[Decimal] = Field(default=None, ge=0, le=100)
    status: BuyerStatus = BuyerStatus.ACTIVE
    notes: Optional[str] = None

    @model_validator(mode="after")
    def validate_budget_range(self) -> "BuyerCreate":
        """Ensure budget_min <= budget_max when both are set."""
        if (
            self.budget_min is not None
            and self.budget_max is not None
            and self.budget_min > self.budget_max
        ):
            msg = f"budget_min ({self.budget_min}) must be <= budget_max ({self.budget_max})"
            raise ValueError(msg)
        return self


class BuyerUpdate(BaseModel):
    """Schema for updating a buyer profile."""

    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    budget_min: Optional[Decimal] = Field(default=None, ge=0)
    budget_max: Optional[Decimal] = Field(default=None, ge=0)
    preferred_zones: Optional[List[str]] = None
    preferred_types: Optional[List[str]] = None
    required_features: Optional[Dict[str, Any]] = None
    purchase_horizon: Optional[str] = None
    motivation_score: Optional[Decimal] = Field(default=None, ge=0, le=100)
    status: Optional[BuyerStatus] = None
    notes: Optional[str] = None


class BuyerResponse(BaseModel):
    """Response schema for a buyer profile."""

    id: UUID
    org_id: UUID
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    budget_min: Optional[Decimal] = None
    budget_max: Optional[Decimal] = None
    preferred_zones: List[str] = Field(default_factory=list)
    preferred_types: List[str] = Field(default_factory=list)
    required_features: Dict[str, Any] = Field(default_factory=dict)
    purchase_horizon: Optional[str] = None
    motivation_score: Optional[Decimal] = None
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BuyerList(BaseModel):
    """Paginated list of buyers."""

    items: List[BuyerResponse]
    total: int
    limit: int
    offset: int


# ═══════════════════════════════════════════════════════════════════════════════
# MATCH MODELS
# ═══════════════════════════════════════════════════════════════════════════════


class MatchUpdate(BaseModel):
    """Schema for updating a match."""

    match_status: Optional[MatchStatus] = None
    commission_estimate: Optional[Decimal] = Field(default=None, ge=0)
    notes: Optional[str] = None


class MatchResponse(BaseModel):
    """Response schema for a property-buyer match."""

    id: UUID
    org_id: UUID
    property_id: UUID
    buyer_id: UUID
    match_score: Decimal
    score_breakdown: Dict[str, Any] = Field(default_factory=dict)
    match_status: str
    commission_estimate: Optional[Decimal] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    # Denormalized for frontend display
    property_title: Optional[str] = None
    buyer_name: Optional[str] = None

    class Config:
        from_attributes = True


class MatchList(BaseModel):
    """Paginated list of matches."""

    items: List[MatchResponse]
    total: int
    limit: int
    offset: int


# ═══════════════════════════════════════════════════════════════════════════════
# ACTIVITY MODELS
# ═══════════════════════════════════════════════════════════════════════════════


class ActivityCreate(BaseModel):
    """Schema for logging a match activity."""

    activity_type: ActivityType
    outcome: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)


class ActivityResponse(BaseModel):
    """Response schema for a match activity."""

    id: UUID
    org_id: UUID
    match_id: UUID
    activity_type: str
    outcome: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)
    created_by: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ActivityList(BaseModel):
    """List of activities for a match."""

    items: List[ActivityResponse]
    total: int


# ═══════════════════════════════════════════════════════════════════════════════
# RECOMPUTE REQUEST
# ═══════════════════════════════════════════════════════════════════════════════


class RecomputeRequest(BaseModel):
    """Request to recompute match scores."""

    property_ids: Optional[List[UUID]] = None
    buyer_ids: Optional[List[UUID]] = None


class RecomputeResponse(BaseModel):
    """Response from recompute operation."""

    matches_created: int
    matches_updated: int
    total_computed: int
