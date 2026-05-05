# Agent B — Backend Prompt

Feature: `synergi-datalab-access-requests`

## Role

You are Agent B. Your responsibility is Nexus backend implementation for centralized Synergi/Data Lab access requests.

Run this prompt only after Agent A has completed the DB/domain contract or after confirming the files exist.

## Read first

```text
sdd/features/synergi-datalab-access-requests/README.md
sdd/features/synergi-datalab-access-requests/spec-v1.md
sdd/features/synergi-datalab-access-requests/implementation-plan-nexus.md
sdd/features/synergi-datalab-access-requests/executions/feature-synergi-datalab-access-requests-01-agent-a-db.md
.agent/rules/feature-synergi-datalab-access-requests.md
.agent/skills/features/synergi-datalab-access-requests/SKILL.md
.antigravity/prompts/features/synergi-datalab-access-requests/feature-synergi-datalab-access-requests-shared-context.md
.antigravity/prompts/features/synergi-datalab-access-requests/feature-synergi-datalab-access-requests-agent-a-db.md
```

## Objective

Implement the backend API and service layer for `AccessRequest` intake.

## Required tasks

### 1. Config

Update `backend/config.py` with Turnstile settings while preserving reCAPTCHA compatibility:

```py
TURNSTILE_SECRET_KEY: str | None = None
TURNSTILE_VERIFY_URL: str = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
```

Do not print or expose secrets.

### 2. Captcha verification

Extend `backend/services/captcha_verification_service.py` to support:

```text
recaptcha
turnstile
```

Required behavior:

- `provider="recaptcha"` keeps current behavior.
- `provider="turnstile"` verifies with Cloudflare siteverify.
- `provider=None` remains non-required where existing flows depend on that behavior.
- Missing token for required provider raises `CaptchaVerificationError`.
- Missing secret for required provider raises `CaptchaVerificationError`.
- Failed provider response raises `CaptchaVerificationError`.

Tests must mock verification. Do not call Cloudflare from tests.

### 3. Service

Create `backend/services/access_request_service.py`.

Implement:

```py
async def create_public_request(org_id: str, data: PublicAccessRequestCreate, remote_ip: str | None = None) -> dict:
    ...
```

Responsibilities:

- Validate product/source via model or service guard.
- Verify captcha.
- Insert into `access_requests` with `status='pending'`.
- Store `captcha_verified=true` when verification succeeds.
- Store provider hostname if available.
- Return inserted id.
- Trigger internal notification if a safe existing service exists. If not, leave explicit TODO and do not block persistence.

### 4. Public route

Add to `backend/api/routes/public.py`:

```http
POST /api/public/access-requests
```

Response:

```json
{
  "status": "submitted",
  "request_id": "...",
  "message": "Access request submitted"
}
```

Error handling:

- Captcha errors → HTTP 400.
- Domain validation errors → HTTP 400/422 according to existing project patterns.
- Unexpected errors → HTTP 500.

### 5. Compatibility wrappers

If the current landing still depends on these endpoints, add or preserve wrappers:

```http
POST /api/public/data-lab-access-requests
POST /api/public/partner-admissions
```

Wrappers must call the same `AccessRequestService`.

Mapping:

```text
data-lab-access-requests → product=data_lab, source=landing
partner-admissions      → product=synergi, source=landing
```

Do not create separate persistence logic.

## Backend contract

Products:

```text
synergi | data_lab
```

Sources:

```text
landing | synergi_app | data_lab_app
```

Statuses:

```text
pending | approved | rejected | revoked
```

## Tests

Add or update tests for:

- Valid Data Lab access request.
- Valid Synergi access request.
- Missing Turnstile token.
- Invalid product/source combination.
- `privacy_accepted=false`.
- `gdpr_consent=false`.
- Existing valuation route non-regression.
- Existing public CTA lead route non-regression if testable.

## Boundaries

- Do not implement Nexus admin UI in this prompt.
- Do not implement approval/rejection emails yet unless already trivial and isolated.
- Do not modify landing.
- Do not modify Synergi/Data Lab app access logic.
- Do not touch seller/buyer/valuation lead intake except shared captcha compatibility.
- Do not add `private_estates_web` as a source.

## Output

Create:

```text
sdd/features/synergi-datalab-access-requests/executions/feature-synergi-datalab-access-requests-02-agent-b-backend.md
```

Include:

- files changed
- endpoint added
- service behavior
- captcha behavior
- tests run
- known limitations
- handoff notes for Agent C or Agent D
