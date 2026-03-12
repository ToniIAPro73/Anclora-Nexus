from __future__ import annotations

import secrets
from datetime import datetime, timezone
from typing import Any, Dict, Optional
from urllib.parse import quote

from backend.config import settings
from backend.models.data_lab_access import DataLabAccessReview, PublicDataLabAccessRequestCreate
from backend.services.email_delivery_service import get_email_transport_summary, send_email_native
from backend.services.supabase_service import supabase_service


class DataLabAccessService:
    def _now(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def _normalize_text_list(self, value: Any) -> list[str]:
        if value is None:
            return []
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return []

    def _build_launch_url(self, token: str) -> str:
        base_url = str(settings.APP_BASE_URL or "http://localhost:3000").rstrip("/")
        return f"{base_url}/private-area/data-lab/workspace?token={token}"

    def _default_headline(self, request: Dict[str, Any], approved_scope: str) -> str:
        company = str(request.get("company_name") or "").strip()
        if company:
            return f"{company} · Data Lab {approved_scope.replace('_', ' ')}"
        return f"Data Lab access · {approved_scope.replace('_', ' ')}"

    def _default_next_steps(self, request: Dict[str, Any]) -> list[str]:
        geography = self._normalize_text_list(request.get("geography_focus"))
        primary_geography = geography[0] if geography else "Mallorca"
        return [
            f"Revisar primero los activos publicados para {primary_geography}.",
            "Usar este acceso solo para el alcance aprobado por Anclora.",
            "Si necesitas otro pack o entrega analítica, solicita ampliación desde tu contacto operativo.",
        ]

    def _default_resources(self, request: Dict[str, Any], approved_scope: str) -> list[dict[str, str]]:
        return [
            {
                "label": "Access scope",
                "description": f"Tu acceso actual está aprobado para el scope {approved_scope}.",
            },
            {
                "label": "Uso permitido",
                "description": str(request.get("intended_use") or "Uso analítico controlado."),
            },
        ]

    def _serialize_pack(self, row: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "id": row.get("id"),
            "pack_label": row.get("pack_label"),
            "notebook_name": row.get("notebook_name"),
            "market_scope": row.get("market_scope"),
            "zone_scope": self._normalize_text_list(row.get("zone_scope")),
            "language_code": row.get("language_code") or "es",
            "source_mode": row.get("source_mode") or "notebooklm_manual",
            "status": row.get("status") or "draft",
            "is_default": bool(row.get("is_default")),
            "age_hours": row.get("age_hours"),
        }

    def _list_published_packs(self, org_id: str, limit: int = 4) -> list[dict[str, Any]]:
        rows = (
            supabase_service.client.table("intelligence_packs")
            .select("*")
            .eq("org_id", org_id)
            .eq("status", "active")
            .order("updated_at", desc=True)
            .limit(limit)
            .execute()
        ).data or []
        return [self._serialize_pack(row) for row in rows]

    def _get_request_by_id(self, org_id: str, request_id: str) -> Optional[Dict[str, Any]]:
        response = (
            supabase_service.client.table("data_lab_access_requests")
            .select("*")
            .eq("org_id", org_id)
            .eq("id", request_id)
            .limit(1)
            .execute()
        )
        return response.data[0] if response.data else None

    def _get_workspace_by_request_id(self, org_id: str, request_id: str) -> Optional[Dict[str, Any]]:
        response = (
            supabase_service.client.table("data_lab_access_workspaces")
            .select("*")
            .eq("org_id", org_id)
            .eq("request_id", request_id)
            .limit(1)
            .execute()
        )
        return response.data[0] if response.data else None

    async def create_public_request(self, org_id: str, payload: PublicDataLabAccessRequestCreate) -> Dict[str, Any]:
        now = self._now()
        data = payload.model_dump()
        record = {
            **data,
            "org_id": org_id,
            "geography_focus": self._normalize_text_list(data.get("geography_focus")),
            "languages": self._normalize_text_list(data.get("languages")),
            "status": "submitted",
            "created_at": now,
            "updated_at": now,
        }
        response = supabase_service.client.table("data_lab_access_requests").insert(record).execute()
        return response.data[0]

    async def list_requests(
        self,
        *,
        org_id: str,
        status: Optional[str] = None,
        profile_type: Optional[str] = None,
        query: Optional[str] = None,
        limit: int = 25,
        offset: int = 0,
    ) -> Dict[str, Any]:
        base_query = (
            supabase_service.client.table("data_lab_access_requests")
            .select("*")
            .eq("org_id", org_id)
            .order("created_at", desc=True)
        )
        if status:
            base_query = base_query.eq("status", status)
        if profile_type:
            base_query = base_query.eq("profile_type", profile_type)
        rows = base_query.execute().data or []
        workspace_rows = (
            supabase_service.client.table("data_lab_access_workspaces")
            .select("*")
            .eq("org_id", org_id)
            .execute()
        ).data or []
        workspace_map = {str(row.get("request_id")): row for row in workspace_rows}

        if query:
            needle = query.lower().strip()
            rows = [
                row for row in rows
                if needle in " ".join(
                    [
                        str(row.get("full_name") or ""),
                        str(row.get("email") or ""),
                        str(row.get("company_name") or ""),
                        str(row.get("intended_use") or ""),
                    ]
                ).lower()
            ]

        total = len(rows)
        items = []
        for row in rows[offset: offset + limit]:
            item = dict(row)
            workspace = workspace_map.get(str(item.get("id")))
            if workspace:
                item["workspace"] = {
                    "id": workspace.get("id"),
                    "workspace_status": workspace.get("workspace_status"),
                    "access_tier": workspace.get("access_tier"),
                    "approved_scope": workspace.get("approved_scope"),
                    "launch_url": self._build_launch_url(str(workspace.get("access_token"))),
                    "last_seen_at": workspace.get("last_seen_at"),
                }
            items.append(item)
        return {
            "items": items,
            "total": total,
            "limit": limit,
            "offset": offset,
        }

    async def get_summary(self, org_id: str) -> Dict[str, Any]:
        rows = (
            supabase_service.client.table("data_lab_access_requests")
            .select("status,profile_type,requested_scope")
            .eq("org_id", org_id)
            .execute()
        ).data or []
        summary = {
            "total": len(rows),
            "submitted": 0,
            "under_review": 0,
            "approved": 0,
            "rejected": 0,
            "by_profile": {},
            "by_scope": {},
        }
        for row in rows:
            status = str(row.get("status") or "submitted")
            profile = str(row.get("profile_type") or "other")
            scope = str(row.get("requested_scope") or "market_brief")
            summary[status] = int(summary.get(status, 0)) + 1
            summary["by_profile"][profile] = int(summary["by_profile"].get(profile, 0)) + 1
            summary["by_scope"][scope] = int(summary["by_scope"].get(scope, 0)) + 1
        return summary

    async def ensure_workspace_for_approved_request(self, org_id: str, request_row: Dict[str, Any], approved_scope: str, access_tier: str) -> Dict[str, Any]:
        existing = self._get_workspace_by_request_id(org_id, str(request_row["id"]))
        if existing:
            return {**existing, "launch_url": self._build_launch_url(str(existing["access_token"]))}

        now = self._now()
        token = secrets.token_urlsafe(24)
        record = {
            "org_id": org_id,
            "request_id": request_row["id"],
            "access_token": token,
            "workspace_status": "invited",
            "access_tier": access_tier,
            "approved_scope": approved_scope,
            "headline": self._default_headline(request_row, approved_scope),
            "next_steps": self._default_next_steps(request_row),
            "resources": self._default_resources(request_row, approved_scope),
            "created_at": now,
            "updated_at": now,
        }
        created = supabase_service.client.table("data_lab_access_workspaces").insert(record).execute()
        row = created.data[0]
        row["launch_url"] = self._build_launch_url(str(row["access_token"]))
        return row

    def _build_notification(self, full_name: str, status: str, review_notes: Optional[str]) -> Dict[str, str]:
        if status == "approved":
            subject = "Anclora Data Lab · Access approved"
            body = (
                f"Hola {full_name},\n\n"
                "Tu solicitud de acceso a Anclora Data Lab ha sido aprobada.\n"
                f"Notas: {review_notes or 'Sin observaciones adicionales.'}\n\n"
                "Equipo Anclora"
            )
        else:
            subject = "Anclora Data Lab · Access reviewed"
            body = (
                f"Hola {full_name},\n\n"
                "Hemos revisado tu solicitud para Anclora Data Lab y por ahora no avanzará a la siguiente fase.\n"
                f"Notas: {review_notes or 'Gracias por tu interés en Anclora Data Lab.'}\n\n"
                "Equipo Anclora"
            )
        return {"subject": subject, "body": body}

    async def review_request(
        self,
        *,
        org_id: str,
        request_id: str,
        reviewer_user_id: str,
        payload: DataLabAccessReview,
    ) -> Optional[Dict[str, Any]]:
        row = self._get_request_by_id(org_id, request_id)
        if not row:
            return None
        now = self._now()
        approved_scope = (payload.approved_scope.value if payload.approved_scope else row.get("requested_scope") or "market_brief")
        access_tier = (payload.access_tier.value if payload.access_tier else "limited")
        update_payload: Dict[str, Any] = {
            "status": payload.status.value,
            "review_notes": payload.review_notes,
            "reviewed_by_user_id": reviewer_user_id,
            "reviewed_at": now,
            "approved_scope": approved_scope if payload.status.value == "approved" else None,
            "updated_at": now,
        }

        workspace = None
        notification = None
        if payload.status.value == "approved":
            workspace = await self.ensure_workspace_for_approved_request(org_id, row, approved_scope, access_tier)
        if payload.notify_applicant and row.get("email"):
            mail = self._build_notification(str(row.get("full_name") or "partner"), payload.status.value, payload.review_notes)
            if workspace and workspace.get("launch_url"):
                mail["body"] = f"{mail['body']}\n\nAcceso al workspace: {workspace['launch_url']}\n"
            transport = get_email_transport_summary()
            if transport["native_email_enabled"]:
                delivery = send_email_native(
                    to_email=str(row["email"]),
                    subject=mail["subject"],
                    body=mail["body"],
                )
                update_payload["decision_email_sent_at"] = now
                notification = {"transport": "smtp", "delivery": delivery}
            else:
                notification = {
                    "transport": "mailto",
                    "launch_url": f"mailto:{quote(str(row['email']))}?subject={quote(mail['subject'])}&body={quote(mail['body'])}",
                }

        updated = (
            supabase_service.client.table("data_lab_access_requests")
            .update(update_payload)
            .eq("org_id", org_id)
            .eq("id", request_id)
            .execute()
        )
        result = updated.data[0] if updated.data else None
        if not result:
            return None
        result["notification"] = notification
        result["workspace"] = workspace
        return result

    async def get_workspace_by_token(self, token: str) -> Optional[Dict[str, Any]]:
        workspace_response = (
            supabase_service.client.table("data_lab_access_workspaces")
            .select("*")
            .eq("access_token", token)
            .limit(1)
            .execute()
        )
        workspace = workspace_response.data[0] if workspace_response.data else None
        if not workspace:
            return None
        request_row = self._get_request_by_id(str(workspace["org_id"]), str(workspace["request_id"]))
        if not request_row:
            return None
        now = self._now()
        update_payload: Dict[str, Any] = {"last_seen_at": now, "updated_at": now}
        if workspace.get("workspace_status") == "invited":
            update_payload["workspace_status"] = "active"
            workspace["workspace_status"] = "active"
        workspace["last_seen_at"] = now
        (
            supabase_service.client.table("data_lab_access_workspaces")
            .update(update_payload)
            .eq("id", workspace["id"])
            .execute()
        )
        packs = self._list_published_packs(str(workspace["org_id"]))
        return {
            "id": workspace.get("id"),
            "request_id": workspace.get("request_id"),
            "requester_name": request_row.get("full_name"),
            "company_name": request_row.get("company_name"),
            "profile_type": request_row.get("profile_type"),
            "requested_scope": request_row.get("requested_scope"),
            "approved_scope": workspace.get("approved_scope"),
            "access_tier": workspace.get("access_tier"),
            "workspace_status": workspace.get("workspace_status"),
            "headline": workspace.get("headline") or self._default_headline(request_row, str(workspace.get("approved_scope") or "market_brief")),
            "intended_use": request_row.get("intended_use"),
            "geography_focus": self._normalize_text_list(request_row.get("geography_focus")),
            "languages": self._normalize_text_list(request_row.get("languages")),
            "next_steps": self._normalize_text_list(workspace.get("next_steps")),
            "resources": workspace.get("resources") or [],
            "packs": packs,
            "last_seen_at": workspace.get("last_seen_at"),
        }


data_lab_access_service = DataLabAccessService()
