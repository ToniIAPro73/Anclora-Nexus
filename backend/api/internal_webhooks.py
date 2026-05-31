import asyncio
from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security.api_key import APIKeyHeader
from backend.config import settings
from backend.services.syncxml_pilot_service import syncxml_pilot_service

router = APIRouter(prefix="/api/internal/webhooks", tags=["Internal Webhooks"])

api_key_header = APIKeyHeader(name="Authorization", auto_error=False)

def get_api_key(api_key: str = Security(api_key_header)):
    if not api_key:
        raise HTTPException(status_code=403, detail="Missing API Key")
    # Expecting "Bearer <KEY>"
    token = api_key.replace("Bearer ", "").strip()
    if token != settings.NEXUS_INTERNAL_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid API Key")
    return token

@router.post("/syncxml-pilot")
async def syncxml_pilot_webhook(payload: dict, api_key: str = Depends(get_api_key)):
    """
    Internal webhook for SyncXML pilot requests.
    Bypasses captcha and rate limits, assuming source is trusted.
    """
    # Fire and forget: process lead in background
    asyncio.create_task(syncxml_pilot_service.process_incoming_lead(payload))
    return {"status": "accepted"}
