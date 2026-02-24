# Migration Spec - Deal Margin Simulator v1

## Goal
Define DB migration strategy for deal-margin-simulator with safe rollout and rollback.

## Migration Need
- Status: Conditional
- Rule: execute migration only if schema gaps are confirmed by Agent A (DB).

## Planned DB Artifacts
- Optional table for persisted simulation scenarios by org and user.
- Standard metadata: created_at, updated_at, org_id, status.
- Index baseline: (org_id, status) and feature-specific query paths.

## Rollout
1. Create additive schema objects.
2. Run verification queries for constraints and indexes.
3. Enable feature behind server-side capability flag if needed.

## Rollback
1. Disable feature writes and background workers.
2. Revert feature migration file.
3. Re-run verification helper to confirm schema restoration.
