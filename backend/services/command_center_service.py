from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Dict, List

from fastapi import HTTPException, status

from backend.models.command_center import (
    CommandCenterSnapshotResponse,
    CommandCenterTrendsResponse,
    KPIValue,
    ScopeMetadata,
    TrendPoint,
)
from backend.models.membership import UserRole
from backend.services.finops import finops_service
from backend.services.supabase_service import supabase_service


class CommandCenterService:
    def __init__(self) -> None:
        self.client = supabase_service.client

    async def _get_role(self, org_id: str, user_id: str) -> str:
        result = (
            self.client.table("organization_members")
            .select("role,status")
            .eq("org_id", org_id)
            .eq("user_id", user_id)
            .eq("status", "active")
            .limit(1)
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="FORBIDDEN_ORG_SCOPE")
        return str(result.data[0].get("role") or UserRole.AGENT.value)

    def _is_agent(self, role: str) -> bool:
        return role == UserRole.AGENT.value

    async def _count_entities(self, table: str, org_id: str, role: str, user_id: str, status_filter: List[str] | None = None) -> int:
        query = self.client.table(table).select("id", count="exact").eq("org_id", org_id)
        if self._is_agent(role):
            query = query.eq("assigned_user_id", user_id)
        if status_filter:
            query = query.in_("status", status_filter)
        result = query.execute()
        return result.count or 0

    async def get_snapshot(self, org_id: str, user_id: str) -> CommandCenterSnapshotResponse:
        role = await self._get_role(org_id, user_id)
        leads_total = await self._count_entities("leads", org_id, role, user_id)
        leads_qualified = await self._count_entities("leads", org_id, role, user_id, ["qualified", "negotiating", "closed"])
        properties_total = await self._count_entities("properties", org_id, role, user_id)
        properties_sold = await self._count_entities("properties", org_id, role, user_id, ["sold", "listed"])
        tasks_total = await self._count_entities("tasks", org_id, role, user_id)
        tasks_completed = await self._count_entities("tasks", org_id, role, user_id, ["completed"])

        lead_conversion = (leads_qualified / leads_total * 100) if leads_total > 0 else 0
        property_close_rate = (properties_sold / properties_total * 100) if properties_total > 0 else 0
        task_completion_rate = (tasks_completed / tasks_total * 100) if tasks_total > 0 else 0

        budget = await finops_service.get_budget_status(org_id)
        has_full_cost_visibility = not self._is_agent(role)

        return CommandCenterSnapshotResponse(
            scope=ScopeMetadata(org_id=org_id, role=role),
            commercial_kpis=[
                KPIValue(label="leads_total", value=float(leads_total), unit="count"),
                KPIValue(label="lead_conversion_rate", value=lead_conversion, unit="percent"),
                KPIValue(label="property_close_rate", value=property_close_rate, unit="percent"),
            ],
            productivity_kpis=[
                KPIValue(label="tasks_total", value=float(tasks_total), unit="count"),
                KPIValue(label="tasks_completed", value=float(tasks_completed), unit="count"),
                KPIValue(label="task_completion_rate", value=task_completion_rate, unit="percent"),
            ],
            budget_status=budget.status,
            burn_pct=budget.current_usage_pct if has_full_cost_visibility else None,
            monthly_budget_eur=budget.monthly_budget_eur if has_full_cost_visibility else None,
            current_usage_eur=budget.current_usage_eur if has_full_cost_visibility else None,
            cost_visibility="full" if has_full_cost_visibility else "limited",
        )

    def _month_keys(self, months: int) -> List[str]:
        now = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        keys: List[str] = []
        for i in range(months - 1, -1, -1):
            d = now - timedelta(days=i * 31)
            keys.append(d.strftime("%Y-%m"))
        return keys

    async def get_trends(self, org_id: str, user_id: str, months: int = 6) -> CommandCenterTrendsResponse:
        role = await self._get_role(org_id, user_id)
        month_keys = self._month_keys(months)
        min_date = f"{month_keys[0]}-01T00:00:00+00:00"

        lead_q = self.client.table("leads").select("created_at,assigned_user_id").eq("org_id", org_id).gte("created_at", min_date)
        task_q = (
            self.client.table("tasks")
            .select("created_at,status,assigned_user_id")
            .eq("org_id", org_id)
            .gte("created_at", min_date)
        )
        cost_q = (
            self.client.table("org_cost_usage_events")
            .select("created_at,cost_eur")
            .eq("org_id", org_id)
            .gte("created_at", min_date)
        )
        if self._is_agent(role):
            lead_q = lead_q.eq("assigned_user_id", user_id)
            task_q = task_q.eq("assigned_user_id", user_id)

        leads = lead_q.execute().data or []
        tasks = task_q.execute().data or []
        costs = cost_q.execute().data or []

        lead_map: Dict[str, int] = defaultdict(int)
        task_map: Dict[str, int] = defaultdict(int)
        cost_map: Dict[str, float] = defaultdict(float)

        for item in leads:
            created_at = str(item.get("created_at") or "")
            if len(created_at) >= 7:
                lead_map[created_at[:7]] += 1

        for item in tasks:
            if str(item.get("status")) != "completed":
                continue
            created_at = str(item.get("created_at") or "")
            if len(created_at) >= 7:
                task_map[created_at[:7]] += 1

        if not self._is_agent(role):
            for item in costs:
                created_at = str(item.get("created_at") or "")
                if len(created_at) >= 7:
                    cost_map[created_at[:7]] += float(item.get("cost_eur") or 0)

        points = [
            TrendPoint(
                period=key,
                leads_created=lead_map.get(key, 0),
                tasks_completed=task_map.get(key, 0),
                cost_eur=round(cost_map.get(key, 0), 2),
            )
            for key in month_keys
        ]

        return CommandCenterTrendsResponse(
            scope=ScopeMetadata(org_id=org_id, role=role),
            months=months,
            points=points,
        )


command_center_service = CommandCenterService()
