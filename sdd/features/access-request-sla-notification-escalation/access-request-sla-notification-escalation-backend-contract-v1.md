# Backend Contract v1 - Access Request SLA & Notification Escalation

## Models & Schemas

To be added to `backend/models/access_requests.py`:

```python
class AccessRequestSlaSeverity(str, Enum):
    WARNING = "warning"
    CRITICAL = "critical"

class AccessRequestSlaReason(str, Enum):
    PENDING_OLDER_THAN_24H = "pending_older_than_24h"
    PENDING_OLDER_THAN_72H = "pending_older_than_72h"
    DECISION_EMAIL_FAILED = "decision_email_failed"
    DECISION_EMAIL_UNKNOWN = "decision_email_unknown"
    RETRY_AVAILABLE = "retry_available"
    PROVISIONING_ATTENTION = "provisioning_attention"

class AccessRequestSlaItem(BaseModel):
    request_id: str
    reason: AccessRequestSlaReason
    severity: AccessRequestSlaSeverity
    status: str
    product: str
    source: str
    email: str
    age_hours: Optional[float] = None
    audit_event_created: bool = False
    suppressed_by_dedupe: bool = False
    last_alert_at: Optional[datetime] = None

class AccessRequestSlaScanResponse(BaseModel):
    scan_id: str
    generated_at: datetime
    scanned_count: int
    alerts_created: int
    alerts_suppressed: int
    warning_count: int
    critical_count: int
    notification_status: str = "audit_only"
    dedupe_window_hours: int = 24
    items: list[AccessRequestSlaItem]
```

## Endpoints

### `POST /api/access-requests/sla/scan`

- **Purpose:** Scans access requests for SLA violations and logs alerts.
- **Permission:** Reviewer/Manager.
- **Org Scoping:** Mandatory.
- **Logic:**
    1. Fetch requests and relevant audit logs.
    2. Identify violations per `AccessRequestSlaReason`.
    3. For each violation, check if a similar `audit_log` event (`access_request.sla_*`) exists for the same `resource_id` and `reason` within `dedupe_window_hours`.
    4. If not found, insert new `audit_log` entry.
    5. Return summary and items.

## Audit Log Actions

- `access_request.sla_warning`
- `access_request.sla_critical`
- `access_request.sla_scan_completed`
