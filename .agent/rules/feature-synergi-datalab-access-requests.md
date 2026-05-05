# Rule — Synergi/Data Lab Access Requests

## Feature

Centralized access requests for Anclora Synergi and Anclora Data Lab, managed from Nexus.

## Mandatory constraints

- Nexus is the source of truth for access request status.
- Do not add `private_estates_web` as a source.
- Valid sources are only: `landing`, `synergi_app`, `data_lab_app`.
- Valid products are only: `synergi`, `data_lab`.
- Do not duplicate approval logic inside Synergi or Data Lab.
- Do not break existing seller/buyer/valuation intake flows.
- Do not remove reCAPTCHA compatibility while extending captcha support to Turnstile.
- Do not call Cloudflare from tests; mock captcha verification.
- Do not merge old backup branches wholesale. Use them only as reference.

## Required implementation order

1. Database/model contract.
2. Backend service and public endpoint.
3. Turnstile server-side verification.
4. Compatibility wrappers if needed.
5. Tests.
6. Execution report.
7. Admin UI and decision emails only after intake is stable, unless explicitly requested.

## Product/source validation

```text
source = landing      → product can be synergi or data_lab
source = synergi_app  → product must be synergi
source = data_lab_app → product must be data_lab
```

## Done criteria

- `POST /api/public/access-requests` works for Data Lab and Synergi.
- Invalid captcha fails.
- Invalid product/source combination fails.
- Request persists as `pending`.
- Existing public routes keep passing tests.
- SDD execution report is created under `sdd/features/synergi-datalab-access-requests/executions/`.
