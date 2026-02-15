PROMPT: Implementa el bloque Backend de `ANCLORA-CGF-001`.

CONTEXTO:
- Usa `.antigravity/prompts/features/cost-governance-foundation/feature-cost-governance-foundation-shared-context.md`.
- El contrato DB ya viene fijado por Agent A.

LECTURAS:
1) `sdd/features/cost-governance-foundation/cost-governance-foundation-spec-v1.md`
2) `sdd/features/cost-governance-foundation/cost-governance-foundation-test-plan-v1.md`

TAREAS:
1) Crear endpoints:
- `GET /api/finops/budget`
- `PATCH /api/finops/budget`
- `GET /api/finops/usage`
- `GET /api/finops/alerts`
- `POST /api/finops/usage/log` (internal)
2) Implementar servicio de calculo de consumo mensual.
3) Implementar evaluacion warning/hard-stop.
4) Aplicar aislamiento por `org_id`.

ALCANCE PERMITIDO:
- `backend/*`
- `sdd/features/cost-governance-foundation/*` (ajustes de contrato API si imprescindible)

PROHIBIDO:
- `supabase/migrations/*`
- `frontend/*`

CRITERIO DE PARADA:
- Backend compile y rutas registradas.
- Entregar archivos tocados + checks.
