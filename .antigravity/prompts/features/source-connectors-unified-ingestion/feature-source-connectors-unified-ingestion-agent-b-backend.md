PROMPT: Implementa el bloque Backend de `ANCLORA-SCUI-001`.

TAREAS:
1) Endpoints:
- `POST /api/ingestion/leads`
- `POST /api/ingestion/properties`
- `GET /api/ingestion/events`
- `GET /api/ingestion/events/{id}`
2) Validación de contrato canónico.
3) Dedupe por `dedupe_key`.
4) Logging de estado y errores.

ALCANCE:
- `backend/*`
- `sdd/features/source-connectors-unified-ingestion/*` (si ajuste menor API)

PARADA:
- Detener al finalizar backend.
