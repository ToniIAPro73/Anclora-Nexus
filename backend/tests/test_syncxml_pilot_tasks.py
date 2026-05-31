from unittest.mock import Mock, patch

import pytest

from backend.services.syncxml_pilot_service import SyncXmlPilotPayload, syncxml_pilot_service


@pytest.mark.asyncio
async def test_syncxml_pilot_creates_manual_review_task_when_hermes_fails():
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

    with patch("backend.services.syncxml_pilot_service.supabase_service") as supabase, patch.object(
        syncxml_pilot_service, "_score_with_hermes", return_value={
            "decision": "manual_review",
            "score": 50,
            "riskFlags": ["hermes_unavailable"],
            "reasonInternal": "hermes unavailable",
            "emailReasonUser": "manual review",
            "recommendedNextAction": "manual_review",
        }
    ), patch.object(syncxml_pilot_service, "_send_safely", return_value=True):
        access_table = Mock()
        task_table = Mock()
        supabase.client.table.side_effect = lambda name: access_table if name == "access_requests" else task_table
        access_table.select.return_value.eq.return_value.eq.return_value.eq.return_value.order.return_value.limit.return_value.execute.return_value.data = []
        access_table.insert.return_value.execute.return_value.data = [record]
        access_table.update.return_value.eq.return_value.execute.return_value.data = [{**record, "status": "pending"}]
        task_table.insert.return_value.execute.return_value.data = [{"id": "task_1"}]

        result = await syncxml_pilot_service.process_incoming_lead(payload.model_dump())

    assert result["id"] == "ar_1"
    task_payload = task_table.insert.call_args.args[0]
    assert task_payload["task_type"] == "syncxml_pilot_review"
    assert task_payload["origin"] == "anclora-syncxml"
    assert task_payload["entity_type"] == "pilot_request"
