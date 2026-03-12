from enum import Enum
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class PartnerRelationshipStatus(str, Enum):
    ACTIVE = "active"
    WATCHLIST = "watchlist"
    PAUSED = "paused"


class PartnerNetworkTier(str, Enum):
    APPROVED = "approved"
    PREFERRED = "preferred"
    STRATEGIC = "strategic"


class PartnerNetworkItem(BaseModel):
    workspace_id: UUID
    admission_id: UUID
    partner_name: str
    company_name: Optional[str] = None
    service_category: str
    sustainability_focus: bool = False
    partner_tier: PartnerNetworkTier
    relationship_status: PartnerRelationshipStatus
    trust_score: float
    preferred_for_buyers: bool = False
    preferred_for_sellers: bool = False
    network_tags: List[str] = Field(default_factory=list)
    strategic_notes: Optional[str] = None
    coverage_areas: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    preferred_opportunity_types: List[str] = Field(default_factory=list)
    priority_zones: List[str] = Field(default_factory=list)
    contact_preferences: List[str] = Field(default_factory=list)
    response_commitment_hours: Optional[int] = None
    profile_notes: Optional[str] = None
    opportunities_count: int = 0
    shared_opportunities_count: int = 0
    shared_interested_count: int = 0
    shared_declined_count: int = 0
    shared_pending_count: int = 0
    buyer_referrals_count: int = 0
    high_intent_buyers_count: int = 0
    engagement_score: float = 0
    response_rate: float = 0
    recommended_opportunity_type: Optional[str] = None
    recommended_zone: Optional[str] = None
    last_seen_at: Optional[str] = None
    last_referral_at: Optional[str] = None
    last_shared_response_at: Optional[str] = None
    workspace_launch_url: Optional[str] = None


class PartnerNetworkSummary(BaseModel):
    total: int
    strategic: int
    preferred: int
    eco_focus: int
    buyer_referrals: int
    shared_opportunities: int
    responsive_partners: int


class PartnerNetworkList(BaseModel):
    items: List[PartnerNetworkItem]
    total: int
    limit: int
    offset: int


class PartnerNetworkUpdate(BaseModel):
    partner_tier: Optional[PartnerNetworkTier] = None
    relationship_status: Optional[PartnerRelationshipStatus] = None
    trust_score: Optional[float] = Field(default=None, ge=0, le=100)
    preferred_for_buyers: Optional[bool] = None
    preferred_for_sellers: Optional[bool] = None
    strategic_notes: Optional[str] = Field(default=None, max_length=3000)
    network_tags: Optional[List[str]] = None


class PartnerSharedOpportunityCreate(BaseModel):
    title: str = Field(min_length=6, max_length=180)
    summary: str = Field(min_length=20, max_length=4000)
    opportunity_type: str = Field(min_length=2, max_length=80)
    target_zone: Optional[str] = Field(default=None, max_length=160)
    budget_context: Optional[str] = Field(default=None, max_length=160)
    next_step: Optional[str] = Field(default=None, max_length=800)


class PartnerNetworkSharedOpportunity(BaseModel):
    id: UUID
    title: str
    opportunity_type: str
    target_zone: Optional[str] = None
    status: str
    budget_context: Optional[str] = None
    next_step: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
