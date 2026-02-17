---
name: content-design-and-localization-governance-anclora
description: Governance workflow for Anclora Nexus and Anclora Private Estates to audit and improve UX writing, terminology, and localization quality in es/en/de/ru with strict env, i18n, visual consistency, and QA gate contracts.
---

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
- Non-create actions use `btn-action` pattern aligned to `Invitar`: `bg-gold`, `hover:bg-gold-muted`, `text-navy-deep`, `font-bold`, `h-12`, `px-6`, `rounded-xl`, and one elegant left emoji/icon.
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

## Domain Routing (Anclora)
Before auditing, classify the request and load only the matching profile from `references/domain-profiles/`.

1. Lead capture / prospecting:
- `references/domain-profiles/captacion-y-prospeccion-inmobiliaria.md`
2. Buyer matching / closing:
- `references/domain-profiles/buyer-matching-y-cierre-comercial.md`
3. Listings / premium asset presentation:
- `references/domain-profiles/listings-y-presentacion-de-activos-premium.md`
4. CRM and lead lifecycle:
- `references/domain-profiles/crm-operativo-y-lead-lifecycle.md`
5. Internal runbooks:
- `references/domain-profiles/runbooks-operativos-equipo-interno.md`
6. Legal/compliance:
- `references/domain-profiles/legal-y-compliance-inmobiliario.md`
7. Brand messaging / GTM:
- `references/domain-profiles/brand-messaging-y-gtm.md`

If scope crosses domains, start with the primary domain and add one secondary profile only.
