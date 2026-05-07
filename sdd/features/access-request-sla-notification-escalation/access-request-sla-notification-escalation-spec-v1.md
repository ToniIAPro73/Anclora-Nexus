# Spec v1 - Access Request SLA & Notification Escalation

## Problem Statement

The current access request operations dashboard is reactive. Reviewers must manually check the console to identify stale requests or failed notifications. There is no proactive alerting or auditable record of SLA violations.

## Business Objective

Enable Nexus to proactively detect operational SLA risks, record them as auditable events, and expose them in the admin console to ensure timely processing of access requests.

## Scope

- Backend SLA scan endpoint (`POST /api/access-requests/sla/scan`).
- Deterministic SLA rules (Pending > 24h/72h, Failed Email, etc.).
- Deduplication of alerts (24h window).
- Persistence of alerts in `audit_log`.
- Frontend SLA panel in Operations Dashboard.
- Support for "Run Scan" action from UI.

## Out of Scope

- Real-time notifications (Slack/Teams) unless existing adapters support them easily.
- Automatic processing/escalation of requests.
- New database tables (prefer `audit_log`).

## SLA Rules

| Condition | Severity | Reason Code |
|-----------|----------|-------------|
| Pending > 24h | Warning | `pending_older_than_24h` |
| Pending > 72h | Critical | `pending_older_than_72h` |
| Decision email status: `failed` | Critical | `decision_email_failed` |
| Decision email status: `unknown` | Warning | `decision_email_unknown` |
| Retry available (terminal request) | Warning | `retry_available` |
| Provisioning attention required | Warning | `provisioning_attention` |

## Deduplication Policy

- A request ID + reason + severity combination will not generate a new `audit_log` entry if one already exists within the last 24 hours.

## Backend Contract

### `POST /api/access-requests/sla/scan`

**Security:** `require_access_request_reviewer` (Manager/Reviewer).

**Response:**
```json
{
  "scan_id": "uuid",
  "generated_at": "iso-date",
  "scanned_count": 500,
  "alerts_created": 2,
  "alerts_suppressed": 5,
  "warning_count": 1,
  "critical_count": 1,
  "notification_status": "audit_only",
  "items": [...]
}
```

## Frontend Contract

- Compact SLA panel in `AccessRequestOperationsDashboard`.
- Button "Run SLA Scan".
- Display alert counts and last scan time.
- Clicking an alert opens the related request.

## Security

- Org-scoped data access.
- Reviewer-only permission enforcement on backend.
- No client-supplied `reviewed_by`.
