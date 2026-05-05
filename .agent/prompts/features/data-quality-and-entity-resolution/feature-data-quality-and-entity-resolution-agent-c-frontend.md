PROMPT: Implementa el bloque Frontend de `ANCLORA-DQER-001`.

CONTEXTO:
- Usa `.antigravity/prompts/features/data-quality-and-entity-resolution/feature-data-quality-and-entity-resolution-shared-context.md`.
- Contrato API fijado por Agent B.

LECTURAS:
1) `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-spec-v1.md`
2) `sdd/features/data-quality-and-entity-resolution/data-quality-and-entity-resolution-test-plan-v1.md`

TAREAS:
1) Añadir UI de issues de calidad y candidatos de dedupe.
2) Implementar acciones owner/manager (aprobar/rechazar resolución).
3) Mostrar señales/score explicables.
4) Integrar i18n para todo texto nuevo en `es`, `en`, `de`, `ru`.
5) Mantener estilo visual actual sin regresión.

ALCANCE:
- `frontend/*`
- `sdd/features/data-quality-and-entity-resolution/*` (ajustes UX/API si imprescindibles)

PROHIBIDO:
- `supabase/migrations/*`
- `backend/*`

CRITERIO DE PARADA:
- UI funcional conectada y sin keys faltantes de i18n.
