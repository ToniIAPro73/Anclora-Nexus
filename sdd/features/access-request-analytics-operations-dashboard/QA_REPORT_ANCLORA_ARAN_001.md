# QA Report — ANCLORA-ARAN-001

## Status

Implemented and locally validated on 2026-05-06.

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

## Bóveda / Design System Availability

- Local `~/projects/anclora-design-system` exists and was inspected by file inventory. The inventory command included `.git` files because the repository has matching paths in metadata; implementation still used Nexus-local UI primitives and contracts.
- Local Bóveda paths from the prompt were not mounted: `~/projects/boveda-anclora`, `~/projects/anclora-boveda`, `~/projects/anclora-vault`, `~/Boveda-Anclora`, `~/Bóveda-Anclora`.
- UI implementation used repository contracts and existing Nexus access request components as source of truth.

## Implementation Summary

- Added reviewer-protected `GET /api/access-requests/analytics/summary`.
- Added backend analytics response and attention item models.
- Added bounded analytics aggregation from real `access_requests` rows and real `audit_log` lifecycle events.
- Added KPI cards, product/source breakdowns, and an attention queue to the access request console.
- Attention items can open/fetch request detail in the existing detail panel.
- Refresh now reloads both list and analytics.
- Added localized analytics strings for Spanish, English, German, and Russian.

## Files Changed

- `backend/api/routes/access_requests.py`
- `backend/models/access_requests.py`
- `backend/services/access_request_service.py`
- `backend/tests/test_access_request_analytics.py`
- `backend/tests/test_access_request_permissions.py`
- `frontend/src/lib/access-requests-api.ts`
- `frontend/src/app/(dashboard)/access-requests/page.tsx`
- `frontend/src/components/access-requests/AccessRequestAttentionQueue.tsx`
- `frontend/src/components/access-requests/AccessRequestOperationsDashboard.tsx`
- `frontend/src/lib/i18n/translations.ts`
- `sdd/features/access-request-analytics-operations-dashboard/*`

## Commands and Results

- `PYTHONPATH=. backend/venv/bin/pytest backend/tests/test_access_request_analytics.py backend/tests/test_access_request_review_routes.py backend/tests/test_access_request_review_service.py backend/tests/test_access_request_permissions.py backend/tests/test_access_request_decision_lifecycle.py backend/tests/test_access_request_decision_email_retry.py`
  - Result: PASS, 42 passed, 11 existing deprecation warnings.
- `npm run frontend:lint`
  - Result: PASS.
- `npm run build`
  - Result: PASS. Next.js emitted existing dynamic server usage diagnostics for cookie-backed routes while completing the build.
- `grep -Rni "decision.reviewed_by" backend frontend/src --exclude-dir=__pycache__ --exclude-dir=node_modules || true`
  - Result: PASS, no matches.
- `grep -Rni "reviewed_by" frontend/src --exclude-dir=node_modules | sed -n '1,260p'`
  - Result: PASS, matches are response/display typing and UI display only.
- `grep -RniE "analytics|attention|aging|average_review|pending_older|retry_available|decision_email_failed" backend frontend/src sdd/features/access-request-analytics-operations-dashboard --exclude-dir=__pycache__ --exclude-dir=node_modules --exclude-dir=venv | sed -n '1,520p'`
  - Result: PASS, analytics and attention code present.
- `curl -sS -i http://127.0.0.1:8010/health`
  - Result: PASS, `HTTP/1.1 200 OK`.

## Performance / Data Limit Decision

- Analytics use a bounded recent sample with default `limit=500` and server clamp at `1000`.
- Audit event read is bounded to `min(limit * 4, 2000)`.
- The response includes `sample_size`, `sample_limit`, and `is_sampled`.

## Migration Decision

- No SQL migration was added.
- Existing `access_requests` fields and append-only `audit_log` support the v1 analytics model.

## Rollout / Rollback

- Rollout: deploy backend endpoint, deploy frontend dashboard, monitor endpoint latency and attention item volume.
- Rollback: remove/revert dashboard components first if UI issues appear; backend endpoint is independent from review/lifecycle operations and can be reverted separately.

## Browser Smoke

- Built app server started successfully with `PORT=3100 npm run frontend:start`.
- Playwright CLI was attempted via `/home/toni/.agents/skills/playwright/scripts/playwright_cli.sh`.
- Browser smoke was blocked because Chromium distribution `chrome` is not installed at `/opt/google/chrome/chrome`; Playwright suggested `npx playwright install chrome`.

## Caveats

- `total_requests` reflects the bounded sample, not a warehouse/global total.
- Historical terminal requests without decision-email audit events can appear as `decision_email_unknown`.
- Attention queue intentionally allows multiple reasons per request when multiple operational issues are present.
