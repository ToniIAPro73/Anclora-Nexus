# ANCLORA-ARAN-001 Spec v1

## Problem

The access request console can review, audit, and manage decision lifecycle state, but it does not yet give operations a compact view of queue health. Reviewers need to see aging, volume by product/source, decision email failures, provisioning attention, and the highest-priority requests that need action.

## Objective

Create an operations dashboard for access requests that:

- exposes org-scoped analytics from the backend;
- summarizes status, product, source, aging, review time, lifecycle and retry health;
- highlights attention items;
- lets an admin click an attention item and open the request detail;
- preserves current reviewer identity, permission, and org isolation guarantees.

## Scope

- Add `GET /api/access-requests/analytics/summary`.
- Add response models for analytics summary and attention items.
- Add backend summary generation from real `access_requests` rows and real `audit_log` lifecycle events.
- Add frontend API client types and function.
- Add dashboard/attention queue components to the existing access request page.
- Add localized strings in `es/en/de/ru`.
- Add backend analytics tests and update existing route tests.

## Out of Scope

- Long-term warehouse analytics.
- New SQL migration or materialized aggregate table.
- Cross-org analytics.
- Fake or mock analytics in production UI.
- New charting/UI library.
- Full visual redesign of the console.

## KPI Definitions

- `total_requests`: number of sampled org-scoped requests included in the summary.
- `pending_count`, `approved_count`, `rejected_count`, `cancelled_count`: status counts in the sampled set.
- `requests_by_product`: sampled counts keyed by product.
- `requests_by_source`: sampled counts keyed by source.
- `pending_older_than_24h`: pending requests with `created_at` at least 24 hours old.
- `pending_older_than_72h`: pending requests with `created_at` at least 72 hours old.
- `average_review_time_hours`: mean `reviewed_at - created_at` for valid reviewed requests.
- `decision_email_failed_count`: terminal requests whose latest derived decision-email status is `failed`.
- `decision_email_unknown_count`: terminal requests whose latest derived decision-email status is `unknown`.
- `retry_available_count`: terminal requests whose lifecycle marks retry as available.
- `provisioning_attention_count`: approved requests whose derived provisioning status is not `invite_ready`.

## Attention Queue

Attention items are derived from real request fields and audit-backed lifecycle state:

- pending older than 72h: critical;
- pending older than 24h: warning;
- decision email failed: critical;
- terminal request with unknown decision email status: warning;
- retry available: warning;
- approved but provisioning is not `invite_ready`: warning.

Items include request id, reason, severity, status, product, source, email, timestamps, and age in hours.

## Security and Org Scoping

- Analytics require authentication and the same reviewer/manager permission used by review operations.
- Backend remains source of truth.
- Queries filter by `org_id`.
- Frontend does not send `org_id` or `reviewed_by`.

## Performance Limits

The v1 endpoint uses a bounded recent sample, defaulting to 500 request rows and a bounded audit event read. This avoids unbounded scans while still giving operators useful recent-state visibility. The response includes `sample_size`, `sample_limit`, and `is_sampled`.

## Migration Decision

No SQL migration is planned. The analytics can be derived from existing `access_requests` fields and existing append-only `audit_log` rows.

## Acceptance Criteria

- Analytics endpoint is reviewer-protected and org-scoped.
- Dashboard shows KPI cards, product/source breakdowns, and attention queue.
- Attention items open request detail.
- Existing review, lifecycle, audit, and retry flows continue to pass tests.
- Static checks confirm no `decision.reviewed_by` dependency and no frontend approve/reject `reviewed_by` payload.
