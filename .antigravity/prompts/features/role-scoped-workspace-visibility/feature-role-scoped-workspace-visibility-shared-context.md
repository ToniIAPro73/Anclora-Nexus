# Shared Context — Role Scoped Workspace Visibility

- Owner/Manager: full org visibility.
- Agent: only assigned rows (`assigned_user_id = auth.uid()`).
- Tables: `leads`, `tasks`, `properties`.
- Transitional compatibility: read legacy `notes.routing.assigned_user_id` only for backfill/fallback.
