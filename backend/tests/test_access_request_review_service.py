import pytest

from backend.models.access_requests import (
    AccessRequestProduct,
    AccessRequestRejectDecision,
    AccessRequestReviewDecision,
    AccessRequestStatus,
)
from backend.services.access_request_service import (
    AccessRequestInvalidTransitionError,
    AccessRequestNotFoundError,
    AccessRequestService,
)


ORG_ID = "9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf"


def access_request_record(
    request_id: str = "request-1",
    status: str = "pending",
    product: str = "synergi",
) -> dict:
    return {
        "id": request_id,
        "org_id": ORG_ID,
        "product": product,
        "source": "landing",
        "status": status,
        "full_name": "Test User",
        "email": "test@example.com",
        "privacy_accepted": True,
        "gdpr_consent": True,
        "submission_language": "es",
        "captcha_verified": True,
        "created_at": "2026-05-06T10:00:00+00:00",
        "updated_at": "2026-05-06T10:00:00+00:00",
    }


class MockResult:
    def __init__(self, data):
        self.data = data


class MockAccessRequestQuery:
    def __init__(self, rows, update_payload=None):
        self.rows = rows
        self.update_payload = update_payload
        self.filters = []
        self.limit_value = None
        self.order_desc = False

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, key, value):
        self.filters.append((key, value))
        return self

    def order(self, _key, desc=False):
        self.order_desc = desc
        return self

    def limit(self, value):
        self.limit_value = value
        return self

    def update(self, payload):
        return MockAccessRequestQuery(self.rows, update_payload=payload)

    def execute(self):
        matches = [
            row for row in self.rows
            if all(row.get(key) == value for key, value in self.filters)
        ]
        if self.order_desc:
            matches = list(reversed(matches))
        if self.limit_value is not None:
            matches = matches[: self.limit_value]
        if self.update_payload is not None:
            for row in matches:
                row.update(self.update_payload)
        return MockResult(matches)


class MockSupabaseClient:
    def __init__(self, rows):
        self.rows = rows

    def table(self, name):
        assert name == "access_requests"
        return MockAccessRequestQuery(self.rows)


@pytest.fixture
def service():
    return AccessRequestService()


@pytest.mark.anyio
async def test_list_requests_filters_by_status_and_product(monkeypatch, service):
    rows = [
        access_request_record("request-1", status="pending", product="synergi"),
        access_request_record("request-2", status="approved", product="synergi"),
        access_request_record("request-3", status="pending", product="data_lab"),
    ]
    monkeypatch.setattr(
        "backend.services.access_request_service.supabase_service.client",
        MockSupabaseClient(rows),
    )

    result = await service.list_requests(
        org_id=ORG_ID,
        status=AccessRequestStatus.PENDING,
        product=AccessRequestProduct.DATA_LAB,
    )

    assert [row["id"] for row in result] == ["request-3"]


@pytest.mark.anyio
async def test_get_request_existing(monkeypatch, service):
    rows = [access_request_record("request-1")]
    monkeypatch.setattr(
        "backend.services.access_request_service.supabase_service.client",
        MockSupabaseClient(rows),
    )

    result = await service.get_request(ORG_ID, "request-1")

    assert result["id"] == "request-1"


@pytest.mark.anyio
async def test_get_request_missing_raises_not_found(monkeypatch, service):
    monkeypatch.setattr(
        "backend.services.access_request_service.supabase_service.client",
        MockSupabaseClient([]),
    )

    with pytest.raises(AccessRequestNotFoundError):
        await service.get_request(ORG_ID, "missing")


@pytest.mark.anyio
async def test_approve_pending_sets_review_fields(monkeypatch, service):
    rows = [access_request_record("request-1")]
    monkeypatch.setattr(
        "backend.services.access_request_service.supabase_service.client",
        MockSupabaseClient(rows),
    )

    result = await service.approve_request(
        ORG_ID,
        "request-1",
        AccessRequestReviewDecision(reviewed_by="admin-user", admin_notes="Looks good"),
    )

    assert result["status"] == "approved"
    assert result["reviewed_by"] == "admin-user"
    assert result["admin_notes"] == "Looks good"
    assert result["reviewed_at"]


@pytest.mark.anyio
async def test_reject_pending_sets_rejection_reason(monkeypatch, service):
    rows = [access_request_record("request-1")]
    monkeypatch.setattr(
        "backend.services.access_request_service.supabase_service.client",
        MockSupabaseClient(rows),
    )

    result = await service.reject_request(
        ORG_ID,
        "request-1",
        AccessRequestRejectDecision(
            reviewed_by="admin-user",
            admin_notes="Not a fit",
            rejection_reason="Missing eligibility criteria",
        ),
    )

    assert result["status"] == "rejected"
    assert result["reviewed_by"] == "admin-user"
    assert result["rejection_reason"] == "Missing eligibility criteria"
    assert result["reviewed_at"]


def test_reject_decision_requires_rejection_reason():
    with pytest.raises(ValueError, match="rejection_reason is required"):
        AccessRequestRejectDecision(reviewed_by="admin-user", rejection_reason="   ")


@pytest.mark.anyio
@pytest.mark.parametrize("current_status", ["approved", "rejected", "cancelled"])
async def test_approve_terminal_request_fails(monkeypatch, service, current_status):
    rows = [access_request_record("request-1", status=current_status)]
    monkeypatch.setattr(
        "backend.services.access_request_service.supabase_service.client",
        MockSupabaseClient(rows),
    )

    with pytest.raises(AccessRequestInvalidTransitionError):
        await service.approve_request(
            ORG_ID,
            "request-1",
            AccessRequestReviewDecision(reviewed_by="admin-user"),
        )


@pytest.mark.anyio
@pytest.mark.parametrize("current_status", ["approved", "rejected", "cancelled"])
async def test_reject_terminal_request_fails(monkeypatch, service, current_status):
    rows = [access_request_record("request-1", status=current_status)]
    monkeypatch.setattr(
        "backend.services.access_request_service.supabase_service.client",
        MockSupabaseClient(rows),
    )

    with pytest.raises(AccessRequestInvalidTransitionError):
        await service.reject_request(
            ORG_ID,
            "request-1",
            AccessRequestRejectDecision(
                reviewed_by="admin-user",
                rejection_reason="Not eligible",
            ),
        )
