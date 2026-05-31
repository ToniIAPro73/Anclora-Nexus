import logging
from typing import Any, Dict, Optional

import httpx
from pydantic import BaseModel, EmailStr, Field, ValidationError

from backend.config import settings
from backend.services.access_request_email_service import access_request_email_service, build_access_request_fallback_admin_email
from backend.services.email_delivery_service import send_email_native
from backend.services.supabase_service import supabase_service

logger = logging.getLogger(__name__)


class SyncXmlPilotPayload(BaseModel):
    requestId: Optional[str] = None
    name: str = Field(min_length=1, max_length=180)
    email: EmailStr
    companyName: Optional[str] = Field(default=None, max_length=200)
    role: Optional[str] = Field(default=None, max_length=120)
    accommodationType: str = Field(min_length=1, max_length=120)
    estimatedMonthlyReservations: str = Field(min_length=1, max_length=80)
    currentWorkflow: str = Field(min_length=1, max_length=1200)
    mainPain: str = Field(min_length=1, max_length=1200)
    wantsToValidate: str = Field(default="", max_length=1200)
    acceptsSyntheticOrAnonymizedData: bool
    acceptsPilotConditions: bool
    locale: str = "es"
    source: str = "syncxml_landing"
    raw: Dict[str, Any] = Field(default_factory=dict)


class SyncXmlApprovePayload(BaseModel):
    admin_notes: str = ""
    rotatePassword: bool = False
    expiresAt: Optional[str] = None


class SyncXmlRejectPayload(BaseModel):
    internal_reason: str = ""
    user_reason: str = Field(
        default=(
            "En esta fase estamos aceptando únicamente casos que encajan con una validación controlada muy concreta. "
            "Tu solicitud no encaja suficientemente con el alcance actual del piloto o requiere condiciones que todavía no ofrecemos."
        ),
        min_length=1,
        max_length=1200,
    )


class SyncXmlMoreInfoPayload(BaseModel):
    message: str = Field(
        default=(
            "Gracias por tu interés en Anclora SyncXML. Antes de confirmar el acceso al piloto necesitamos aclarar "
            "algunos detalles sobre tu caso de uso y confirmar que la prueba se realizará solo con datos sintéticos o anonimizados."
        ),
        min_length=1,
        max_length=1600,
    )


def _manual_review_result(reason: str) -> Dict[str, Any]:
    return {
        "decision": "manual_review",
        "score": 0,
        "riskFlags": [reason],
        "reasonInternal": reason,
        "emailReasonUser": "Tu solicitud requiere revisión manual antes de decidir el acceso.",
        "recommendedNextAction": "manual_review",
    }


class SyncXmlPilotService:
    async def process_incoming_lead(self, data: Dict[str, Any]):
        try:
            payload = SyncXmlPilotPayload.model_validate(data)
        except ValidationError as exc:
            logger.warning("Invalid SyncXML pilot payload: %s", exc)
            raise

        org_id = settings.LEGACY_SINGLE_TENANT_ORG_ID or settings.PUBLIC_CTA_ORG_ID
        metadata = payload.model_dump(mode="json")
        record_data = {
            "org_id": org_id,
            "product": "syncxml",
            "source": "syncxml_landing",
            "full_name": payload.name,
            "email": str(payload.email),
            "company": payload.companyName,
            "profile_type": payload.accommodationType,
            "service_summary": payload.mainPain,
            "intended_use": payload.wantsToValidate,
            "requested_scope": "controlled_pilot",
            "message": payload.currentWorkflow,
            "privacy_accepted": payload.acceptsPilotConditions,
            "gdpr_consent": payload.acceptsSyntheticOrAnonymizedData,
            "submission_language": payload.locale,
            "status": "pending",
            "metadata": {
                **metadata,
                "request_type": "syncxml_pilot",
                "review_mode": "ai_review_pending",
            },
        }

        try:
            existing = (
                supabase_service.client.table("access_requests")
                .select("id,status,email,created_at")
                .eq("org_id", org_id)
                .eq("product", "syncxml")
                .eq("email", str(payload.email))
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            if existing.data:
                await self._create_review_task(existing.data[0], _manual_review_result("duplicate_request"))
                return existing.data[0]

            result = supabase_service.client.table("access_requests").insert(record_data).execute()
            if not result.data:
                raise RuntimeError("Failed to persist SyncXML lead")
            record = result.data[0]

            hermes_result = await self._score_with_hermes(record["id"], payload)
            final_status = self._decide_status(payload, hermes_result)
            update_data = {
                "status": final_status,
                "metadata": {
                    **record_data["metadata"],
                    "ai_review": hermes_result,
                    "review_mode": "automatic" if final_status in {"approved", "rejected"} else "manual_review",
                },
            }
            if final_status == "rejected":
                update_data["rejection_reason"] = hermes_result.get("emailReasonUser") or "Fuera del alcance actual del piloto."

            updated = (
                supabase_service.client.table("access_requests")
                .update(update_data)
                .eq("id", record["id"])
                .execute()
            )
            record = updated.data[0] if updated.data else {**record, **update_data}

            if final_status == "pending":
                await self._create_review_task(record, hermes_result)
                self._send_safely(build_access_request_fallback_admin_email(record), record, "manual_review_email_failed")
            elif final_status in {"approved", "rejected"}:
                ok = self._send_safely(access_request_email_service.build_decision_email(record), record, "decision_email_failed")
                if not ok:
                    await self._create_review_task(record, {**hermes_result, "riskFlags": ["decision_email_failed"]})

            return record
        except Exception as exc:
            logger.error("Error processing SyncXML lead: %s", exc)
            raise

    async def _score_with_hermes(self, request_id: str, payload: SyncXmlPilotPayload) -> Dict[str, Any]:
        try:
            async with httpx.AsyncClient() as client:
                headers = {}
                if settings.HERMES_WORKER_API_KEY:
                    headers["Authorization"] = f"Bearer {settings.HERMES_WORKER_API_KEY}"
                response = await client.post(
                    f"{settings.HERMES_WORKER_URL.rstrip('/')}/api/syncxml/pilot/validate",
                    json={
                        "requestId": request_id,
                        "type": "syncxml_pilot_validation",
                        "language": payload.locale,
                        "payload": payload.model_dump(mode="json"),
                        "constraints": [
                            "Pilot only",
                            "Synthetic or anonymized data only",
                            "No automatic SES.HOSPEDAJES submission",
                            "No legal compliance claims",
                            "Return strict JSON only",
                        ],
                    },
                    headers=headers,
                    timeout=15.0,
                )
                response.raise_for_status()
                return response.json()
        except Exception as exc:
            logger.warning("Hermes validation failed for %s: %s", payload.email, exc)
            return _manual_review_result("hermes_unavailable")

    def _decide_status(self, payload: SyncXmlPilotPayload, ai: Dict[str, Any]) -> str:
        flags = ai.get("riskFlags") or []
        decision = ai.get("decision")
        score = int(ai.get("score") or 0)
        text = " ".join([payload.currentWorkflow, payload.mainPain, payload.wantsToValidate]).lower()
        risky_terms = ["datos reales", "producción", "produccion", "ses automático", "ses automatico", "ministerio automático"]

        if not payload.acceptsPilotConditions or not payload.acceptsSyntheticOrAnonymizedData:
            return "rejected"
        if any(term in text for term in risky_terms):
            return "pending"
        if decision == "approve" and score >= 85 and not flags:
            return "approved"
        if decision == "reject" and score <= 25 and flags:
            return "rejected"
        return "pending"

    async def _create_review_task(self, record: Dict[str, Any], ai: Dict[str, Any]) -> None:
        payload = {
            "org_id": record.get("org_id") or settings.PUBLIC_CTA_ORG_ID,
            "title": f"Revisar piloto SyncXML · {record.get('email')}",
            "status": "pending",
            "task_type": "syncxml_pilot_review",
            "origin": "anclora-syncxml",
            "entity_type": "pilot_request",
            "entity_id": record.get("id"),
            "metadata": {
                "badge": "SyncXML · Piloto controlado",
                "access_request": record,
                "ai_review": ai,
            },
        }
        try:
            supabase_service.client.table("tasks").insert(payload).execute()
        except Exception as exc:
            logger.warning("Could not create SyncXML review task: %s", exc)

    def _email_kwargs(self, email_data: Dict[str, str]) -> Dict[str, str]:
        return {
            "to_email": email_data["to"],
            "subject": email_data["subject"],
            "body": email_data["text"],
            "html": email_data["html"],
        }

    def _send_safely(self, email_data: Dict[str, str], record: Dict[str, Any], failure_code: str) -> bool:
        try:
            send_email_native(**self._email_kwargs(email_data))
            return True
        except Exception as exc:
            logger.warning("SyncXML email failed for %s: %s", record.get("email"), exc)
            try:
                supabase_service.client.table("access_requests").update({
                    "metadata": {
                        **(record.get("metadata") or {}),
                        "email_status": "failed",
                        "error_message": str(exc),
                        "failure_code": failure_code,
                    }
                }).eq("id", record["id"]).execute()
            except Exception:
                pass
            return False

    async def approve_manual(self, org_id: str, request_id: str, reviewer_id: str, payload: SyncXmlApprovePayload) -> Dict[str, Any]:
        record = await self._get_syncxml_request(org_id, request_id)
        pending = self._merge_metadata(record, {
            "final_decision": "approved_pending_credentials",
            "credential_status": "pending",
            "email_status": "pending",
            "decided_by": str(reviewer_id),
        })
        self._update_request(record["id"], {"status": "pending", "metadata": pending, "admin_notes": payload.admin_notes})

        credentials = await self._create_syncxml_user(record, payload)
        if not credentials.get("ok") or not credentials.get("temporaryPassword"):
            failed = self._merge_metadata(record, {
                "final_decision": "failed_credentials",
                "credential_status": "failed",
                "error_message": credentials.get("error") or "SyncXML did not return temporary credentials",
            })
            updated = self._update_request(record["id"], {"status": "pending", "metadata": failed})
            await self._create_review_task(updated, _manual_review_result("credential_creation_failed"))
            self._send_safely(build_access_request_fallback_admin_email(updated), updated, "credential_creation_failed")
            return {"ok": False, "status": "failed_credentials", "record": updated}

        updated_record = self._update_request(record["id"], {
            "status": "approved",
            "reviewed_by": str(reviewer_id),
            "reviewed_at": self._now_iso(),
            "metadata": self._merge_metadata(record, {
                "final_decision": "approved",
                "credential_status": credentials.get("credentialStatus") or "created",
                "pilot_user_id": credentials.get("pilotUserId"),
            }),
        })
        sent = self._send_safely(
            access_request_email_service.build_syncxml_acceptance_email(updated_record, credentials),
            updated_record,
            "acceptance_email_failed",
        )
        final_metadata = self._merge_metadata(updated_record, {"email_status": "sent" if sent else "failed"})
        final_record = self._update_request(record["id"], {"metadata": final_metadata})
        if not sent:
            await self._create_review_task(final_record, _manual_review_result("acceptance_email_failed"))
        return {"ok": sent, "status": "approved" if sent else "approved_email_failed", "record": final_record}

    async def reject_manual(self, org_id: str, request_id: str, reviewer_id: str, payload: SyncXmlRejectPayload) -> Dict[str, Any]:
        record = await self._get_syncxml_request(org_id, request_id)
        updated = self._update_request(record["id"], {
            "status": "rejected",
            "reviewed_by": str(reviewer_id),
            "reviewed_at": self._now_iso(),
            "rejection_reason": payload.user_reason,
            "admin_notes": payload.internal_reason,
            "metadata": self._merge_metadata(record, {
                "final_decision": "rejected",
                "final_decision_reason": payload.internal_reason,
                "email_status": "pending",
            }),
        })
        sent = self._send_safely(access_request_email_service.build_decision_email(updated), updated, "rejection_email_failed")
        final = self._update_request(record["id"], {"metadata": self._merge_metadata(updated, {"email_status": "sent" if sent else "failed"})})
        return {"ok": sent, "status": "rejected" if sent else "rejected_email_failed", "record": final}

    async def request_more_info_manual(self, org_id: str, request_id: str, reviewer_id: str, payload: SyncXmlMoreInfoPayload) -> Dict[str, Any]:
        record = await self._get_syncxml_request(org_id, request_id)
        updated = self._update_request(record["id"], {
            "status": "pending",
            "reviewed_by": str(reviewer_id),
            "reviewed_at": self._now_iso(),
            "metadata": self._merge_metadata(record, {
                "final_decision": "more_info_requested",
                "email_status": "pending",
                "more_info_message": payload.message,
            }),
        })
        sent = self._send_safely(access_request_email_service.build_syncxml_more_info_email(updated, payload.message), updated, "more_info_email_failed")
        final = self._update_request(record["id"], {"metadata": self._merge_metadata(updated, {"email_status": "sent" if sent else "failed"})})
        return {"ok": sent, "status": "more_info_requested" if sent else "more_info_email_failed", "record": final}

    async def _create_syncxml_user(self, record: Dict[str, Any], payload: SyncXmlApprovePayload) -> Dict[str, Any]:
        if not settings.SYNCXML_INTERNAL_API_SECRET:
            return {"ok": False, "error": "SYNCXML_INTERNAL_API_SECRET is not configured"}
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    settings.SYNCXML_INTERNAL_API_URL,
                    json={
                        "requestId": record["id"],
                        "email": record["email"],
                        "name": record.get("full_name") or record["email"],
                        "role": "pilot_user",
                        "expiresAt": payload.expiresAt,
                        "source": "anclora-nexus",
                        "rotatePassword": payload.rotatePassword,
                    },
                    headers={"Authorization": f"Bearer {settings.SYNCXML_INTERNAL_API_SECRET}"},
                    timeout=15.0,
                )
            if not response.is_success:
                return {"ok": False, "error": f"SyncXML returned {response.status_code}"}
            return response.json()
        except Exception as exc:
            return {"ok": False, "error": str(exc)}

    async def _get_syncxml_request(self, org_id: str, request_id: str) -> Dict[str, Any]:
        result = (
            supabase_service.client.table("access_requests")
            .select("*")
            .eq("org_id", org_id)
            .eq("id", request_id)
            .eq("product", "syncxml")
            .limit(1)
            .execute()
        )
        if not result.data:
            raise ValueError("SYNCXML_PILOT_REQUEST_NOT_FOUND")
        return result.data[0]

    def _update_request(self, request_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        result = supabase_service.client.table("access_requests").update(data).eq("id", request_id).execute()
        return result.data[0] if result.data else data

    def _merge_metadata(self, record: Dict[str, Any], updates: Dict[str, Any]) -> Dict[str, Any]:
        return {**(record.get("metadata") or {}), **updates}

    def _now_iso(self) -> str:
        from datetime import datetime, timezone

        return datetime.now(timezone.utc).isoformat()


syncxml_pilot_service = SyncXmlPilotService()
