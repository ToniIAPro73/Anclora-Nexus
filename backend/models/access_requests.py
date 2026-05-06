from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator, ConfigDict

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

class AccessRequestDecisionStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class AccessRequestProvisioningStatus(str, Enum):
    NOT_STARTED = "not_started"
    INVITE_READY = "invite_ready"
    PROVISIONING_PENDING = "provisioning_pending"
    NOT_APPLICABLE = "not_applicable"

class AccessRequestEmailStatus(str, Enum):
    NOT_APPLICABLE = "not_applicable"
    SENT = "sent"
    FAILED = "failed"
    SKIPPED = "skipped"
    UNKNOWN = "unknown"

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

class DecisionEmailResult(BaseModel):
    status: Optional[str] = None
    transport: Optional[str] = None
    to: Optional[str] = None
    subject: Optional[str] = None
    error: Optional[str] = None

class AccessRequestLifecycleResponse(BaseModel):
    request_id: str
    status: AccessRequestStatus
    decision_status: AccessRequestDecisionStatus
    provisioning_status: AccessRequestProvisioningStatus
    email_status: AccessRequestEmailStatus
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    invite_expires_at: Optional[str] = None
    retry_available: bool
    last_event_at: Optional[str] = None

class AccessRequestAttentionItem(BaseModel):
    request_id: str
    reason: str
    severity: str
    status: AccessRequestStatus
    product: AccessRequestProduct
    source: AccessRequestSource
    email: EmailStr
    created_at: Optional[str] = None
    reviewed_at: Optional[str] = None
    age_hours: Optional[float] = None

class AccessRequestAnalyticsSummary(BaseModel):
    total_requests: int
    pending_count: int
    approved_count: int
    rejected_count: int
    cancelled_count: int
    requests_by_product: Dict[str, int]
    requests_by_source: Dict[str, int]
    pending_older_than_24h: int
    pending_older_than_72h: int
    average_review_time_hours: Optional[float] = None
    decision_email_failed_count: int
    decision_email_unknown_count: int
    retry_available_count: int
    provisioning_attention_count: int
    generated_at: str
    sample_size: int
    sample_limit: int
    is_sampled: bool
    attention_items: list[AccessRequestAttentionItem] = Field(default_factory=list)

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
    decision_email: Optional[DecisionEmailResult] = None
    lifecycle: Optional[AccessRequestLifecycleResponse] = None

class AccessRequestAuditEventResponse(BaseModel):
    id: str
    timestamp: Optional[str] = None
    actor_type: str
    actor_id: str
    action: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)
