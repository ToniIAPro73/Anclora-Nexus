# Migration Spec - Guardrailed Automation and Alerting v1

## Goal
Define DB migration strategy for guardrailed-automation-and-alerting with safe rollout and rollback.

## Migration Need
- Status: Required and Applied
- Migration file: `supabase/migrations/035_guardrailed_automation_and_alerting.sql`
- Rule: additive migration, no destructive changes.

## Planned DB Artifacts
- New tables for automation rules, executions and alerts; indexes by org and status.
- Standard metadata: created_at, updated_at, org_id, status.
- Index baseline: (org_id, status) and feature-specific query paths.
- Implemented objects:
  - `automation_rules`
  - `automation_executions`
  - `automation_alerts`
  - Indexes by `(org_id, status|is_active)` and recency sort.

## Rollout
1. Create additive schema objects.
2. Run verification queries for constraints and indexes.
3. Enable feature behind server-side capability flag if needed.
4. Validate API contracts with `backend/tests/test_automation_routes.py`.

## Rollback
1. Disable feature writes and background workers.
2. Revert feature migration file.
3. Re-run verification helper to confirm schema restoration.
