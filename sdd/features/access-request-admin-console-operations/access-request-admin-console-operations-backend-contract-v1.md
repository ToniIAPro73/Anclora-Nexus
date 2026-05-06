# Access Request Admin Console Operations — Backend Contract v1

Feature ID: ANCLORA-ARCO-001  
Status: Draft

## Endpoints

### `GET /api/access-requests`

Auth: `get_current_user` + `get_org_id`.

Query params:

- `status?: pending | approved | rejected | cancelled`
- `product?: synergi | data_lab`
- `source?: landing | synergi_app | data_lab_app`
- `email?: string`
- `created_from?: ISO date/datetime string`
- `created_to?: ISO date/datetime string`
- `limit?: 1..100`, default `50`

Rules:

- always scoped by backend `org_id`;
- preserve existing `status`, `product`, `limit`;
- do not accept client `org_id`.

### `GET /api/access-requests/{request_id}`

Auth: `get_current_user` + `get_org_id`.

Rules:

- scoped by backend `org_id`;
- `404` when missing.

### `POST /api/access-requests/{request_id}/approve`

Auth: `require_access_request_reviewer`.

Body:

```json
{
  "admin_notes": "optional"
}
```

Rules:

- `401` unauthenticated;
- `403` authenticated but role below `manager`;
- `404` request not found;
- `409` invalid transition;
- `reviewed_by` and audit `actor_id` are derived from authenticated user id.

### `POST /api/access-requests/{request_id}/reject`

Auth: `require_access_request_reviewer`.

Body:

```json
{
  "admin_notes": "optional",
  "rejection_reason": "required"
}
```

Rules:

- same permission and identity rules as approve;
- `rejection_reason` remains required and non-empty.

### `GET /api/access-requests/{request_id}/audit`

Auth: `require_access_request_reviewer`.

Response: ordered list of real `audit_log` events for `resource_type = access_request`.

Fields:

- `id`
- `timestamp`
- `actor_type`
- `actor_id`
- `action`
- `resource_type`
- `resource_id`
- `details`

Rules:

- scoped by backend `org_id`;
- confirms the request exists under the same org before returning events;
- does not fake or synthesize events.

## Permission Source

Use `organization_members` via existing membership role semantics:

- allowed: `owner`, `manager`;
- denied: `agent`, inactive, missing membership.

No new role table or migration.
