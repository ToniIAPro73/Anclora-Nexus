import asyncio

from backend.services.seller_memory_service import SellerMemoryService


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

    def execute(self):
        return type("Resp", (), {"data": self.rows})()


class _MockClient:
    def __init__(self, store: dict[str, list[dict]]) -> None:
        self.store = store

    def table(self, table_name: str):
        return _MockQuery(table_name, self.store)


class _MockDb:
    def __init__(self, store: dict[str, list[dict]]) -> None:
        self.client = _MockClient(store)


def test_rebuild_for_seller_creates_redacted_memory_records() -> None:
    store = {
        "seller_interactions": [
            {
                "id": "i-1",
                "org_id": "org-1",
                "seller_id": "seller-1",
                "tipo": "llamada",
                "estado": "realizado",
                "contenido": "Llamar al +34 600 111 222 y enviar email a owner@example.com",
                "resultado": "interesado",
                "metadata": {"artifact": "context_brief"},
                "created_at": "2026-03-10T10:00:00+00:00",
            }
        ],
        "seller_memory_records": [],
    }
    service = SellerMemoryService()
    service.client = _MockClient(store)
    db = _MockDb(store)

    result = asyncio.run(service.rebuild_for_seller(db=db, org_id="org-1", seller_id="seller-1"))

    assert result.created_records == 1
    saved = store["seller_memory_records"][0]
    assert saved["interaction_id"] == "i-1"
    assert "[redacted-phone]" in saved["redacted_content"]
    assert "[redacted-email]" in saved["redacted_content"]


def test_search_returns_explainable_matches() -> None:
    store = {
        "seller_interactions": [],
        "seller_memory_records": [
            {
                "id": "m-1",
                "org_id": "org-1",
                "seller_id": "seller-1",
                "interaction_id": "i-1",
                "memory_kind": "followup",
                "source_type": "llamada",
                "source_artifact": "context_brief",
                "summary": "llamada · context brief · resultado interesado en exclusividad",
                "redacted_content": "seller asked for exclusividad y seguimiento esta semana",
                "semantic_payload": {"resultado": "interesado"},
                "keywords": ["exclusividad", "seguimiento", "interesado"],
                "salience_score": 84,
                "source_created_at": "2026-03-10T10:00:00+00:00",
            }
        ],
    }
    service = SellerMemoryService()
    service.client = _MockClient(store)
    db = _MockDb(store)

    result = asyncio.run(service.search(db=db, org_id="org-1", seller_id="seller-1", query="seguimiento exclusividad"))

    assert result.status == "ready"
    assert result.total_records == 1
    assert result.matches[0].matched_keywords == ["seguimiento", "exclusividad"]
    assert any(reason.type == "keyword_hits" for reason in result.matches[0].reasons)
