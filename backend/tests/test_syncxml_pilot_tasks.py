from datetime import datetime, timezone
from unittest.mock import AsyncMock, Mock, patch

import pytest

from backend.services.syncxml_pilot_service import (
    REAL_WRITE_BLOCK_REASON,
    SyncXmlApprovePayload,
    SyncXmlPilotPayload,
    syncxml_pilot_service,
)


def _payload(**overrides):
    base = SyncXmlPilotPayload(
        requestId="req_test",
        name="Ana Test",
        email="ana@example.com",
        accommodationType="Vivienda turística",
        estimatedMonthlyReservations="10-30",
        currentWorkflow="Excel manual",
        mainPain="Necesito revisar XML",
        wantsToValidate="Piloto con datos anonimizados",
        acceptsSyntheticOrAnonymizedData=True,
        acceptsPilotConditions=True,
    )
    data = base.model_dump()
    data.update(overrides)
    return data


def _configure_safe_settings(settings, *, app_env="staging", syncxml_env="staging", allow_real_write=False, synthetic_only=True, auto_approve=False):
    settings.APP_ENV = app_env
    settings.SYNCXML_ENV = syncxml_env
    settings.ALLOW_REAL_SUPABASE_WRITE = allow_real_write
    settings.USE_SYNTHETIC_DATA_ONLY = synthetic_only
    settings.SYNCXML_PILOT_AUTO_APPROVE = auto_approve
    settings.PUBLIC_CTA_ORG_ID = "org_1"
    settings.LEGACY_SINGLE_TENANT_ORG_ID = None
    settings.SYNCXML_INTERNAL_API_SECRET = "secret"
    settings.SYNCXML_INTERNAL_API_URL = "https://syncxml.test/internal"
    settings.HERMES_WORKER_URL = ""
    settings.HERMES_WORKER_API_KEY = None


@pytest.mark.asyncio
async def test_blocks_real_pilot_request_write_in_staging():
    with patch("backend.services.syncxml_pilot_service.supabase_service") as supabase, patch(
        "backend.services.syncxml_pilot_service.settings"
    ) as settings:
        _configure_safe_settings(settings)

        result = await syncxml_pilot_service.process_incoming_lead(_payload())

    assert result["blocked"] is True
    assert result["reason"] == REAL_WRITE_BLOCK_REASON
    assert result["action"] == "process_incoming_lead"
    assert result["environment"] == "staging"
    supabase.client.table.assert_not_called()


@pytest.mark.asyncio
async def test_blocks_real_write_when_syncxml_environment_is_staging():
    with patch("backend.services.syncxml_pilot_service.supabase_service") as supabase, patch(
        "backend.services.syncxml_pilot_service.settings"
    ) as settings:
        _configure_safe_settings(settings, app_env="production", syncxml_env="staging", allow_real_write=True, synthetic_only=False)

        result = await syncxml_pilot_service.process_incoming_lead(_payload())

    assert result["blocked"] is True
    assert result["reason"] == REAL_WRITE_BLOCK_REASON
    assert result["syncxmlEnvironment"] == "staging"
    supabase.client.table.assert_not_called()


@pytest.mark.asyncio
async def test_blocks_real_write_when_synthetic_only_is_enabled():
    with patch("backend.services.syncxml_pilot_service.supabase_service") as supabase, patch(
        "backend.services.syncxml_pilot_service.settings"
    ) as settings:
        _configure_safe_settings(settings, app_env="production", syncxml_env="production", allow_real_write=True, synthetic_only=True)

        result = await syncxml_pilot_service.process_incoming_lead(_payload())

    assert result["blocked"] is True
    assert result["useSyntheticDataOnly"] is True
    supabase.client.table.assert_not_called()


def test_does_not_autoapprove_when_flag_is_false():
    payload = SyncXmlPilotPayload.model_validate(_payload())

    with patch("backend.services.syncxml_pilot_service.settings") as settings:
        _configure_safe_settings(settings, app_env="production", syncxml_env="production", allow_real_write=True, synthetic_only=False, auto_approve=False)
        decision = syncxml_pilot_service._decide_status(payload, {"decision": "approve", "score": 88, "riskFlags": []})

    assert decision == "pending"


@pytest.mark.asyncio
async def test_allows_production_flow_with_explicit_real_write_and_mocks():
    record = {"id": "ar_1", "org_id": "org_1", "email": "ana@example.com", "metadata": {}, "full_name": "Ana Test"}
    credentials = {
        "ok": True,
        "email": "ana@example.com",
        "temporaryPassword": "Tmp-123456",
        "credentialStatus": "created",
        "pilotUserId": "pilot_1",
    }

    with patch("backend.services.syncxml_pilot_service.supabase_service") as supabase, patch(
        "backend.services.syncxml_pilot_service.settings"
    ) as settings, patch.object(
        syncxml_pilot_service, "_create_syncxml_user", new=AsyncMock(return_value=credentials)
    ), patch.object(
        syncxml_pilot_service, "_send_safely", return_value=True
    ):
        _configure_safe_settings(settings, app_env="production", syncxml_env="production", allow_real_write=True, synthetic_only=False, auto_approve=True)

        access_table = Mock()
        task_table = Mock()
        supabase.client.table.side_effect = lambda name: access_table if name == "access_requests" else task_table
        access_table.select.return_value.eq.return_value.eq.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = []
        access_table.insert.return_value.execute.return_value.data = [record]
        access_table.update.return_value.eq.return_value.execute.return_value.data = [{**record, "status": "approved", "metadata": {}}]

        result = await syncxml_pilot_service.process_incoming_lead(_payload())

    assert result["id"] == "ar_1"
    assert result["status"] == "approved"
    supabase.client.table.assert_called()
    task_table.insert.assert_not_called()


@pytest.mark.asyncio
async def test_block_reason_is_clear_for_manual_approval():
    with patch("backend.services.syncxml_pilot_service.settings") as settings:
        _configure_safe_settings(settings)
        result = await syncxml_pilot_service.approve_manual("org_1", "req_1", "reviewer_1", SyncXmlApprovePayload())

    assert result == {
        "ok": False,
        "blocked": True,
        "reason": REAL_WRITE_BLOCK_REASON,
        "action": "approve_manual",
        "environment": "staging",
        "syncxmlEnvironment": "staging",
        "allowRealSupabaseWrite": False,
        "useSyntheticDataOnly": True,
    }


def test_hermes_local_validation_still_works_without_writes():
    payload = SyncXmlPilotPayload.model_validate(_payload())

    result = syncxml_pilot_service._score_locally(payload)

    assert result["decision"] == "approve"
    assert result["recommendedNextAction"] == "approve_pilot"


@pytest.mark.asyncio
async def test_syncxml_user_creation_defaults_temporary_password_to_seven_days():
    record = {
        "id": "ar_1",
        "email": "ana@example.com",
        "full_name": "Ana Test",
    }
    sent = {}

    class FakeResponse:
        is_success = True

        @staticmethod
        def json():
            return {
                "ok": True,
                "email": "ana@example.com",
                "temporaryPassword": "Tmp-123456",
            }

    class FakeClient:
        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return None

        async def post(self, url, json, headers, timeout):
            sent.update({"url": url, "json": json, "headers": headers, "timeout": timeout})
            return FakeResponse()

    with patch("backend.services.syncxml_pilot_service.settings") as settings, patch(
        "backend.services.syncxml_pilot_service.httpx.AsyncClient", return_value=FakeClient()
    ):
        _configure_safe_settings(settings, app_env="production", syncxml_env="production", allow_real_write=True, synthetic_only=False)
        credentials = await syncxml_pilot_service._create_syncxml_user(record, SyncXmlApprovePayload())

    assert credentials["expiresAt"] == sent["json"]["expiresAt"]
    expires_at = datetime.fromisoformat(sent["json"]["expiresAt"].replace("Z", "+00:00"))
    remaining = expires_at - datetime.now(timezone.utc)
    assert 6 <= remaining.days <= 7
    assert sent["json"]["rotatePassword"] is False
