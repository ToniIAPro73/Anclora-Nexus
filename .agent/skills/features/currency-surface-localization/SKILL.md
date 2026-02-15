---
name: currency-surface-localization
description: Implement and maintain currency localization plus explicit property surface model for Anclora Nexus. Use when touching price formatting, currency selector behavior, area fields (useful/built/plot), and origin-based editability contracts for properties/contacts.
---

# Currency & Surface Localization

## Workflow

1. Read:
- `sdd/features/currency-surface-localization/currency-surface-localization-INDEX.md`
- `sdd/features/currency-surface-localization/currency-surface-localization-spec-v1.md`
- `sdd/features/currency-surface-localization/currency-surface-localization-spec-migration.md`
- `.agent/rules/feature-currency-surface-localization.md`

2. Implement in order:
- DB migration and backfill
- Backend contract and validation
- Frontend formatting/unit UX
- QA and release gate

3. Preserve compatibility:
- keep legacy `surface_m2` operational during v1 rollout.

## Minimal v1 contract

- Currency toggle independent from language.
- Formatters for EUR/GBP/USD/DEM/RUB.
- Surface trio: `useful_area_m2`, `built_area_m2`, `plot_area_m2`.
- Origin-based editability policy enforced.

## Stop rules

- Do not mix unrelated feature scopes.
- 1 prompt = 1 commit.
- Agent must stop after its assigned block.
