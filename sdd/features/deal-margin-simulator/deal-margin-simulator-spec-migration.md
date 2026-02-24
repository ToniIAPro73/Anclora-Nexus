# Migration Spec - Deal Margin Simulator v1

## Goal
Define DB migration strategy for deal-margin-simulator with safe rollout and rollback.

## Migration Need
- Status: Skipped (Not Required in v1)
- Agent A decision date: 2026-02-24
- Rationale: DMS v1 is deterministic and does not require persisted scenario storage.

## Planned DB Artifacts
- No DB artifacts added in v1.
- Future path (v1.1+): optional scenario persistence table if product requires saved simulations.

## Rollout
1. Validate existing schema and org/role dependencies.
2. Implement simulation endpoints and frontend flow.
3. Validate with automated tests and lint.

## Rollback
1. Disable `/api/deal-margin/*` routes if rollback needed.
2. Revert backend/frontend DMS commits.
3. Re-run validation checks and confirm baseline behavior.
