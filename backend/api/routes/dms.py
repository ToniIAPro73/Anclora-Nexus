import hashlib
import hmac
import os
import tempfile
from datetime import datetime, timezone
from io import BytesIO
from pathlib import PurePosixPath
from typing import Any, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, Request, UploadFile, status
from fastapi.responses import StreamingResponse

from backend.api.deps import get_current_user, get_org_id
from backend.api.middleware import verify_org_membership
from backend.config import settings
from backend.models.dms import (
    DealFolderCreate,
    DocuSealWebhookPayload,
    DocumentCategory,
    DocumentValidationRequest,
    GeneratedDocumentCreate,
    GeneratedDocumentEdit,
    LegalReviewRequest,
    ManualLegalReviewDecision,
    PartyCreate,
    PartyUpdate,
    PartyResponse,
    SignatureFlowCreate,
    TemplateCreate,
    TemplateFieldCreate,
)
from backend.services.advanced_document_parser import AdvancedDocumentParser
from backend.services.advisor_contract_validator_service import advisor_contract_validator_service
from backend.services.document_encryption_service import DocumentEncryptionService
from backend.services.document_generation_service import fetch_template_required_fields
from backend.services.document_template_rendering_service import build_template_context, resolve_and_render_template
from backend.services.supabase_service import supabase_service


router = APIRouter()

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
IMMUTABLE_SIGNATURE_STATUSES = {"sent", "opened", "signed"}


async def require_dms_membership(
    org_id: str = Depends(get_org_id),
    current_user: Any = Depends(get_current_user),
) -> dict:
    return await verify_org_membership(UUID(str(current_user.id)), UUID(str(org_id)), None)


def _storage_bucket() -> str:
    return settings.NEXUS_DMS_BUCKET or os.environ.get("NEXUS_DMS_BUCKET", "dms")


def _max_upload_bytes() -> int:
    return int(os.environ.get("NEXUS_DMS_MAX_UPLOAD_BYTES", str(settings.NEXUS_DMS_MAX_UPLOAD_BYTES)))


def _safe_filename(filename: str | None) -> str:
    name = PurePosixPath(filename or "document").name
    return name.replace("/", "_").replace("\\", "_")


def _table(name: str):
    return supabase_service.client.table(name)


def _fetch_one(table: str, org_id: str, record_id: str, columns: str = "*") -> Optional[dict[str, Any]]:
    response = (
        _table(table)
        .select(columns)
        .eq("id", str(record_id))
        .eq("org_id", org_id)
        .limit(1)
        .execute()
    )
    return response.data[0] if response.data else None


def _ensure_related_belongs_to_org(table: str, record_id: UUID | None, org_id: str, label: str) -> None:
    if not record_id:
        return
    if not _fetch_one(table, org_id, str(record_id), "id,org_id"):
        raise HTTPException(status_code=404, detail=f"{label} not found for organization")


def _is_document_immutable(document: dict[str, Any]) -> bool:
    metadata = document.get("legal_metadata") or {}
    if metadata.get("immutable") is True:
        return True
    flows = (
        _table("document_signature_flows")
        .select("flow_status")
        .eq("document_id", str(document["id"]))
        .eq("org_id", str(document["org_id"]))
        .execute()
    )
    return any((flow.get("flow_status") in IMMUTABLE_SIGNATURE_STATUSES) for flow in (flows.data or []))


def _update_document_metadata(document: dict[str, Any], metadata_patch: dict[str, Any], compliance_status: Optional[str] = None) -> dict:
    metadata = {**(document.get("legal_metadata") or {}), **metadata_patch}
    payload: dict[str, Any] = {"legal_metadata": metadata}
    if compliance_status:
        payload["compliance_status"] = compliance_status
    response = (
        _table("deal_documents")
        .update(payload)
        .eq("id", str(document["id"]))
        .eq("org_id", str(document["org_id"]))
        .execute()
    )
    return response.data[0] if response.data else {**document, **payload}


def _audit_access(org_id: str, user_id: Optional[str], action: str, entity_id: str, metadata: dict[str, Any]) -> None:
    try:
        import asyncio

        payload = {
            "org_id": org_id,
            "user_id": user_id,
            "action": action,
            "entity_type": "deal_document",
            "entity_id": entity_id,
            "metadata": metadata,
        }
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(supabase_service.insert_audit_log(payload))
        except RuntimeError:
            asyncio.run(supabase_service.insert_audit_log(payload))
    except Exception:
        pass


def _extract_plain_text(document: dict[str, Any], content: bytes, override_text: Optional[str]) -> str:
    if override_text and override_text.strip():
        return override_text.strip()
    mime = document.get("file_mime_type") or ""
    if mime.startswith("text/"):
        return content.decode("utf-8", errors="ignore")
    try:
        with tempfile.NamedTemporaryFile(delete=True, suffix=PurePosixPath(document.get("title") or "document").suffix) as tmp:
            tmp.write(content)
            tmp.flush()
            result = AdvancedDocumentParser().parse_document(tmp.name, project="nexus")
            if result.markdown_candidates:
                with open(result.markdown_candidates[0], "r", encoding="utf-8") as handle:
                    return handle.read()
    except Exception:
        pass
    return (document.get("title") or "")[:5000]


def _download_and_decrypt(document: dict[str, Any]) -> bytes:
    encrypted_payload = supabase_service.client.storage.from_(_storage_bucket()).download(document["storage_path"])
    return DocumentEncryptionService.decrypt_file(
        encrypted_payload,
        bytes.fromhex(document["encryption_iv"]),
        bytes.fromhex(document["encryption_auth_tag"]),
    )


def _require_folder(folder_id: UUID | str, org_id: str, columns: str = "*") -> dict[str, Any]:
    folder = _fetch_one("real_estate_deal_folders", org_id, str(folder_id), columns)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder


def _list_folder_parties(folder_id: UUID | str, org_id: str) -> list[dict[str, Any]]:
    response = (
        _table("deal_folder_parties")
        .select("*")
        .eq("folder_id", str(folder_id))
        .eq("org_id", org_id)
        .order("created_at")
        .execute()
    )
    return response.data or []


def _primary_party(parties: list[dict[str, Any]]) -> Optional[dict[str, Any]]:
    return next((party for party in parties if party.get("is_primary") is True), None)


def _required_roles_for_operation(operation_type: str) -> set[str]:
    if operation_type == "compraventa":
        return {"buyer", "seller"}
    if operation_type in {"alquiler_temporada", "alquiler_turistico"}:
        return {"buyer", "seller"}
    return {"buyer"}


def _assert_generation_prerequisites(folder: dict[str, Any], parties: list[dict[str, Any]]) -> None:
    if not folder.get("client_lead_id") and not folder.get("seller_id") and not _primary_party(parties):
        raise HTTPException(status_code=422, detail="A primary client is required before generating documents")
    roles = {party.get("party_role") for party in parties}
    missing = sorted(_required_roles_for_operation(str(folder.get("operation_type"))) - roles)
    if missing:
        raise HTTPException(status_code=422, detail={"missing_party_roles": missing})


def _ensure_party_links_belong_to_org(body: PartyCreate | PartyUpdate, org_id: str) -> None:
    _ensure_related_belongs_to_org("leads", getattr(body, "lead_id", None), org_id, "Lead")
    _ensure_related_belongs_to_org("nexus_sellers", getattr(body, "seller_id", None), org_id, "Seller")
    _ensure_related_belongs_to_org("companies", getattr(body, "company_id", None), org_id, "Company")
    _ensure_related_belongs_to_org("contacts", getattr(body, "contact_id", None), org_id, "Contact")


def _party_payload(body: PartyCreate | PartyUpdate) -> dict[str, Any]:
    payload: dict[str, Any] = {}
    for key, value in body.model_dump(exclude_unset=True).items():
        if isinstance(value, UUID):
            payload[key] = str(value)
        elif hasattr(value, "value"):
            payload[key] = value.value
        else:
            payload[key] = value
    return payload


def _unset_existing_primary_party(folder_id: UUID | str, org_id: str) -> None:
    (_table("deal_folder_parties")
     .update({"is_primary": False})
     .eq("folder_id", str(folder_id))
     .eq("org_id", org_id)
     .execute())


def _plain_storage_upload(path: str, content: bytes, content_type: str) -> None:
    supabase_service.client.storage.from_(_storage_bucket()).upload(
        path,
        content,
        file_options={"content-type": content_type, "upsert": "false"},
    )


def _pdf_placeholder(text: str) -> bytes:
    escaped = text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")
    body = f"BT /F1 12 Tf 72 720 Td ({escaped[:3000]}) Tj ET"
    return (
        b"%PDF-1.4\n"
        + f"1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n"
          f"2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n"
          f"3 0 obj << /Type /Page /Parent 2 0 R /Contents 4 0 R >> endobj\n"
          f"4 0 obj << /Length {len(body)} >> stream\n{body}\nendstream endobj\n%%EOF".encode("utf-8")
    )


def _fetch_latest_template_version(template_version_id: UUID | str, org_id: str) -> dict[str, Any]:
    version = _fetch_one("document_template_versions", org_id, str(template_version_id))
    if not version:
        raise HTTPException(status_code=404, detail="Template version not found")
    status_value = version.get("status")
    if status_value and status_value != "published":
        raise HTTPException(status_code=409, detail="Template version is not published")
    return version


def _generated_document_version(generated_document: dict[str, Any]) -> Optional[dict[str, Any]]:
    version_id = generated_document.get("current_version_id")
    if version_id:
        return _fetch_one("document_versions", str(generated_document["org_id"]), str(version_id))
    response = (
        _table("document_versions")
        .select("*")
        .eq("generated_document_id", str(generated_document["id"]))
        .eq("org_id", str(generated_document["org_id"]))
        .order("version_number", desc=True)
        .limit(1)
        .execute()
    )
    return (response.data or [None])[0]


@router.post("/folders", response_model=dict)
async def create_folder(
    data: DealFolderCreate,
    org_id: str = Depends(get_org_id),
    _membership: dict = Depends(require_dms_membership),
):
    if not data.client_lead_id and not data.seller_id:
        raise HTTPException(status_code=422, detail="A primary client lead or seller is required")
    _ensure_related_belongs_to_org("properties", data.property_id, org_id, "Property")
    _ensure_related_belongs_to_org("leads", data.client_lead_id, org_id, "Lead")
    _ensure_related_belongs_to_org("nexus_sellers", data.seller_id, org_id, "Seller")
    payload = {
        "org_id": org_id,
        "property_id": str(data.property_id) if data.property_id else None,
        "client_lead_id": str(data.client_lead_id) if data.client_lead_id else None,
        "seller_id": str(data.seller_id) if data.seller_id else None,
        "operation_type": data.operation_type.value,
    }
    response = _table("real_estate_deal_folders").insert(payload).execute()
    return response.data[0] if response.data else {}


@router.get("/folders", response_model=list[dict])
async def list_folders(
    org_id: str = Depends(get_org_id),
    _membership: dict = Depends(require_dms_membership),
):
    response = (
        _table("real_estate_deal_folders")
        .select("*")
        .eq("org_id", org_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


@router.post("/documents/upload", response_model=dict)
async def upload_document(
    folder_id: UUID = Form(...),
    title: str = Form(...),
    document_category: DocumentCategory = Form(...),
    file: UploadFile = File(...),
    org_id: str = Depends(get_org_id),
    current_user: Any = Depends(get_current_user),
    _membership: dict = Depends(require_dms_membership),
):
    folder = _fetch_one("real_estate_deal_folders", org_id, str(folder_id), "id,org_id")
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    mime = file.content_type or "application/octet-stream"
    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported document MIME type")

    file_content = await file.read()
    if len(file_content) > _max_upload_bytes():
        raise HTTPException(status_code=413, detail="Document exceeds maximum upload size")

    encrypted_payload, iv, auth_tag = DocumentEncryptionService.encrypt_file(file_content)
    filename = _safe_filename(file.filename)
    storage_path = f"dms/{org_id}/{folder_id}/{uuid4()}-{filename}.enc"

    supabase_service.client.storage.from_(_storage_bucket()).upload(
        storage_path,
        encrypted_payload,
        file_options={"content-type": "application/octet-stream", "upsert": "false"},
    )

    payload = {
        "folder_id": str(folder_id),
        "org_id": org_id,
        "title": title,
        "document_category": document_category.value,
        "storage_path": storage_path,
        "file_mime_type": mime,
        "file_size_bytes": len(file_content),
        "sha256_hash": DocumentEncryptionService.sha256(file_content),
        "encryption_iv": iv.hex(),
        "encryption_auth_tag": auth_tag.hex(),
        "uploaded_by": str(current_user.id),
        "legal_metadata": {"original_filename": filename, "immutable": False},
    }
    response = _table("deal_documents").insert(payload).execute()
    document = response.data[0] if response.data else {}
    if document:
        _audit_access(org_id, str(current_user.id), "dms_document_uploaded", str(document["id"]), {"folder_id": str(folder_id)})
    return document


@router.get("/documents/{document_id}/download")
async def download_document(
    document_id: UUID,
    org_id: str = Depends(get_org_id),
    current_user: Any = Depends(get_current_user),
    _membership: dict = Depends(require_dms_membership),
):
    document = _fetch_one("deal_documents", org_id, str(document_id))
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    content = _download_and_decrypt(document)
    _audit_access(org_id, str(current_user.id), "dms_document_downloaded", str(document_id), {"mime": document["file_mime_type"]})
    return StreamingResponse(BytesIO(content), media_type=document["file_mime_type"])


@router.get("/folders/{folder_id}/documents", response_model=list[dict])
async def list_folder_documents(
    folder_id: UUID,
    org_id: str = Depends(get_org_id),
    _membership: dict = Depends(require_dms_membership),
):
    folder = _fetch_one("real_estate_deal_folders", org_id, str(folder_id), "id,org_id")
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")
    response = (
        _table("deal_documents")
        .select("*")
        .eq("folder_id", str(folder_id))
        .eq("org_id", org_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


@router.post("/documents/{document_id}/validate", response_model=dict)
async def validate_document(
    document_id: UUID,
    data: DocumentValidationRequest | None = None,
    org_id: str = Depends(get_org_id),
    current_user: Any = Depends(get_current_user),
    _membership: dict = Depends(require_dms_membership),
):
    document = _fetch_one("deal_documents", org_id, str(document_id))
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    if _is_document_immutable(document):
        raise HTTPException(status_code=409, detail="Signed or signature-sent documents are immutable")

    folder = _fetch_one("real_estate_deal_folders", org_id, str(document["folder_id"]), "id,org_id,operation_type")
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    data = data or DocumentValidationRequest()
    content = _download_and_decrypt(document)
    text = _extract_plain_text(document, content, data.text)
    result = await advisor_contract_validator_service.validate_contract(
        contract_text=text,
        contract_type=data.contract_type or document.get("document_category"),
        operation_type=(data.operation_type.value if data.operation_type else folder.get("operation_type")),
        jurisdiction=data.jurisdiction,
        language=data.language,
        metadata={
            **data.metadata,
            "nexus_document_id": str(document_id),
            "nexus_folder_id": str(document["folder_id"]),
            "org_id": org_id,
            "sha256_hash": document.get("sha256_hash"),
        },
    )
    compliance_status = "rejected" if result.get("block_signing") else "approved"
    if not result.get("advisor_available", True) or result.get("status") in {"review_required", "error"}:
        compliance_status = "pending" if not result.get("block_signing") else "rejected"
    updated = _update_document_metadata(
        document,
        {
            "advisor_validation": result,
            "validated_by": str(current_user.id),
        },
        compliance_status=compliance_status,
    )
    _audit_access(org_id, str(current_user.id), "dms_document_validated", str(document_id), {"compliance_status": compliance_status})
    return {"document": updated, "validation": result}


@router.post("/documents/{document_id}/signature-flows", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_signature_flow(
    document_id: UUID,
    data: SignatureFlowCreate,
    org_id: str = Depends(get_org_id),
    current_user: Any = Depends(get_current_user),
    _membership: dict = Depends(require_dms_membership),
):
    document = _fetch_one("deal_documents", org_id, str(document_id))
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    if _is_document_immutable(document):
        raise HTTPException(status_code=409, detail="Document is immutable")
    if document.get("compliance_status") != "approved":
        raise HTTPException(status_code=409, detail="Only approved documents can be sent to signature")

    provider_token = getattr(settings, "DOCUSEAL_API_KEY", None) or os.environ.get("DOCUSEAL_API_KEY")
    if not provider_token:
        raise HTTPException(status_code=503, detail="DocuSeal provider is not configured")
    external_envelope_id = f"docuseal-{uuid4()}"
    payload = {
        "document_id": str(document_id),
        "org_id": org_id,
        "external_provider": "docuseal",
        "external_envelope_id": external_envelope_id,
        "signer_email": data.signer_email,
        "signer_name": data.signer_name,
        "signer_role": data.signer_role.value,
        "flow_status": "sent",
    }
    response = _table("document_signature_flows").insert(payload).execute()
    _update_document_metadata(document, {"immutable": True, "signature_sent_by": str(current_user.id)})
    _audit_access(org_id, str(current_user.id), "dms_signature_flow_created", str(document_id), {"envelope_id": external_envelope_id})
    return response.data[0] if response.data else payload


@router.get("/documents/{document_id}/workspace", response_model=dict)
async def get_document_workspace(
    document_id: UUID,
    org_id: str = Depends(get_org_id),
    _membership: dict = Depends(require_dms_membership),
):
    document = _fetch_one("deal_documents", org_id, str(document_id))
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    flows = (
        _table("document_signature_flows")
        .select("*")
        .eq("document_id", str(document_id))
        .eq("org_id", org_id)
        .order("created_at", desc=True)
        .execute()
    )
    return {
        "document": {key: value for key, value in document.items() if key != "storage_path"},
        "download_url": f"/api/dms/documents/{document_id}/download",
        "signature_flow": (flows.data or [None])[0],
    }


@router.post("/webhooks/docuseal")
async def docuseal_webhook(
    request: Request,
    x_docuseal_signature: str = Header(...),
):
    body = await request.body()
    secret = (settings.DOCUSEAL_WEBHOOK_SECRET or os.environ.get("DOCUSEAL_WEBHOOK_SECRET", "")).encode()
    if not secret:
        raise HTTPException(status_code=500, detail="DocuSeal webhook secret not configured")
    computed = hmac.new(secret, body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(computed, x_docuseal_signature):
        raise HTTPException(status_code=401)

    payload = DocuSealWebhookPayload(**await request.json())
    if payload.status == "completed" and payload.envelope_id:
        flows = (
            _table("document_signature_flows")
            .select("*")
            .eq("external_envelope_id", payload.envelope_id)
            .limit(1)
            .execute()
        )
        flow = flows.data[0] if flows.data else None
        _table("document_signature_flows").update({
            "flow_status": "signed",
            "signing_timestamp": payload.signing_timestamp.isoformat() if payload.signing_timestamp else None,
            "ip_address": payload.ip_address,
            "signed_document_path": payload.document_url,
        }).eq("external_envelope_id", payload.envelope_id).execute()
        if flow:
            document = _fetch_one("deal_documents", str(flow["org_id"]), str(flow["document_id"]))
            if document:
                _update_document_metadata(
                    document,
                    {
                        "immutable": True,
                        "signed_at": payload.signing_timestamp.isoformat() if payload.signing_timestamp else None,
                        "signed_ip_address": payload.ip_address,
                    },
                )
    return {"ok": True}


# ── Template library ──────────────────────────────────────────────────────────

@router.get("/templates/", response_model=list[dict])
@router.get("/templates", response_model=list[dict], include_in_schema=False)
async def list_templates(
    document_type: Optional[str] = None,
    status: Optional[str] = None,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    query = _table("document_templates").select("*").eq("org_id", org_id)
    if document_type:
        query = query.eq("template_document_type", document_type)
    if status:
        query = query.eq("status", status)
    return query.order("created_at", desc=True).execute().data or []


@router.post("/templates/", response_model=dict, status_code=status.HTTP_201_CREATED)
@router.post("/templates", response_model=dict, status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_template(
    body: TemplateCreate,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
    current_user: Any = Depends(get_current_user),
):
    payload = {
        "org_id": org_id,
        "name": body.name,
        "template_document_type": body.template_document_type.value,
        "description": body.description,
        "jurisdiction": body.jurisdiction,
        "language": body.language,
        "status": "draft",
        "created_by": str(current_user.id),
    }
    return (_table("document_templates").insert(payload).execute().data or [payload])[0]


@router.get("/templates/{template_id}", response_model=dict)
async def get_template(
    template_id: UUID,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    template = _fetch_one("document_templates", org_id, str(template_id))
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.patch("/templates/{template_id}/publish", response_model=dict)
async def publish_template(
    template_id: UUID,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
    current_user: Any = Depends(get_current_user),
):
    template = _fetch_one("document_templates", org_id, str(template_id))
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    now = datetime.now(timezone.utc).isoformat()
    versions = (
        _table("document_template_versions")
        .select("*")
        .eq("template_id", str(template_id))
        .eq("org_id", org_id)
        .execute()
        .data or []
    )
    for version in versions:
        _table("document_template_versions").update({
            "status": "published",
            "immutable": True,
            "published_by": str(current_user.id),
            "published_at": now,
            "legal_reviewed_by": str(current_user.id),
            "legal_reviewed_at": now,
        }).eq("id", str(version["id"])).eq("org_id", org_id).execute()
    updated = (
        _table("document_templates")
        .update({"status": "published", "published_at": now})
        .eq("id", str(template_id))
        .eq("org_id", org_id)
        .execute()
        .data or [{**template, "status": "published", "published_at": now}]
    )[0]
    return updated


@router.get("/templates/{template_id}/versions", response_model=list[dict])
async def list_template_versions(
    template_id: UUID,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    template = _fetch_one("document_templates", org_id, str(template_id), "id,org_id")
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return (
        _table("document_template_versions")
        .select("*")
        .eq("template_id", str(template_id))
        .eq("org_id", org_id)
        .order("version_number", desc=True)
        .execute()
        .data or []
    )


@router.post("/templates/{template_id}/versions", response_model=dict, status_code=status.HTTP_201_CREATED)
async def upload_template_version(
    template_id: UUID,
    file: UploadFile = File(...),
    change_summary: Optional[str] = Form(None),
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    template = _fetch_one("document_templates", org_id, str(template_id), "id,org_id")
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    content = await file.read()
    text = content.decode("utf-8", errors="ignore")
    versions = (
        _table("document_template_versions")
        .select("version_number")
        .eq("template_id", str(template_id))
        .eq("org_id", org_id)
        .execute()
        .data or []
    )
    next_number = max([int(row.get("version_number") or 0) for row in versions] or [0]) + 1
    storage_path = f"dms/{org_id}/templates/{template_id}/v{next_number}-{_safe_filename(file.filename)}"
    _plain_storage_upload(storage_path, content, file.content_type or "application/octet-stream")
    payload = {
        "template_id": str(template_id),
        "org_id": org_id,
        "version_number": next_number,
        "storage_path": storage_path,
        "source_storage_path": storage_path,
        "sha256_hash": DocumentEncryptionService.sha256(content),
        "canonical_text": text,
        "change_summary": change_summary,
        "status": "draft",
        "immutable": False,
    }
    return (_table("document_template_versions").insert(payload).execute().data or [payload])[0]


@router.get("/templates/{template_id}/versions/{version_id}/fields", response_model=list[dict])
async def list_template_fields(
    template_id: UUID,
    version_id: UUID,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    template = _fetch_one("document_templates", org_id, str(template_id), "id,org_id")
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return (
        _table("document_template_fields")
        .select("*")
        .eq("template_version_id", str(version_id))
        .eq("org_id", org_id)
        .order("created_at")
        .execute()
        .data or []
    )


@router.post("/templates/{template_id}/versions/{version_id}/fields", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_template_field(
    template_id: UUID,
    version_id: UUID,
    body: TemplateFieldCreate,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    template = _fetch_one("document_templates", org_id, str(template_id), "id,org_id")
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    version = _fetch_one("document_template_versions", org_id, str(version_id), "id,org_id,template_id")
    if not version or str(version.get("template_id")) != str(template_id):
        raise HTTPException(status_code=404, detail="Template version not found")
    payload = {
        "template_version_id": str(version_id),
        "org_id": org_id,
        "field_key": body.field_key,
        "label": body.label,
        "field_type": body.field_type.value,
        "required": body.required,
        "default_value": body.default_value,
        "validation_rule": body.validation_rule,
        "source_path": body.source_path,
    }
    return (_table("document_template_fields").insert(payload).execute().data or [payload])[0]


# ── Parties ───────────────────────────────────────────────────────────────────

@router.post("/folders/{folder_id}/parties", response_model=PartyResponse)
async def create_party(
    folder_id: UUID,
    body: PartyCreate,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    _require_folder(folder_id, org_id)
    _ensure_party_links_belong_to_org(body, org_id)
    if body.is_primary:
        _unset_existing_primary_party(folder_id, org_id)
    payload = {
        "folder_id": str(folder_id),
        "org_id": org_id,
        **_party_payload(body),
    }
    response = _table("deal_folder_parties").insert(payload).execute()
    if not response.data:
        raise HTTPException(status_code=500, detail="Failed to create party")
    return response.data[0]


@router.get("/folders/{folder_id}/parties", response_model=list[PartyResponse])
async def list_parties(
    folder_id: UUID,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    _require_folder(folder_id, org_id)
    return _list_folder_parties(folder_id, org_id)


@router.patch("/folders/{folder_id}/parties/{party_id}", response_model=PartyResponse)
async def update_party(
    folder_id: UUID,
    party_id: UUID,
    body: PartyUpdate,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    party = _fetch_one("deal_folder_parties", org_id, str(party_id))
    if not party or str(party.get("folder_id")) != str(folder_id):
        raise HTTPException(status_code=404, detail="Party not found")
    _ensure_party_links_belong_to_org(body, org_id)
    payload = _party_payload(body)
    if payload.get("is_primary") is True:
        _unset_existing_primary_party(folder_id, org_id)
    if not payload:
        return party
    response = (
        _table("deal_folder_parties")
        .update(payload)
        .eq("id", str(party_id))
        .eq("org_id", org_id)
        .execute()
    )
    return response.data[0] if response.data else {**party, **payload}


@router.delete("/folders/{folder_id}/parties/{party_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_party(
    folder_id: UUID,
    party_id: UUID,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    party = _fetch_one("deal_folder_parties", org_id, str(party_id))
    if not party or str(party.get("folder_id")) != str(folder_id):
        raise HTTPException(status_code=404, detail="Party not found")
    if party.get("is_primary"):
        raise HTTPException(status_code=409, detail="Primary party cannot be deleted")
    _table("deal_folder_parties").delete().eq("id", str(party_id)).eq("org_id", org_id).execute()
    return None


@router.get("/party-candidates", response_model=list[dict])
async def list_party_candidates(
    q: Optional[str] = None,
    entity_type: Optional[str] = None,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    tables = {
        "lead": "leads",
        "seller": "nexus_sellers",
        "company": "companies",
        "contact": "contacts",
    }
    candidates: list[dict[str, Any]] = []
    selected = [entity_type] if entity_type in tables else list(tables.keys())
    needle = (q or "").lower().strip()
    for kind in selected:
        rows = (_table(tables[kind]).select("*").eq("org_id", org_id).limit(25).execute().data or [])
        for row in rows:
            label = row.get("full_name") or row.get("name") or row.get("company_name") or row.get("email") or str(row.get("id"))
            if needle and needle not in str(label).lower() and needle not in str(row.get("email", "")).lower():
                continue
            candidates.append({
                "id": row.get("id"),
                "entity_type": kind,
                "label": label,
                "email": row.get("email"),
                "phone": row.get("phone"),
                "role_hint": "seller" if kind == "seller" else "buyer",
                "payload": row,
            })
    return candidates[:50]


@router.patch("/folders/{folder_id}/parties/{party_id}/kyc")
async def mark_party_kyc_verified(
    folder_id: UUID,
    party_id: UUID,
    membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    party = _fetch_one("deal_folder_parties", org_id, str(party_id))
    if not party or str(party.get("folder_id")) != str(folder_id):
        raise HTTPException(status_code=404, detail="Party not found")

    now = datetime.now(timezone.utc).isoformat()
    response = (
        _table("deal_folder_parties")
        .update({"kyc_verified": True, "kyc_verified_at": now})
        .eq("id", str(party_id))
        .eq("org_id", org_id)
        .execute()
    )
    return response.data[0] if response.data else {"ok": True}


# ── Complete generated-document flow ──────────────────────────────────────────

@router.get("/folders/{folder_id}/available-templates", response_model=list[dict])
async def list_available_templates(
    folder_id: UUID,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    folder = _require_folder(folder_id, org_id, "id,org_id,operation_type")
    templates = (
        _table("document_templates")
        .select("*")
        .eq("org_id", org_id)
        .eq("status", "published")
        .execute()
        .data or []
    )
    operation = folder.get("operation_type")
    allowed_by_operation = {
        "compraventa": {"arras_penitenciales", "contrato_compraventa", "mandato_exclusiva", "oferta_compra", "kyc_cliente", "nota_encargo", "reserva", "acuerdo_confidencialidad", "generico"},
        "alquiler_temporada": {"contrato_temporada", "contrato_arrendamiento", "mandato_exclusiva", "kyc_cliente", "nota_encargo", "recibo_fianza", "acta_entrega_llaves", "acuerdo_confidencialidad", "generico"},
        "alquiler_turistico": {"contrato_alquiler_turistico", "mandato_exclusiva", "kyc_cliente", "acta_entrega_llaves", "acuerdo_confidencialidad", "generico"},
    }
    allowed = allowed_by_operation.get(operation, set())
    rows: list[dict[str, Any]] = []
    for template in templates:
        if allowed and template.get("template_document_type") not in allowed:
            continue
        versions = (
            _table("document_template_versions")
            .select("*")
            .eq("template_id", str(template["id"]))
            .eq("org_id", org_id)
            .order("version_number", desc=True)
            .limit(1)
            .execute()
            .data or []
        )
        version = versions[0] if versions else None
        if version and version.get("status") not in {None, "published"}:
            continue
        rows.append({**template, "latest_version": version})
    return rows


@router.post("/folders/{folder_id}/generate-document", response_model=dict, status_code=status.HTTP_201_CREATED)
async def generate_document_from_template(
    folder_id: UUID,
    body: GeneratedDocumentCreate,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
    current_user: Any = Depends(get_current_user),
):
    folder = _require_folder(folder_id, org_id)
    parties = _list_folder_parties(folder_id, org_id)
    _assert_generation_prerequisites(folder, parties)
    template_version = _fetch_latest_template_version(body.template_version_id, org_id)
    template = _fetch_one("document_templates", org_id, str(template_version.get("template_id")))
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    property_row = _fetch_one("properties", org_id, str(folder["property_id"])) if folder.get("property_id") else None
    organization = _fetch_one("organizations", org_id, org_id) or {"id": org_id}
    context = build_template_context(
        folder=folder,
        parties=parties,
        property_row=property_row,
        organization=organization,
        agent={"id": str(current_user.id)},
    )
    fields = fetch_template_required_fields(str(template_version["id"]), org_id)
    rendered = resolve_and_render_template(
        canonical_text=template_version.get("canonical_text") or "",
        template_fields=fields,
        context=context,
        overrides=body.generation_payload,
    )
    if not rendered.is_complete:
        raise HTTPException(
            status_code=422,
            detail={"missing_fields": rendered.missing_fields, "variable_snapshot": rendered.variable_snapshot},
        )

    generated_id = str(uuid4())
    version_id = str(uuid4())
    docx_bytes = rendered.rendered_text.encode("utf-8")
    pdf_bytes = _pdf_placeholder(rendered.rendered_text)
    docx_path = f"dms/{org_id}/{folder_id}/generated/{generated_id}/v1.docx"
    pdf_path = f"dms/{org_id}/{folder_id}/generated/{generated_id}/v1.pdf"
    preview_path = f"dms/{org_id}/{folder_id}/generated/{generated_id}/preview.txt"
    _plain_storage_upload(docx_path, docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    _plain_storage_upload(pdf_path, pdf_bytes, "application/pdf")
    _plain_storage_upload(preview_path, rendered.rendered_text.encode("utf-8"), "text/plain")

    generated_payload = {
        "id": generated_id,
        "folder_id": str(folder_id),
        "org_id": org_id,
        "template_version_id": str(template_version["id"]),
        "title": body.title,
        "status": "draft",
        "generation_payload": body.generation_payload,
        "storage_path": docx_path,
        "docx_storage_path": docx_path,
        "pdf_storage_path": pdf_path,
        "preview_storage_path": preview_path,
        "variable_snapshot": rendered.variable_snapshot,
        "current_version_id": version_id,
    }
    generated = (_table("generated_documents").insert(generated_payload).execute().data or [generated_payload])[0]
    version_payload = {
        "id": version_id,
        "generated_document_id": generated_id,
        "org_id": org_id,
        "version_number": 1,
        "docx_storage_path": docx_path,
        "pdf_storage_path": pdf_path,
        "canonical_text": rendered.rendered_text,
        "validation_status": "pending",
        "signature_status": "not_sent",
        "is_signed_immutable": False,
        "created_by": str(current_user.id),
    }
    version = (_table("document_versions").insert(version_payload).execute().data or [version_payload])[0]
    _audit_access(org_id, str(current_user.id), "dms_generated_document_created", generated_id, {"folder_id": str(folder_id)})
    return {
        "document": generated,
        "version": version,
        "preview": rendered.rendered_text,
        "download_urls": {
            "docx": f"/api/dms/generated-documents/{generated_id}/download?format=docx",
            "pdf": f"/api/dms/generated-documents/{generated_id}/download?format=pdf",
        },
    }


@router.post("/folders/{folder_id}/generate", response_model=dict, status_code=status.HTTP_201_CREATED)
async def generate_document_legacy_alias(
    folder_id: UUID,
    body: GeneratedDocumentCreate,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
    current_user: Any = Depends(get_current_user),
):
    return await generate_document_from_template(folder_id, body, _membership, org_id, current_user)


@router.get("/folders/{folder_id}/generated", response_model=list[dict])
async def list_generated_documents(
    folder_id: UUID,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    _require_folder(folder_id, org_id, "id,org_id")
    return (
        _table("generated_documents")
        .select("*")
        .eq("folder_id", str(folder_id))
        .eq("org_id", org_id)
        .order("created_at", desc=True)
        .execute()
        .data or []
    )


@router.get("/generated-documents/{document_id}", response_model=dict)
async def get_generated_document(
    document_id: UUID,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    document = _fetch_one("generated_documents", org_id, str(document_id))
    if not document:
        raise HTTPException(status_code=404, detail="Generated document not found")
    return {"document": document, "version": _generated_document_version(document)}


@router.post("/generated-documents/{document_id}/versions", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_generated_document_version(
    document_id: UUID,
    body: GeneratedDocumentEdit,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
    current_user: Any = Depends(get_current_user),
):
    document = _fetch_one("generated_documents", org_id, str(document_id))
    if not document:
        raise HTTPException(status_code=404, detail="Generated document not found")
    current = _generated_document_version(document)
    if current and current.get("is_signed_immutable"):
        raise HTTPException(status_code=409, detail="Signed documents are immutable")
    versions = (
        _table("document_versions")
        .select("version_number")
        .eq("generated_document_id", str(document_id))
        .eq("org_id", org_id)
        .execute()
        .data or []
    )
    next_number = max([int(row.get("version_number") or 0) for row in versions] or [0]) + 1
    version_id = str(uuid4())
    docx_path = f"dms/{org_id}/{document.get('folder_id')}/generated/{document_id}/v{next_number}.docx"
    pdf_path = f"dms/{org_id}/{document.get('folder_id')}/generated/{document_id}/v{next_number}.pdf"
    _plain_storage_upload(docx_path, body.edited_text.encode("utf-8"), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    _plain_storage_upload(pdf_path, _pdf_placeholder(body.edited_text), "application/pdf")
    version_payload = {
        "id": version_id,
        "generated_document_id": str(document_id),
        "org_id": org_id,
        "version_number": next_number,
        "docx_storage_path": docx_path,
        "pdf_storage_path": pdf_path,
        "canonical_text": body.edited_text,
        "validation_status": "pending",
        "advisor_validation": {},
        "signature_status": "not_sent",
        "is_signed_immutable": False,
        "change_summary": body.change_summary,
        "created_by": str(current_user.id),
    }
    version = (_table("document_versions").insert(version_payload).execute().data or [version_payload])[0]
    update_payload = {"current_version_id": version_id, "status": "review_required", "storage_path": docx_path}
    if body.title:
        update_payload["title"] = body.title
    _table("generated_documents").update(update_payload).eq("id", str(document_id)).eq("org_id", org_id).execute()
    return {"version": version, "status": "review_required"}


@router.post("/generated-documents/{document_id}/validate", response_model=dict)
async def validate_generated_document(
    document_id: UUID,
    body: LegalReviewRequest | None = None,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
    current_user: Any = Depends(get_current_user),
):
    document = _fetch_one("generated_documents", org_id, str(document_id))
    if not document:
        raise HTTPException(status_code=404, detail="Generated document not found")
    version = _generated_document_version(document)
    if not version:
        raise HTTPException(status_code=404, detail="Document version not found")
    if version.get("is_signed_immutable"):
        raise HTTPException(status_code=409, detail="Signed documents are immutable")
    template_version = _fetch_one("document_template_versions", org_id, str(document.get("template_version_id"))) or {}
    folder = _fetch_one("real_estate_deal_folders", org_id, str(document.get("folder_id"))) or {}
    body = body or LegalReviewRequest()
    result = await advisor_contract_validator_service.validate_legal_document(
        document_text=version.get("canonical_text") or "",
        document_type=(template_version.get("template_document_type") or "generico"),
        canonical_template=template_version.get("canonical_text"),
        template_version_id=str(template_version.get("id") or document.get("template_version_id")),
        operation_type=folder.get("operation_type"),
        variable_snapshot=document.get("variable_snapshot") or {},
        jurisdiction=body.jurisdiction,
        language=body.language,
        document_id=str(document_id),
        org_id=org_id,
        metadata={"reviewer_notes": body.reviewer_notes, "requested_by": str(current_user.id)},
    )
    validation_status = "rejected" if result.get("block_signing") else "approved"
    if result.get("status") in {"review_required", "approved_with_warnings"}:
        validation_status = "review_required"
    _table("document_versions").update({
        "validation_status": validation_status,
        "advisor_validation": result,
    }).eq("id", str(version["id"])).eq("org_id", org_id).execute()
    _table("generated_documents").update({"status": validation_status}).eq("id", str(document_id)).eq("org_id", org_id).execute()
    decision_payload = {
        "org_id": org_id,
        "generated_document_id": str(document_id),
        "document_version_id": str(version["id"]),
        "review_type": "auto",
        "status": validation_status,
        "decision": validation_status,
        "notes": result.get("summary"),
        "block_signing": bool(result.get("block_signing")),
        "reviewer_id": str(current_user.id),
        "advisor_ai_response": result,
        "decided_at": datetime.now(timezone.utc).isoformat(),
    }
    _table("legal_review_decisions").insert(decision_payload).execute()
    return {"document_id": str(document_id), "version_id": version["id"], "validation": result, "status": validation_status}


@router.post("/generated-documents/{document_id}/review-decisions", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_manual_review_decision(
    document_id: UUID,
    body: ManualLegalReviewDecision,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
    current_user: Any = Depends(get_current_user),
):
    document = _fetch_one("generated_documents", org_id, str(document_id))
    if not document:
        raise HTTPException(status_code=404, detail="Generated document not found")
    version = _generated_document_version(document)
    if not version:
        raise HTTPException(status_code=404, detail="Document version not found")
    allowed = {"approved", "review_required", "rejected"}
    if body.decision not in allowed:
        raise HTTPException(status_code=422, detail="Invalid legal review decision")
    payload = {
        "org_id": org_id,
        "generated_document_id": str(document_id),
        "document_version_id": str(version["id"]),
        "review_type": "manual",
        "status": body.decision,
        "decision": body.decision,
        "notes": body.notes,
        "block_signing": body.block_signing or body.decision != "approved",
        "reviewer_id": str(current_user.id),
        "decided_at": datetime.now(timezone.utc).isoformat(),
    }
    row = (_table("legal_review_decisions").insert(payload).execute().data or [payload])[0]
    _table("document_versions").update({
        "validation_status": body.decision,
        "advisor_validation": {"manual": True, "notes": body.notes, "block_signing": payload["block_signing"]},
    }).eq("id", str(version["id"])).eq("org_id", org_id).execute()
    _table("generated_documents").update({"status": body.decision}).eq("id", str(document_id)).eq("org_id", org_id).execute()
    return row


@router.get("/generated-documents/{document_id}/review-decisions", response_model=list[dict])
async def list_manual_review_decisions(
    document_id: UUID,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    document = _fetch_one("generated_documents", org_id, str(document_id))
    if not document:
        raise HTTPException(status_code=404, detail="Generated document not found")
    return (
        _table("legal_review_decisions")
        .select("*")
        .eq("generated_document_id", str(document_id))
        .eq("org_id", org_id)
        .order("created_at", desc=True)
        .execute()
        .data or []
    )


@router.get("/generated-documents/{document_id}/download")
async def download_generated_document(
    document_id: UUID,
    format: str = "docx",
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
    current_user: Any = Depends(get_current_user),
):
    document = _fetch_one("generated_documents", org_id, str(document_id))
    if not document:
        raise HTTPException(status_code=404, detail="Generated document not found")
    version = _generated_document_version(document)
    if not version:
        raise HTTPException(status_code=404, detail="Document version not found")
    path_key = "pdf_storage_path" if format == "pdf" else "docx_storage_path"
    path = version.get(path_key) or document.get(path_key)
    if not path:
        raise HTTPException(status_code=404, detail="Generated file not found")
    content = supabase_service.client.storage.from_(_storage_bucket()).download(path)
    media_type = "application/pdf" if format == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    _audit_access(org_id, str(current_user.id), "dms_generated_document_downloaded", str(document_id), {"format": format})
    return StreamingResponse(BytesIO(content), media_type=media_type)


@router.post("/generated-documents/{document_id}/signature-flows", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_generated_signature_flow(
    document_id: UUID,
    body: SignatureFlowCreate,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
    current_user: Any = Depends(get_current_user),
):
    document = _fetch_one("generated_documents", org_id, str(document_id))
    if not document:
        raise HTTPException(status_code=404, detail="Generated document not found")
    version = _generated_document_version(document)
    if not version:
        raise HTTPException(status_code=404, detail="Document version not found")
    if version.get("is_signed_immutable") or version.get("signature_status") == "signed":
        raise HTTPException(status_code=409, detail="Signed documents are immutable")
    if version.get("validation_status") != "approved":
        raise HTTPException(status_code=409, detail="Only legally approved generated documents can be sent to signature")
    provider_token = getattr(settings, "DOCUSEAL_API_KEY", None) or os.environ.get("DOCUSEAL_API_KEY")
    if not provider_token:
        raise HTTPException(status_code=503, detail="DocuSeal provider is not configured")
    envelope_id = f"docuseal-{uuid4()}"
    payload = {
        "generated_document_id": str(document_id),
        "document_version_id": str(version["id"]),
        "org_id": org_id,
        "external_provider": "docuseal",
        "external_envelope_id": envelope_id,
        "signer_email": body.signer_email,
        "signer_name": body.signer_name,
        "signer_role": body.signer_role.value,
        "flow_status": "sent",
    }
    row = (_table("generated_document_signature_flows").insert(payload).execute().data or [payload])[0]
    _table("document_versions").update({"signature_status": "sent"}).eq("id", str(version["id"])).eq("org_id", org_id).execute()
    _audit_access(org_id, str(current_user.id), "dms_generated_signature_flow_created", str(document_id), {"envelope_id": envelope_id})
    return row


@router.post("/generated/{document_id}/review/auto", response_model=dict)
async def validate_generated_document_legacy_alias(
    document_id: UUID,
    body: LegalReviewRequest | None = None,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
    current_user: Any = Depends(get_current_user),
):
    return await validate_generated_document(document_id, body, _membership, org_id, current_user)


@router.get("/generated/{document_id}/review", response_model=list[dict])
async def list_review_decisions_legacy_alias(
    document_id: UUID,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    return await list_manual_review_decisions(document_id, _membership, org_id)


@router.get("/{document_id:uuid}", response_model=dict)
async def get_generated_document_legacy_alias(
    document_id: UUID,
    _membership: dict = Depends(require_dms_membership),
    org_id: str = Depends(get_org_id),
):
    return await get_generated_document(document_id, _membership, org_id)
