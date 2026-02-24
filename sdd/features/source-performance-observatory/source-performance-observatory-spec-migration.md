# Migration Spec - Source Performance Observatory v1

## Goal
Define DB migration strategy for source-performance-observatory with safe rollout and rollback.

## Migration Need
- Status: Skipped (Not Required in v1)
- Agent A decision date: 2026-02-24
- Rationale: current schema (`ingestion_events`, `leads`) is sufficient for source scorecards/ranking/trends.

## Planned DB Artifacts
- No DB artifacts added in v1.
- KPI aggregation is computed in backend service layer (`source_observatory_service.py`).
- Future path (v1.1+): optional materialized snapshot view for large-volume orgs.

## Rollout
1. Validate existing schema availability and contracts.
2. Implement read-only observatory endpoints in backend.
3. Validate with automated tests and frontend integration.

## Rollback
1. Disable `/api/source-observatory/*` routes if rollback needed.
2. Revert backend/frontend SPO commits.
3. Re-run validation checks to confirm baseline behavior.
