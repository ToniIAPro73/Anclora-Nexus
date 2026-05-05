# Shared Context — Synergi/Data Lab Access Requests

## Mission

Implement a centralized access request system for Anclora Synergi and Anclora Data Lab, managed by Anclora Nexus.

## Architecture decision

Nexus owns request intake and approval state.

```text
landing / synergi_app / data_lab_app
        ↓
Nexus AccessRequest
        ↓
Admin review
        ↓
approved / rejected / revoked
```

## Valid domain values

```ts
product = "synergi" | "data_lab"
source = "landing" | "synergi_app" | "data_lab_app"
status = "pending" | "approved" | "rejected" | "revoked"
```

Do not add `private_estates_web` as a source.

## Validation rules

```text
landing      → synergi or data_lab
synergi_app  → synergi only
data_lab_app → data_lab only
```

## Current repo context

Nexus already has:

- FastAPI app.
- `/api/public` router.
- public valuation request route.
- captcha verification service currently focused on reCAPTCHA.

Landing currently has:

- Data Lab form.
- Partners/Synergi form.

## Target endpoint

```http
POST /api/public/access-requests
```

## Phase boundary

This implementation phase is backend-first:

- Migration.
- Pydantic model.
- Service.
- Public endpoint.
- Turnstile verification.
- Tests.

Admin UI, approval/rejection actions, decision emails and app invite flow are later unless explicitly assigned.

## Non-regression

Do not break:

- public valuation requests
- public CTA lead intake
- seller/buyer/valuation flows
- n8n unified lead intake
