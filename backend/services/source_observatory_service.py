from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Tuple

from fastapi import HTTPException, status

from backend.models.membership import UserRole
from backend.models.source_observatory import (
    ObservatoryOverviewResponse,
    ObservatoryRankingResponse,
    ObservatoryTrendsResponse,
    RankingItem,
    ScopeMetadata,
    SourceScorecard,
    TrendPoint,
)
from backend.services.supabase_service import supabase_service


class SourceObservatoryService:
    def __init__(self) -> None:
        self.client = supabase_service.client

    def _table_exists(self, table: str) -> bool:
        try:
            self.client.table(table).select("id").limit(1).execute()
            return True
        except Exception:
            return False

    async def _get_role(self, org_id: str, user_id: str) -> str:
        try:
            result = (
                self.client.table("organization_members")
                .select("role,status")
                .eq("org_id", org_id)
                .eq("user_id", user_id)
                .eq("status", "active")
                .limit(1)
                .execute()
            )
            if result.data:
                return str(result.data[0].get("role") or UserRole.AGENT.value)
        except Exception:
            pass
        return UserRole.OWNER.value

    def _source_key_from_event(self, connector_name: str | None) -> str:
        val = str(connector_name or "").strip().lower()
        return val or "unknown"

    async def _load_source_data(self, org_id: str) -> Tuple[List[dict], List[dict]]:
        events: List[dict] = []
        leads: List[dict] = []
        if self._table_exists("ingestion_events"):
            events = (
                self.client.table("ingestion_events")
                .select("connector_name,status,processed_at")
                .eq("org_id", org_id)
                .execute()
                .data
                or []
            )
        if self._table_exists("leads"):
            leads = (
                self.client.table("leads")
                .select("source_system,source_channel")
                .eq("org_id", org_id)
                .execute()
                .data
                or []
            )
        return events, leads

    async def get_overview(self, org_id: str, user_id: str) -> ObservatoryOverviewResponse:
        role = await self._get_role(org_id, user_id)
        events, leads = await self._load_source_data(org_id)

        counters: Dict[str, Dict[str, int]] = defaultdict(lambda: {"total": 0, "success": 0, "duplicate": 0, "error": 0, "leads": 0})
        for ev in events:
            key = self._source_key_from_event(ev.get("connector_name"))
            counters[key]["total"] += 1
            s = str(ev.get("status") or "").lower()
            if s in {"success", "duplicate", "error"}:
                counters[key][s] += 1

        for lead in leads:
            source_system = str(lead.get("source_system") or "unknown").lower()
            source_channel = str(lead.get("source_channel") or "unknown").lower()
            key = f"{source_system}:{source_channel}"
            counters[key]["leads"] += 1

        items: List[SourceScorecard] = []
        for key, c in counters.items():
            total = c["total"]
            success_rate = (c["success"] / total * 100) if total > 0 else 0
            items.append(
                SourceScorecard(
                    source_key=key,
                    total_events=total,
                    success_events=c["success"],
                    duplicate_events=c["duplicate"],
                    error_events=c["error"],
                    success_rate_pct=round(success_rate, 2),
                    lead_count=c["leads"],
                )
            )
        items.sort(key=lambda x: (x.success_rate_pct, x.total_events), reverse=True)
        return ObservatoryOverviewResponse(scope=ScopeMetadata(org_id=org_id, role=role), items=items, total=len(items))

    async def get_ranking(self, org_id: str, user_id: str) -> ObservatoryRankingResponse:
        overview = await self.get_overview(org_id, user_id)
        ranking: List[RankingItem] = []
        for item in overview.items:
            volume_factor = min(item.total_events / 20.0, 1.0) * 10
            lead_factor = min(item.lead_count / 30.0, 1.0) * 10
            score = round((item.success_rate_pct * 0.8) + volume_factor + lead_factor, 2)
            ranking.append(
                RankingItem(
                    source_key=item.source_key,
                    score=score,
                    success_rate_pct=item.success_rate_pct,
                    lead_count=item.lead_count,
                )
            )
        ranking.sort(key=lambda r: r.score, reverse=True)
        return ObservatoryRankingResponse(
            scope=overview.scope,
            items=ranking,
            total=len(ranking),
        )

    def _month_keys(self, months: int) -> List[str]:
        now = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        return [(now - timedelta(days=i * 31)).strftime("%Y-%m") for i in range(months - 1, -1, -1)]

    async def get_trends(self, org_id: str, user_id: str, months: int = 6) -> ObservatoryTrendsResponse:
        role = await self._get_role(org_id, user_id)
        month_keys = self._month_keys(months)
        min_date = f"{month_keys[0]}-01T00:00:00+00:00"

        events: List[dict] = []
        if self._table_exists("ingestion_events"):
            events = (
                self.client.table("ingestion_events")
                .select("connector_name,status,processed_at")
                .eq("org_id", org_id)
                .gte("processed_at", min_date)
                .execute()
                .data
                or []
            )

        bucket: Dict[Tuple[str, str], Dict[str, int]] = defaultdict(lambda: {"total": 0, "success": 0})
        for ev in events:
            ts = str(ev.get("processed_at") or "")
            if len(ts) < 7:
                continue
            period = ts[:7]
            source_key = self._source_key_from_event(ev.get("connector_name"))
            key = (period, source_key)
            bucket[key]["total"] += 1
            if str(ev.get("status") or "").lower() == "success":
                bucket[key]["success"] += 1

        points: List[TrendPoint] = []
        for (period, source_key), c in bucket.items():
            total = c["total"]
            success_rate = (c["success"] / total * 100) if total > 0 else 0
            points.append(
                TrendPoint(
                    period=period,
                    source_key=source_key,
                    events=total,
                    success_rate_pct=round(success_rate, 2),
                )
            )
        points.sort(key=lambda p: (p.period, p.source_key))
        return ObservatoryTrendsResponse(
            scope=ScopeMetadata(org_id=org_id, role=role),
            months=months,
            points=points,
        )


source_observatory_service = SourceObservatoryService()
