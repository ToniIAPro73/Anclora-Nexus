# Implementation Plan — Nexus Access Requests

## Branch

```bash
git switch -c feat/synergi-datalab-access-requests
```

## Principle

Implement the backend first. The landing should not be migrated until Nexus exposes and validates the canonical endpoint.

## Phase 1 — Backend intake

### 1. Configuration

Update `backend/config.py` with:

```py
TURNSTILE_SECRET_KEY: str | None = None
TURNSTILE_VERIFY_URL: str = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
```

Keep existing reCAPTCHA settings for compatibility.

### 2. Captcha verification

Update `backend/services/captcha_verification_service.py`.

Required behavior:

- `provider=None` or unsupported provider keeps current non-required behavior where appropriate.
- `provider="recaptcha"` keeps existing behavior.
- `provider="turnstile"` verifies with Cloudflare Turnstile.
- Return structured result:

```py
{
  "provider": "turnstile",
  "verified": True,
  "required": True,
  "hostname": body.get("hostname"),
  "action": body.get("action"),
  "cdata": body.get("cdata"),
}
```

### 3. Model

Create `backend/models/access_requests.py`.

Suggested classes:

```py
AccessRequestProduct
AccessRequestSource
AccessRequestStatus
PublicAccessRequestCreate
AccessRequestRecord
AccessRequestCreateResult
```

Validation rules:

- `privacy_accepted` must be true.
- `gdpr_consent` must be true.
- `source="synergi_app"` requires `product="synergi"`.
- `source="data_lab_app"` requires `product="data_lab"`.
- Data Lab requests require `intended_use` or `message`.
- Synergi requests require `service_category` and `service_summary`.

### 4. Database migration

Create a migration:

```text
supabase/migrations/XXX_access_requests.sql
```

Suggested columns:

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

Indexes:

```sql
create index idx_access_requests_status_created_at on access_requests(status, created_at desc);
create index idx_access_requests_product_status on access_requests(product, status);
create index idx_access_requests_email on access_requests(lower(email));
create unique index idx_access_requests_external_id on access_requests(external_id) where external_id is not null;
```

Optional dedupe for MVP:

```sql
create index idx_access_requests_product_email_pending on access_requests(product, lower(email), status);
```

### 5. Service

Create `backend/services/access_request_service.py`.

Responsibilities:

- Verify captcha.
- Normalize strings.
- Validate product/source combination.
- Insert into Supabase/database.
- Return request id.
- Trigger internal notification.

Service methods:

```py
async def create_public_request(org_id: str, data: PublicAccessRequestCreate, remote_ip: str | None = None) -> dict
```

Later:

```py
async def list_requests(...)
async def get_request(request_id: str)
async def approve_request(request_id: str, admin_id: str, notes: str | None = None)
async def reject_request(request_id: str, admin_id: str, reason: str | None = None)
```

### 6. Public API

Add to `backend/api/routes/public.py`:

```py
@router.post("/access-requests", status_code=status.HTTP_201_CREATED)
async def create_public_access_request(data: PublicAccessRequestCreate, request: Request):
    ...
```

Response:

```py
{
  "status": "submitted",
  "request_id": result.get("id"),
  "message": "Access request submitted",
}
```

### 7. Compatibility wrappers

If the current specialized routes exist or are expected by the landing, preserve them as wrappers:

```text
POST /api/public/data-lab-access-requests
POST /api/public/partner-admissions
```

Both should map to `PublicAccessRequestCreate` and call `access_request_service.create_public_request`.

Do not keep separate persistence logic.

### 8. Tests

Create tests for:

- Valid Data Lab request.
- Valid Synergi request.
- Missing Turnstile token.
- Invalid product/source combination.
- Privacy/GDPR false.
- Legacy Data Lab wrapper if implemented.
- Legacy Partners wrapper if implemented.

Mock Cloudflare verification. Do not call external network in tests.

## Phase 2 — Nexus admin UI

Do not implement until Phase 1 is stable unless explicitly requested.

Later files likely involved:

```text
frontend/src/app/(dashboard)/access-requests/page.tsx
frontend/src/lib/access-requests-api.ts
frontend/src/components/access-requests/AccessRequestDetailModal.tsx
```

## Phase 3 — Decision emails and invitations

Later responsibilities:

- Generate invite token on approval.
- Send approval email with invite URL.
- Send rejection email.
- Store reviewed_at/reviewed_by.
- Add audit events if an audit/event system exists.

## Risks

1. **Captcha only on frontend is insufficient.** Turnstile must be verified in Nexus.
2. **Do not duplicate status logic in Synergi/Data Lab.** Nexus owns access decision.
3. **Do not break valuation requests.** Keep reCAPTCHA compatibility until fully migrated.
4. **Do not treat Private Estates web as a source.** Use `landing`, `synergi_app`, `data_lab_app` only.
5. **Do not merge old backup branch wholesale.** It contains useful references but is divergent.

## Done definition

Phase 1 is done when:

- Canonical public endpoint exists.
- Access requests persist as `pending`.
- Turnstile verification works server-side.
- Invalid captcha fails.
- Invalid product/source fails.
- Tests pass.
- Existing public lead and valuation tests still pass.
