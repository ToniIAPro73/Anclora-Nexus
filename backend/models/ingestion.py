from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, EmailStr, Field

class EntityType(str, Enum):
    LEAD = "lead"
    PROPERTY = "property"

class IngestionStatus(str, Enum):
    SUCCESS = "success"
    DUPLICATE = "duplicate"
    ERROR = "error"

class LeadSourceSystem(str, Enum):
    MANUAL = "manual"
    CTA_WEB = "cta_web"
    IMPORT = "import"
    REFERRAL = "referral"
    PARTNER = "partner"
    SOCIAL = "social"

class LeadSourceChannel(str, Enum):
    WEBSITE = "website"
    LINKEDIN = "linkedin"
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"
    EMAIL = "email"
    PHONE = "phone"
    OTHER = "other"

class PropertySourceSystem(str, Enum):
    MANUAL = "manual"
    WIDGET = "widget"
    PBM = "pbm"
    IMPORT = "import"

class PropertySourcePortal(str, Enum):
    IDEALISTA = "idealista"
    FOTOCASA = "fotocasa"
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    RIGHTMOVE = "rightmove"
    KYERO = "kyero"
    OTHER = "other"

class LeadIngestionPayload(BaseModel):
    org_id: str
    external_id: str
    source_system: LeadSourceSystem
    source_channel: LeadSourceChannel
    source_detail: Optional[str] = None
    source_url: Optional[str] = None
    source_referrer: Optional[str] = None
    captured_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Business data
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    budget: Optional[float] = None
    notes: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class PropertyIngestionPayload(BaseModel):
    org_id: str
    external_id: str
    source_system: PropertySourceSystem
    source_portal: PropertySourcePortal
    captured_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Business data
    title: str
    address: str
    price_eur: float
    zone: Optional[str] = None
    built_area_m2: Optional[float] = None
    useful_area_m2: Optional[float] = None
    plot_area_m2: Optional[float] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[int] = None
    description: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class IngestionEvent(BaseModel):
    id: Optional[str] = None
    org_id: str
    entity_type: EntityType
    external_id: str
    connector_name: str
    status: IngestionStatus
    message: Optional[str] = None
    payload: Dict[str, Any]
    error_detail: Optional[Dict[str, Any]] = None
    processed_at: datetime = Field(default_factory=datetime.utcnow)
    dedupe_key: str
