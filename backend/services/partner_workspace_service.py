from __future__ import annotations

import secrets
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from backend.config import settings
from backend.models.partner_workspaces import PublicPartnerOpportunityCreate
from backend.services.supabase_service import supabase_service


class PartnerWorkspaceService:
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

    def _default_headline(self, admission: Dict[str, Any]) -> str:
        company = str(admission.get("company_name") or "").strip()
        service_summary = str(admission.get("service_summary") or "").strip()
        if company:
            return f"{company} · Synergi approved partner"
        if service_summary:
            return service_summary[:140]
        return "Synergi approved partner"

    def _default_collaboration_focus(self, admission: Dict[str, Any]) -> list[str]:
        focus = []
        category = str(admission.get("service_category") or "other")
        if category == "real_estate":
            focus.extend(["buyers", "sellers", "co-brokerage"])
        elif category == "professional":
            focus.extend(["advisory", "legal", "operations"])
        elif category == "luxury":
            focus.extend(["lifestyle", "asset enhancement"])
        elif category == "eco":
            focus.extend(["sustainability", "local impact", "eco-upgrades"])
        else:
            focus.append("collaboration")
        return focus

    def _default_next_steps(self, admission: Dict[str, Any]) -> list[str]:
        areas = self._normalize_text_list(admission.get("coverage_areas"))
        primary_area = areas[0] if areas else "Mallorca"
        return [
            f"Confirmar tu cobertura operativa en {primary_area}.",
            "Compartir dos ejemplos de colaboración u oportunidad prioritaria.",
            "Usar este workspace para enviar referrals o solicitudes de colaboración.",
        ]

    def _default_resources(self, admission: Dict[str, Any]) -> list[dict[str, str]]:
        category = str(admission.get("service_category") or "other")
        return [
            {
                "label": "Guía Synergi",
                "description": "Marco de colaboración, tiempos de respuesta y criterios de oportunidad.",
            },
            {
                "label": "Categoría activa",
                "description": f"Tu categoría principal aprobada actualmente es {category}.",
            },
        ]

    def _build_launch_url(self, token: str) -> str:
        base_url = str(settings.APP_BASE_URL or "http://localhost:3000").rstrip("/")
        return f"{base_url}/private-area/partner/workspace?token={token}"

    def _get_workspace_by_admission_id(self, org_id: str, admission_id: str) -> Optional[Dict[str, Any]]:
        response = (
            supabase_service.client.table("synergi_partner_workspaces")
            .select("*")
            .eq("org_id", org_id)
            .eq("admission_id", admission_id)
            .limit(1)
            .execute()
        )
        return response.data[0] if response.data else None

    def _get_admission_by_id(self, org_id: str, admission_id: str) -> Optional[Dict[str, Any]]:
        response = (
            supabase_service.client.table("partner_admissions")
            .select("*")
            .eq("org_id", org_id)
            .eq("id", admission_id)
            .limit(1)
            .execute()
        )
        return response.data[0] if response.data else None

    def _list_workspace_opportunities(self, workspace_id: str) -> list[dict[str, Any]]:
        response = (
            supabase_service.client.table("synergi_partner_opportunities")
            .select("*")
            .eq("workspace_id", workspace_id)
            .order("created_at", desc=True)
            .execute()
        )
        return response.data or []

    def _serialize_workspace(
        self,
        workspace: Dict[str, Any],
        admission: Dict[str, Any],
        opportunities: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        return {
            "id": workspace.get("id"),
            "admission_id": workspace.get("admission_id"),
            "partner_name": admission.get("full_name"),
            "company_name": admission.get("company_name"),
            "service_category": admission.get("service_category"),
            "service_summary": admission.get("service_summary"),
            "coverage_areas": self._normalize_text_list(admission.get("coverage_areas")),
            "languages": self._normalize_text_list(admission.get("languages")),
            "sustainability_focus": bool(admission.get("sustainability_focus")),
            "sustainability_notes": admission.get("sustainability_notes"),
            "workspace_status": workspace.get("workspace_status"),
            "partner_tier": workspace.get("partner_tier"),
            "headline": workspace.get("headline") or self._default_headline(admission),
            "collaboration_focus": self._normalize_text_list(workspace.get("collaboration_focus")),
            "next_steps": self._normalize_text_list(workspace.get("next_steps")),
            "resources": workspace.get("resources") or [],
            "opportunities": opportunities or [],
            "last_seen_at": workspace.get("last_seen_at"),
        }

    async def ensure_workspace_for_accepted_admission(self, org_id: str, admission: Dict[str, Any]) -> Dict[str, Any]:
        existing = self._get_workspace_by_admission_id(org_id, str(admission["id"]))
        if existing:
            return {
                **existing,
                "launch_url": self._build_launch_url(str(existing["access_token"])),
            }

        now = self._now()
        token = secrets.token_urlsafe(24)
        record = {
            "org_id": org_id,
            "admission_id": admission["id"],
            "access_token": token,
            "workspace_status": "invited",
            "partner_tier": "approved",
            "headline": self._default_headline(admission),
            "collaboration_focus": self._default_collaboration_focus(admission),
            "next_steps": self._default_next_steps(admission),
            "resources": self._default_resources(admission),
            "created_at": now,
            "updated_at": now,
        }
        created = supabase_service.client.table("synergi_partner_workspaces").insert(record).execute()
        row = created.data[0]
        row["launch_url"] = self._build_launch_url(str(row["access_token"]))
        return row

    async def get_workspace_by_token(self, token: str) -> Optional[Dict[str, Any]]:
        workspace_response = (
            supabase_service.client.table("synergi_partner_workspaces")
            .select("*")
            .eq("access_token", token)
            .limit(1)
            .execute()
        )
        workspace = workspace_response.data[0] if workspace_response.data else None
        if not workspace:
            return None

        admission = self._get_admission_by_id(str(workspace["org_id"]), str(workspace["admission_id"]))
        if not admission:
            return None

        opportunities = self._list_workspace_opportunities(str(workspace["id"]))
        now = self._now()
        update_payload: Dict[str, Any] = {"last_seen_at": now, "updated_at": now}
        if workspace.get("workspace_status") == "invited":
            update_payload["workspace_status"] = "active"
            workspace["workspace_status"] = "active"
        workspace["last_seen_at"] = now
        (
            supabase_service.client.table("synergi_partner_workspaces")
            .update(update_payload)
            .eq("id", workspace["id"])
            .execute()
        )
        return self._serialize_workspace(workspace, admission, opportunities)

    async def create_opportunity_from_token(self, payload: PublicPartnerOpportunityCreate) -> Optional[Dict[str, Any]]:
        workspace_response = (
            supabase_service.client.table("synergi_partner_workspaces")
            .select("*")
            .eq("access_token", payload.token)
            .limit(1)
            .execute()
        )
        workspace = workspace_response.data[0] if workspace_response.data else None
        if not workspace:
            return None

        now = self._now()
        record = {
            "org_id": workspace["org_id"],
            "workspace_id": workspace["id"],
            "title": payload.title,
            "opportunity_type": payload.opportunity_type.value,
            "summary": payload.summary,
            "target_zone": payload.target_zone,
            "budget_range": payload.budget_range,
            "next_step": payload.next_step,
            "status": "submitted",
            "created_at": now,
            "updated_at": now,
        }
        response = supabase_service.client.table("synergi_partner_opportunities").insert(record).execute()
        return response.data[0] if response.data else None

    async def get_internal_workspace_for_admission(self, org_id: str, admission_id: str) -> Optional[Dict[str, Any]]:
        workspace = self._get_workspace_by_admission_id(org_id, admission_id)
        if not workspace:
            return None
        opportunities = self._list_workspace_opportunities(str(workspace["id"]))
        return {
            "id": workspace.get("id"),
            "workspace_status": workspace.get("workspace_status"),
            "partner_tier": workspace.get("partner_tier"),
            "launch_url": self._build_launch_url(str(workspace["access_token"])),
            "opportunities_count": len(opportunities),
            "last_seen_at": workspace.get("last_seen_at"),
        }


partner_workspace_service = PartnerWorkspaceService()
