# INDEX: CURRENCY & SURFACE LOCALIZATION V1

**Feature ID**: ANCLORA-CSL-001  
**Version**: 1.0  
**Status**: Specification Phase  
**Priority**: CRITICAL

## Document Map

| Document | Purpose |
|---|---|
| `sdd/features/currency-surface-localization/currency-surface-localization-spec-v1.md` | Functional and technical specification |
| `sdd/features/currency-surface-localization/currency-surface-localization-spec-migration.md` | DB migration, backfill and rollback |
| `sdd/features/currency-surface-localization/currency-surface-localization-test-plan-v1.md` | Test plan and validation criteria |
| `.agent/rules/feature-currency-surface-localization.md` | Immutable implementation rules |
| `.agent/skills/features/currency-surface-localization/SKILL.md` | Operational skill for this feature |
| `.antigravity/prompts/currency-surface-localization/feature-currency-surface-localization-v1.md` | Orchestrator prompt |

## Goal

Create a consistent localization layer for commercial metrics in properties:

- Currency selector independent from language.
- Correct locale formatting by currency (EUR, GBP, USD, DEM, RUB).
- Surface model with explicit business fields:
  - `useful_area`
  - `built_area`
  - `plot_area` (optional)
- Surface unit display adapted by selected currency market:
  - `m2` / `sq ft` conversion in UI.
- Clear edit contract by record origin for properties and contacts.
