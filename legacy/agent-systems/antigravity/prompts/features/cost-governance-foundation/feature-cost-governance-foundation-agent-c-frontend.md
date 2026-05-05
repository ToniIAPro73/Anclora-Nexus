PROMPT: Implementa el bloque Frontend de `ANCLORA-CGF-001`.

CONTEXTO:
- Usa `.antigravity/prompts/features/cost-governance-foundation/feature-cost-governance-foundation-shared-context.md`.
- Contrato API ya fijado por Agent B.

LECTURAS:
1) `sdd/features/cost-governance-foundation/cost-governance-foundation-spec-v1.md`
2) `sdd/features/cost-governance-foundation/cost-governance-foundation-test-plan-v1.md`

TAREAS:
1) Mostrar estado de presupuesto en Dashboard y/o Settings:
- consumo mes actual
- umbral warning/hard-stop
- alerta activa si aplica
2) Añadir vista de detalle de consumo por capability (tabla o widget).
3) Integrar i18n para nuevos labels.
4) Mantener estilo visual existente sin regresion.

ALCANCE PERMITIDO:
- `frontend/*`
- `sdd/features/cost-governance-foundation/*` (solo ajustes UX/API contract si imprescindible)

PROHIBIDO:
- `supabase/migrations/*`
- `backend/*`

CRITERIO DE PARADA:
- UI funcional conectada al backend.
- Entregar archivos tocados + checklist.
