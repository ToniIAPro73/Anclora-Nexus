# Agent A - DB Prompt (ANCLORA-FCCC-001)

Objective:
- Validate whether Supabase migration is required.
- If required, define minimal additive migration and verification SQL.
- If not required, document explicit rationale and keep migration skipped.

Checks:
1) Schema readiness for finops-and-commercial-command-center.
2) Required indexes for expected query paths.
3) Rollback safety and verification script.
