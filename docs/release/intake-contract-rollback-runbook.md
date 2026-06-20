# Rollback Runbook — Intake Contract Access/Commercial Separation

**Date:** 2026-06-21
**Migration:** `20260620120000_access_requests_access_only_constraints.sql`

---

## What can be reverted (code)

All code changes are in git. If issues surface before migration is applied to production:

```bash
# In each affected repo, revert the feature branch commits
git revert <commit-sha-range> --no-edit
```

Key commits to identify: those touching `backend/models/access_requests.py`, `backend/api/routes/public.py`, `backend/services/access_request_service.py`, and frontend files.

## What CANNOT be reverted without a new migration

Once `20260620120000_access_requests_access_only_constraints.sql` is applied to a database, the CHECK constraints are active. Rolling back requires a new forward migration.

**Never edit or delete an applied migration file.**

---

## DB Rollback (new forward migration required)

If constraints must be removed, create:

`supabase/migrations/20260621000000_rollback_access_requests_constraints.sql`

```sql
BEGIN;

ALTER TABLE access_requests
    DROP CONSTRAINT IF EXISTS access_requests_source_check,
    DROP CONSTRAINT IF EXISTS access_requests_product_check,
    DROP CONSTRAINT IF EXISTS access_requests_intake_domain_check,
    DROP CONSTRAINT IF EXISTS access_requests_routing_target_domain_check,
    DROP CONSTRAINT IF EXISTS access_requests_service_interest_check,
    DROP CONSTRAINT IF EXISTS access_requests_request_type_check,
    DROP CONSTRAINT IF EXISTS access_requests_source_product_coherence;

COMMIT;
```

**This must be reviewed and approved before applying to any environment.**

---

## Code Rollback Steps

1. Identify the last known-good commit before the feature branch was merged
2. Create a revert branch from `development`:
   ```bash
   git checkout development
   git checkout -b fix/revert-intake-separation
   git revert <feature-branch-merge-commit> --no-edit
   ```
3. Run quality gates: `pytest` + `tsc --noEmit`
4. Push through the standard pipeline: development → staging → production → main

---

## Contacts

- Before reverting: assess whether the issue is in code vs data vs migration
- Never revert a migration already applied to production without a written incident record
- `SYNCXML_PILOT_AUTO_APPROVE` must remain `false` throughout any rollback procedure
