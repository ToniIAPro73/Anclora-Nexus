PROMPT: Implementa el bloque Backend de `ANCLORA-POU-001`.

CONTEXTO:
- Usa `.antigravity/prompts/feature-property-origin-unification-shared-context.md`.
- Contrato DB ya definido por Agent A.

LECTURAS:
1) `sdd/features/property-origin-unification/property-origin-unification-spec-v1.md`
2) `sdd/features/property-origin-unification/property-origin-unification-spec-migration.md`
3) `.agent/rules/anclora-nexus.md`

TAREAS:
1) `POST/GET/PATCH` de properties:
- soportar `source_system`, `source_portal`
- validar dominio (`manual|widget|pbm`, portal permitido)
2) Mantener fallback legacy desde `notes` para compatibilidad temporal.
3) Garantizar org isolation en queries.
4) No romper contratos actuales consumidos por frontend.

ALCANCE PERMITIDO (estricto):
- `backend/**`
- `sdd/features/property-origin-unification/*` (solo notas técnicas backend)

PROHIBIDO:
- `supabase/migrations/*`
- `frontend/**`
- prompts o artefactos QA

CRITERIO DE PARADA:
- Al cerrar API/servicios/tests backend del bloque B, detener ejecución.
- No implementar UI ni migraciones.

CRITERIOS:
- CRUD properties estable.
- Errores de validación claros (400).
- Sin hardcode de org/roles.

SALIDA:
- Cambios backend + tests unitarios mínimos.
- Lista de archivos tocados (solo backend/spec backend).
