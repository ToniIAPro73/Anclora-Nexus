import asyncio

from backend.models.partner_network import PartnerNetworkUpdate
from backend.services.partner_network_service import PartnerNetworkService


class _MockQuery:
    def __init__(self, table_name: str, store: dict[str, list[dict]]) -> None:
        self.table_name = table_name
        self.store = store
        self.rows = list(store.get(table_name, []))
        self.payload = None

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, key, value):
        self.rows = [row for row in self.rows if row.get(key) == value]
        return self

    def order(self, key, desc=False):
        self.rows = sorted(self.rows, key=lambda row: row.get(key) or "", reverse=desc)
        return self

    def limit(self, value):
        self.rows = self.rows[:value]
        return self

    def update(self, payload):
        self.payload = payload
        return self

    def execute(self):
        if self.payload is not None:
          for row in self.store.get(self.table_name, []):
            if row in self.rows:
              row.update(self.payload)
          return type("Resp", (), {"data": self.rows, "count": len(self.rows)})()
        return type("Resp", (), {"data": self.rows, "count": len(self.rows)})()


class _MockClient:
    def __init__(self, store: dict[str, list[dict]]) -> None:
        self.store = store

    def table(self, table_name: str):
        return _MockQuery(table_name, self.store)


def test_list_partner_network_aggregates_buyers(monkeypatch) -> None:
    service = PartnerNetworkService()
    store = {
        "partner_admissions": [
            {
                "id": "adm-1",
                "org_id": "org-1",
                "status": "accepted",
                "full_name": "Agent eXp Mallorca",
                "company_name": "Agent eXp Mallorca",
                "service_category": "real_estate",
                "coverage_areas": ["mallorca"],
                "languages": ["es", "en"],
                "sustainability_focus": True,
            }
        ],
        "synergi_partner_workspaces": [
            {
                "id": "ws-1",
                "org_id": "org-1",
                "admission_id": "adm-1",
                "access_token": "token-1",
                "partner_tier": "preferred",
                "relationship_status": "active",
                "trust_score": 88,
                "network_tags": ["exp", "buyers"],
                "preferred_for_buyers": True,
            }
        ],
        "synergi_partner_opportunities": [
            {"id": "opp-1", "org_id": "org-1", "workspace_id": "ws-1"},
        ],
        "buyer_profiles": [
            {
                "id": "b-1",
                "org_id": "org-1",
                "source_type": "partner_referral",
                "referral_partner_name": "Agent eXp Mallorca",
                "motivation_score": 91,
                "created_at": "2026-03-12T10:00:00+00:00",
            }
        ],
    }
    monkeypatch.setattr("backend.services.partner_network_service.supabase_service.client", _MockClient(store))
    monkeypatch.setattr(
        "backend.services.partner_network_service.partner_workspace_service._build_launch_url",
        lambda token: f"https://anclora.local/private-area/partner/workspace?token={token}",
    )

    result = asyncio.run(service.list_network(org_id="org-1"))

    assert result["total"] == 1
    assert result["items"][0]["buyer_referrals_count"] == 1
    assert result["items"][0]["high_intent_buyers_count"] == 1
    assert result["items"][0]["workspace_launch_url"].endswith("token-1")


def test_update_partner_network(monkeypatch) -> None:
    service = PartnerNetworkService()
    store = {
        "synergi_partner_workspaces": [
            {"id": "ws-1", "org_id": "org-1", "partner_tier": "approved", "relationship_status": "active", "trust_score": 70}
        ]
    }
    monkeypatch.setattr("backend.services.partner_network_service.supabase_service.client", _MockClient(store))

    result = asyncio.run(
        service.update_network_partner(
            "org-1",
            "ws-1",
            PartnerNetworkUpdate(
                partner_tier="strategic",
                relationship_status="watchlist",
                trust_score=92,
                network_tags=["eco", "exp"],
            ),
        )
    )

    assert result is not None
    assert result["partner_tier"] == "strategic"
    assert result["relationship_status"] == "watchlist"
    assert result["trust_score"] == 92

