# Migration Spec - FinOps and Commercial Command Center v1

## Goal
Define DB migration strategy for finops-and-commercial-command-center with safe rollout and rollback.

## Migration Need
- Status: Skipped (Not Required in v1)
- Agent A decision date: 2026-02-24
- Rationale: existing tables (`leads`, `properties`, `tasks`, `org_cost_usage_events`) already cover KPI computation for snapshot and trends.

## Planned DB Artifacts
- No new DB artifacts added in v1.
- KPI aggregation is computed in backend service layer (`command_center_service.py`).
- Future optimization path (v1.1+): materialized monthly KPI view if latency requires.

## Rollout
1. Validate existing schema availability.
2. Implement read-only aggregation endpoints in backend.
3. Validate via automated tests and frontend integration.

## Rollback
1. Disable `/api/command-center/*` routes if rollback needed.
2. Revert backend/frontend FCCC commits.
3. Re-run validation checks to confirm baseline behavior.
