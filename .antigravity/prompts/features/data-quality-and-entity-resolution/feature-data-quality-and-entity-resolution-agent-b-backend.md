PROMPT: Implementa el bloque Backend de `ANCLORA-DQER-001`.

CONTEXTO:
- Usa `.antigravity/prompts/features/data-quality-and-entity-resolution/feature-data-quality-and-entity-resolution-shared-context.md`.
- El contrato DB viene fijado por Agent A.

LECTURAS:
1) `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-spec-v1.md`
2) `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-test-plan-v1.md`

TAREAS:
1) Crear endpoints:
- `GET /api/dq/issues`
- `GET /api/dq/metrics`
- `POST /api/dq/resolve`
- `POST /api/dq/recompute`
2) Implementar servicio de similitud y candidatos.
3) Implementar workflow de resolución y log auditable.
4) Aplicar aislamiento por `org_id`.

ALCANCE:
- `backend/*`
- `sdd/features/data-quality-and-entity-resolution/*` (ajustes API si imprescindibles)

PROHIBIDO:
- `supabase/migrations/*`
- `frontend/*`

CRITERIO DE PARADA:
- Backend compila y rutas registradas.
