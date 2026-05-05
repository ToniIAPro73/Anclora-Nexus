# Agent B - Backend Prompt (ANCLORA-FCCC-001)

Objective:
- Implement backend endpoints and service layer contracts for finops-and-commercial-command-center.
- Enforce org and role scope.
- Return explainable and auditable outputs.

Minimum contract:
- Endpoints:
  - `GET /api/command-center/snapshot`
  - `GET /api/command-center/trends`
- Deterministic response shape with `version` and `scope`.
- Role-aware cost visibility (`full` for owner/manager, `limited` for agent).
