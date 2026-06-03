from unittest.mock import AsyncMock, Mock, patch
from datetime import datetime, timezone

import pytest

from backend.services.syncxml_pilot_service import SyncXmlApprovePayload, SyncXmlPilotPayload, syncxml_pilot_service


@pytest.mark.asyncio
async def test_syncxml_pilot_manual_review_by_default_even_with_high_score():
    """Nexus should NOT auto-approve by default, even if the score is high."""
    payload = SyncXmlPilotPayload(
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

    record = {"id": "ar_1", "org_id": "org_1", "email": "ana@example.com", "metadata": {}}

    with patch("backend.services.syncxml_pilot_service.supabase_service") as supabase, \
         patch("backend.services.syncxml_pilot_service.settings") as settings, \
         patch.object(syncxml_pilot_service, "_send_safely", return_value=True):
        
        settings.SYNCXML_PILOT_AUTO_APPROVE = False
        settings.PUBLIC_CTA_ORG_ID = "org_1"
        settings.LEGACY_SINGLE_TENANT_ORG_ID = None

        access_table = Mock()
        task_table = Mock()
        supabase.client.table.side_effect = lambda name: access_table if name == "access_requests" else task_table
        access_table.select.return_value.eq.return_value.eq.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = []
        access_table.insert.return_value.execute.return_value.data = [record]
        access_table.update.return_value.eq.return_value.execute.return_value.data = [{**record, "status": "pending"}]
        task_table.insert.return_value.execute.return_value.data = [{"id": "task_1"}]

        result = await syncxml_pilot_service.process_incoming_lead(payload.model_dump())

    assert result["id"] == "ar_1"
    assert result["status"] == "pending"
    # Should have created a review task because auto-approve is false
    task_table.insert.assert_called_once()


@pytest.mark.asyncio
async def test_syncxml_pilot_auto_approves_only_when_flag_is_true():
    """Nexus auto-approves if and only if SYNCXML_PILOT_AUTO_APPROVE is True."""
    payload = SyncXmlPilotPayload(
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

    record = {"id": "ar_1", "org_id": "org_1", "email": "ana@example.com", "metadata": {}}

    credentials = {
        "ok": True,
        "email": "ana@example.com",
        "temporaryPassword": "Tmp-123456",
        "credentialStatus": "created",
        "pilotUserId": "pilot_1",
    }

    with patch("backend.services.syncxml_pilot_service.supabase_service") as supabase, \
         patch("backend.services.syncxml_pilot_service.settings") as settings, \
         patch.object(syncxml_pilot_service, "_create_syncxml_user", new=AsyncMock(return_value=credentials)), \
         patch.object(syncxml_pilot_service, "_send_safely", return_value=True):
        
        settings.SYNCXML_PILOT_AUTO_APPROVE = True
        settings.PUBLIC_CTA_ORG_ID = "org_1"
        settings.LEGACY_SINGLE_TENANT_ORG_ID = None

        access_table = Mock()
        task_table = Mock()
        supabase.client.table.side_effect = lambda name: access_table if name == "access_requests" else task_table
        access_table.select.return_value.eq.return_value.eq.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = []
        access_table.insert.return_value.execute.return_value.data = [record]
        access_table.update.return_value.eq.return_value.execute.return_value.data = [{**record, "status": "approved", "metadata": {}}]
        task_table.insert.return_value.execute.return_value.data = [{"id": "task_1"}]

        result = await syncxml_pilot_service.process_incoming_lead(payload.model_dump())

    assert result["id"] == "ar_1"
    assert result["status"] == "approved"
    task_table.insert.assert_not_called()


@pytest.mark.asyncio
async def test_syncxml_pilot_never_auto_approves_risky_requests_even_if_flag_true():
    """Risk override: 'producción' or 'datos reales' always forces manual review."""
    payload = SyncXmlPilotPayload(
        requestId="req_test",
        name="Ana Test",
        email="ana@example.com",
        accommodationType="Vivienda turística",
        estimatedMonthlyReservations="10-30",
        currentWorkflow="Quiero usar datos reales en producción",
        mainPain="Necesito revisar XML",
        wantsToValidate="Envío automático al ministerio",
        acceptsSyntheticOrAnonymizedData=True,
        acceptsPilotConditions=True,
    )

    record = {"id": "ar_1", "org_id": "org_1", "email": "ana@example.com", "metadata": {}}

    with patch("backend.services.syncxml_pilot_service.supabase_service") as supabase, \
         patch("backend.services.syncxml_pilot_service.settings") as settings, \
         patch.object(syncxml_pilot_service, "_send_safely", return_value=True):
        
        settings.SYNCXML_PILOT_AUTO_APPROVE = True # Even if true
        settings.PUBLIC_CTA_ORG_ID = "org_1"
        settings.LEGACY_SINGLE_TENANT_ORG_ID = None

        access_table = Mock()
        task_table = Mock()
        supabase.client.table.side_effect = lambda name: access_table if name == "access_requests" else task_table
        access_table.select.return_value.eq.return_value.eq.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = []
        access_table.insert.return_value.execute.return_value.data = [record]
        access_table.update.return_value.eq.return_value.execute.return_value.data = [{**record, "status": "pending"}]
        task_table.insert.return_value.execute.return_value.data = [{"id": "task_1"}]

        result = await syncxml_pilot_service.process_incoming_lead(payload.model_dump())

    assert result["id"] == "ar_1"
    assert result["status"] == "pending"
    task_payload = task_table.insert.call_args.args[0]
    assert task_payload["task_type"] == "syncxml_pilot_review"
    assert task_payload["metadata"]["ai_review"]["decision"] == "manual_review"


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

    with patch("backend.services.syncxml_pilot_service.settings.SYNCXML_INTERNAL_API_SECRET", "secret"), patch(
        "backend.services.syncxml_pilot_service.settings.SYNCXML_INTERNAL_API_URL", "https://syncxml.test/internal"
    ), patch("backend.services.syncxml_pilot_service.httpx.AsyncClient", return_value=FakeClient()):
        credentials = await syncxml_pilot_service._create_syncxml_user(record, SyncXmlApprovePayload())

    assert credentials["expiresAt"] == sent["json"]["expiresAt"]
    assert sent["json"]["expiresAt"]
    expires_at = datetime.fromisoformat(sent["json"]["expiresAt"].replace("Z", "+00:00"))
    remaining = expires_at - datetime.now(timezone.utc)
    assert 6 <= remaining.days <= 7
    assert sent["json"]["rotatePassword"] is False
