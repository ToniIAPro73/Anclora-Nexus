# Agent B - Backend Prompt (ANCLORA-MFO-001)

Objetivo:
- Implementar API de orquestacion multicanal con validacion, publish/dry-run y trazabilidad de runs.
- Mantener aislamiento por `org_id` y manejo resiliente ante tablas opcionales.

Contrato minimo:
- `GET /api/feeds/workspace`
- `GET /api/feeds/channels/{channel}/config`
- `PATCH /api/feeds/channels/{channel}/config`
- `POST /api/feeds/channels/{channel}/validate`
- `POST /api/feeds/channels/{channel}/publish`
- `GET /api/feeds/runs`

Restricciones:
- Canal invalido debe responder `404`.
- No publicar sin validacion accesible.
- Toda ejecucion debe dejar run auditable.
