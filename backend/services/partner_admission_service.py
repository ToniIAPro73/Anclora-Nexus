from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional
from urllib.parse import quote

from backend.models.partner_admissions import PartnerAdmissionReview, PublicPartnerAdmissionCreate
from backend.services.captcha_verification_service import captcha_verification_service
from backend.services.email_delivery_service import get_email_transport_summary, send_email_native
from backend.services.external_portal_email_service import (
    build_partner_review_email,
    build_partner_submission_confirmation,
)
from backend.services.partner_workspace_service import partner_workspace_service
from backend.services.supabase_service import supabase_service


class PartnerAdmissionService:
    def _normalize_text_list(self, value: Any) -> list[str]:
        if value is None:
            return []
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return []

    async def create_public_admission(self, org_id: str, payload: PublicPartnerAdmissionCreate, remote_ip: Optional[str] = None) -> Dict[str, Any]:
        now = datetime.now(timezone.utc).isoformat()
        data = payload.model_dump()
        captcha_result = captcha_verification_service.verify(
            provider=data.get("captcha_provider"),
            token=data.get("captcha_token"),
            remote_ip=remote_ip,
        )
        record = {
            **{key: value for key, value in data.items() if key != "captcha_token"},
            "org_id": org_id,
            "coverage_areas": self._normalize_text_list(data.get("coverage_areas")),
            "languages": self._normalize_text_list(data.get("languages")),
            "captcha_verified_at": now if captcha_result["verified"] else None,
            "status": "submitted",
            "created_at": now,
            "updated_at": now,
        }
        response = supabase_service.client.table("partner_admissions").insert(record).execute()
        result = response.data[0]

        transport = get_email_transport_summary()
        confirmation = None
        if transport["native_email_enabled"]:
            mail = build_partner_submission_confirmation(
                full_name=str(result.get("full_name") or "partner"),
                language=str(result.get("submission_language") or "es"),
            )
            delivery = send_email_native(
                to_email=str(result["email"]),
                subject=mail["subject"],
                body=mail["body"],
                html=mail.get("html"),
            )
            updated = (
                supabase_service.client.table("partner_admissions")
                .update({"confirmation_email_sent_at": now, "updated_at": now})
                .eq("org_id", org_id)
                .eq("id", result["id"])
                .execute()
            )
            result = updated.data[0] if updated.data else result
            confirmation = {"transport": "smtp", "delivery": delivery}
        else:
            confirmation = {"transport": "unavailable"}
        result["confirmation_email"] = confirmation
        return result

    async def list_admissions(
        self,
        *,
        org_id: str,
        status: Optional[str] = None,
        service_category: Optional[str] = None,
        query: Optional[str] = None,
        limit: int = 25,
        offset: int = 0,
    ) -> Dict[str, Any]:
        base_query = (
            supabase_service.client.table("partner_admissions")
            .select("*")
            .eq("org_id", org_id)
            .order("created_at", desc=True)
        )
        if status:
            base_query = base_query.eq("status", status)
        if service_category:
            base_query = base_query.eq("service_category", service_category)
        response = base_query.execute()
        rows = response.data or []
        try:
            workspace_rows = (
                supabase_service.client.table("synergi_partner_workspaces")
                .select("*")
                .eq("org_id", org_id)
                .execute()
            ).data or []
        except Exception:
            workspace_rows = []
        workspace_map = {str(row.get("admission_id")): row for row in workspace_rows}

        if query:
            needle = query.lower().strip()
            rows = [
                row
                for row in rows
                if needle in " ".join(
                    [
                        str(row.get("full_name") or ""),
                        str(row.get("email") or ""),
                        str(row.get("company_name") or ""),
                        str(row.get("service_summary") or ""),
                    ]
                ).lower()
            ]

        total = len(rows)
        enriched = []
        for row in rows[offset : offset + limit]:
            item = dict(row)
            workspace = workspace_map.get(str(item.get("id")))
            if workspace:
                try:
                    opportunities = (
                        supabase_service.client.table("synergi_partner_opportunities")
                        .select("id")
                        .eq("workspace_id", workspace["id"])
                        .execute()
                    ).data or []
                except Exception:
                    opportunities = []
                item["workspace"] = {
                    "id": workspace.get("id"),
                    "workspace_status": workspace.get("workspace_status"),
                    "partner_tier": workspace.get("partner_tier"),
                    "launch_url": partner_workspace_service._build_launch_url(str(workspace.get("access_token"))),
                    "opportunities_count": len(opportunities),
                    "last_seen_at": workspace.get("last_seen_at"),
                }
            enriched.append(item)
        return {
            "items": enriched,
            "total": total,
            "limit": limit,
            "offset": offset,
        }

    async def get_summary(self, org_id: str) -> Dict[str, Any]:
        response = (
            supabase_service.client.table("partner_admissions")
            .select("status,service_category,sustainability_focus")
            .eq("org_id", org_id)
            .execute()
        )
        rows = response.data or []
        summary = {
            "total": len(rows),
            "submitted": 0,
            "under_review": 0,
            "accepted": 0,
            "rejected": 0,
            "eco_focus": 0,
            "by_category": {},
        }
        for row in rows:
            status = str(row.get("status") or "submitted")
            category = str(row.get("service_category") or "other")
            summary[status] = int(summary.get(status, 0)) + 1
            summary["by_category"][category] = int(summary["by_category"].get(category, 0)) + 1
            if bool(row.get("sustainability_focus")):
                summary["eco_focus"] += 1
        return summary

    async def review_admission(
        self,
        *,
        org_id: str,
        admission_id: str,
        reviewer_user_id: str,
        payload: PartnerAdmissionReview,
    ) -> Optional[Dict[str, Any]]:
        current = (
            supabase_service.client.table("partner_admissions")
            .select("*")
            .eq("org_id", org_id)
            .eq("id", admission_id)
            .limit(1)
            .execute()
        )
        row = current.data[0] if current.data else None
        if not row:
            return None

        now = datetime.now(timezone.utc).isoformat()
        update_payload: Dict[str, Any] = {
            "status": payload.status.value,
            "review_notes": payload.review_notes,
            "reviewed_by_user_id": reviewer_user_id,
            "reviewed_at": now,
            "updated_at": now,
        }

        notification = None
        workspace = None
        if payload.status.value == "accepted":
            try:
                workspace = await partner_workspace_service.ensure_workspace_for_accepted_admission(org_id, row)
            except Exception:
                workspace = None
        if payload.notify_applicant and row.get("email"):
            mail = build_partner_review_email(
                full_name=str(row.get("full_name") or "partner"),
                language=str(row.get("submission_language") or "es"),
                accepted=payload.status.value == "accepted",
                review_notes=payload.review_notes,
                launch_url=workspace.get("launch_url") if workspace else None,
            )
            transport = get_email_transport_summary()
            if transport["native_email_enabled"]:
                delivery = send_email_native(
                    to_email=str(row["email"]),
                    subject=mail["subject"],
                    body=mail["body"],
                    html=mail.get("html"),
                )
                update_payload["decision_email_sent_at"] = now
                notification = {
                    "transport": "smtp",
                    "delivery": delivery,
                }
            else:
                notification = {
                    "transport": "mailto",
                    "launch_url": f"mailto:{quote(str(row['email']))}?subject={quote(mail['subject'])}&body={quote(mail['body'])}",
                }

        updated = (
            supabase_service.client.table("partner_admissions")
            .update(update_payload)
            .eq("org_id", org_id)
            .eq("id", admission_id)
            .execute()
        )
        result = updated.data[0] if updated.data else None
        if result is None:
            return None
        result["notification"] = notification
        result["workspace"] = workspace
        return result


partner_admission_service = PartnerAdmissionService()
