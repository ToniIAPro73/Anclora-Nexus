# ANCLORA-ARDP-001 Backend Contract v1

## Existing Contracts Preserved

- `POST /api/access-requests/{request_id}/approve`
- `POST /api/access-requests/{request_id}/reject`
- `GET /api/access-requests/{request_id}/audit`
- `GET /api/access-requests`
- `GET /api/access-requests/{request_id}`

Approve/reject request bodies must not include `reviewed_by`.

## New Endpoint

### `GET /api/access-requests/{request_id}/lifecycle`

Returns derived lifecycle state for a single request.

Requirements:

- authenticated user;
- same reviewer permission as review operations;
- `org_id` scoped;
- `404` when request is not found in org.

Response shape:

```json
{
  "request_id": "uuid",
  "status": "approved",
  "decision_status": "approved",
  "provisioning_status": "invite_ready",
  "email_status": "failed",
  "reviewed_by": "user-id",
  "reviewed_at": "2026-05-06T10:00:00Z",
  "invite_expires_at": "2026-05-20T10:00:00Z",
  "retry_available": true,
  "last_event_at": "2026-05-06T10:00:10Z"
}
```

### `POST /api/access-requests/{request_id}/decision-email/retry`

Retries decision email delivery for a decided request.

Requirements:

- authenticated reviewer permission;
- `404` when request not found in org;
- `409` when request is pending or latest derived email status is `sent`;
- no mutation of original decision fields;
- audit retry request and outcome;
- provider failures return a retryable result without rolling back the decision.

## Service Contract

`AccessRequestService` adds:

- `get_lifecycle(org_id, request_id)`
- `retry_decision_email(org_id, request_id, reviewer_id)`

Approval path prepares invite intent using existing fields:

- if `invite_token` is absent, generate one;
- if `invite_expires_at` is absent, set a bounded expiry;
- do not create product accounts;
- do not overwrite existing invite fields.

## Error Contract

- `401`: missing/invalid auth from existing auth dependency.
- `403`: authenticated but not reviewer/manager.
- `404`: org-scoped request not found.
- `409`: invalid transition or retry blocked.
