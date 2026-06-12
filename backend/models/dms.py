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
    contrato_alquiler_turistico = "contrato_alquiler_turistico"
    kyc_cliente = "kyc_cliente"
    mandato_exclusiva = "mandato_exclusiva"
    oferta_compra = "oferta_compra"
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
