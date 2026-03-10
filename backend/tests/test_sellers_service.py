from backend.services.sellers_service import _build_workbench_console


def test_build_workbench_console_requests_dossier_if_core_artifacts_missing() -> None:
    console = _build_workbench_console(
        seller={"estado_contacto": "sin_contacto"},
        latest_artifacts={
            "dossier": None,
            "email_draft": None,
            "whatsapp_draft": None,
            "call_brief": None,
            "context_brief": None,
        },
        interactions=[],
        memory_payload={"matches": []},
    )

    assert console["readiness"] == "needs_dossier"
    assert console["recommended_channel"] == "review"


def test_build_workbench_console_prefers_whatsapp_for_cold_seller_with_ready_channel() -> None:
    console = _build_workbench_console(
        seller={
            "estado_contacto": "sin_contacto",
            "whatsapp_contacto": "+34600111222",
        },
        latest_artifacts={
            "dossier": {"id": "d1"},
            "email_draft": {"id": "e1"},
            "whatsapp_draft": {"id": "w1"},
            "call_brief": {"id": "c1"},
            "context_brief": {"id": "cb1"},
        },
        interactions=[],
        memory_payload={
            "matches": [
                {
                    "matched_keywords": ["seguimiento", "exclusividad"],
                    "record": {"summary": "seguimiento exclusividad"},
                    "score": 88,
                }
            ]
        },
    )

    assert console["readiness"] == "ready_to_send"
    assert console["recommended_channel"] == "whatsapp"
    assert "seguimiento" in console["memory_focus_terms"]


def test_build_workbench_console_prefers_call_for_follow_up_states() -> None:
    console = _build_workbench_console(
        seller={"estado_contacto": "en_seguimiento"},
        latest_artifacts={
            "dossier": {"id": "d1"},
            "email_draft": {"id": "e1"},
            "whatsapp_draft": {"id": "w1"},
            "call_brief": {"id": "c1"},
            "context_brief": {"id": "cb1"},
        },
        interactions=[{"created_at": "2026-03-10T10:00:00+00:00"}],
        memory_payload={"matches": []},
    )

    assert console["recommended_channel"] == "call"
    assert console["last_touch_at"] == "2026-03-10T10:00:00+00:00"
