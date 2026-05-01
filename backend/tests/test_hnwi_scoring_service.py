from backend.models.ingestion import (
    HNWIQualificationTier,
    HNWISourceChannel,
    LeadIngestionPayload,
    LeadSourceChannel,
    LeadSourceSystem,
)
from backend.services.hnwi_scoring_service import hnwi_scoring_service


def test_manual_score_override_is_respected() -> None:
    payload = LeadIngestionPayload(
        org_id="org-1",
        external_id="lead-override",
        source_system=LeadSourceSystem.SOCIAL,
        source_channel=LeadSourceChannel.OTHER,
        name="Override Lead",
        qualification_score=82,
        qualification_tier=HNWIQualificationTier.HOT,
        email_verified=False,
    )

    result = hnwi_scoring_service.score_lead(payload)

    assert result.score == 82
    assert result.tier == "hot"
    assert result.outreach_ready is False
    assert result.explanation == "manual_override"


def test_reddit_signal_scores_without_verified_email() -> None:
    payload = LeadIngestionPayload(
        org_id="org-1",
        external_id="lead-reddit",
        connector_name="hnwi-prospection:reddit",
        source_system=LeadSourceSystem.SOCIAL,
        source_channel=LeadSourceChannel.OTHER,
        hnwi_source_channel=HNWISourceChannel.REDDIT,
        name="Expat Buyer",
        budget=2_100_000,
        property_interest="Relocating to Mallorca and looking for a property in Son Vida",
        nationality="American",
        zone_interest="Son Vida",
        notes="Looking for a family villa before summer.",
    )

    result = hnwi_scoring_service.score_lead(payload)

    assert result.score >= 70
    assert result.tier == "hot"
    assert result.outreach_ready is False
    assert result.intent_signal is not None
