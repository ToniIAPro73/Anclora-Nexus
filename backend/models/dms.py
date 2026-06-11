from datetime import datetime
from enum import Enum
from typing import Optional
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


class SignatureFlowCreate(BaseModel):
    document_id: UUID
    signer_email: str
    signer_name: str
    signer_role: SignerRole


class DocuSealWebhookPayload(BaseModel):
    event: str
    submission_id: Optional[str]
    envelope_id: Optional[str]
    status: Optional[str]
    document_url: Optional[str]
    signer_email: Optional[str]
    ip_address: Optional[str]
    signing_timestamp: Optional[datetime]
