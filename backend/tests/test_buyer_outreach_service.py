import asyncio
from unittest.mock import AsyncMock, patch

from backend.services import buyer_outreach_service as bos


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
        values = {str(v) for v in values}
        self.rows = [row for row in self.rows if str(row.get(key)) in values]
        return self

    def order(self, key, desc=False):
        self.rows = sorted(self.rows, key=lambda row: row.get(key) or "", reverse=desc)
        return self

    def limit(self, value):
        self.rows = self.rows[:value]
        return self

    def maybe_single(self):
        self.rows = self.rows[:1]
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
        data = self.rows[0] if getattr(self, "_maybe_single", False) else self.rows
        return type("Resp", (), {"data": data})()


class _MockClient:
    def __init__(self, store: dict[str, list[dict]]) -> None:
        self.store = store

    def table(self, table_name: str):
        return _MockQuery(table_name, self.store)


class _MockDb:
    def __init__(self, store: dict[str, list[dict]]) -> None:
        self.client = _MockClient(store)


def test_generate_buyer_outreach_creates_artifacts() -> None:
    store = {
        "buyer_profiles": [{"id": "buyer-1", "org_id": "org-1", "full_name": "Hans Mueller", "email": "buyer@example.com", "phone": "+34600111222", "preferred_zones": ["andratx"], "source_type": "partner_referral", "source_platform": "exp_agent"}],
        "property_buyer_matches": [{"id": "match-1", "org_id": "org-1", "buyer_id": "buyer-1", "property_id": "prop-1", "match_status": "candidate", "match_score": 88}],
        "properties": [{"id": "prop-1", "title": "Villa Andratx"}],
        "prospected_properties": [],
        "buyer_interactions": [],
    }
    db = _MockDb(store)

    with patch("backend.services.buyer_outreach_service.buyer_memory_service.search", new_callable=AsyncMock) as mock_memory, \
         patch("backend.services.buyer_outreach_service.llm_service.summarize", new_callable=AsyncMock) as mock_summarize, \
         patch("backend.services.buyer_outreach_service.llm_service.generate_copy", new_callable=AsyncMock) as mock_copy:
        mock_memory.return_value = type("Resp", (), {"model_dump": lambda self: {"matches": [], "total_records": 0}})()
        mock_summarize.return_value = "Brief"
        mock_copy.side_effect = ["SUBJECT: Subject\nBODY: Body", "WhatsApp body"]

        result = asyncio.run(bos.generate_buyer_outreach(db=db, org_id="org-1", buyer_id="buyer-1"))

    assert result["email_subject"] == "Subject"
    assert len(store["buyer_interactions"]) == 3


def test_build_supervised_send_payload_whatsapp() -> None:
    store = {
        "buyer_profiles": [{"id": "buyer-1", "org_id": "org-1", "full_name": "Hans Mueller", "email": "buyer@example.com", "phone": "+34600111222", "preferred_zones": ["andratx"], "source_type": "partner_referral", "source_platform": "exp_agent"}],
        "property_buyer_matches": [],
        "properties": [],
        "prospected_properties": [],
        "buyer_interactions": [{"id": "w1", "org_id": "org-1", "buyer_id": "buyer-1", "tipo": "whatsapp_draft", "contenido": "Hola Hans", "metadata": {"artifact": "whatsapp_draft"}, "created_at": "2026-03-10T10:00:00+00:00"}],
    }
    db = _MockDb(store)
    with patch("backend.services.buyer_outreach_service.buyer_memory_service.search", new_callable=AsyncMock) as mock_memory:
        mock_memory.return_value = type("Resp", (), {"model_dump": lambda self: {"matches": [], "total_records": 0}, "total_records": 0, "status": "ready"})()
        payload = asyncio.run(bos.build_supervised_send_payload(db=db, org_id="org-1", buyer_id="buyer-1", channel="whatsapp"))

    assert payload["channel"] == "whatsapp"
    assert payload["status"] == "ready_for_human_send"
    assert "wa.me" in payload["launch_url"]


def test_generate_buyer_outreach_uses_human_property_fallback_when_title_missing() -> None:
    store = {
        "buyer_profiles": [{"id": "buyer-1", "org_id": "org-1", "full_name": "Hans Mueller", "email": "buyer@example.com", "phone": "+34600111222", "preferred_zones": ["andratx"], "source_type": "partner_referral", "source_platform": "exp_agent"}],
        "property_buyer_matches": [{"id": "match-1", "org_id": "org-1", "buyer_id": "buyer-1", "property_id": "prop-1", "match_status": "candidate", "match_score": 88}],
        "properties": [{"id": "prop-1", "org_id": "org-1", "title": None, "zone": "Port d'Andratx", "city": "Mallorca", "property_type": "villa", "address": None}],
        "prospected_properties": [],
        "buyer_interactions": [],
    }
    db = _MockDb(store)

    with patch("backend.services.buyer_outreach_service.buyer_memory_service.search", new_callable=AsyncMock) as mock_memory, \
         patch("backend.services.buyer_outreach_service.llm_service.summarize", new_callable=AsyncMock) as mock_summarize, \
         patch("backend.services.buyer_outreach_service.llm_service.generate_copy", new_callable=AsyncMock) as mock_copy:
        mock_memory.return_value = type("Resp", (), {"model_dump": lambda self: {"matches": [], "total_records": 0}})()
        mock_summarize.return_value = "Brief"
        mock_copy.side_effect = RuntimeError("no ai")

        result = asyncio.run(bos.generate_buyer_outreach(db=db, org_id="org-1", buyer_id="buyer-1"))

    assert "Port d'Andratx" in result["email_subject"]
    assert "prop-1" not in result["email_subject"]
    assert "Port d'Andratx" in result["whatsapp_body"]
