import asyncio
from pathlib import Path
from unittest.mock import AsyncMock, patch

import pytest

from backend.services import seller_signal_source_service


def test_seller_signal_source_prefers_firecrawl(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    status_path = tmp_path / "seller-signal-source-status.json"
    monkeypatch.setattr(seller_signal_source_service, "STATUS_PATH", status_path)

    with patch.object(seller_signal_source_service, "_firecrawl_available", return_value=True), \
         patch.object(seller_signal_source_service, "_run_firecrawl_source", new_callable=AsyncMock) as mock_firecrawl, \
         patch.object(seller_signal_source_service, "get_statefox_live_capture", return_value={"import_ready": False}):
        mock_firecrawl.return_value = {
            "source_key": "firecrawl:idealista-fsbo",
            "signals_received": 5,
            "created": 2,
            "duplicates": 1,
            "rejected": 0,
            "failed": 0,
        }
        result = asyncio.run(
            seller_signal_source_service.run_seller_signal_source_pipeline(
                org_id="org-1",
                zonas=["andratx"],
            )
        )

    assert result["status"] == "success"
    assert result["source_selected"] == "firecrawl:idealista-fsbo"
    assert result["result"]["created"] == 2


def test_seller_signal_source_falls_back_to_statefox(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    status_path = tmp_path / "seller-signal-source-status.json"
    monkeypatch.setattr(seller_signal_source_service, "STATUS_PATH", status_path)

    with patch.object(seller_signal_source_service, "_firecrawl_available", return_value=False), \
         patch.object(seller_signal_source_service, "get_statefox_live_capture", return_value={"import_ready": True}), \
         patch.object(seller_signal_source_service, "_run_statefox_source", new_callable=AsyncMock) as mock_statefox:
        mock_statefox.return_value = {
            "source_key": "statefox:live-capture",
            "signals_received": 3,
            "created": 1,
            "duplicates": 1,
            "rejected": 0,
            "failed": 0,
        }
        result = asyncio.run(
            seller_signal_source_service.run_seller_signal_source_pipeline(
                org_id="org-1",
                zone="palma",
            )
        )

    assert result["status"] == "success"
    assert result["source_selected"] == "statefox:live-capture"
    assert result["attempts"][0]["status"] == "skipped"


def test_seller_signal_source_uses_snapshot_fallback(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    status_path = tmp_path / "seller-signal-source-status.json"
    monkeypatch.setattr(seller_signal_source_service, "STATUS_PATH", status_path)

    with patch.object(seller_signal_source_service, "_firecrawl_available", return_value=False), \
         patch.object(seller_signal_source_service, "get_statefox_live_capture", return_value={"import_ready": False, "message": "missing"}), \
         patch.object(seller_signal_source_service, "_snapshot_available", return_value=True), \
         patch.object(seller_signal_source_service, "_run_snapshot_fallback", new_callable=AsyncMock) as mock_snapshot:
        mock_snapshot.return_value = {
            "source_key": "snapshot:seller-signals",
            "status": "processed",
            "signals_received": 4,
            "created": 1,
            "duplicates": 2,
            "rejected": 0,
            "failed": 0,
        }
        result = asyncio.run(
            seller_signal_source_service.run_seller_signal_source_pipeline(
                org_id="org-1",
            )
        )

    assert result["status"] == "warning"
    assert result["source_selected"] == "snapshot:seller-signals"
    assert result["result"]["signals_received"] == 4


def test_seller_signal_source_errors_when_no_source_available(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    status_path = tmp_path / "seller-signal-source-status.json"
    monkeypatch.setattr(seller_signal_source_service, "STATUS_PATH", status_path)

    with patch.object(seller_signal_source_service, "_firecrawl_available", return_value=False), \
         patch.object(seller_signal_source_service, "get_statefox_live_capture", return_value={"import_ready": False, "message": "missing"}), \
         patch.object(seller_signal_source_service, "_snapshot_available", return_value=False):
        with pytest.raises(RuntimeError, match="No seller signal source available"):
            asyncio.run(
                seller_signal_source_service.run_seller_signal_source_pipeline(
                    org_id="org-1",
                    enable_snapshot_fallback=True,
                )
            )
