# Gate Final — Synergi/Data Lab Access Requests

Feature: `synergi-datalab-access-requests`

## Role

You are the final gate reviewer. Your job is to decide whether the feature can be merged or must be sent back for correction.

Do not implement new functionality unless the fix is very small, safe and directly related to a failed gate. Prefer reporting issues clearly.

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
.antigravity/prompts/features/synergi-datalab-access-requests/feature-synergi-datalab-access-requests-agent-d-qa.md
```

Also read all execution reports:

```text
sdd/features/synergi-datalab-access-requests/executions/
```

## Required gate checks

### Architecture

- Nexus is the source of truth for access requests.
- No approval/rejection logic is duplicated in Synergi/Data Lab.
- `private_estates_web` is not accepted as a source.
- Valid source values are only `landing`, `synergi_app`, `data_lab_app`.
- Valid product values are only `synergi`, `data_lab`.

### Backend

- `POST /api/public/access-requests` exists and follows the spec.
- Data Lab request can be submitted and persisted as `pending`.
- Synergi request can be submitted and persisted as `pending`.
- Product/source validation is enforced.
- Consent validation is enforced.
- Turnstile is verified server-side, not only shown in frontend.
- reCAPTCHA compatibility is not removed if existing flows still depend on it.
- Existing public valuation and CTA lead flows do not regress.

### Database

- `access_requests` migration exists.
- Required checks and indexes exist.
- Status defaults to `pending`.
- The schema can support future approval/rejection/revocation.

### Frontend/admin, if implemented

Validate compliance with:

```text
sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md
sdd/contracts/UI-TEXT-FIELD-CONTRACT.md
sdd/contracts/UI-BOOLEAN-FIELD-CONTRACT.md
sdd/contracts/UI-SELECT-FIELD-CONTRACT.md
docs/standards/MODAL_CONTRACT.md
```

The UI gate fails if:

- a new page ignores page primitives.
- inputs/selects/booleans use ad hoc styles without documented exception.
- a modal has avoidable full-modal scroll.
- critical actions are hidden or unclear.
- desktop/mobile visual validation is missing.

### Security

- No secrets committed.
- No `.env` values printed.
- Turnstile secret remains server-side.
- Tests do not call Cloudflare.
- Admin actions, if implemented, respect existing auth/role scope.

### Tests

Required checks must be run using the repo's actual commands. At minimum, validate backend tests relevant to:

- access request creation
- captcha validation
- invalid source/product
- existing public routes

Frontend build/test must be run if UI files changed.

## Final report

Create:

```text
sdd/features/synergi-datalab-access-requests/executions/feature-synergi-datalab-access-requests-05-gate-final.md
```

Use this structure:

```markdown
# Gate Final — Synergi/Data Lab Access Requests

## Verdict
PASS | CONDITIONAL PASS | FAIL

## Summary
...

## Files reviewed
...

## Checks run
...

## Contract compliance
...

## Regressions
...

## Security review
...

## Required fixes before merge
...

## Follow-up recommendations
...
```

## Verdict rules

Use `PASS` only if all required checks are satisfied.

Use `CONDITIONAL PASS` only if the feature is safe to merge with clearly documented non-blocking follow-ups.

Use `FAIL` if any of these are true:

- Turnstile is not verified server-side.
- Requests are not persisted.
- Invalid source/product is accepted.
- Existing valuation or public lead flow is broken.
- Secrets are exposed.
- UI violates mandatory contracts.
- Tests are not run or fail.
