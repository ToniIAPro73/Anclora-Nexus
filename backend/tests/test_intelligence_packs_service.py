import asyncio

from backend.services.intelligence_packs_service import (
    create_intelligence_pack,
    get_active_intelligence_pack,
    list_intelligence_packs,
    update_intelligence_pack,
)


class _MockQuery:
    def __init__(self, table_name: str, store: dict[str, list[dict]]) -> None:
        self.table_name = table_name
        self.store = store
        self.rows = list(store.get(table_name, []))
        self._update_payload = None

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, key, value):
        self.rows = [row for row in self.rows if row.get(key) == value]
        return self

    def order(self, key, desc=False):
        def sort_value(row):
            value = row.get(key)
            if isinstance(value, bool):
                return int(value)
            return value or ""

        self.rows = sorted(self.rows, key=sort_value, reverse=desc)
        return self

    def limit(self, value):
        self.rows = self.rows[:value]
        return self

    def update(self, payload):
        self._update_payload = payload
        return self

    def insert(self, payload):
        rows = payload if isinstance(payload, list) else [payload]
        self.store.setdefault(self.table_name, []).extend(rows)
        self.rows = rows
        return self

    def execute(self):
        if self._update_payload is not None:
            for row in self.rows:
                row.update(self._update_payload)
            for stored in self.store.get(self.table_name, []):
                if any(stored.get("id") == row.get("id") for row in self.rows if row.get("id")):
                    stored.update(self._update_payload)
                elif stored in self.rows:
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


def test_list_intelligence_packs_returns_fallback_when_table_empty() -> None:
    db = _MockDb({"intelligence_packs": [], "notebooklm_insights": []})
    packs = asyncio.run(list_intelligence_packs(db=db, org_id="org-1"))
    assert len(packs) == 1
    assert packs[0]["is_default"] is True
    assert packs[0]["synthetic"] is True


def test_create_pack_sets_default_and_activates_it() -> None:
    store = {
        "intelligence_packs": [
            {
                "id": "pack-1",
                "org_id": "org-1",
                "pack_key": "mallorca-sw",
                "pack_label": "Mallorca SW",
                "notebook_id": "nb-1",
                "notebook_name": "SW Notebook",
                "market_scope": "seller",
                "zone_scope": ["andratx"],
                "language_code": "es",
                "source_mode": "live_sync_pack",
                "status": "active",
                "is_default": True,
                "metadata": {},
            }
        ],
        "notebooklm_insights": [],
    }
    db = _MockDb(store)
    created = asyncio.run(
        create_intelligence_pack(
            db=db,
            org_id="org-1",
            payload={
                "pack_label": "Tramontana 2026",
                "notebook_id": "nb-2",
                "notebook_name": "Tramontana Notebook",
                "zone_scope": ["soller", "deia"],
                "is_default": True,
            },
        )
    )

    assert created["pack_label"] == "Tramontana 2026"
    active = asyncio.run(get_active_intelligence_pack(db=db, org_id="org-1"))
    assert active["notebook_id"] == "nb-2"


def test_update_pack_switches_default_flag() -> None:
    store = {
        "intelligence_packs": [
            {
                "id": "pack-1",
                "org_id": "org-1",
                "pack_key": "mallorca-sw",
                "pack_label": "Mallorca SW",
                "notebook_id": "nb-1",
                "notebook_name": "SW Notebook",
                "market_scope": "seller",
                "zone_scope": ["andratx"],
                "language_code": "es",
                "source_mode": "live_sync_pack",
                "status": "active",
                "is_default": False,
                "metadata": {},
            }
        ],
        "notebooklm_insights": [
            {"org_id": "org-1", "notebook_id": "nb-1", "zona": "andratx", "created_at": "2026-03-10T10:00:00+00:00"}
        ],
    }
    db = _MockDb(store)
    updated = asyncio.run(
        update_intelligence_pack(
            db=db,
            org_id="org-1",
            pack_id="pack-1",
            payload={"is_default": True, "status": "active"},
        )
    )

    assert updated is not None
    assert updated["is_default"] is True
    assert updated["zones_with_data"] == ["andratx"]
