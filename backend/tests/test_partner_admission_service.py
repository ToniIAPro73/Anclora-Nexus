import asyncio

from backend.models.partner_admissions import PartnerAdmissionReview, PublicPartnerAdmissionCreate
from backend.services.partner_admission_service import PartnerAdmissionService


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

    def insert(self, payload):
        row = dict(payload)
        row.setdefault("id", f"{self.table_name}-{len(self.store.get(self.table_name, [])) + 1}")
        self.store.setdefault(self.table_name, []).append(row)
        self.rows = [row]
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


def test_create_public_admission_normalizes_lists(monkeypatch) -> None:
    service = PartnerAdmissionService()
    store = {"partner_admissions": []}
    monkeypatch.setattr("backend.services.partner_admission_service.supabase_service.client", _MockClient(store))
    monkeypatch.setattr(
        "backend.services.partner_admission_service.captcha_verification_service.verify",
        lambda **_kwargs: {"provider": "none", "verified": False, "required": False},
    )
    monkeypatch.setattr(
        "backend.services.partner_admission_service.get_email_transport_summary",
        lambda: {"native_email_enabled": False},
    )

    result = asyncio.run(
        service.create_public_admission(
            "org-1",
            PublicPartnerAdmissionCreate(
                full_name="Partner Test",
                email="partner@example.com",
                service_category="eco",
                service_summary="Construccion eficiente, domotica y mejoras energeticas premium para activos residenciales.",
                coverage_areas="mallorca, tramuntana",
                languages="es,en",
                sustainability_focus=True,
                privacy_accepted=True,
            ),
        )
    )

    assert result["org_id"] == "org-1"
    assert result["status"] == "submitted"
    assert result["coverage_areas"] == ["mallorca", "tramuntana"]
    assert result["languages"] == ["es", "en"]
    assert result["confirmation_email"]["transport"] == "unavailable"


def test_review_admission_updates_status(monkeypatch) -> None:
    service = PartnerAdmissionService()
    store = {
        "partner_admissions": [
            {
                "id": "adm-1",
                "org_id": "org-1",
                "full_name": "Partner Test",
                "email": "partner@example.com",
                "status": "submitted",
            }
        ]
    }
    monkeypatch.setattr("backend.services.partner_admission_service.supabase_service.client", _MockClient(store))
    monkeypatch.setattr(
        "backend.services.partner_admission_service.captcha_verification_service.verify",
        lambda **_kwargs: {"provider": "none", "verified": False, "required": False},
    )

    result = asyncio.run(
        service.review_admission(
            org_id="org-1",
            admission_id="adm-1",
            reviewer_user_id="user-1",
            payload=PartnerAdmissionReview(status="accepted", review_notes="Encaje correcto", notify_applicant=False),
        )
    )

    assert result is not None
    assert result["status"] == "accepted"
    assert result["review_notes"] == "Encaje correcto"
