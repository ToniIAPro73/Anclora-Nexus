import hmac
import hashlib
import os
from io import BytesIO
from pathlib import PurePosixPath
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse

from backend.api.deps import get_current_user, get_org_id
from backend.api.middleware import verify_org_membership
from backend.models.dms import (
    DealFolderCreate,
    DocuSealWebhookPayload,
    DocumentCategory,
)
from backend.services.document_encryption_service import DocumentEncryptionService
from backend.services.supabase_service import supabase_service


router = APIRouter()


async def require_dms_membership(
    org_id: str = Depends(get_org_id),
    current_user: Any = Depends(get_current_user),
) -> dict:
    return await verify_org_membership(UUID(str(current_user.id)), UUID(str(org_id)), None)


def _storage_bucket() -> str:
    return os.environ.get("NEXUS_DMS_BUCKET", "dms")


def _safe_filename(filename: str | None) -> str:
    name = PurePosixPath(filename or "document").name
    return name.replace("/", "_").replace("\\", "_")


@router.post("/folders", response_model=dict)
async def create_folder(
    data: DealFolderCreate,
    org_id: str = Depends(get_org_id),
    _membership: dict = Depends(require_dms_membership),
):
    payload = {
        "org_id": org_id,
        "property_id": str(data.property_id) if data.property_id else None,
        "client_lead_id": str(data.client_lead_id) if data.client_lead_id else None,
        "seller_id": str(data.seller_id) if data.seller_id else None,
        "operation_type": data.operation_type.value,
    }
    response = supabase_service.client.table("real_estate_deal_folders").insert(payload).execute()
    return response.data[0] if response.data else {}


@router.get("/folders", response_model=list[dict])
async def list_folders(
    org_id: str = Depends(get_org_id),
    _membership: dict = Depends(require_dms_membership),
):
    response = (
        supabase_service.client.table("real_estate_deal_folders")
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
    file_content = await file.read()
    encrypted_payload, iv, auth_tag = DocumentEncryptionService.encrypt_file(file_content)
    filename = _safe_filename(file.filename)
    storage_path = f"dms/{org_id}/{folder_id}/{filename}.enc"

    supabase_service.client.storage.from_(_storage_bucket()).upload(
        storage_path,
        encrypted_payload,
        file_options={"content-type": "application/octet-stream", "upsert": "true"},
    )

    payload = {
        "folder_id": str(folder_id),
        "org_id": org_id,
        "title": title,
        "document_category": document_category.value,
        "storage_path": storage_path,
        "file_mime_type": file.content_type or "application/octet-stream",
        "file_size_bytes": len(file_content),
        "sha256_hash": DocumentEncryptionService.sha256(file_content),
        "encryption_iv": iv.hex(),
        "encryption_auth_tag": auth_tag.hex(),
        "uploaded_by": str(current_user.id),
    }
    response = supabase_service.client.table("deal_documents").insert(payload).execute()
    return response.data[0] if response.data else {}


@router.get("/documents/{document_id}/download")
async def download_document(
    document_id: UUID,
    org_id: str = Depends(get_org_id),
    _membership: dict = Depends(require_dms_membership),
):
    response = (
        supabase_service.client.table("deal_documents")
        .select("*")
        .eq("id", str(document_id))
        .eq("org_id", org_id)
        .limit(1)
        .execute()
    )
    if not response.data:
        raise HTTPException(status_code=404, detail="Document not found")

    document = response.data[0]
    encrypted_payload = supabase_service.client.storage.from_(_storage_bucket()).download(
        document["storage_path"]
    )
    content = DocumentEncryptionService.decrypt_file(
        encrypted_payload,
        bytes.fromhex(document["encryption_iv"]),
        bytes.fromhex(document["encryption_auth_tag"]),
    )
    return StreamingResponse(BytesIO(content), media_type=document["file_mime_type"])


@router.get("/folders/{folder_id}/documents", response_model=list[dict])
async def list_folder_documents(
    folder_id: UUID,
    org_id: str = Depends(get_org_id),
    _membership: dict = Depends(require_dms_membership),
):
    response = (
        supabase_service.client.table("deal_documents")
        .select("*")
        .eq("folder_id", str(folder_id))
        .eq("org_id", org_id)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


@router.post("/webhooks/docuseal")
async def docuseal_webhook(
    request: Request,
    x_docuseal_signature: str = Header(...),
):
    body = await request.body()
    secret = os.environ.get("DOCUSEAL_WEBHOOK_SECRET", "").encode()
    computed = hmac.new(secret, body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(computed, x_docuseal_signature):
        raise HTTPException(status_code=401)

    payload = DocuSealWebhookPayload(**await request.json())
    if payload.status == "completed" and payload.envelope_id:
        supabase_service.client.table("document_signature_flows").update({
            "flow_status": "signed",
            "signing_timestamp": payload.signing_timestamp.isoformat() if payload.signing_timestamp else None,
            "ip_address": payload.ip_address,
        }).eq("external_envelope_id", payload.envelope_id).execute()
    return {"ok": True}
