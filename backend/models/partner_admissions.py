from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class PartnerAdmissionStatus(str, Enum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class PartnerServiceCategory(str, Enum):
    REAL_ESTATE = "real_estate"
    PROFESSIONAL = "professional"
    LUXURY = "luxury"
    ECO = "eco"
    OTHER = "other"


class PublicPartnerAdmissionCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=64)
    company_name: Optional[str] = Field(default=None, max_length=160)
    service_category: PartnerServiceCategory
    service_summary: str = Field(min_length=20, max_length=3000)
    collaboration_pitch: Optional[str] = Field(default=None, max_length=2000)
    coverage_areas: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    website_url: Optional[str] = Field(default=None, max_length=500)
    linkedin_url: Optional[str] = Field(default=None, max_length=500)
    instagram_url: Optional[str] = Field(default=None, max_length=500)
    sustainability_focus: bool = False
    sustainability_notes: Optional[str] = Field(default=None, max_length=1200)
    submission_source: str = Field(default="private_estates")

    @field_validator("coverage_areas", "languages", mode="before")
    @classmethod
    def normalize_lists(cls, value):
        if value is None:
            return []
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return value


class PartnerAdmissionReview(BaseModel):
    status: PartnerAdmissionStatus
    review_notes: Optional[str] = Field(default=None, max_length=2000)
    notify_applicant: bool = False


class PartnerAdmissionResponse(BaseModel):
    id: UUID
    org_id: UUID
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    company_name: Optional[str] = None
    service_category: PartnerServiceCategory
    service_summary: str
    collaboration_pitch: Optional[str] = None
    coverage_areas: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    website_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    instagram_url: Optional[str] = None
    sustainability_focus: bool = False
    sustainability_notes: Optional[str] = None
    submission_source: str
    status: PartnerAdmissionStatus
    review_notes: Optional[str] = None
    reviewed_by_user_id: Optional[UUID] = None
    reviewed_at: Optional[datetime] = None
    decision_email_sent_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class PartnerAdmissionList(BaseModel):
    items: List[PartnerAdmissionResponse]
    total: int
    limit: int
    offset: int


class PartnerAdmissionSummary(BaseModel):
    total: int
    submitted: int
    under_review: int
    accepted: int
    rejected: int
    eco_focus: int
    by_category: dict[str, int]
