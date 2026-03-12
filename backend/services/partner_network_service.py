from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.models.partner_network import PartnerNetworkUpdate
from backend.services.partner_workspace_service import partner_workspace_service
from backend.services.supabase_service import supabase_service


class PartnerNetworkService:
    def _normalize_text_list(self, value: Any) -> list[str]:
        if value is None:
            return []
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        if isinstance(value, list):
            return [str(item).strip() for item in value if str(item).strip()]
        return []

    def _build_partner_aliases(self, admission: Dict[str, Any]) -> list[str]:
        aliases = []
        for value in (admission.get("full_name"), admission.get("company_name")):
            text = str(value or "").strip().lower()
            if text:
                aliases.append(text)
        return aliases

    def _matches_partner(self, buyer: Dict[str, Any], aliases: list[str]) -> bool:
        if str(buyer.get("source_type") or "") != "partner_referral":
            return False
        referral_name = str(buyer.get("referral_partner_name") or "").strip().lower()
        if not referral_name:
            return False
        return referral_name in aliases

    def _safe_table_rows(self, table: str, org_id: str, columns: str = "*") -> list[dict[str, Any]]:
        try:
            return (
                supabase_service.client.table(table)
                .select(columns)
                .eq("org_id", org_id)
                .execute()
            ).data or []
        except Exception:
            return []

    async def list_network(
        self,
        *,
        org_id: str,
        relationship_status: Optional[str] = None,
        service_category: Optional[str] = None,
        q: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Dict[str, Any]:
        admissions = self._safe_table_rows("partner_admissions", org_id)
        workspaces = self._safe_table_rows("synergi_partner_workspaces", org_id)
        opportunities = self._safe_table_rows("synergi_partner_opportunities", org_id)
        buyers = self._safe_table_rows("buyer_profiles", org_id)

        admissions_by_id = {str(item["id"]): item for item in admissions if item.get("status") == "accepted"}
        opportunities_by_workspace: Dict[str, list[dict[str, Any]]] = {}
        for item in opportunities:
            workspace_id = str(item.get("workspace_id") or "")
            if workspace_id:
                opportunities_by_workspace.setdefault(workspace_id, []).append(item)

        items: list[dict[str, Any]] = []
        for workspace in workspaces:
            admission = admissions_by_id.get(str(workspace.get("admission_id")))
            if not admission:
                continue
            aliases = self._build_partner_aliases(admission)
            matched_buyers = [buyer for buyer in buyers if self._matches_partner(buyer, aliases)]
            item = {
                "workspace_id": workspace.get("id"),
                "admission_id": admission.get("id"),
                "partner_name": admission.get("full_name"),
                "company_name": admission.get("company_name"),
                "service_category": admission.get("service_category"),
                "sustainability_focus": bool(admission.get("sustainability_focus")),
                "partner_tier": workspace.get("partner_tier") or "approved",
                "relationship_status": workspace.get("relationship_status") or "active",
                "trust_score": float(workspace.get("trust_score") or 70),
                "preferred_for_buyers": bool(workspace.get("preferred_for_buyers")),
                "preferred_for_sellers": bool(workspace.get("preferred_for_sellers")),
                "network_tags": self._normalize_text_list(workspace.get("network_tags")),
                "strategic_notes": workspace.get("strategic_notes"),
                "coverage_areas": self._normalize_text_list(admission.get("coverage_areas")),
                "languages": self._normalize_text_list(admission.get("languages")),
                "opportunities_count": len(opportunities_by_workspace.get(str(workspace.get("id")), [])),
                "buyer_referrals_count": len(matched_buyers),
                "high_intent_buyers_count": len(
                    [buyer for buyer in matched_buyers if float(buyer.get("motivation_score") or 0) >= 80]
                ),
                "last_seen_at": workspace.get("last_seen_at"),
                "last_referral_at": max(
                    [
                        str(buyer.get("last_partner_touch_at") or buyer.get("created_at") or "")
                        for buyer in matched_buyers
                        if buyer.get("last_partner_touch_at") or buyer.get("created_at")
                    ],
                    default=None,
                ),
                "workspace_launch_url": partner_workspace_service._build_launch_url(str(workspace.get("access_token"))),
            }
            items.append(item)

        if relationship_status:
            items = [item for item in items if item["relationship_status"] == relationship_status]
        if service_category:
            items = [item for item in items if item["service_category"] == service_category]
        if q:
            needle = q.lower().strip()
            items = [
                item for item in items
                if needle in " ".join(
                    [
                        str(item.get("partner_name") or ""),
                        str(item.get("company_name") or ""),
                        str(item.get("service_category") or ""),
                        " ".join(item.get("network_tags") or []),
                    ]
                ).lower()
            ]

        items.sort(key=lambda row: (row["partner_tier"], row["trust_score"], row["buyer_referrals_count"]), reverse=True)
        total = len(items)
        return {
            "items": items[offset: offset + limit],
            "total": total,
            "limit": limit,
            "offset": offset,
        }

    async def get_summary(self, org_id: str) -> Dict[str, Any]:
        payload = await self.list_network(org_id=org_id, limit=500, offset=0)
        rows = payload["items"]
        return {
            "total": len(rows),
            "strategic": len([row for row in rows if row["partner_tier"] == "strategic"]),
            "preferred": len([row for row in rows if row["partner_tier"] == "preferred"]),
            "eco_focus": len([row for row in rows if row["sustainability_focus"]]),
            "buyer_referrals": sum(int(row["buyer_referrals_count"]) for row in rows),
        }

    async def update_network_partner(self, org_id: str, workspace_id: str, payload: PartnerNetworkUpdate) -> Optional[Dict[str, Any]]:
        current = (
            supabase_service.client.table("synergi_partner_workspaces")
            .select("*")
            .eq("org_id", org_id)
            .eq("id", workspace_id)
            .limit(1)
            .execute()
        )
        row = current.data[0] if current.data else None
        if not row:
            return None

        update_payload: Dict[str, Any] = {}
        for field in (
            "partner_tier",
            "relationship_status",
            "trust_score",
            "preferred_for_buyers",
            "preferred_for_sellers",
            "strategic_notes",
        ):
            value = getattr(payload, field)
            if value is not None:
                update_payload[field] = value.value if hasattr(value, "value") else value
        if payload.network_tags is not None:
            update_payload["network_tags"] = self._normalize_text_list(payload.network_tags)
        if not update_payload:
            return row
        updated = (
            supabase_service.client.table("synergi_partner_workspaces")
            .update(update_payload)
            .eq("org_id", org_id)
            .eq("id", workspace_id)
            .execute()
        )
        return updated.data[0] if updated.data else None


partner_network_service = PartnerNetworkService()
