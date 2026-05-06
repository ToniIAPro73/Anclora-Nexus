# ANCLORA-ARDP-001 Spec v1

## Problem

Access request approval and rejection are secured by authenticated reviewer identity and reviewer permission, but the post-decision lifecycle is not operationally explicit enough. Admins need to see whether a request has a decision, whether approval produced an invitation/provisioning intent, whether the decision email was sent or retryable, and what audit events support that state.

## Objective

Add a controlled decision lifecycle layer for `access_requests`:

- derive lifecycle state from existing request fields and real audit events;
- prepare approval invite intent using existing `invite_token` and `invite_expires_at` fields;
- expose lifecycle retrieval for a single request;
- support safe decision-email retry after approval/rejection;
- surface lifecycle, provisioning, email, retry, and audit state in the admin UI.

## Out of Scope

- Creating real product accounts.
- Adding a new provisioning backend or external invitation provider.
- Replacing existing access request approval/rejection security.
- Persisting a new decision-email status column unless existing fields are insufficient.
- Redesigning the admin console.
- Faking audit data.

## Current Architecture Findings

- `approve` and `reject` derive `reviewed_by` from authenticated backend user identity.
- Reviewer permission is enforced by `require_access_request_reviewer`.
- `access_requests` already includes `invite_token` and `invite_expires_at`.
- Decision email sending exists in `backend/services/access_request_email_service.py`.
- Decision email result is currently returned transiently and audit events are stored in `audit_log`.
- The existing audit endpoint reads real `audit_log` rows scoped by `org_id` and request id.

## Lifecycle State Model

Lifecycle state is derived, not separately stored:

- `request_id`
- `status`
- `decision_status`: `pending | approved | rejected | cancelled`
- `provisioning_status`: `not_started | invite_ready | provisioning_pending | not_applicable`
- `email_status`: `not_applicable | sent | failed | skipped | unknown`
- `reviewed_by`
- `reviewed_at`
- `invite_expires_at`
- `retry_available`
- `last_event_at`

Decision email status is inferred from the current send result when available, otherwise from the latest matching audit events.

## Retry Policy

`POST /api/access-requests/{request_id}/decision-email/retry`:

- requires reviewer permission;
- only works for approved or rejected requests;
- is blocked for pending requests;
- is blocked when the latest derived email status is `sent`;
- does not change `status`, `reviewed_by`, `reviewed_at`, or `rejection_reason`;
- records retry request and retry outcome audit events;
- returns sanitized failure status when the provider fails.

## Audit Events

Existing decision events remain:

- `access_request.approved`
- `access_request.rejected`
- `access_request.email_sent`
- `access_request.email_skipped`
- `access_request.email_send_failed`

New lifecycle events:

- `access_request.provisioning_intent_prepared`
- `access_request.decision_email_retry_requested`
- `access_request.decision_email_retry_succeeded`
- `access_request.decision_email_retry_failed`

## Migration Decision

No SQL migration is planned for v1 because the current schema already has request decision fields, invite fields, and append-only audit storage. Email lifecycle status is derived from audit events to avoid duplicating state.

## Acceptance Criteria

- Frontend still does not send `reviewed_by`.
- Approve/reject still use authenticated backend reviewer identity.
- Approval prepares invite token and expiry when absent.
- Lifecycle endpoint returns derived lifecycle state scoped by org.
- Retry endpoint enforces reviewer permission and blocks invalid retry transitions.
- Retry does not mutate the original decision fields.
- UI displays lifecycle/email/provisioning state and retry affordance when available.
- QA and gate documents reflect actual validation.
