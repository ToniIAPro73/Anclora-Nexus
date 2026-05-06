# ANCLORA-ARAN-001 Test Plan v1

## Backend Tests

- Analytics endpoint returns summary for authorized reviewer.
- Analytics endpoint passes `org_id` and limit to service.
- Service counts statuses, product, and source from org-scoped rows.
- Service computes pending aging thresholds with UTC-safe date math.
- Service computes average review time only from valid created/reviewed timestamps.
- Service derives email failure/unknown/retry counts from real audit events.
- Service emits attention items for aging, email, retry, and provisioning issues.
- Existing review, permissions, lifecycle, and retry tests continue to pass.

## Frontend Validation

- `npm run frontend:lint`
- `npm run build`
- Static grep confirms no client-supplied `reviewed_by`.
- Browser smoke when local browser tooling is available.

## Static Checks

- No `decision.reviewed_by`.
- Analytics and attention code present in backend/frontend/SDD.
- No SQL migration unless documented.
