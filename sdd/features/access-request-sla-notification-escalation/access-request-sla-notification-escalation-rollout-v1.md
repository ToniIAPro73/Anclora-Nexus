# Rollout v1 - Access Request SLA & Notification Escalation

## Rollout Plan

1. **Phase 1: Backend Deployment**
    - Deploy backend routes and service updates.
    - Run initial manual scan via API to verify logic.
2. **Phase 2: Frontend Deployment**
    - Deploy UI changes to the dashboard.
    - Enable SLA visibility for reviewers.

## Rollback Plan

1. **Frontend Rollback:** Revert UI changes if bugs are found in the dashboard.
2. **Backend Rollback:** Revert backend routes. Audit logs will persist but won't be generated anymore.

## Migration

No SQL migration required as we use existing `audit_log` table and `resource_id`/`resource_type` patterns.
