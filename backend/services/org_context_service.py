from __future__ import annotations

from typing import Optional

from fastapi import HTTPException, status

from backend.config import settings


def resolve_legacy_org_id(requested_org_id: Optional[str], context: str) -> str:
    org_id = str(requested_org_id or "").strip()
    if org_id:
        return org_id

    fallback_org_id = str(settings.LEGACY_SINGLE_TENANT_ORG_ID or "").strip()
    if fallback_org_id:
        return fallback_org_id

    raise ValueError(f"ORG_ID_REQUIRED:{context}")


def resolve_legacy_org_id_http(requested_org_id: Optional[str], context: str) -> str:
    try:
        return resolve_legacy_org_id(requested_org_id, context)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
