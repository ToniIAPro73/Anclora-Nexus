import asyncio
from unittest.mock import AsyncMock, patch

from backend.services.buyer_memory_service import BuyerMemoryService


class _MockQuery:
    def __init__(self, table_name: str, store: dict[str, list[dict]]) -> None:
        self.table_name = table_name
        self.store = store
        self.rows = list(store.get(table_name, []))

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, key, value):
        self.rows = [row for row in self.rows if row.get(key) == value]
        return self

    def in_(self, key, values):
        value_set = {str(value) for value in values}
        self.rows = [row for row in self.rows if str(row.get(key)) in value_set]
        return self

    def order(self, key, desc=False):
        self.rows = sorted(self.rows, key=lambda row: row.get(key) or "", reverse=desc)
        return self

    def limit(self, value):
        self.rows = self.rows[:value]
        return self

    def insert(self, payload):
        rows = payload if isinstance(payload, list) else [payload]
        self.store.setdefault(self.table_name, []).extend(rows)
        self.rows = rows
        return self

    def update(self, payload):
        self._update_payload = payload
        return self

    def execute(self):
        if hasattr(self, "_update_payload"):
            for row in self.rows:
                row.update(self._update_payload)
            for stored in self.store.get(self.table_name, []):
                if stored in self.rows:
                    stored.update(self._update_payload)
        return type("Resp", (), {"data": self.rows})()


class _MockClient:
    def __init__(self, store: dict[str, list[dict]]) -> None:
        self.store = store

    def table(self, table_name: str):
        return _MockQuery(table_name, self.store)


class _MockDb:
    def __init__(self, store: dict[str, list[dict]]) -> None:
        self.client = _MockClient(store)


def test_rebuild_for_buyer_creates_profile_and_activity_memory() -> None:
    store = {
        "buyer_profiles": [
            {
                "id": "buyer-1",
                "org_id": "org-1",
                "full_name": "Buyer Referral",
                "email": "buyer@example.com",
                "phone": "+34 600 111 333",
                "preferred_zones": ["andratx"],
                "source_type": "partner_referral",
                "source_platform": "exp_agent",
                "referral_partner_name": "Agent eXp Mallorca",
                "created_at": "2026-03-10T10:00:00+00:00",
                "updated_at": "2026-03-10T11:00:00+00:00",
            }
        ],
        "property_buyer_matches": [
            {
                "id": "match-1",
                "org_id": "org-1",
                "buyer_id": "buyer-1",
                "property_id": "prop-1",
                "match_status": "candidate",
                "match_score": 88,
                "created_at": "2026-03-10T11:00:00+00:00",
            }
        ],
        "properties": [{"id": "prop-1", "title": "Villa Tramontana"}],
        "prospected_properties": [],
        "match_activity_log": [
            {
                "id": "act-1",
                "org_id": "org-1",
                "match_id": "match-1",
                "activity_type": "call",
                "outcome": "qualified",
                "details": {"note": "Buyer wants visit this week"},
                "created_at": "2026-03-10T12:00:00+00:00",
            }
        ],
        "buyer_memory_records": [],
    }
    service = BuyerMemoryService()
    service.client = _MockClient(store)
    db = _MockDb(store)

    result = asyncio.run(service.rebuild_for_buyer(db=db, org_id="org-1", buyer_id="buyer-1"))

    assert result.created_records == 3
    assert "[redacted-email]" in store["buyer_memory_records"][0]["redacted_content"]
    assert any(row["memory_kind"] == "activity" for row in store["buyer_memory_records"])


def test_search_uses_vector_hybrid_when_embeddings_available() -> None:
    store = {
        "buyer_memory_records": [
            {
                "id": "m-1",
                "org_id": "org-1",
                "buyer_id": "buyer-1",
                "source_ref": "profile:buyer-1",
                "memory_kind": "profile",
                "source_type": "partner_referral",
                "source_artifact": "buyer_profile",
                "summary": "buyer referral andratx visita inmediata",
                "redacted_content": "buyer referral visita andratx esta semana",
                "semantic_payload": {},
                "keywords": ["buyer", "referral", "visita", "andratx"],
                "salience_score": 70,
                "embedding": [0.1, 0.2, 0.3],
                "embedding_dimensions": 3,
                "embedding_status": "ready",
                "source_created_at": "2026-03-10T10:00:00+00:00",
            }
        ]
    }
    service = BuyerMemoryService()
    service.client = _MockClient(store)
    db = _MockDb(store)

    with patch("backend.services.buyer_memory_service.embedding_service.is_ready", return_value=True), \
         patch("backend.services.buyer_memory_service.embedding_service.embed_text", new_callable=AsyncMock) as mock_embed:
        mock_embed.return_value = [0.1, 0.2, 0.29]
        result = asyncio.run(service.search(db=db, org_id="org-1", buyer_id="buyer-1", query="visita andratx referral"))

    assert result.retrieval_mode == "vector_hybrid"
    assert result.vector_ready_records == 1
    assert any(reason.type == "vector_similarity" for reason in result.matches[0].reasons)


def test_preview_map_returns_highlights() -> None:
    store = {
        "buyer_memory_records": [
            {
                "org_id": "org-1",
                "buyer_id": "buyer-1",
                "summary": "profile referral andratx",
                "embedding_status": "ready",
                "source_created_at": "2026-03-10T10:00:00+00:00",
            },
            {
                "org_id": "org-1",
                "buyer_id": "buyer-1",
                "summary": "call qualified this week",
                "embedding_status": "pending",
                "source_created_at": "2026-03-10T11:00:00+00:00",
            },
        ]
    }
    service = BuyerMemoryService()
    service.client = _MockClient(store)
    db = _MockDb(store)

    preview = asyncio.run(service.get_preview_map(db=db, org_id="org-1", buyer_ids=["buyer-1"]))

    assert preview["buyer-1"]["memory_status"] == "ready"
    assert len(preview["buyer-1"]["memory_preview"]) == 2
