# Agent A - DB Prompt (ANCLORA-GAA-001)

Objective:
- Confirm schema gap and apply additive migration for GAA v1.
- Deliver verification checklist and rollback-safe notes.

Checks:
1) Migration `035_guardrailed_automation_and_alerting.sql` created/applied.
2) Tables present: `automation_rules`, `automation_executions`, `automation_alerts`.
3) Indexes by org/status and recency query paths are available.
4) Rollback remains reversible (drop/revert migration only).
