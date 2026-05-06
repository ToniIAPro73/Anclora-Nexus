from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator, model_validator, ConfigDict

class AccessRequestProduct(str, Enum):
    SYNERGI = "synergi"
    DATA_LAB = "data_lab"

class AccessRequestSource(str, Enum):
    LANDING = "landing"
    SYNERGI_APP = "synergi_app"
    DATA_LAB_APP = "data_lab_app"

class AccessRequestStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class PublicAccessRequestCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    # org_id is NOT accepted from public client
    product: AccessRequestProduct
    source: AccessRequestSource
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    profile_type: Optional[str] = None
    service_category: Optional[str] = None
    service_summary: Optional[str] = None
    intended_use: Optional[str] = None
    requested_scope: Optional[str] = None
    message: Optional[str] = None
    privacy_accepted: bool
    gdpr_consent: bool
    submission_language: str = "es"
    external_id: Optional[str] = None
    captcha_provider: str = "turnstile"
    captcha_token: str

    @model_validator(mode="after")
    def validate_consents(self):
        if not self.privacy_accepted or not self.gdpr_consent:
            raise ValueError("Privacy and GDPR consents are required")
        return self

    @model_validator(mode="after")
    def validate_product_source(self):
        if self.source == AccessRequestSource.SYNERGI_APP and self.product != AccessRequestProduct.SYNERGI:
            raise ValueError("Synergi app source requires Synergi product")
        if self.source == AccessRequestSource.DATA_LAB_APP and self.product != AccessRequestProduct.DATA_LAB:
            raise ValueError("Data Lab app source requires Data Lab product")
        return self

    @model_validator(mode="after")
    def validate_product_fields(self):
        if self.product == AccessRequestProduct.SYNERGI:
            if not self.service_category or not self.service_summary:
                raise ValueError("Synergi requests require service_category and service_summary")
        if self.product == AccessRequestProduct.DATA_LAB:
            if not self.intended_use and not self.message:
                raise ValueError("Data Lab requests require intended_use or message")
        return self

class LegacyDataLabAccessRequest(BaseModel):
    # This model matches what legacy landing/apps might send
    full_name: str
    email: EmailStr
    profile_type: Optional[str] = None
    requested_scope: Optional[str] = None
    intended_use: Optional[str] = None
    privacy_accepted: bool
    gdpr_consent: bool
    submission_language: str = "es"
    captcha_provider: str = "turnstile"
    captcha_token: str

class LegacyPartnerAdmission(BaseModel):
    # This model matches what legacy landing/apps might send
    full_name: str
    email: EmailStr
    service_category: Optional[str] = None
    service_summary: Optional[str] = None
    privacy_accepted: bool
    gdpr_consent: bool
    submission_language: str = "es"
    captcha_provider: str = "turnstile"
    captcha_token: str

class AccessRequestReviewDecision(BaseModel):
    admin_notes: Optional[str] = None

class AccessRequestRejectDecision(AccessRequestReviewDecision):
    rejection_reason: str

    @field_validator("rejection_reason")
    @classmethod
    def validate_rejection_reason(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("rejection_reason is required")
        return value.strip()

class AccessRequestResponse(BaseModel):
    id: str
    org_id: str
    product: AccessRequestProduct
    source: AccessRequestSource
    status: AccessRequestStatus
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    profile_type: Optional[str] = None
    service_category: Optional[str] = None
    service_summary: Optional[str] = None
    intended_use: Optional[str] = None
    requested_scope: Optional[str] = None
    message: Optional[str] = None
    privacy_accepted: bool
    gdpr_consent: bool
    submission_language: str = "es"
    external_id: Optional[str] = None
    captcha_provider: Optional[str] = None
    captcha_verified: bool = False
    captcha_hostname: Optional[str] = None
    reviewed_at: Optional[str] = None
    reviewed_by: Optional[str] = None
    admin_notes: Optional[str] = None
    rejection_reason: Optional[str] = None
    invite_token: Optional[str] = None
    invite_expires_at: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
