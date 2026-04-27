"""
Pydantic schemas for Nexus Sellers — Motor de Adquisición de Vendedores

Nexus Sellers are seller prospects detected before they appear on the open market.
They are fed by scraping (Idealista/Fotocasa), STR enforcement signals, and the
prospection_weekly skill.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, field_validator


class ZonaEnum(str, Enum):
    andratx = "andratx"
    calvia = "calvia"
    son_ferrer = "son_ferrer"
    santa_ponca = "santa_ponca"
    paguera = "paguera"
    portals_nous = "portals_nous"
    bendinat = "bendinat"
    punta_negra = "punta_negra"
    costa_den_blanes = "costa_den_blanes"
    port_adriano = "port_adriano"
    palma = "palma"
    otra = "otra"


class FuenteEnum(str, Enum):
    idealista = "idealista"
    fotocasa = "fotocasa"
    fsbo = "fsbo"
    str_enforcement = "str_enforcement"
    prospection_match = "prospection_match"
    manual = "manual"
    referral = "referral"
    scraping = "scraping"


class EstadoContactoEnum(str, Enum):
    sin_contacto = "sin_contacto"
    primer_contacto = "primer_contacto"
    en_seguimiento = "en_seguimiento"
    reunion_agendada = "reunion_agendada"
    propuesta_enviada = "propuesta_enviada"
    mandato_exclusivo = "mandato_exclusivo"
    descartado = "descartado"


class NexusSellerCreate(BaseModel):
    """Schema for creating a new Nexus Seller prospect."""
    nombre_propietario: Optional[str] = None
    empresa: Optional[str] = None
    website_url: Optional[str] = None
    anuncio_url: Optional[str] = None
    email_contacto: Optional[str] = None
    telefono_contacto: Optional[str] = None
    whatsapp_contacto: Optional[str] = None
    direccion: Optional[str] = None
    zona: ZonaEnum
    fuente: FuenteEnum
    precio_publicado: Optional[float] = None
    precio_estimado: Optional[float] = None
    superficie_m2: Optional[float] = None
    tipo_propiedad: Optional[str] = None
    dias_en_mercado: Optional[int] = Field(None, ge=0)
    datos_extraidos: Optional[Dict[str, Any]] = Field(default_factory=dict)
    estado_contacto: EstadoContactoEnum = EstadoContactoEnum.sin_contacto
    prioridad: int = Field(default=3, ge=1, le=5)
    notas: Optional[str] = None
    argumentario: Optional[str] = None
    senales_motivacion: Optional[List[str]] = Field(default_factory=list)

    @field_validator("prioridad")
    @classmethod
    def validate_prioridad(cls, v: int) -> int:
        if not 1 <= v <= 5:
            raise ValueError("prioridad must be between 1 (cold) and 5 (Whale)")
        return v


class NexusSellerUpdate(BaseModel):
    """Schema for updating a Nexus Seller — all fields optional."""
    nombre_propietario: Optional[str] = None
    empresa: Optional[str] = None
    website_url: Optional[str] = None
    anuncio_url: Optional[str] = None
    email_contacto: Optional[str] = None
    telefono_contacto: Optional[str] = None
    whatsapp_contacto: Optional[str] = None
    direccion: Optional[str] = None
    zona: Optional[ZonaEnum] = None
    precio_publicado: Optional[float] = None
    precio_estimado: Optional[float] = None
    superficie_m2: Optional[float] = None
    tipo_propiedad: Optional[str] = None
    dias_en_mercado: Optional[int] = None
    datos_extraidos: Optional[Dict[str, Any]] = None
    estado_contacto: Optional[EstadoContactoEnum] = None
    prioridad: Optional[int] = Field(None, ge=1, le=5)
    notas: Optional[str] = None
    argumentario: Optional[str] = None
    senales_motivacion: Optional[List[str]] = None
    notebooklm_notebook_id: Optional[str] = None


class EstadoUpdate(BaseModel):
    """Schema for updating only the contact state of a seller."""
    estado_contacto: EstadoContactoEnum
    notas: Optional[str] = None


class NexusSellerResponse(BaseModel):
    """Full Nexus Seller response schema."""
    id: UUID
    org_id: UUID
    nombre_propietario: Optional[str]
    empresa: Optional[str]
    website_url: Optional[str]
    anuncio_url: Optional[str]
    email_contacto: Optional[str]
    telefono_contacto: Optional[str]
    whatsapp_contacto: Optional[str]
    direccion: Optional[str]
    zona: str
    fuente: str
    precio_publicado: Optional[float]
    precio_estimado: Optional[float]
    superficie_m2: Optional[float]
    tipo_propiedad: Optional[str]
    dias_en_mercado: Optional[int]
    datos_extraidos: Dict[str, Any]
    estado_contacto: str
    prioridad: int
    notas: Optional[str]
    argumentario: Optional[str]
    senales_motivacion: List[Any]
    notebooklm_notebook_id: Optional[str]
    fecha_deteccion: datetime
    fecha_primer_contacto: Optional[datetime]
    fecha_ultimo_contacto: Optional[datetime]
    fecha_mandato: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SellerStatsResponse(BaseModel):
    """Aggregated stats for the Nexus Sellers pipeline."""
    total: int
    por_estado: Dict[str, int]
    por_zona: Dict[str, int]
    por_fuente: Dict[str, int]
    whales: int           # prioridad == 5
    alta_prioridad: int   # prioridad >= 4
    tasa_mandatos: float  # mandato_exclusivo / total (%)
    timestamp: str


# ─── Intake Pipeline (ANCLORA-SIP-001) ──────────────────────────────────────


class SellerIntakeRequest(BaseModel):
    """Raw data intake payload — accepts unstructured input from any source."""
    raw_data: Dict[str, Any]
    org_id: Optional[str] = None


class SellerIntakeResponse(BaseModel):
    seller_id: Optional[str]
    draft_id: Optional[str]
    status: str
    priority_score: Optional[float]
    priority_tier: Optional[int]
    timestamp: str


class SellerPrioritizeRequest(BaseModel):
    batch_size: int = Field(default=10, ge=1, le=50)


class SellerPrioritizeItem(BaseModel):
    seller_id: str
    nombre_propietario: Optional[str]
    priority_score: float
    priority_tier: int
    zona: str


class SellerPrioritizeResponse(BaseModel):
    scored: List[SellerPrioritizeItem]
    total_processed: int
    timestamp: str


class PendingApprovalItem(BaseModel):
    draft_id: str
    seller_id: str
    seller_name: Optional[str]
    priority_tier: int
    email_draft: Optional[str]
    whatsapp_draft: Optional[str]
    created_at: str


class PendingApprovalResponse(BaseModel):
    items: List[PendingApprovalItem]
    total: int
    limit: int
    offset: int


class ApproveAndSendRequest(BaseModel):
    draft_id: str
    approved_email_body: Optional[str] = None
    approved_whatsapp_body: Optional[str] = None
    agent_comments: Optional[str] = None


class ApproveAndSendResponse(BaseModel):
    status: str
    job_id: Optional[str]
    draft_id: str
