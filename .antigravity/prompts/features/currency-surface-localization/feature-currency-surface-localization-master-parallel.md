# MASTER PROMPT: Currency & Surface Localization v1 (Agents A/B/C/D)

Feature ID: `ANCLORA-CSL-001`

Common context:
- `.antigravity/prompts/currency-surface-localization/feature-currency-surface-localization-shared-context.md`
- Baseline QA/Gate: `.antigravity/prompts/features/_qa-gate-baseline.md`

## Agent A — DB & Migration
- Add surface breakdown columns and constraints.
- Backfill from legacy `surface_m2`.
- Rollback and validation SQL.
- Do not touch backend/frontend.

## Agent B — Backend
- Extend property contracts with surface trio.
- Enforce validation and origin editability policy.
- Keep backwards compatibility.
- Do not touch migrations/frontend.

## Agent C — Frontend UX
- Add currency toggle integration and formatters.
- Render currency and surface consistently in properties/prospection.
- Ensure no label overlap in cards.
- Do not touch migrations/backend.

## Agent D — QA
- Validate DB/API/UI, regressions and org isolation.

## Commit policy
- 1 prompt = 1 commit.
- Agent must stop after its block.
