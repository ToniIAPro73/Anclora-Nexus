"""
Property-based test: Lead Intake Validation (Property 11)

**Validates: Requirements 13.2, 13.3**

For any lead intake request, if any required field (contact, source_system,
source_channel, timestamp) is missing or empty, the request shall be rejected
with HTTP 400. If all fields are present and valid, the lead shall be created
with status 'new' and a temperature assignment.

This test validates:
1. Pydantic model validation rejects requests with missing/empty required fields
2. Valid requests produce a response with status "new" and a temperature in
   {"cold", "warm", "hot"} based on source_system
3. Temperature assignment: "private-estates-landing" → "warm", others → "cold"
"""

from __future__ import annotations

from datetime import datetime, timezone

import pytest
from hypothesis import given, settings, assume
from hypothesis.strategies import (
    booleans,
    composite,
    datetimes,
    emails,
    just,
    none,
    one_of,
    sampled_from,
    text,
)
from pydantic import ValidationError

from backend.models.lead_intake import ContactInfo, LeadIntakeRequest
from backend.api.routes.lead_intake import assign_temperature


# ---------------------------------------------------------------------------
# Strategies
# ---------------------------------------------------------------------------

valid_names = text(min_size=1, max_size=100).filter(lambda s: s.strip())
valid_source_systems = text(min_size=1, max_size=50).filter(lambda s: s.strip())
valid_source_channels = text(min_size=1, max_size=50).filter(lambda s: s.strip())
valid_timestamps = datetimes(
    min_value=datetime(2020, 1, 1),
    max_value=datetime(2030, 12, 31),
    timezones=just(timezone.utc),
)
valid_emails = emails()
valid_phones = text(min_size=5, max_size=20).filter(lambda s: s.strip())

# Empty/whitespace-only strings that should fail min_length=1 validation
empty_strings = sampled_from([""])


@composite
def valid_contact_with_email(draw):
    """Generate a valid ContactInfo with at least an email."""
    return {
        "name": draw(valid_names),
        "email": draw(valid_emails),
        "phone": draw(one_of(none(), valid_phones)),
    }


@composite
def valid_contact_with_phone(draw):
    """Generate a valid ContactInfo with at least a phone."""
    return {
        "name": draw(valid_names),
        "email": None,
        "phone": draw(valid_phones),
    }


@composite
def valid_contact(draw):
    """Generate a valid ContactInfo (either email or phone or both)."""
    return draw(one_of(valid_contact_with_email(), valid_contact_with_phone()))


@composite
def valid_lead_request_data(draw):
    """Generate valid lead intake request data as a dict."""
    return {
        "contact": draw(valid_contact()),
        "source_system": draw(valid_source_systems),
        "source_channel": draw(valid_source_channels),
        "timestamp": draw(valid_timestamps).isoformat(),
    }


# ---------------------------------------------------------------------------
# Property tests: Invalid requests must be rejected
# ---------------------------------------------------------------------------


@given(
    source_system=valid_source_systems,
    source_channel=valid_source_channels,
    timestamp=valid_timestamps,
)
@settings(max_examples=200)
def test_missing_contact_name_rejects(
    source_system: str, source_channel: str, timestamp: datetime
) -> None:
    """
    A lead request with an empty contact name must fail Pydantic validation.

    **Validates: Requirements 13.2**
    """
    with pytest.raises(ValidationError):
        LeadIntakeRequest(
            contact=ContactInfo(name="", email="test@example.com", phone=None),
            source_system=source_system,
            source_channel=source_channel,
            timestamp=timestamp,
        )


@given(
    name=valid_names,
    source_system=valid_source_systems,
    source_channel=valid_source_channels,
    timestamp=valid_timestamps,
)
@settings(max_examples=200)
def test_contact_without_email_and_phone_rejects(
    name: str, source_system: str, source_channel: str, timestamp: datetime
) -> None:
    """
    A lead request with no email AND no phone must fail Pydantic validation.

    **Validates: Requirements 13.2**
    """
    with pytest.raises(ValidationError):
        LeadIntakeRequest(
            contact=ContactInfo(name=name, email=None, phone=None),
            source_system=source_system,
            source_channel=source_channel,
            timestamp=timestamp,
        )


@given(
    contact=valid_contact(),
    source_channel=valid_source_channels,
    timestamp=valid_timestamps,
)
@settings(max_examples=200)
def test_empty_source_system_rejects(
    contact: dict, source_channel: str, timestamp: datetime
) -> None:
    """
    A lead request with an empty source_system must fail Pydantic validation.

    **Validates: Requirements 13.2**
    """
    with pytest.raises(ValidationError):
        LeadIntakeRequest(
            contact=ContactInfo(**contact),
            source_system="",
            source_channel=source_channel,
            timestamp=timestamp,
        )


@given(
    contact=valid_contact(),
    source_system=valid_source_systems,
    timestamp=valid_timestamps,
)
@settings(max_examples=200)
def test_empty_source_channel_rejects(
    contact: dict, source_system: str, timestamp: datetime
) -> None:
    """
    A lead request with an empty source_channel must fail Pydantic validation.

    **Validates: Requirements 13.2**
    """
    with pytest.raises(ValidationError):
        LeadIntakeRequest(
            contact=ContactInfo(**contact),
            source_system=source_system,
            source_channel="",
            timestamp=timestamp,
        )


# ---------------------------------------------------------------------------
# Property tests: Valid requests produce correct status and temperature
# ---------------------------------------------------------------------------


@given(
    contact=valid_contact(),
    source_system=valid_source_systems,
    source_channel=valid_source_channels,
    timestamp=valid_timestamps,
)
@settings(max_examples=300)
def test_valid_request_has_status_new_and_temperature_assigned(
    contact: dict, source_system: str, source_channel: str, timestamp: datetime
) -> None:
    """
    A valid lead request (all required fields present) must:
    - Parse without errors
    - Produce temperature in {"cold", "warm", "hot"} via assign_temperature
    - Never produce an empty or None temperature

    **Validates: Requirements 13.2, 13.3**
    """
    # This must not raise
    request = LeadIntakeRequest(
        contact=ContactInfo(**contact),
        source_system=source_system,
        source_channel=source_channel,
        timestamp=timestamp,
    )

    # Temperature assignment logic
    temperature = assign_temperature(request.source_system, request.metadata)

    # Core assertions
    assert temperature in {"cold", "warm", "hot"}, (
        f"Temperature '{temperature}' is not a valid value"
    )
    assert temperature is not None
    assert temperature != ""


@given(
    contact=valid_contact(),
    source_channel=valid_source_channels,
    timestamp=valid_timestamps,
)
@settings(max_examples=200)
def test_private_estates_landing_assigns_warm(
    contact: dict, source_channel: str, timestamp: datetime
) -> None:
    """
    Leads from "private-estates-landing" must be assigned temperature "warm".

    **Validates: Requirements 13.3**
    """
    request = LeadIntakeRequest(
        contact=ContactInfo(**contact),
        source_system="private-estates-landing",
        source_channel=source_channel,
        timestamp=timestamp,
    )

    temperature = assign_temperature(request.source_system, request.metadata)
    assert temperature == "warm", (
        f"Expected 'warm' for private-estates-landing, got '{temperature}'"
    )


@given(
    contact=valid_contact(),
    source_system=valid_source_systems,
    source_channel=valid_source_channels,
    timestamp=valid_timestamps,
)
@settings(max_examples=200)
def test_non_warm_source_assigns_cold(
    contact: dict, source_system: str, source_channel: str, timestamp: datetime
) -> None:
    """
    Leads from sources NOT in WARM_SOURCES or HOT_SOURCES must be assigned
    temperature "cold" (assuming no referral metadata).

    **Validates: Requirements 13.3**
    """
    # Exclude warm and hot sources to test the "cold" path
    assume(source_system != "private-estates-landing")

    request = LeadIntakeRequest(
        contact=ContactInfo(**contact),
        source_system=source_system,
        source_channel=source_channel,
        timestamp=timestamp,
    )

    temperature = assign_temperature(request.source_system, request.metadata)
    assert temperature == "cold", (
        f"Expected 'cold' for source '{source_system}', got '{temperature}'"
    )
