from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PartnerWorkspaceStatus(str, Enum):
    INVITED = "invited"
    ACTIVE = "active"
    PAUSED = "paused"


class PartnerTier(str, Enum):
    APPROVED = "approved"
    PREFERRED = "preferred"
    STRATEGIC = "strategic"


class PartnerOpportunityType(str, Enum):
    BUYER_REFERRAL = "buyer_referral"
    SELLER_REFERRAL = "seller_referral"
    SERVICE_OFFER = "service_offer"
    COLLABORATION_REQUEST = "collaboration_request"


class PartnerOpportunityStatus(str, Enum):
    SUBMITTED = "submitted"
    IN_REVIEW = "in_review"
    ACCEPTED = "accepted"
    ARCHIVED = "archived"


class PublicPartnerOpportunityCreate(BaseModel):
    token: str = Field(min_length=12, max_length=255)
    title: str = Field(min_length=6, max_length=180)
    opportunity_type: PartnerOpportunityType
    summary: str = Field(min_length=20, max_length=4000)
    target_zone: Optional[str] = Field(default=None, max_length=160)
    budget_range: Optional[str] = Field(default=None, max_length=160)
    next_step: Optional[str] = Field(default=None, max_length=800)


class PublicPartnerWorkspaceProfileUpdate(BaseModel):
    token: str = Field(min_length=12, max_length=255)
    preferred_opportunity_types: List[PartnerOpportunityType] = Field(default_factory=list)
    priority_zones: List[str] = Field(default_factory=list)
    contact_preferences: List[str] = Field(default_factory=list)
    response_commitment_hours: Optional[int] = Field(default=None, ge=1, le=168)
    profile_notes: Optional[str] = Field(default=None, max_length=1200)


class PartnerWorkspaceResource(BaseModel):
    label: str
    description: str


class PartnerWorkspaceOpportunityResponse(BaseModel):
    id: UUID
    title: str
    opportunity_type: PartnerOpportunityType
    summary: str
    target_zone: Optional[str] = None
    budget_range: Optional[str] = None
    next_step: Optional[str] = None
    status: PartnerOpportunityStatus
    created_at: datetime


class PartnerWorkspaceActivityResponse(BaseModel):
    id: UUID
    event_type: str
    title: str
    description: Optional[str] = None
    related_opportunity_id: Optional[UUID] = None
    created_at: datetime


class PartnerWorkspaceResponse(BaseModel):
    id: UUID
    admission_id: UUID
    partner_name: str
    company_name: Optional[str] = None
    service_category: str
    service_summary: str
    coverage_areas: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    sustainability_focus: bool = False
    sustainability_notes: Optional[str] = None
    workspace_status: PartnerWorkspaceStatus
    partner_tier: PartnerTier
    headline: str
    collaboration_focus: List[str] = Field(default_factory=list)
    preferred_opportunity_types: List[PartnerOpportunityType] = Field(default_factory=list)
    priority_zones: List[str] = Field(default_factory=list)
    contact_preferences: List[str] = Field(default_factory=list)
    response_commitment_hours: Optional[int] = None
    profile_notes: Optional[str] = None
    next_steps: List[str] = Field(default_factory=list)
    resources: List[PartnerWorkspaceResource] = Field(default_factory=list)
    opportunities: List[PartnerWorkspaceOpportunityResponse] = Field(default_factory=list)
    activity: List[PartnerWorkspaceActivityResponse] = Field(default_factory=list)
    last_seen_at: Optional[datetime] = None
