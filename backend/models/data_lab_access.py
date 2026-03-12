from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class DataLabAccessStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    APPROVED = "approved"
    REJECTED = "rejected"


class DataLabProfileType(str, Enum):
    PARTNER = "partner"
    CLIENT = "client"
    INVESTOR = "investor"
    OTHER = "other"


class DataLabScope(str, Enum):
    MARKET_BRIEF = "market_brief"
    PARTNER_INTELLIGENCE = "partner_intelligence"
    CLIENT_PACK = "client_pack"
    STRATEGIC_OVERVIEW = "strategic_overview"


class DataLabAccessTier(str, Enum):
    LIMITED = "limited"
    STANDARD = "standard"
    STRATEGIC = "strategic"


class DataLabWorkspaceStatus(str, Enum):
    INVITED = "invited"
    ACTIVE = "active"
    PAUSED = "paused"


class PublicDataLabAccessRequestCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    company_name: Optional[str] = Field(default=None, max_length=160)
    profile_type: DataLabProfileType
    requested_scope: DataLabScope
    intended_use: str = Field(min_length=20, max_length=3000)
    geography_focus: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    website_url: Optional[str] = Field(default=None, max_length=500)
    notes: Optional[str] = Field(default=None, max_length=1500)
    privacy_accepted: bool = False
    newsletter_opt_in: bool = False
    captcha_provider: Optional[str] = Field(default=None, max_length=32)
    captcha_token: Optional[str] = Field(default=None, max_length=4096)
    submission_language: str = Field(default="es", max_length=8)
    submission_source: str = Field(default="private_estates")

    @field_validator("geography_focus", "languages", mode="before")
    @classmethod
    def normalize_lists(cls, value):
        if value is None:
            return []
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return value

    @field_validator("privacy_accepted")
    @classmethod
    def require_privacy_acceptance(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("Privacy policy must be accepted")
        return value


class DataLabAccessReview(BaseModel):
    status: DataLabAccessStatus
    review_notes: Optional[str] = Field(default=None, max_length=2000)
    access_tier: Optional[DataLabAccessTier] = None
    approved_scope: Optional[DataLabScope] = None
    notify_applicant: bool = False


class DataLabPackSummary(BaseModel):
    id: UUID
    pack_label: str
    notebook_name: str
    market_scope: str
    zone_scope: List[str] = Field(default_factory=list)
    language_code: str
    source_mode: str
    status: str
    is_default: bool = False
    age_hours: Optional[float] = None


class DataLabWorkspaceResource(BaseModel):
    label: str
    description: str


class DataLabWorkspaceResponse(BaseModel):
    id: UUID
    request_id: UUID
    requester_name: str
    company_name: Optional[str] = None
    profile_type: DataLabProfileType
    requested_scope: DataLabScope
    approved_scope: DataLabScope
    access_tier: DataLabAccessTier
    workspace_status: DataLabWorkspaceStatus
    headline: str
    intended_use: str
    geography_focus: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    next_steps: List[str] = Field(default_factory=list)
    resources: List[DataLabWorkspaceResource] = Field(default_factory=list)
    packs: List[DataLabPackSummary] = Field(default_factory=list)
    last_seen_at: Optional[datetime] = None
