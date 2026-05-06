# QA Report — ANCLORA-ARDP-001

## Status

Implemented and locally validated on 2026-05-06.

## Contracts Inspected

- `README.md`
- `docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`
- `docs/standards/ANCLORA_INTERNAL_APP_CONTRACT.md`
- `docs/standards/UI_MOTION_CONTRACT.md`
- `docs/standards/MODAL_CONTRACT.md`
- `docs/standards/LOCALIZATION_CONTRACT.md`
- `sdd/contracts/ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md`
- `sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md`
- `sdd/contracts/UI-SURFACE-INTERACTION-CONTRACT.md`
- `.agent/rules/*` inventory, including access request feature rules.

## Bóveda / Design System Availability

- Local `~/projects/anclora-design-system` exists and was inspected at file inventory level.
- Local Bóveda paths from the master prompt were not mounted: `~/projects/boveda-anclora`, `~/projects/anclora-boveda`, `~/projects/anclora-vault`, `~/Boveda-Anclora`, `~/Bóveda-Anclora`.
- UI decisions used repository contracts and existing Nexus UI as source of truth.

## Implementation Summary

- Added derived lifecycle model for access requests.
- Added `GET /api/access-requests/{request_id}/lifecycle`.
- Added `POST /api/access-requests/{request_id}/decision-email/retry`.
- Kept reviewer identity backend-derived; no `reviewed_by` client input was added.
- Approval now prepares invite intent using existing `invite_token` and `invite_expires_at` fields when absent.
- Retry enforces reviewer permission, blocks pending/already-sent states, does not mutate original decision fields, and logs retry events.
- Added lifecycle panel and retry action to the access request detail UI.
- Added localized lifecycle/retry strings for Spanish, English, German, and Russian.

## Files Changed

- `backend/api/routes/access_requests.py`
- `backend/models/access_requests.py`
- `backend/services/access_request_service.py`
- `backend/tests/test_access_request_review_routes.py`
- `backend/tests/test_access_request_review_service.py`
- `backend/tests/test_access_request_decision_lifecycle.py`
- `backend/tests/test_access_request_decision_email_retry.py`
- `frontend/src/lib/access-requests-api.ts`
- `frontend/src/app/(dashboard)/access-requests/page.tsx`
- `frontend/src/components/access-requests/AccessRequestDetailPanel.tsx`
- `frontend/src/components/access-requests/AccessRequestLifecyclePanel.tsx`
- `frontend/src/lib/i18n/translations.ts`
- `sdd/features/access-request-decision-provisioning-lifecycle/*`

## Commands and Results

- `PYTHONPATH=. backend/venv/bin/pytest backend/tests/test_access_request_review_routes.py backend/tests/test_access_request_review_service.py backend/tests/test_access_request_permissions.py backend/tests/test_access_request_decision_lifecycle.py backend/tests/test_access_request_decision_email_retry.py`
  - Result: PASS, 38 passed, 11 existing deprecation warnings.
- `npm run frontend:lint`
  - Result: PASS.
- `npm run build`
  - Result: PASS. Next.js emitted dynamic server usage diagnostics for existing cookie-backed routes while completing the build.
- `grep -Rni "decision.reviewed_by" backend frontend/src --exclude-dir=__pycache__ --exclude-dir=node_modules || true`
  - Result: PASS, no matches.
- `grep -Rni "reviewed_by" frontend/src --exclude-dir=node_modules | sed -n '1,260p'`
  - Result: PASS, matches are response/display typing and UI display only.
- `grep -RniE "lifecycle|retry|decision_email|provisioning|invite|ACCESS_REQUEST|FORBIDDEN" backend frontend/src sdd/features/access-request-decision-provisioning-lifecycle --exclude-dir=__pycache__ --exclude-dir=node_modules --exclude-dir=venv | sed -n '1,420p'`
  - Result: PASS, lifecycle/retry and permission-related code present.
- `curl -sS -i http://127.0.0.1:8010/health`
  - Result: PASS, `HTTP/1.1 200 OK`.

## Migration Decision

- No SQL migration was added.
- Existing `access_requests.invite_token`, `access_requests.invite_expires_at`, request decision fields, and append-only `audit_log` support this v1 lifecycle model.

## Browser Smoke

- Built app server started successfully with `PORT=3100 npm run frontend:start`.
- Playwright CLI was attempted via `/home/toni/.agents/skills/playwright/scripts/playwright_cli.sh`.
- Browser smoke was blocked because Chromium distribution `chrome` is not installed at `/opt/google/chrome/chrome`; Playwright suggested `npx playwright install chrome`.

## Caveats

- Lifecycle email status is derived from audit events. Historical decided requests without decision-email audit events may show `unknown` and therefore retryable.
- Retry re-sends the decision email through the existing email service; it does not provision real product accounts.
- Provider failures are sanitized in retry responses as `decision_email_send_failed`.
