# Agent B - Backend Prompt (ANCLORA-GAA-001)

Objective:
- Implement backend endpoints and service layer contracts for guardrailed-automation-and-alerting.
- Enforce org and role scope.
- Return explainable and auditable outputs.

Minimum contract:
- Endpoints:
  - `GET/POST /api/automation/rules`
  - `PATCH /api/automation/rules/{rule_id}`
  - `POST /api/automation/rules/{rule_id}/dry-run`
  - `POST /api/automation/rules/{rule_id}/execute`
  - `GET /api/automation/executions`
  - `GET /api/automation/alerts`
  - `POST /api/automation/alerts/{alert_id}/ack`
- Deterministic response shape with `version` and `scope`.
- Guardrails required: role scope, FinOps hard-stop, per-run cost cap, human checkpoint.
- Audit logging required for rule changes and executions.
