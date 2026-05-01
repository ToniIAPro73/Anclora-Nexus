import asyncio
from unittest.mock import AsyncMock, patch

from backend.services import lead_outreach_service as los


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

    def maybe_single(self):
        self.rows = self.rows[:1]
        self._maybe_single = True
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


def test_generate_lead_outreach_creates_brief_and_email_draft() -> None:
    store = {
        "leads": [
            {
                "id": "lead-1",
                "org_id": "org-1",
                "name": "Hans Mueller",
                "email": "lead@example.com",
                "qualification_score": 85,
                "qualification_tier": "hot",
                "nationality": "German",
                "zone_interest": "Andratx",
                "property_interest": "Luxury villa",
            }
        ],
        "lead_interactions": [],
    }
    db = _MockDb(store)

    with patch("backend.services.lead_outreach_service.llm_service.summarize", new_callable=AsyncMock) as mock_summarize, \
         patch("backend.services.lead_outreach_service.llm_service.generate_copy", new_callable=AsyncMock) as mock_copy:
        mock_summarize.return_value = "Brief"
        mock_copy.return_value = "SUBJECT: Subject\nBODY: Body"
        result = asyncio.run(los.generate_lead_outreach(db=db, org_id="org-1", lead_id="lead-1"))

    assert result["email_subject"] == "Subject"
    assert result["email_body"] == "Body"
    assert len(store["lead_interactions"]) == 2


def test_build_supervised_send_payload_email_mailto() -> None:
    store = {
        "leads": [
            {
                "id": "lead-1",
                "org_id": "org-1",
                "name": "Hans Mueller",
                "email": "lead@example.com",
                "qualification_score": 85,
                "qualification_tier": "hot",
                "zone_interest": "Andratx",
            }
        ],
        "lead_interactions": [
            {
                "id": "draft-1",
                "org_id": "org-1",
                "lead_id": "lead-1",
                "tipo": "email_draft",
                "contenido": "Body",
                "metadata": {"artifact": "email_draft", "subject": "Subject"},
                "created_at": "2026-03-10T10:00:00+00:00",
            }
        ],
    }
    db = _MockDb(store)

    with patch("backend.services.lead_outreach_service.get_email_transport_summary", return_value={"native_email_enabled": False}):
        payload = asyncio.run(los.build_supervised_send_payload(db=db, org_id="org-1", lead_id="lead-1", transport="auto"))

    assert payload["channel"] == "email"
    assert payload["status"] == "ready_for_human_send"
    assert "mailto:" in payload["launch_url"]
