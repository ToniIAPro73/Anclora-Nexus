# Agent D — QA Prompt

Feature: `synergi-datalab-access-requests`

## Role

You are Agent D. Your responsibility is QA, regression validation and release readiness for the centralized Synergi/Data Lab access request feature.

Run this prompt only after the implementation agents have completed their work.

## Read first

```text
sdd/features/synergi-datalab-access-requests/README.md
sdd/features/synergi-datalab-access-requests/spec-v1.md
sdd/features/synergi-datalab-access-requests/implementation-plan-nexus.md
.agent/rules/feature-synergi-datalab-access-requests.md
.agent/skills/features/synergi-datalab-access-requests/SKILL.md
.antigravity/prompts/features/synergi-datalab-access-requests/feature-synergi-datalab-access-requests-shared-context.md
.antigravity/prompts/features/synergi-datalab-access-requests/feature-synergi-datalab-access-requests-agent-a-db.md
.antigravity/prompts/features/synergi-datalab-access-requests/feature-synergi-datalab-access-requests-agent-b-backend.md
.antigravity/prompts/features/synergi-datalab-access-requests/feature-synergi-datalab-access-requests-agent-c-frontend.md
```

Also inspect all execution reports under:

```text
sdd/features/synergi-datalab-access-requests/executions/
```

## Contracts to validate

If UI was implemented, verify compliance with:

```text
sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md
sdd/contracts/UI-TEXT-FIELD-CONTRACT.md
sdd/contracts/UI-BOOLEAN-FIELD-CONTRACT.md
sdd/contracts/UI-SELECT-FIELD-CONTRACT.md
docs/standards/MODAL_CONTRACT.md
```

## QA objectives

Verify that the feature is correct, isolated and does not regress existing Nexus flows.

## Backend checks

Validate:

- `POST /api/public/access-requests` exists.
- Valid Data Lab request returns success and persists `pending`.
- Valid Synergi request returns success and persists `pending`.
- Missing Turnstile token fails.
- Invalid Turnstile result fails.
- Invalid product/source combination fails.
- `privacy_accepted=false` fails.
- `gdpr_consent=false` fails.
- `private_estates_web` is not accepted as source.
- Existing public valuation endpoint still works.
- Existing public CTA lead endpoint still works.
- Existing n8n/lead ingestion tests still pass.

## Frontend checks, if Agent C ran

Validate:

- Access Requests dashboard route renders.
- Loading state is visible.
- Empty state is useful.
- Error state is useful.
- Detail modal/drawer opens.
- Modal follows `docs/standards/MODAL_CONTRACT.md`.
- Page follows UI primitives contract.
- Inputs/selects/booleans follow UI field contracts.
- No hardcoded strings if i18n pattern exists.
- Sidebar integration does not break navigation.

## Security checks

Validate:

- No secrets printed in logs.
- No `.env` values committed.
- Turnstile secret is server-side only.
- Frontend never uses `TURNSTILE_SECRET_KEY`.
- Tests mock external verification.
- Admin endpoints, if added, require existing auth/role patterns.

## Regression checks

Run the repo's normal checks. Use the package manager and commands already present in the repo.

Common checks may include:

```bash
pytest
npm test
npm run build
```

Do not invent new commands if the repo uses different scripts. Inspect project scripts first.

## Output

Create:

```text
sdd/features/synergi-datalab-access-requests/executions/feature-synergi-datalab-access-requests-04-agent-d-qa.md
```

Include:

- commands run
- pass/fail result
- manual checks
- regressions found
- fixes applied, if any
- remaining risks
- recommendation: pass / conditional pass / fail

## Gate condition

Do not mark as pass if:

- captcha is frontend-only
- requests are not persisted
- invalid source/product is accepted
- existing valuation or public lead flows break
- secrets are exposed
- UI modal violates the modal contract
