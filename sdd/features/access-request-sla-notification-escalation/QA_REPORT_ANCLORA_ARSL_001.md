# QA Report — ANCLORA-ARSL-001

## Status

Implemented and locally validated on 2026-05-07.

## Contracts Inspected

- `README.md`
- `docs/standards/ANCLORA_INTERNAL_APP_CONTRACT.md`
- `docs/standards/LOCALIZATION_CONTRACT.md`
- `docs/standards/MODAL_CONTRACT.md`
- `docs/standards/UI_MOTION_CONTRACT.md`
- `sdd/contracts/ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md`
- `sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md`
- `sdd/contracts/UI-SURFACE-INTERACTION-CONTRACT.md`
- `.agent/rules/*` inventory, including Synergi/Data Lab access request rules.

## Implementation Summary

- Added reviewer-protected `POST /api/access-requests/sla/scan`.
- Added backend SLA scan logic with deduplication against `audit_log` (24h default window).
- Added SLA alert generation for:
  - Pending requests > 24h (Warning).
  - Pending requests > 72h (Critical).
  - Failed decision emails (Critical).
  - Unknown decision email status (Warning).
  - Retry opportunities (Warning).
  - Provisioning attention (Critical).
- Added `AccessRequestSlaPanel` component to the access request operations dashboard.
- Integrated SLA scan actions and real-time alert visibility in the frontend.
- Fixed frontend lint issues (unused variables, `any` types).
- Fixed missing API exports and prop name mismatches in `AccessRequestsPage`.
- Added localized SLA strings for Spanish, English, German, and Russian.

## Files Changed

- `backend/api/routes/access_requests.py`
- `backend/models/access_requests.py`
- `backend/services/access_request_service.py`
- `backend/tests/test_access_request_sla.py`
- `frontend/src/lib/access-requests-api.ts`
- `frontend/src/app/(dashboard)/access-requests/page.tsx`
- `frontend/src/components/access-requests/AccessRequestSlaPanel.tsx`
- `frontend/src/lib/i18n/translations.ts`
- `sdd/features/access-request-sla-notification-escalation/*`

## Commands and Results

- `PYTHONPATH=. backend/venv/bin/pytest backend/tests/test_access_request_sla.py backend/tests/test_access_request_analytics.py backend/tests/test_access_request_review_routes.py backend/tests/test_access_request_review_service.py backend/tests/test_access_request_permissions.py backend/tests/test_access_request_decision_lifecycle.py backend/tests/test_access_request_decision_email_retry.py`
  - Result: PASS, 46 passed, 11 existing deprecation warnings.
- `npm run frontend:lint`
  - Result: PASS (after fixes).
- `npm run build`
  - Result: PASS (after fixes).
- `grep -Rni "decision.reviewed_by" backend frontend/src --exclude-dir=__pycache__ --exclude-dir=node_modules || true`
  - Result: PASS, no matches.
- `grep -Rni "reviewed_by" frontend/src --exclude-dir=node_modules | sed -n '1,260p'`
  - Result: PASS, matches are for response typing and UI display.
- `grep -RniE "sla|SLA|sla_scan|sla_warning|sla_critical|dedupe|notification_status|audit_only" backend frontend/src sdd/features/access-request-sla-notification-escalation --exclude-dir=__pycache__ --exclude-dir=node_modules | sed -n '1,620p'`
  - Result: PASS, SLA logic and UI present.

## Dedupe Policy

- SLA scan uses a `dedupe_window_hours` (default 24h).
- If an SLA audit event (`access_request.sla_warning` or `access_request.sla_critical`) with the same reason exists within the window, the alert is suppressed to avoid spam.
- Suppression status is visible in the frontend SLA panel.

## Notification Adapter Decision

- Implementation uses **Audit Only** as the primary notification channel in this phase.
- SLA breaches are recorded in the `audit_log` and visible in the dashboard.
- This follows the existing repository pattern for supervised operations before enabling external adapters (Slack/Email).

## Migration Decision

- No SQL migration was added.
- Logic relies on existing `access_requests` timestamps and the append-only `audit_log`.

## Caveats

- SLA scan is manual-trigger in this version (Dashboard button).
- Deduplication relies on the `audit_log` being the source of truth for previous alerts.
