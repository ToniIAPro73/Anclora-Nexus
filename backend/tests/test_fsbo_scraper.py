import asyncio
from unittest.mock import AsyncMock, patch

from backend.skills.fsbo_scraper import run_fsbo_scraper


def test_fsbo_scraper_routes_signals_through_unified_ingestion() -> None:
    zone_result = {
        "zona": "andratx",
        "signals": [
            {
                "anuncio_url": "https://example.com/fsbo/1",
                "zona": "andratx",
                "fuente": "idealista",
            }
        ],
        "listings_found": 1,
        "signals_extracted": 1,
        "credits_used": 1,
        "source_url": "https://idealista.test/andratx",
    }

    with patch("backend.skills.fsbo_scraper.scrape_zone", new_callable=AsyncMock) as mock_scrape_zone, \
         patch("backend.skills.fsbo_scraper.ingestion_service.ingest_seller_signals", new_callable=AsyncMock) as mock_ingest:
        mock_scrape_zone.return_value = zone_result
        mock_ingest.return_value = {
            "status": "processed",
            "received": 1,
            "created": 1,
            "duplicates": 0,
            "rejected": 0,
            "failed": 0,
            "trace_id": "trace-1",
        }

        result = asyncio.run(
            run_fsbo_scraper(
                data={"org_id": "org-1", "zonas": ["andratx"], "enrich_listings": False},
                llm=None,
                db=None,
            )
        )

    assert result["created"] == 1
    assert result["duplicates"] == 0
    assert result["trace_id"] == "trace-1"
    payload = mock_ingest.await_args.args[0]
    assert payload.connector_name == "firecrawl:idealista-fsbo"
