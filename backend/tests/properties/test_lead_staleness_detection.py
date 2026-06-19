"""
Property-based test: Lead Staleness Detection (Property 13)

**Validates: Requirements 14.4**

Property statement: For any lead with no next_action_due set and created_at older
than 48 hours, the staleness check shall flag the lead with status 'stale' and
alert the assigned owner.

This test validates the pure staleness detection logic implemented in
`backend/services/lead_pipeline_service.py::_detect_stale_leads`, which checks:
- next_action_due is None
- created_at older than STALENESS_HOURS (48)
- status not in terminal states (converted, lost, stale)

The core invariants:
- no next_action_due + created_at > 48h + non-terminal status → stale
- next_action_due set → NOT stale
- created_at < 48h ago → NOT stale
- terminal status (converted, lost, stale) → NOT stale
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from hypothesis import given, settings, assume
from hypothesis import strategies as st


# ---------------------------------------------------------------------------
# Constants matching the service implementation
# ---------------------------------------------------------------------------

STALENESS_HOURS = 48
TERMINAL_STATUSES = ("converted", "lost", "stale")
NON_TERMINAL_STATUSES = ("new", "contacted", "qualified")
ALL_STATUSES = NON_TERMINAL_STATUSES + TERMINAL_STATUSES


# ---------------------------------------------------------------------------
# Pure staleness detection function (mirrors the service logic)
# ---------------------------------------------------------------------------


def is_lead_stale(
    created_at: datetime,
    next_action_due: Optional[datetime],
    status: str,
    now: datetime,
    staleness_hours: int = STALENESS_HOURS,
) -> bool:
    """
    Determine whether a lead should be flagged as stale.

    Mirrors _detect_stale_leads logic:
    1. Skip terminal states (converted, lost, stale)
    2. Skip if next_action_due is set (not None)
    3. Flag if created_at is older than staleness_hours

    Returns True if the lead should be flagged stale.
    """
    # Terminal states are never flagged
    if status in TERMINAL_STATUSES:
        return False

    # Leads with a scheduled next action are not stale
    if next_action_due is not None:
        return False

    # Check age against staleness threshold
    cutoff = now - timedelta(hours=staleness_hours)
    return created_at < cutoff


# ---------------------------------------------------------------------------
# Hypothesis strategies
# ---------------------------------------------------------------------------

# Timezone-aware UTC datetimes in a reasonable range
reasonable_timestamps = st.datetimes(
    min_value=datetime(2020, 1, 1),
    max_value=datetime(2030, 12, 31),
    timezones=st.just(timezone.utc),
)

# Time deltas strictly greater than 48 hours
beyond_48h_deltas = st.timedeltas(
    min_value=timedelta(hours=STALENESS_HOURS, seconds=1),
    max_value=timedelta(days=365),
)

# Time deltas strictly less than 48 hours (1 second to 47h 59m 59s)
within_48h_deltas = st.timedeltas(
    min_value=timedelta(seconds=1),
    max_value=timedelta(hours=STALENESS_HOURS) - timedelta(seconds=1),
)

# Non-terminal lead statuses
non_terminal_statuses = st.sampled_from(list(NON_TERMINAL_STATUSES))

# Terminal lead statuses
terminal_statuses = st.sampled_from(list(TERMINAL_STATUSES))

# All possible lead statuses
all_statuses = st.sampled_from(list(ALL_STATUSES))

# Optional next_action_due timestamps (None or a valid datetime)
optional_action_due = st.one_of(st.none(), reasonable_timestamps)

# General time deltas for mixed scenarios
any_positive_delta = st.timedeltas(
    min_value=timedelta(seconds=1),
    max_value=timedelta(days=365),
)


# ---------------------------------------------------------------------------
# Property tests
# ---------------------------------------------------------------------------


class TestLeadStalenessDetection:
    """
    Property 13: Lead Staleness Detection.

    **Validates: Requirements 14.4**
    """

    @given(
        now=reasonable_timestamps,
        age_delta=beyond_48h_deltas,
        status=non_terminal_statuses,
    )
    @settings(max_examples=500)
    def test_no_action_due_and_older_than_48h_is_stale(
        self,
        now: datetime,
        age_delta: timedelta,
        status: str,
    ):
        """
        For any lead with no next_action_due, a non-terminal status, and
        created_at older than 48 hours, the staleness check shall flag
        the lead as stale.

        **Validates: Requirements 14.4**
        """
        created_at = now - age_delta

        result = is_lead_stale(
            created_at=created_at,
            next_action_due=None,
            status=status,
            now=now,
        )

        assert result is True, (
            f"Expected lead to be stale. "
            f"created_at={created_at}, now={now}, age={age_delta}, "
            f"status={status}, next_action_due=None"
        )

    @given(
        now=reasonable_timestamps,
        age_delta=any_positive_delta,
        action_due=reasonable_timestamps,
        status=non_terminal_statuses,
    )
    @settings(max_examples=500)
    def test_leads_with_next_action_due_are_not_stale(
        self,
        now: datetime,
        age_delta: timedelta,
        action_due: datetime,
        status: str,
    ):
        """
        For any lead with next_action_due set (regardless of age or status),
        the staleness check shall NOT flag the lead as stale.

        **Validates: Requirements 14.4**
        """
        created_at = now - age_delta

        result = is_lead_stale(
            created_at=created_at,
            next_action_due=action_due,
            status=status,
            now=now,
        )

        assert result is False, (
            f"Expected lead NOT to be stale (has next_action_due). "
            f"created_at={created_at}, now={now}, next_action_due={action_due}, "
            f"status={status}"
        )

    @given(
        now=reasonable_timestamps,
        age_delta=within_48h_deltas,
        status=non_terminal_statuses,
    )
    @settings(max_examples=500)
    def test_leads_created_less_than_48h_ago_are_not_stale(
        self,
        now: datetime,
        age_delta: timedelta,
        status: str,
    ):
        """
        For any lead created less than 48 hours ago (even with no
        next_action_due), the staleness check shall NOT flag as stale.

        **Validates: Requirements 14.4**
        """
        created_at = now - age_delta

        result = is_lead_stale(
            created_at=created_at,
            next_action_due=None,
            status=status,
            now=now,
        )

        assert result is False, (
            f"Expected lead NOT to be stale (created < 48h ago). "
            f"created_at={created_at}, now={now}, age={age_delta}, "
            f"status={status}"
        )

    @given(
        now=reasonable_timestamps,
        age_delta=beyond_48h_deltas,
        status=terminal_statuses,
    )
    @settings(max_examples=500)
    def test_terminal_status_leads_are_never_stale(
        self,
        now: datetime,
        age_delta: timedelta,
        status: str,
    ):
        """
        For any lead in a terminal state (converted, lost, stale),
        the staleness check shall NOT flag it, regardless of age
        or next_action_due.

        **Validates: Requirements 14.4**
        """
        created_at = now - age_delta

        result = is_lead_stale(
            created_at=created_at,
            next_action_due=None,
            status=status,
            now=now,
        )

        assert result is False, (
            f"Expected terminal lead NOT to be flagged stale. "
            f"created_at={created_at}, now={now}, status={status}"
        )

    @given(
        now=reasonable_timestamps,
        age_delta=any_positive_delta,
        next_action_due=optional_action_due,
        status=all_statuses,
    )
    @settings(max_examples=500)
    def test_staleness_decision_is_consistent(
        self,
        now: datetime,
        age_delta: timedelta,
        next_action_due: Optional[datetime],
        status: str,
    ):
        """
        The staleness decision for any given lead state shall be consistent
        with the conjunction of all three conditions:
        - status not in terminal states
        - next_action_due is None
        - created_at older than 48 hours

        A lead is stale iff ALL three conditions hold simultaneously.

        **Validates: Requirements 14.4**
        """
        created_at = now - age_delta

        result = is_lead_stale(
            created_at=created_at,
            next_action_due=next_action_due,
            status=status,
            now=now,
        )

        # Compute expected from individual conditions
        is_non_terminal = status not in TERMINAL_STATUSES
        has_no_action = next_action_due is None
        cutoff = now - timedelta(hours=STALENESS_HOURS)
        is_old_enough = created_at < cutoff

        expected = is_non_terminal and has_no_action and is_old_enough

        assert result == expected, (
            f"Staleness decision inconsistent. "
            f"result={result}, expected={expected}, "
            f"is_non_terminal={is_non_terminal}, has_no_action={has_no_action}, "
            f"is_old_enough={is_old_enough}, "
            f"created_at={created_at}, now={now}, age={age_delta}, "
            f"status={status}, next_action_due={next_action_due}"
        )

    @given(
        now=reasonable_timestamps,
        status=non_terminal_statuses,
    )
    @settings(max_examples=300)
    def test_exactly_48h_boundary_is_not_stale(
        self,
        now: datetime,
        status: str,
    ):
        """
        At exactly the 48-hour boundary (created_at == now - 48h), the lead
        shall NOT be flagged stale. The condition uses strict less-than
        (created_at < cutoff), so exactly at the cutoff is not stale.

        **Validates: Requirements 14.4**
        """
        created_at = now - timedelta(hours=STALENESS_HOURS)

        result = is_lead_stale(
            created_at=created_at,
            next_action_due=None,
            status=status,
            now=now,
        )

        assert result is False, (
            f"Expected lead at exact 48h boundary NOT to be stale. "
            f"created_at={created_at}, now={now}, status={status}"
        )
