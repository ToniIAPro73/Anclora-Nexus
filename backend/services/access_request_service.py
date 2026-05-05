import logging
from typing import Any, Dict, Optional
from backend.config import settings
from backend.models.access_requests import PublicAccessRequestCreate
from backend.services.captcha_verification_service import captcha_verification_service, CaptchaVerificationError
from backend.services.supabase_service import supabase_service

logger = logging.getLogger(__name__)

class AccessRequestService:
    async def create_public_request(self, data: PublicAccessRequestCreate, remote_ip: Optional[str] = None) -> Dict[str, Any]:
        # 1. Verify Captcha
        captcha_result = captcha_verification_service.verify(
            provider=data.captcha_provider,
            token=data.captcha_token,
            remote_ip=remote_ip
        )
        
        # Enforce verification if provider is specified and required
        if captcha_result.get("required") and not captcha_result.get("verified"):
            logger.warning(f"Captcha verification failed for {data.email}")
            raise CaptchaVerificationError(f"{data.captcha_provider} verification failed")
        
        # 2. Prepare data for persistence
        # org_id is strictly controlled by backend
        org_id = settings.LEGACY_SINGLE_TENANT_ORG_ID or settings.PUBLIC_CTA_ORG_ID
        
        persistence_data = data.model_dump(exclude={"captcha_token"})
        persistence_data["org_id"] = org_id
        persistence_data["captcha_verified"] = captcha_result.get("verified", False)
        persistence_data["captcha_hostname"] = captcha_result.get("hostname")
        persistence_data["status"] = "pending"
        
        # 3. Persist to Supabase
        result = supabase_service.client.table("access_requests").insert(persistence_data).execute()
        
        if not result.data:
            logger.error(f"Failed to persist access request: {result}")
            raise RuntimeError("Failed to persist access request")
            
        record = result.data[0]
        
        # 4. TODO: Internal notification
        logger.info(f"Access request created: {record['id']} for {record['email']}")
        
        return {
            "id": record["id"],
            "status": record["status"],
            "product": record["product"],
            "email": record["email"]
        }

access_request_service = AccessRequestService()
