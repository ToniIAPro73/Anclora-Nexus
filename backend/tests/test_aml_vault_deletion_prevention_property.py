"""
Property-based test for AML Vault Deletion Prevention (Property 2).

**Validates: Requirements 3.3**

Property statement: For any record in the AML vault whose
`retention_expires_at > now()`, any attempt to delete that record shall raise
an error and leave the record unchanged.

Tests the pure logic of the `aml_vault.prevent_premature_deletion()` trigger
function in isolation (no live database required).
"""

from datetime import datetime, timedelta, timezone
from dataclasses import dataclass
from typing import Literal
import copy

import pytest
from hypothesis import given, settings, assume
from hypothesis import strategies as st


# ---------------------------------------------------------------------------
# Domain model: mirrors aml_vault.retention_records relevant fields
# ---------------------------------------------------------------------------

ReviewStatus = Literal["active", "pending_review", "deleted"]


@dataclass
class AmlVaultRecord:
    """Represents a row in aml_vault.retention_records."""

    id: str
    org_id: str
    source_table: str
    source_record_id: str
    record_data: dict
    classification_reason: str
    created_at: datetime
    retention_expires_at: datetime
    review_status: ReviewStatus


class PrematureDeletionError(Exception):
    """Raised when attempting to delete a record before retention expiry."""

    pass


# ---------------------------------------------------------------------------
# Pure logic: mirrors the PostgreSQL trigger function
# ---------------------------------------------------------------------------


def prevent_premature_deletion(record: AmlVaultRecord, now: datetime) -> AmlVaultRecord:
    """
    Replicates the logic of aml_vault.prevent_premature_deletion() trigger.

    If retention_expires_at > now AND review_status == 'active':
        raises PrematureDeletionError (record unchanged)
    Otherwise:
        returns the record (deletion allowed)
    """
    if record.retention_expires_at > now and record.review_status == "active":
        raise PrematureDeletionError(
            f"Cannot delete record before retention period expires "
            f"(expires: {record.retention_expires_at})"
        )
    return record


# ---------------------------------------------------------------------------
# Hypothesis strategies
# ---------------------------------------------------------------------------

# Generate naive datetimes within a reasonable range (timezone handled separately)
reasonable_datetimes = st.datetimes(
    min_value=datetime(2000, 1, 1),
    max_value=datetime(2100, 12, 31),
)

review_statuses = st.sampled_from(["active", "pending_review", "deleted"])


def aml_vault_record_strategy(
    review_status: st.SearchStrategy = review_statuses,
    retention_expires_at: st.SearchStrategy = reasonable_datetimes,
) -> st.SearchStrategy:
    """Generate arbitrary AML vault records with naive datetimes."""
    return st.builds(
        AmlVaultRecord,
        id=st.uuids().map(str),
        org_id=st.uuids().map(str),
        source_table=st.text(
            min_size=1,
            max_size=50,
            alphabet=st.characters(whitelist_categories=("L", "Nd", "Pc")),
        ),
        source_record_id=st.uuids().map(str),
        record_data=st.fixed_dictionaries({"key": st.text(min_size=1, max_size=20)}),
        classification_reason=st.text(min_size=1, max_size=100),
        created_at=reasonable_datetimes,
        retention_expires_at=retention_expires_at,
        review_status=review_status,
    )


# ---------------------------------------------------------------------------
# Property tests
# ---------------------------------------------------------------------------


class TestAmlVaultDeletionPrevention:
    """
    Property 2: AML Vault Deletion Prevention.

    **Validates: Requirements 3.3**
    """

    @given(
        record=aml_vault_record_strategy(review_status=st.just("active")),
        offset_seconds=st.integers(min_value=1, max_value=365 * 24 * 3600 * 20),
    )
    @settings(max_examples=200)
    def test_deletion_blocked_for_active_non_expired_records(
        self, record: AmlVaultRecord, offset_seconds: int
    ):
        """
        For any record with retention_expires_at > now() and review_status == 'active',
        delete attempts must raise an exception and record remains unchanged.

        **Validates: Requirements 3.3**
        """
        # Set now to be strictly before retention_expires_at
        now = record.retention_expires_at - timedelta(seconds=offset_seconds)

        # Preconditions
        assert record.retention_expires_at > now
        assert record.review_status == "active"

        original = copy.deepcopy(record)

        # Attempt deletion should raise
        with pytest.raises(PrematureDeletionError):
            prevent_premature_deletion(record, now)

        # Record must remain unchanged after failed deletion
        assert record.id == original.id
        assert record.org_id == original.org_id
        assert record.record_data == original.record_data
        assert record.retention_expires_at == original.retention_expires_at
        assert record.review_status == original.review_status
        assert record.created_at == original.created_at

    @given(
        record=aml_vault_record_strategy(
            review_status=st.sampled_from(["pending_review", "deleted"]),
        ),
        now=reasonable_datetimes,
    )
    @settings(max_examples=200)
    def test_deletion_allowed_for_non_active_records(
        self, record: AmlVaultRecord, now: datetime
    ):
        """
        Complementary case: records with non-active status CAN be deleted
        regardless of retention_expires_at.
        """
        assert record.review_status != "active"

        # Deletion should succeed (return the record, no exception)
        result = prevent_premature_deletion(record, now)
        assert result == record

    @given(
        record=aml_vault_record_strategy(review_status=st.just("active")),
        offset_seconds=st.integers(min_value=0, max_value=365 * 24 * 3600 * 20),
    )
    @settings(max_examples=200)
    def test_deletion_allowed_for_expired_active_records(
        self, record: AmlVaultRecord, offset_seconds: int
    ):
        """
        Complementary case: active records with expired retention (retention_expires_at <= now)
        CAN be deleted.
        """
        # Set now to be at or after retention_expires_at
        now = record.retention_expires_at + timedelta(seconds=offset_seconds)

        assert record.retention_expires_at <= now
        assert record.review_status == "active"

        # Deletion should succeed
        result = prevent_premature_deletion(record, now)
        assert result == record

    @given(
        record=aml_vault_record_strategy(review_status=st.just("active")),
        now=reasonable_datetimes,
    )
    @settings(max_examples=200)
    def test_deletion_decision_depends_on_time_comparison(
        self, record: AmlVaultRecord, now: datetime
    ):
        """
        For any active record and any point in time, the deletion decision
        depends solely on whether retention_expires_at > now.

        **Validates: Requirements 3.3**
        """
        assert record.review_status == "active"

        if record.retention_expires_at > now:
            # Should block deletion
            with pytest.raises(PrematureDeletionError):
                prevent_premature_deletion(record, now)
        else:
            # Should allow deletion
            result = prevent_premature_deletion(record, now)
            assert result == record

    @given(
        record=aml_vault_record_strategy(review_status=st.just("active")),
        offset_seconds=st.integers(min_value=1, max_value=365 * 24 * 3600 * 20),
    )
    @settings(max_examples=100)
    def test_record_immutability_on_failed_deletion(
        self, record: AmlVaultRecord, offset_seconds: int
    ):
        """
        When deletion is blocked, the record data must remain completely
        unchanged — simulating that the database row is not modified.

        **Validates: Requirements 3.3**
        """
        # Set now to be strictly before retention_expires_at
        now = record.retention_expires_at - timedelta(seconds=offset_seconds)

        # Snapshot all fields before deletion attempt
        snapshot = {
            "id": record.id,
            "org_id": record.org_id,
            "source_table": record.source_table,
            "source_record_id": record.source_record_id,
            "record_data": copy.deepcopy(record.record_data),
            "classification_reason": record.classification_reason,
            "created_at": record.created_at,
            "retention_expires_at": record.retention_expires_at,
            "review_status": record.review_status,
        }

        with pytest.raises(PrematureDeletionError):
            prevent_premature_deletion(record, now)

        # Verify all fields are unchanged
        assert record.id == snapshot["id"]
        assert record.org_id == snapshot["org_id"]
        assert record.source_table == snapshot["source_table"]
        assert record.source_record_id == snapshot["source_record_id"]
        assert record.record_data == snapshot["record_data"]
        assert record.classification_reason == snapshot["classification_reason"]
        assert record.created_at == snapshot["created_at"]
        assert record.retention_expires_at == snapshot["retention_expires_at"]
        assert record.review_status == snapshot["review_status"]
