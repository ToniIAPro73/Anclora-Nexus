# ANCLORA-CDLG-001 — Spec Migration

## DB Impact
v1 has no mandatory schema changes.

## Notes
- If future versions require DB persistence (terminology registry/audit log), define explicit migration IDs and rollback strategy.
- Until then, mark DB as `DB_NOT_REQUIRED_V1`.

