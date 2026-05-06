# ANCLORA-ARAN-001 Backend Contract v1

## Endpoint

### `GET /api/access-requests/analytics/summary`

Must be registered before dynamic `/{request_id}` routes.

Query:

- `limit`: optional integer, default `500`, minimum `1`, maximum `1000`.

Auth:

- authenticated user;
- reviewer/manager permission via existing access request reviewer dependency.

Response:

```json
{
  "total_requests": 42,
  "pending_count": 12,
  "approved_count": 20,
  "rejected_count": 9,
  "cancelled_count": 1,
  "requests_by_product": { "synergi": 21, "data_lab": 21 },
  "requests_by_source": { "landing": 30, "synergi_app": 8, "data_lab_app": 4 },
  "pending_older_than_24h": 5,
  "pending_older_than_72h": 2,
  "average_review_time_hours": 18.7,
  "decision_email_failed_count": 1,
  "decision_email_unknown_count": 3,
  "retry_available_count": 4,
  "provisioning_attention_count": 1,
  "generated_at": "2026-05-06T18:00:00+00:00",
  "sample_size": 42,
  "sample_limit": 500,
  "is_sampled": false,
  "attention_items": []
}
```

Attention item shape:

```json
{
  "request_id": "uuid",
  "reason": "pending_older_than_72h",
  "severity": "critical",
  "status": "pending",
  "product": "synergi",
  "source": "landing",
  "email": "user@example.com",
  "created_at": "2026-05-03T10:00:00+00:00",
  "reviewed_at": null,
  "age_hours": 80.5
}
```

## Error Contract

- `401`: missing/invalid authentication from existing auth dependency.
- `403`: authenticated but not reviewer/manager.
- `500`: unexpected backend failure.

## Data Rules

- Only request rows with matching `org_id` are included.
- Audit events are filtered by matching `org_id` and `resource_type=access_request`.
- Date math is UTC-based and ignores invalid timestamps for averages.
- No persistent analytics table is introduced in v1.
