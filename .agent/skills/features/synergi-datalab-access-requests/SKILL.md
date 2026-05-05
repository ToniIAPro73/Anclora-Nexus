# Skill — Synergi/Data Lab Access Requests

Use this skill when implementing or reviewing the feature `synergi-datalab-access-requests`.

## Inputs

Read first:

```text
sdd/features/synergi-datalab-access-requests/README.md
sdd/features/synergi-datalab-access-requests/spec-v1.md
sdd/features/synergi-datalab-access-requests/implementation-plan-nexus.md
sdd/features/synergi-datalab-access-requests/prompt-nexus-implementation.md
.agent/rules/feature-synergi-datalab-access-requests.md
```

## Scope

Nexus backend first:

- AccessRequest domain model.
- Supabase migration.
- Public endpoint.
- Turnstile server-side verification.
- Persistence as `pending`.
- Tests.

Admin UI, approval/rejection and invite emails are later phases unless explicitly assigned.

## Implementation checklist

### Backend

- Add/extend config for Turnstile.
- Extend captcha verification without removing reCAPTCHA.
- Create `backend/models/access_requests.py`.
- Create `backend/services/access_request_service.py`.
- Add migration `supabase/migrations/XXX_access_requests.sql`.
- Add `POST /api/public/access-requests`.
- Preserve existing public flows.

### Tests

- Valid Synergi request.
- Valid Data Lab request.
- Missing Turnstile token.
- Invalid source/product combination.
- Privacy/GDPR false.
- Existing public valuation/CTA tests still pass.

### Documentation

Create execution report:

```text
sdd/features/synergi-datalab-access-requests/executions/feature-synergi-datalab-access-requests-01-execution-report.md
```

Include:

- files changed
- endpoint added
- migration created
- tests run
- known limitations
- next steps

## Safety notes

- Do not read or print `.env` values.
- Do not expose secret keys.
- Do not call external Turnstile endpoint in tests.
- Do not modify unrelated lead/n8n workflows unless required by shared imports.
