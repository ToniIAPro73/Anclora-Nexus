# SKILL: Content Design and Localization Governance (Anclora Specific)

## Purpose
Apply the portable content-governance workflow with Anclora Nexus constraints.

This skill extends:
- `.agent/skills/features/content-design-and-localization-governance/portable-base/SKILL.md`

## Repository Constraints (mandatory)
- Validate `.env` and `frontend/.env.local` before QA/Gate.
- Backend and frontend must target same Supabase project.
- Reject any external project ref not derived from `.env*`.

## Language Contract
- UI language coverage required for: `es`, `en`, `de`, `ru`.
- No hardcoded UI text in new/modified components.
- Avoid mixed-language UI in the same session.

## UI Consistency Contract
- Keep typography, spacing, and visual rhythm aligned with Dashboard/Prospection.
- No unnecessary desktop vertical scroll in main views.
- No overlaps/overflow in cards, filters, dropdowns, sidebar.

## Navigation Contract
- Sidebar must remain usable as modules grow.
- Global controls must remain accessible.
- Grouping/accordion patterns are preferred over ad-hoc overflow fixes.

## Button Contract (mandatory)
- Create actions use `btn-create` pattern.
  - Examples: new contact, new property, invite.
- Non-create actions use `btn-action` pattern (+ optional subtle emoji/icon).
  - Examples: recompute, recalculate, refresh.

## QA/Gate Blocking Conditions
- `ENV_MISMATCH`
- `QA_INVALID_ENV_SOURCE`
- `I18N_MISSING_KEYS`
- `MIGRATION_NOT_APPLIED` (when feature includes DB scope)
- `VISUAL_REGRESSION_P0`
- `NAVIGATION_SCALABILITY_BROKEN`
- `TEST_ARTIFACTS_NOT_CLEANED`

## Cleanup Rule
- Remove temporary debug/test scripts before feature closure.
- Keep evidence in SDD/QA reports, not ad-hoc executable files.

## Execution Modes
- `audit_only`: report only.
- `plan_changes`: include file-level change plan.
- `apply_changes`: only with explicit user approval.
