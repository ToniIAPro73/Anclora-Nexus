# Shared Context — ANCLORA-CDLG-001

Feature: `ANCLORA-CDLG-001`  
Name: `Content Design and Localization Governance v1`

## Goal
Standardize and govern microcopy, terminology, UX writing patterns, and localization quality across the product (`es`, `en`, `de`, `ru`) with enforceable QA/gate contracts.

## Mandatory Global Contracts
1. Environment source of truth:
- Read `.env` and `frontend/.env.local` first.
- Backend/frontend must target the same Supabase project.
- Never hardcode or assume `project_ref`.
2. i18n coverage:
- Any new/changed UI text must exist in `es`, `en`, `de`, `ru`.
- Missing keys are blocker: `I18N_MISSING_KEYS`.
3. UI quality:
- Avoid unnecessary vertical scroll where layout can be optimized.
- Keep typography and spacing aligned with app standards.
- Keep visual consistency with existing premium UI patterns.
4. Navigation scalability:
- Sidebar/header structure must remain usable as options grow.
5. Test artifacts hygiene:
- Temporary debug/test scripts created for iteration must be deleted before final gate.

## Inputs
- `public/docs/CONTENT_DESIGN_AND_LOCALIZATION_GOVERNANCE.md`
- `.agent/skills/features/content-design-and-localization-governance/SKILL.md`
- `.agent/skills/features/content-design-and-localization-governance/portable-base/SKILL.md`

## Output Format (all agents)
- Explicit assumptions.
- File-level changes.
- Risks/limitations.
- Stop when scope for the agent is complete.

