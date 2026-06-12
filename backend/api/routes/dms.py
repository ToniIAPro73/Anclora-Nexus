import hashlib
import hmac
import os
import tempfile
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
    SignatureFlowCreate,
)
from backend.services.advanced_document_parser import AdvancedDocumentParser
from backend.services.advisor_contract_validator_service import advisor_contract_validator_service
from backend.services.document_encryption_service import DocumentEncryptionService
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


@router.post("/folders", response_model=dict)
async def create_folder(
    data: DealFolderCreate,
    org_id: str = Depends(get_org_id),
    _membership: dict = Depends(require_dms_membership),
):
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
    if document.get("compliance_status") == "rejected":
        raise HTTPException(status_code=409, detail="Rejected documents cannot be sent to signature")

    external_envelope_id = f"pending-{uuid4()}"
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
