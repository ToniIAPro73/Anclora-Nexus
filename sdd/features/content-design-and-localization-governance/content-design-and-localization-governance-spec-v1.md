# ANCLORA-CDLG-001 — Spec v1

## Scope
1. Governance contracts for text quality and localization.
2. Global rules for i18n coverage (`es`, `en`, `de`, `ru`).
3. Visual consistency contracts (typography, spacing, layout).
4. Button contracts:
- `btn-create`: creation actions.
- `btn-action`: non-creation actions (refresh/recompute/recalculate).
5. Navigation scalability contracts (sidebar/header).
6. Cleanup contract for temporary test/debug scripts.

## Non-Goals
- No full UI redesign.
- No business logic redesign.

## Acceptance Criteria
1. No hardcoded project refs in QA/Gate.
2. `ENV_MISMATCH = none`.
3. `I18N_MISSING_KEYS = none`.
4. `TEST_ARTIFACTS_NOT_CLEANED = none`.
5. No P0/P1 visual regressions.

