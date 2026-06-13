from datetime import datetime
from enum import Enum
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel


class OperationType(str, Enum):
    compraventa = "compraventa"
    alquiler_temporada = "alquiler_temporada"
    alquiler_turistico = "alquiler_turistico"


class FolderStatus(str, Enum):
    active = "active"
    completed = "completed"
    archived = "archived"


class DocumentCategory(str, Enum):
    escritura_propiedad = "escritura_propiedad"
    nota_simple = "nota_simple"
    cedula_habitabilidad = "cedula_habitabilidad"
    certificado_energetico = "certificado_energetico"
    certificado_ite = "certificado_ite"
    arras_penitenciales = "arras_penitenciales"
    contrato_temporada = "contrato_temporada"
    driat_etv = "driat_etv"
    dni_nie_pasaporte = "dni_nie_pasaporte"
    certificado_deuda_cero = "certificado_deuda_cero"
    certificado_comunidad = "certificado_comunidad"
    contrato_compraventa = "contrato_compraventa"
    kyc_cliente = "kyc_cliente"
    # Deprecated: use DocumentStatus.signed + immutable=true on document_versions instead
    documento_firmado = "documento_firmado"


class DocumentOrigin(str, Enum):
    """Where the document came from."""
    external = "external"       # uploaded by a user
    generated = "generated"     # produced from a template
    template = "template"       # the master template itself


class DocumentStatus(str, Enum):
    """Lifecycle state of a deal document or generated document."""
    draft = "draft"
    review_required = "review_required"
    approved = "approved"
    signed = "signed"
    archived = "archived"


class TemplateDocumentType(str, Enum):
    """Canonical document types used in the template library."""
    arras_penitenciales = "arras_penitenciales"
    contrato_compraventa = "contrato_compraventa"
    contrato_temporada = "contrato_temporada"
    contrato_arrendamiento = "contrato_arrendamiento"
    contrato_alquiler_turistico = "contrato_alquiler_turistico"
    kyc_cliente = "kyc_cliente"
    mandato_exclusiva = "mandato_exclusiva"
    oferta_compra = "oferta_compra"
    nota_encargo = "nota_encargo"
    reserva = "reserva"
    recibo_fianza = "recibo_fianza"
    acta_entrega_llaves = "acta_entrega_llaves"
    acuerdo_confidencialidad = "acuerdo_confidencialidad"
    generico = "generico"


class ComplianceStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    expired = "expired"


class SignerRole(str, Enum):
    buyer = "buyer"
    seller = "seller"
    agent = "agent"
    witness = "witness"


class FlowStatus(str, Enum):
    pending = "pending"
    sent = "sent"
    opened = "opened"
    signed = "signed"
    declined = "declined"


class DealFolderCreate(BaseModel):
    property_id: Optional[UUID]
    client_lead_id: Optional[UUID]
    seller_id: Optional[UUID]
    operation_type: OperationType


class DocumentUploadRequest(BaseModel):
    folder_id: UUID
    title: str
    document_category: DocumentCategory
    origin: DocumentOrigin = DocumentOrigin.external


class SignatureFlowCreate(BaseModel):
    signer_email: str
    signer_name: str
    signer_role: SignerRole


class DocumentValidationRequest(BaseModel):
    contract_type: Optional[str] = None
    operation_type: Optional[OperationType] = None
    jurisdiction: str = "ES-IB"
    language: str = "es"
    text: Optional[str] = None
    metadata: dict[str, Any] = {}


class DocumentValidationResult(BaseModel):
    status: str
    block_signing: bool
    confidence: float = 0.0
    summary: str
    findings: list[dict[str, Any]] = []
    required_actions: list[str] = []
    missing_documents: list[str] = []
    legal_disclaimer: str = ""
    sources: list[dict[str, Any]] = []


class DocuSealWebhookPayload(BaseModel):
    event: str
    submission_id: Optional[str]
    envelope_id: Optional[str]
    status: Optional[str]
    document_url: Optional[str]
    signer_email: Optional[str]
    ip_address: Optional[str]
    signing_timestamp: Optional[datetime]


# ── Template library models ────────────────────────────────────────────────────

class PartyRole(str, Enum):
    buyer = "buyer"
    seller = "seller"
    agent = "agent"
    guarantor = "guarantor"
    co_buyer = "co_buyer"
    co_seller = "co_seller"
    notary = "notary"


class TemplateStatus(str, Enum):
    draft = "draft"
    published = "published"
    deprecated = "deprecated"


class FieldType(str, Enum):
    text = "text"
    number = "number"
    date = "date"
    amount = "amount"
    boolean = "boolean"
    select = "select"


class PartyCreate(BaseModel):
    party_role: PartyRole
    full_name: str
    lead_id: Optional[UUID] = None
    seller_id: Optional[UUID] = None
    company_id: Optional[UUID] = None
    contact_id: Optional[UUID] = None
    source_entity: Optional[str] = None
    source_id: Optional[UUID] = None
    is_primary: bool = False
    signing_order: Optional[int] = None
    representation_capacity: Optional[str] = None
    dni_nie_passport: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    nationality: Optional[str] = None
    is_company: bool = False
    company_name: Optional[str] = None
    company_cif: Optional[str] = None


class PartyUpdate(BaseModel):
    party_role: Optional[PartyRole] = None
    full_name: Optional[str] = None
    lead_id: Optional[UUID] = None
    seller_id: Optional[UUID] = None
    company_id: Optional[UUID] = None
    contact_id: Optional[UUID] = None
    source_entity: Optional[str] = None
    source_id: Optional[UUID] = None
    is_primary: Optional[bool] = None
    signing_order: Optional[int] = None
    representation_capacity: Optional[str] = None
    dni_nie_passport: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    nationality: Optional[str] = None
    is_company: Optional[bool] = None
    company_name: Optional[str] = None
    company_cif: Optional[str] = None


class PartyResponse(BaseModel):
    id: UUID
    folder_id: UUID
    org_id: UUID
    party_role: str
    full_name: str
    lead_id: Optional[UUID] = None
    seller_id: Optional[UUID] = None
    company_id: Optional[UUID] = None
    contact_id: Optional[UUID] = None
    source_entity: Optional[str] = None
    source_id: Optional[UUID] = None
    is_primary: bool = False
    signing_order: Optional[int] = None
    representation_capacity: Optional[str] = None
    dni_nie_passport: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    nationality: Optional[str] = None
    is_company: bool
    company_name: Optional[str] = None
    company_cif: Optional[str] = None
    kyc_verified: bool
    kyc_verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class TemplateCreate(BaseModel):
    name: str
    template_document_type: TemplateDocumentType
    description: Optional[str] = None
    jurisdiction: str = "España"
    language: str = "es"


class TemplateVersionCreate(BaseModel):
    change_summary: Optional[str] = None


class TemplateFieldCreate(BaseModel):
    field_key: str
    label: str
    field_type: FieldType = FieldType.text
    required: bool = True
    default_value: Optional[str] = None
    validation_rule: Optional[str] = None
    source_path: Optional[str] = None


class GeneratedDocumentCreate(BaseModel):
    template_version_id: UUID
    title: str
    generation_payload: dict[str, Any] = {}
    output_format: str = "docx_pdf"


class GeneratedDocumentEdit(BaseModel):
    title: Optional[str] = None
    edited_text: str
    change_summary: Optional[str] = None


class LegalReviewRequest(BaseModel):
    jurisdiction: str = "España"
    language: str = "es"
    reviewer_notes: Optional[str] = None


class ManualLegalReviewDecision(BaseModel):
    decision: str
    notes: Optional[str] = None
    block_signing: bool = False


class PartyCandidateResponse(BaseModel):
    id: UUID
    entity_type: str
    label: str
    email: Optional[str] = None
    phone: Optional[str] = None
    role_hint: Optional[str] = None
    payload: dict[str, Any] = {}


class GeneratedDocumentResponse(BaseModel):
    id: UUID
    folder_id: UUID
    org_id: UUID
    template_version_id: UUID
    title: str
    status: str
    generation_payload: dict[str, Any]
    storage_path: Optional[str] = None
    generated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
