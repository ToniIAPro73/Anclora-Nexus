PROMPT: Implementa el bloque DB de `ANCLORA-POU-001`.

CONTEXTO:
- Usa `.antigravity/prompts/feature-property-origin-unification-shared-context.md`.
- Respeta contrato de `sdd/features/property-origin-unification/property-origin-unification-spec-migration.md`.

LECTURAS:
1) `sdd/features/property-origin-unification/property-origin-unification-spec-v1.md`
2) `sdd/features/property-origin-unification/property-origin-unification-spec-migration.md`
3) `.agent/rules/anclora-nexus.md`

TAREAS:
1) Validar y ajustar migración `020_property_origin_unification.sql`:
- columnas `source_system`, `source_portal`
- checks de dominio
- índices `(org_id, source_system)` y `(org_id, source_portal)`
- backfill desde `notes`
2) Validar rollback `021_property_origin_unification_rollback.sql`.
3) Entregar script SQL de verificación post-migración.

ALCANCE PERMITIDO (estricto):
- `supabase/migrations/*`
- `sdd/features/property-origin-unification/*` (solo si hay que corregir contrato DB)

PROHIBIDO:
- Cualquier archivo en `backend/*`
- Cualquier archivo en `frontend/*`
- Cualquier prompt de otros agentes

CRITERIO DE PARADA:
- Cuando migración+rollback+verificación estén listos, detener ejecución.
- No continuar con API/UI/QA.

CRITERIOS:
- Idempotencia.
- No colisión con schema actual.
- Datos legacy preservados.

SALIDA:
- SQL final + verificación + riesgos DB.
- Lista de archivos tocados (solo DB/spec DB).
