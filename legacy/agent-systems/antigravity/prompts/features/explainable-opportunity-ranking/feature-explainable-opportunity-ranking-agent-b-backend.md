# Agent B - Backend Prompt (ANCLORA-EOR-001)

Objetivo:
- Implementar `GET /api/prospection/opportunities/ranking`.
- Devolver ranking ordenado, explainability y `next_action`.

Contrato minimo:
- Query params: `limit`, `min_opportunity_score`, `match_status`.
- Response: `items[]`, `total`, `limit`, `scope`.
- Item: `opportunity_score`, `priority_band`, `drivers`, `top_factors`, `next_action`.

Restricciones:
- Scope por rol/org obligatorio.
- Manejo resiliente ante campos opcionales.
