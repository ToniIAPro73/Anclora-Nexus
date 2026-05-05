# Agent B - Backend Prompt (ANCLORA-SPO-001)

Objective:
- Implement backend endpoints and service layer contracts for source-performance-observatory.
- Enforce org and role scope.
- Return explainable and auditable outputs.

Minimum contract:
- Endpoints:
  - `GET /api/source-observatory/overview`
  - `GET /api/source-observatory/ranking`
  - `GET /api/source-observatory/trends`
- Deterministic response shape with `version` and `scope`.
- Explainable source score and period trends in output.
