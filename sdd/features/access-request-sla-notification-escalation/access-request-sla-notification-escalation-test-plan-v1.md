# Test Plan v1 - Access Request SLA & Notification Escalation

## Backend Tests

Create `backend/tests/test_access_request_sla.py`:

- **Test SLA Violation Detection:**
    - Mock requests with different ages and statuses.
    - Verify `_detect_sla_violations` identifies all reasons correctly.
- **Test Deduplication:**
    - Run scan once -> verify audit events created.
    - Run scan again (within 24h) -> verify `alerts_created` is 0 and `alerts_suppressed` matches.
    - Run scan after 24h (mocking time) -> verify audit events created again.
- **Test Org Scoping:**
    - Ensure a scan for Org A does not see or alert for requests in Org B.
- **Test Permissions:**
    - Verify only reviewers/managers can call the scan endpoint.

## Frontend Checks

- **Visual Smoke:**
    - Verify SLA panel displays correctly in dashboard.
    - Test "Run SLA Scan" button and loading states.
    - Verify click-through to request details.
- **Build/Lint:**
    - `npm run frontend:lint`
    - `npm run build`

## Acceptance Criteria

- [ ] `POST /api/access-requests/sla/scan` returns correct summary.
- [ ] Audit events are logged for new violations.
- [ ] Deduplication works correctly (24h window).
- [ ] UI shows SLA status and allows running manual scans.
- [ ] Permissions and Org scoping are enforced.
