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


class MockEmailService:
    def __init__(self, fail=False):
        self.fail = fail
        self.sent_records = []

    def send_decision_email(self, record):
        self.sent_records.append(dict(record))
        if self.fail:
            raise RuntimeError("SMTP failed")
        return {"status": "sent", "transport": "smtp", "to": record["email"]}


class MockAuditService:
    def __init__(self):
        self.events = []

    async def log_event(self, **kwargs):
        self.events.append(kwargs)
        return {"id": f"audit-{len(self.events)}", **kwargs}


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
async def test_approve_sends_email_after_state_update(monkeypatch, service):
    rows = [access_request_record("request-1")]
    email_service = MockEmailService()
    audit_service = MockAuditService()
    monkeypatch.setattr(
        "backend.services.access_request_service.supabase_service.client",
        MockSupabaseClient(rows),
    )
    monkeypatch.setattr(
        "backend.services.access_request_service.access_request_email_service",
        email_service,
    )
    monkeypatch.setattr(
        "backend.services.access_request_service.access_request_audit_service",
        audit_service,
    )

    result = await service.approve_request(
        ORG_ID,
        "request-1",
        AccessRequestReviewDecision(reviewed_by="admin-user"),
    )

    assert result["status"] == "approved"
    assert email_service.sent_records[0]["status"] == "approved"
    assert result["decision_email"]["status"] == "sent"
    assert [event["event_type"] for event in audit_service.events] == [
        "access_request.approved",
        "access_request.email_sent",
    ]


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


@pytest.mark.anyio
async def test_reject_sends_email_after_state_update(monkeypatch, service):
    rows = [access_request_record("request-1")]
    email_service = MockEmailService()
    audit_service = MockAuditService()
    monkeypatch.setattr(
        "backend.services.access_request_service.supabase_service.client",
        MockSupabaseClient(rows),
    )
    monkeypatch.setattr(
        "backend.services.access_request_service.access_request_email_service",
        email_service,
    )
    monkeypatch.setattr(
        "backend.services.access_request_service.access_request_audit_service",
        audit_service,
    )

    result = await service.reject_request(
        ORG_ID,
        "request-1",
        AccessRequestRejectDecision(
            reviewed_by="admin-user",
            rejection_reason="Not eligible",
        ),
    )

    assert result["status"] == "rejected"
    assert email_service.sent_records[0]["status"] == "rejected"
    assert result["decision_email"]["status"] == "sent"
    assert [event["event_type"] for event in audit_service.events] == [
        "access_request.rejected",
        "access_request.email_sent",
    ]


@pytest.mark.anyio
async def test_email_failure_does_not_revert_decision_and_logs_failure(monkeypatch, service):
    rows = [access_request_record("request-1")]
    email_service = MockEmailService(fail=True)
    audit_service = MockAuditService()
    monkeypatch.setattr(
        "backend.services.access_request_service.supabase_service.client",
        MockSupabaseClient(rows),
    )
    monkeypatch.setattr(
        "backend.services.access_request_service.access_request_email_service",
        email_service,
    )
    monkeypatch.setattr(
        "backend.services.access_request_service.access_request_audit_service",
        audit_service,
    )

    result = await service.approve_request(
        ORG_ID,
        "request-1",
        AccessRequestReviewDecision(reviewed_by="admin-user"),
    )

    assert rows[0]["status"] == "approved"
    assert result["status"] == "approved"
    assert result["decision_email"]["status"] == "failed"
    assert "SMTP failed" in result["decision_email"]["error"]
    assert [event["event_type"] for event in audit_service.events] == [
        "access_request.approved",
        "access_request.email_send_failed",
    ]


@pytest.mark.anyio
async def test_audit_failure_does_not_break_approval(monkeypatch, service):
    class FailingAuditService:
        async def log_event(self, **_kwargs):
            raise RuntimeError("audit unavailable")

    rows = [access_request_record("request-1")]
    email_service = MockEmailService()
    monkeypatch.setattr(
        "backend.services.access_request_service.supabase_service.client",
        MockSupabaseClient(rows),
    )
    monkeypatch.setattr(
        "backend.services.access_request_service.access_request_email_service",
        email_service,
    )
    monkeypatch.setattr(
        "backend.services.access_request_service.access_request_audit_service",
        FailingAuditService(),
    )

    result = await service.approve_request(
        ORG_ID,
        "request-1",
        AccessRequestReviewDecision(reviewed_by="admin-user"),
    )

    assert result["status"] == "approved"
    assert result["decision_email"]["status"] == "sent"


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
