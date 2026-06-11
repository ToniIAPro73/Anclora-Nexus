import hmac
import hashlib
import os
from types import SimpleNamespace
from uuid import uuid4

from fastapi import FastAPI
from fastapi.testclient import TestClient

os.environ.setdefault("SUPABASE_URL", "https://test.supabase.co")
os.environ.setdefault("SUPABASE_ANON_KEY", "test-key")
os.environ.setdefault("DOCUSEAL_WEBHOOK_SECRET", "docuseal-secret")

from backend.api.deps import get_current_user, get_org_id
from backend.api.routes.dms import require_dms_membership, router


ORG_ID = str(uuid4())
USER_ID = str(uuid4())

app = FastAPI()
app.include_router(router, prefix="/api/dms")
app.dependency_overrides[get_org_id] = lambda: ORG_ID
app.dependency_overrides[get_current_user] = lambda: SimpleNamespace(id=USER_ID)
app.dependency_overrides[require_dms_membership] = lambda: {"id": str(uuid4())}
client = TestClient(app)


class QueryBuilder:
    def __init__(self, data):
        self.data = data

    def select(self, *_args, **_kwargs):
        return self

    def insert(self, payload):
        self.data = [{**payload, "id": str(uuid4())}]
        return self

    def update(self, payload):
        self.data = [{**payload}]
        return self

    def eq(self, *_args, **_kwargs):
        return self

    def order(self, *_args, **_kwargs):
        return self

    def limit(self, *_args, **_kwargs):
        return self

    def execute(self):
        return SimpleNamespace(data=self.data)


class SupabaseClientStub:
    def __init__(self):
        self.folders = []

    def table(self, name):
        if name == "real_estate_deal_folders":
            return QueryBuilder(self.folders)
        return QueryBuilder([])


def test_create_folder_returns_uuid(monkeypatch) -> None:
    stub = SupabaseClientStub()
    monkeypatch.setattr("backend.api.routes.dms.supabase_service.client", stub)

    response = client.post(
        "/api/dms/folders",
        json={
            "property_id": None,
            "client_lead_id": None,
            "seller_id": None,
            "operation_type": "compraventa",
        },
    )

    assert response.status_code == 200
    assert response.json()["id"]


def test_list_folders_returns_list(monkeypatch) -> None:
    stub = SupabaseClientStub()
    monkeypatch.setattr("backend.api.routes.dms.supabase_service.client", stub)

    response = client.get("/api/dms/folders")

    assert response.status_code == 200
    assert response.json() == []


def test_docuseal_webhook_invalid_hmac_returns_401() -> None:
    response = client.post(
        "/api/dms/webhooks/docuseal",
        json={
            "event": "submission.completed",
            "submission_id": None,
            "envelope_id": "env_123",
            "status": "completed",
            "document_url": None,
            "signer_email": None,
            "ip_address": None,
            "signing_timestamp": None,
        },
        headers={"x-docuseal-signature": "invalid"},
    )

    assert response.status_code == 401


def test_docuseal_webhook_valid_hmac_returns_ok(monkeypatch) -> None:
    stub = SupabaseClientStub()
    monkeypatch.setattr("backend.api.routes.dms.supabase_service.client", stub)
    body = (
        b'{"event":"submission.completed","submission_id":null,"envelope_id":"env_123",'
        b'"status":"completed","document_url":null,"signer_email":null,'
        b'"ip_address":null,"signing_timestamp":null}'
    )
    signature = hmac.new(
        os.environ["DOCUSEAL_WEBHOOK_SECRET"].encode(),
        body,
        hashlib.sha256,
    ).hexdigest()

    response = client.post(
        "/api/dms/webhooks/docuseal",
        content=body,
        headers={"x-docuseal-signature": signature, "content-type": "application/json"},
    )

    assert response.status_code == 200
    assert response.json() == {"ok": True}
