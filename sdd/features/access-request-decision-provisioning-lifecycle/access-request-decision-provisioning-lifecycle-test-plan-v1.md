# ANCLORA-ARDP-001 Test Plan v1

## Backend

- Approve prepares invite token and expiry when absent.
- Approve preserves existing invite token and expiry.
- Approve/reject still derive reviewer identity from auth context.
- Lifecycle endpoint returns derived state for approved, rejected, and pending requests.
- Lifecycle endpoint is org scoped.
- Retry endpoint requires reviewer permission.
- Retry endpoint returns `409` for pending requests.
- Retry endpoint returns `409` when latest email status is `sent`.
- Retry endpoint sends decision email when latest status is failed/skipped/unknown.
- Retry endpoint does not mutate decision fields.
- Retry endpoint logs retry request and outcome.

## Frontend

- TypeScript remains valid.
- Lint passes.
- Build passes.
- Static grep confirms frontend approve/reject payloads do not send `reviewed_by`.
- Admin detail UI renders lifecycle state and retry affordance.

## Static Checks

- No `decision.reviewed_by` usage remains.
- No SQL migration added unless documented.
- Permission code exists for new mutation endpoint.

## Browser Smoke

Run a browser smoke when local tooling is available. If browser runtime is unavailable, document the blocker in QA and PR.
