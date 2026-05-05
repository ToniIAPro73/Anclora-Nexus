# Agent B - Backend Prompt (ANCLORA-DMS-001)

Objective:
- Implement backend endpoints and service layer contracts for deal-margin-simulator.
- Enforce org and role scope.
- Return explainable and auditable outputs.

Minimum contract:
- Endpoints:
  - `POST /api/deal-margin/simulate`
  - `POST /api/deal-margin/compare`
- Deterministic formula and explainable drivers in output.
- Response shape with `version` and `scope`.
