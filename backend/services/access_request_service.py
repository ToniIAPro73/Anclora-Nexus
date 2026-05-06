import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from backend.config import settings
from backend.models.access_requests import (
    AccessRequestProduct,
    AccessRequestRejectDecision,
    AccessRequestReviewDecision,
    AccessRequestSource,
    AccessRequestStatus,
    PublicAccessRequestCreate,
)
from backend.services.access_request_audit_service import access_request_audit_service
from backend.services.access_request_email_service import access_request_email_service
from backend.services.captcha_verification_service import captcha_verification_service, CaptchaVerificationError
from backend.services.supabase_service import supabase_service

logger = logging.getLogger(__name__)

TERMINAL_ACCESS_REQUEST_STATUSES = {
    AccessRequestStatus.APPROVED.value,
    AccessRequestStatus.REJECTED.value,
    AccessRequestStatus.CANCELLED.value,
}

class AccessRequestNotFoundError(Exception):
    pass

class AccessRequestInvalidTransitionError(Exception):
    pass

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
        await self._log_audit_event(
            org_id=str(record.get("org_id") or org_id),
            access_request_id=str(record["id"]),
            event_type="access_request.created",
            metadata={
                "product": record.get("product") or persistence_data.get("product"),
                "source": record.get("source") or persistence_data.get("source"),
                "email": record.get("email"),
            },
        )
        
        # 4. TODO: Internal notification
        logger.info(f"Access request created: {record['id']} for {record['email']}")
        
        return {
            "id": record["id"],
            "status": record["status"],
            "product": record["product"],
            "email": record["email"]
        }

    async def list_requests(
        self,
        org_id: str,
        status: Optional[AccessRequestStatus] = None,
        product: Optional[AccessRequestProduct] = None,
        source: Optional[AccessRequestSource] = None,
        email: Optional[str] = None,
        created_from: Optional[str] = None,
        created_to: Optional[str] = None,
        limit: int = 50,
    ) -> list[Dict[str, Any]]:
        query = supabase_service.client.table("access_requests").select("*").eq("org_id", org_id)
        if status:
            query = query.eq("status", status.value)
        if product:
            query = query.eq("product", product.value)
        if source:
            query = query.eq("source", source.value)
        if email and email.strip():
            query = query.ilike("email", f"%{email.strip()}%")
        if created_from:
            query = query.gte("created_at", created_from)
        if created_to:
            query = query.lte("created_at", created_to)

        result = query.order("created_at", desc=True).limit(limit).execute()
        return result.data or []

    async def get_request(self, org_id: str, request_id: str) -> Dict[str, Any]:
        result = (
            supabase_service.client.table("access_requests")
            .select("*")
            .eq("org_id", org_id)
            .eq("id", request_id)
            .limit(1)
            .execute()
        )
        if not result.data:
            raise AccessRequestNotFoundError(f"Access request {request_id} not found")
        return result.data[0]

    async def approve_request(
        self,
        org_id: str,
        request_id: str,
        decision: AccessRequestReviewDecision,
        reviewer_id: str,
    ) -> Dict[str, Any]:
        reviewer_id = reviewer_id.strip()
        if not reviewer_id:
            raise ValueError("reviewer_id is required")

        await self._ensure_pending(org_id, request_id)
        update_payload = {
            "status": AccessRequestStatus.APPROVED.value,
            "reviewed_at": self._now(),
            "reviewed_by": reviewer_id,
            "admin_notes": decision.admin_notes,
            "updated_at": self._now(),
        }
        record = await self._update_pending_request(org_id, request_id, update_payload)
        await self._log_audit_event(
            org_id=org_id,
            access_request_id=request_id,
            event_type="access_request.approved",
            actor_id=reviewer_id,
            actor_type="user",
            metadata={"admin_notes": decision.admin_notes},
        )
        record["decision_email"] = await self._send_decision_email(record)
        return record

    async def reject_request(
        self,
        org_id: str,
        request_id: str,
        decision: AccessRequestRejectDecision,
        reviewer_id: str,
    ) -> Dict[str, Any]:
        reviewer_id = reviewer_id.strip()
        if not reviewer_id:
            raise ValueError("reviewer_id is required")

        await self._ensure_pending(org_id, request_id)
        update_payload = {
            "status": AccessRequestStatus.REJECTED.value,
            "reviewed_at": self._now(),
            "reviewed_by": reviewer_id,
            "admin_notes": decision.admin_notes,
            "rejection_reason": decision.rejection_reason,
            "updated_at": self._now(),
        }
        record = await self._update_pending_request(org_id, request_id, update_payload)
        await self._log_audit_event(
            org_id=org_id,
            access_request_id=request_id,
            event_type="access_request.rejected",
            actor_id=reviewer_id,
            actor_type="user",
            metadata={
                "admin_notes": decision.admin_notes,
                "rejection_reason": decision.rejection_reason,
            },
        )
        record["decision_email"] = await self._send_decision_email(record)
        return record

    async def list_audit_events(
        self,
        org_id: str,
        request_id: str,
    ) -> list[Dict[str, Any]]:
        await self.get_request(org_id, request_id)
        result = (
            supabase_service.client.table("audit_log")
            .select("id,timestamp,actor_type,actor_id,action,resource_type,resource_id,details")
            .eq("org_id", org_id)
            .eq("resource_type", "access_request")
            .eq("resource_id", request_id)
            .order("timestamp", desc=False)
            .execute()
        )
        return result.data or []

    async def _ensure_pending(self, org_id: str, request_id: str) -> None:
        record = await self.get_request(org_id, request_id)
        current_status = record.get("status")
        if current_status != AccessRequestStatus.PENDING.value:
            if current_status in TERMINAL_ACCESS_REQUEST_STATUSES:
                raise AccessRequestInvalidTransitionError(
                    f"Access request {request_id} is already {current_status}"
                )
            raise AccessRequestInvalidTransitionError(
                f"Access request {request_id} cannot transition from {current_status}"
            )

    async def _update_pending_request(
        self,
        org_id: str,
        request_id: str,
        update_payload: Dict[str, Any],
    ) -> Dict[str, Any]:
        result = (
            supabase_service.client.table("access_requests")
            .update(update_payload)
            .eq("org_id", org_id)
            .eq("id", request_id)
            .eq("status", AccessRequestStatus.PENDING.value)
            .execute()
        )
        if not result.data:
            raise AccessRequestInvalidTransitionError(
                f"Access request {request_id} is no longer pending"
            )
        return result.data[0]

    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    async def _log_audit_event(
        self,
        *,
        org_id: str,
        access_request_id: str,
        event_type: str,
        actor_id: Optional[str] = None,
        actor_type: str = "system",
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        try:
            await access_request_audit_service.log_event(
                org_id=org_id,
                access_request_id=access_request_id,
                event_type=event_type,
                actor_id=actor_id,
                actor_type=actor_type,
                metadata=metadata,
            )
        except Exception as e:
            logger.warning("Access request audit logging failed: %s", e)

    async def _send_decision_email(self, record: Dict[str, Any]) -> Dict[str, Any]:
        try:
            result = access_request_email_service.send_decision_email(record)
            await self._log_audit_event(
                org_id=str(record["org_id"]),
                access_request_id=str(record["id"]),
                event_type="access_request.email_sent"
                if result.get("status") == "sent"
                else "access_request.email_skipped",
                metadata={
                    "status": result.get("status"),
                    "transport": result.get("transport"),
                    "to": result.get("to"),
                    "subject": result.get("subject"),
                },
            )
            return result
        except Exception as e:
            logger.warning("Access request decision email failed: %s", e)
            await self._log_audit_event(
                org_id=str(record["org_id"]),
                access_request_id=str(record["id"]),
                event_type="access_request.email_send_failed",
                metadata={"error": str(e), "status": record.get("status")},
            )
            return {"status": "failed", "error": str(e)}

access_request_service = AccessRequestService()
