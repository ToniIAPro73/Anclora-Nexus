# Prompt — Nexus Implementation

Use this prompt with Codex, Gemini CLI or Claude Code.

---

Act as a senior backend/full-stack engineer working on the repository `ToniIAPro73/Anclora-Nexus`.

## Branch

Create and work on this branch:

```bash
git switch -c feat/synergi-datalab-access-requests
```

If the branch already exists, switch to it and update it from `main` safely.

## Feature

Implement centralized access requests for Anclora Synergi and Anclora Data Lab, managed from Nexus.

Nexus must become the operational source of truth for access request intake, status, review and later approval/rejection workflows.

Do not implement the landing frontend in this repo. This task is for Nexus backend and, only if already practical, backend-facing foundations for the later admin UI.

## Existing context

Nexus already has:

- FastAPI app in `backend/api/main.py`.
- Public router mounted under `/api/public`.
- Public valuation endpoint in `backend/api/routes/public.py`.
- Captcha service in `backend/services/captcha_verification_service.py` currently oriented to reCAPTCHA.
- Existing public lead/valuation flows that must not regress.

The landing currently has Data Lab and Partners/Synergi forms. They will later be migrated to the canonical endpoint:

```http
POST /api/public/access-requests
```

## Domain

Products:

```ts
type AccessRequestProduct = "synergi" | "data_lab";
```

Sources:

```ts
type AccessRequestSource = "landing" | "synergi_app" | "data_lab_app";
```

Statuses:

```ts
type AccessRequestStatus = "pending" | "approved" | "rejected" | "revoked";
```

Rules:

```text
source = landing      → product can be synergi or data_lab
source = synergi_app  → product must be synergi
source = data_lab_app → product must be data_lab
```

Do not add `private_estates_web` as a source.

## Required implementation

### 1. Config

Update `backend/config.py` to support:

```py
TURNSTILE_SECRET_KEY
TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
```

Keep current reCAPTCHA settings intact.

### 2. Captcha service

Extend `backend/services/captcha_verification_service.py` so it supports both:

```text
recaptcha
turnstile
```

For Turnstile:

- Use `TURNSTILE_SECRET_KEY`.
- POST to Cloudflare siteverify endpoint.
- Send `secret`, `response`, and optional `remoteip`.
- Return a structured result.
- Raise `CaptchaVerificationError` on missing token, missing secret or failed verification.

Do not make tests call Cloudflare. Mock verification.

### 3. Model

Create:

```text
backend/models/access_requests.py
```

Include Pydantic models/enums for:

```text
AccessRequestProduct
AccessRequestSource
AccessRequestStatus
PublicAccessRequestCreate
AccessRequestCreateResult if useful
```

Fields for `PublicAccessRequestCreate`:

```text
org_id
product
source
external_id optional
full_name
email
phone optional
company optional
profile_type optional
service_category optional
service_summary optional
intended_use optional
requested_scope optional
message optional
privacy_accepted
gdpr_consent
submission_language
captcha_provider
captcha_token
```

Validation:

- `privacy_accepted` must be true.
- `gdpr_consent` must be true.
- Data Lab request requires `intended_use` or `message`.
- Synergi request requires `service_category` and `service_summary`.
- Product/source combinations must follow the domain rules.

### 4. Migration

Create a Supabase migration:

```text
supabase/migrations/XXX_access_requests.sql
```

Use the next available numeric prefix.

Create table `access_requests` with at least:

```sql
id uuid primary key default gen_random_uuid(),
org_id uuid not null,
product text not null check (product in ('synergi', 'data_lab')),
source text not null check (source in ('landing', 'synergi_app', 'data_lab_app')),
status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'revoked')),
full_name text not null,
email text not null,
phone text,
company text,
profile_type text,
service_category text,
service_summary text,
intended_use text,
requested_scope text,
message text,
privacy_accepted boolean not null default false,
gdpr_consent boolean not null default false,
submission_language text not null default 'es',
external_id text,
captcha_provider text,
captcha_verified boolean not null default false,
captcha_hostname text,
reviewed_at timestamptz,
reviewed_by text,
admin_notes text,
rejection_reason text,
invite_token text,
invite_expires_at timestamptz,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
```

Add practical indexes:

```sql
create index idx_access_requests_status_created_at on access_requests(status, created_at desc);
create index idx_access_requests_product_status on access_requests(product, status);
create index idx_access_requests_email on access_requests(lower(email));
create unique index idx_access_requests_external_id on access_requests(external_id) where external_id is not null;
```

### 5. Service

Create:

```text
backend/services/access_request_service.py
```

Implement:

```py
async def create_public_request(org_id: str, data: PublicAccessRequestCreate, remote_ip: str | None = None) -> dict:
    ...
```

Responsibilities:

- Verify captcha if provider is `turnstile` or `recaptcha`.
- Normalize and validate data.
- Insert request into `access_requests` with status `pending`.
- Return inserted request id.
- Trigger internal notification if a project email/notification service already exists and can be used safely. If not, leave a small explicit TODO and do not block persistence.

Do not build approval/rejection yet unless the current architecture makes it trivial.

### 6. Public route

Add to `backend/api/routes/public.py`:

```http
POST /api/public/access-requests
```

Return:

```json
{
  "status": "submitted",
  "request_id": "...",
  "message": "Access request submitted"
}
```

Handle:

- `CaptchaVerificationError` → HTTP 400.
- validation/domain errors → HTTP 400 or 422.
- unexpected errors → HTTP 500.

### 7. Compatibility wrappers

If the codebase already has or expects these routes, preserve them as wrappers to the same service:

```http
POST /api/public/data-lab-access-requests
POST /api/public/partner-admissions
```

Mapping:

```text
data-lab-access-requests → product=data_lab, source=landing
partner-admissions      → product=synergi, source=landing
```

Do not create separate persistence logic for wrappers.

### 8. Tests

Add tests for:

- Valid Data Lab access request.
- Valid Synergi access request.
- Missing Turnstile token.
- Invalid product/source combination.
- `privacy_accepted=false`.
- `gdpr_consent=false`.
- Existing valuation endpoint still works.
- Existing public CTA lead endpoint still works if tests already exist.

Mock captcha verification.

## Constraints

- Do not break existing public valuation requests.
- Do not remove reCAPTCHA compatibility.
- Do not touch seller/buyer/valuation lead intake unless required for shared captcha compatibility.
- Do not add `private_estates_web` as source.
- Do not implement frontend landing changes here.
- Do not merge old backup branch wholesale. Use it only as reference if needed.

## Documentation

Update or add a concise execution report under:

```text
sdd/features/synergi-datalab-access-requests/executions/
```

Include:

- files changed
- endpoints added
- tests run
- known limitations
- next phase recommendations

## Done criteria

- Backend tests pass.
- New endpoint works in tests.
- Turnstile verification is implemented server-side.
- Requests are persisted with `pending` status.
- Product/source validation works.
- Existing public flows do not regress.
- SDD execution report is created.
