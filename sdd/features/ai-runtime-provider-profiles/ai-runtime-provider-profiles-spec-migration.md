# Migration Spec - AI Runtime Provider Profiles v1

## Decision
Migration skipped in v1.

## Rationale
This feature changes runtime configuration, service wiring and operational contracts. No database schema or persisted data shape is modified.

## Rollout Notes
1. Deploy backend code.
2. Set new env variables:
   - `AI_RUNTIME_PROFILE`
   - `GROQ_*`
   - `CLOUDFLARE_*`
   - `INTERNAL_AUDIT_SECRET`
3. Validate `GET /api/intelligence/runtime-profile`.
4. Run a smoke skill execution.

## Rollback
1. Revert code changes.
2. Restore previous env contract if required.
3. Re-run route smoke checks.
