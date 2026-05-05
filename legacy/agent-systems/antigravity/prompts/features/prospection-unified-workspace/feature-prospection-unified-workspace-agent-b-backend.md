# Agent B - Backend Prompt (ANCLORA-PUW-001)

Objetivo:
- Consolidar contrato backend del workspace unificado y acciones operativas.

Contrato minimo:
- `GET /api/prospection/workspace`
- `POST /api/prospection/workspace/actions/followup-task`
- `POST /api/prospection/workspace/actions/mark-reviewed`

Requisitos:
- Scope por `org_id` y rol en toda consulta.
- Respuesta normalizada en bloques `properties`, `buyers`, `matches`, `totals`.
- Trazabilidad de acciones (task + audit log).
