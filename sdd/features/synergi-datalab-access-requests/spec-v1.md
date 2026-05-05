# SDD Spec v1 — Centralized Synergi/Data Lab Access Requests

## 1. Problem

Anclora Private Estates has two gated products: Anclora Synergi and Anclora Data Lab.

Access requests can be initiated from the public landing, and later from the Synergi/Data Lab apps themselves. These requests must not be handled independently in each app because that would duplicate approval logic, email flows, audit history and user-state management.

## 2. Decision

Anclora Nexus is the source of truth for the full access request lifecycle.

```text
Request created → pending
Admin reviews → approved / rejected
Approved → invite/account creation email
Rejected → rejection email
Revoked → access disabled later
```

Synergi and Data Lab should consume the final access decision or invitation token. They should not own the approval workflow.

## 3. Scope

### In scope — Nexus Phase 1

- Domain model for `AccessRequest`.
- Supabase migration/table.
- Public API endpoint to create requests.
- Server-side Cloudflare Turnstile verification.
- Request persistence with status `pending`.
- Internal notification to admin.
- Tests for public request creation and validation.

### In scope — later Nexus phase

- Admin listing.
- Request detail modal.
- Approve/reject/revoke actions.
- Decision emails.
- Invite token generation.

### Out of scope for Phase 1

- Real account provisioning in Synergi/Data Lab.
- Full RBAC redesign.
- Replacing seller/buyer/valuation lead intake.
- Removing existing legacy public endpoints before compatibility is verified.

## 4. Existing context

Nexus already exposes public routes through `backend/api/routes/public.py`, included in FastAPI under `/api/public`.

Existing public valuation requests already use a pattern with captcha fields:

```text
captcha_provider
captcha_token
submission_language
submission_source
```

Current captcha verification supports reCAPTCHA only. It must be extended to support Turnstile.

The current landing already has public forms for:

- Data Lab access requests.
- Partners/Synergi admissions.

These currently post to specialized endpoints and should migrate to the canonical access request endpoint after Nexus supports it.

## 5. Domain model

```ts
type AccessRequestProduct = "synergi" | "data_lab";

type AccessRequestSource =
  | "landing"
  | "synergi_app"
  | "data_lab_app";

type AccessRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "revoked";
```

Source/product validation rules:

```text
source = landing      → product can be synergi or data_lab
source = synergi_app  → product must be synergi
source = data_lab_app → product must be data_lab
```

`private_estates_web` must not be added as a source. If the user enters from Private Estates and submits the form inside Synergi/Data Lab, the source is the destination app.

## 6. AccessRequest fields

Minimum persistent fields:

```ts
type AccessRequest = {
  id: string;
  org_id: string;

  product: "synergi" | "data_lab";
  source: "landing" | "synergi_app" | "data_lab_app";
  status: "pending" | "approved" | "rejected" | "revoked";

  full_name: string;
  email: string;
  phone?: string | null;
  company?: string | null;

  profile_type?: string | null;
  service_category?: string | null;
  service_summary?: string | null;
  intended_use?: string | null;
  requested_scope?: string | null;
  message?: string | null;

  privacy_accepted: boolean;
  gdpr_consent: boolean;

  submission_language: "es" | "en" | "de" | "fr";
  external_id?: string | null;

  captcha_provider?: "turnstile" | "recaptcha" | null;
  captcha_verified: boolean;
  captcha_hostname?: string | null;

  created_at: string;
  updated_at: string;

  reviewed_at?: string | null;
  reviewed_by?: string | null;
  admin_notes?: string | null;
  rejection_reason?: string | null;

  invite_token?: string | null;
  invite_expires_at?: string | null;
};
```

## 7. Canonical public API

```http
POST /api/public/access-requests
```

### Synergi request payload

```json
{
  "org_id": "uuid",
  "product": "synergi",
  "source": "landing",
  "external_id": "private_estates_landing_synergi_...",
  "full_name": "Nombre Apellido",
  "email": "user@example.com",
  "service_category": "real_estate_agent",
  "service_summary": "Trabajo con clientes compradores premium en Mallorca.",
  "privacy_accepted": true,
  "gdpr_consent": true,
  "submission_language": "es",
  "captcha_provider": "turnstile",
  "captcha_token": "..."
}
```

### Data Lab request payload

```json
{
  "org_id": "uuid",
  "product": "data_lab",
  "source": "landing",
  "external_id": "private_estates_landing_datalab_...",
  "full_name": "Nombre Apellido",
  "email": "user@example.com",
  "profile_type": "investor",
  "requested_scope": "strategic_overview",
  "intended_use": "Quiero analizar señales de mercado e inversión.",
  "privacy_accepted": true,
  "gdpr_consent": true,
  "submission_language": "es",
  "captcha_provider": "turnstile",
  "captcha_token": "..."
}
```

### Success response

```json
{
  "status": "submitted",
  "request_id": "uuid",
  "message": "Access request submitted"
}
```

## 8. Compatibility endpoints

Existing endpoint names may remain temporarily as wrappers:

```text
POST /api/public/data-lab-access-requests
POST /api/public/partner-admissions
```

Wrapper behavior:

```text
/data-lab-access-requests → product=data_lab, source=landing
/partner-admissions      → product=synergi, source=landing
```

The canonical implementation should live in `AccessRequestService`.

## 9. Turnstile verification

Extend `backend/services/captcha_verification_service.py`.

Expected behavior:

```text
provider = turnstile
secret = TURNSTILE_SECRET_KEY
verify_url = TURNSTILE_VERIFY_URL or Cloudflare default
```

Default verify URL:

```text
https://challenges.cloudflare.com/turnstile/v0/siteverify
```

Verification request fields:

```text
secret
response
remoteip optional
```

Errors:

```text
400 Missing Turnstile token
400 Turnstile verification failed
500 TURNSTILE_SECRET_KEY is not configured
```

## 10. Nexus admin workflow

Later phase, not required for initial intake, but the backend should already model the future states.

Admin actions:

```http
GET  /api/access-requests
GET  /api/access-requests/{id}
POST /api/access-requests/{id}/approve
POST /api/access-requests/{id}/reject
POST /api/access-requests/{id}/revoke
```

Approval side effects:

```text
status = approved
reviewed_at set
reviewed_by set
invite_token generated
invite_expires_at set
approval email sent
```

Rejection side effects:

```text
status = rejected
reviewed_at set
reviewed_by set
rejection_reason optionally stored
rejection email sent
```

## 11. Internal notification email

When a request is created, send an internal notification containing:

```text
Product
Source
Name
Email
Service category or intended use
Language
Request ID
Admin review URL
```

For MVP, the email may only contain a link to Nexus. Approve/reject from email is out of scope.

## 12. Landing integration contract

Landing must eventually post both forms to:

```text
/api/public/access-requests
```

Data Lab:

```ts
product: "data_lab"
source: "landing"
profile_type: "investor"
requested_scope: "strategic_overview"
intended_use: intendedUse
captcha_provider: "turnstile"
captcha_token: turnstileToken
```

Synergi/Partners:

```ts
product: "synergi"
source: "landing"
service_category: serviceCategory
service_summary: serviceSummary
captcha_provider: "turnstile"
captcha_token: turnstileToken
```

## 13. Acceptance criteria

### Backend

- `POST /api/public/access-requests` creates a pending request for Data Lab.
- `POST /api/public/access-requests` creates a pending request for Synergi.
- Missing captcha token with provider `turnstile` returns an error.
- Invalid source/product combination returns an error.
- `privacy_accepted=false` or `gdpr_consent=false` is rejected.
- Existing public valuation request behavior does not regress.
- Existing public CTA lead endpoint does not regress.
- Tests pass.

### Frontend later

- Turnstile visible in Data Lab form.
- Turnstile visible in Synergi/Partners form.
- Submit blocked without token.
- Payload uses canonical endpoint and fields.
