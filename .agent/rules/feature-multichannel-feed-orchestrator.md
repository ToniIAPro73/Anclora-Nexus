---
trigger: always_on
---

# Feature Rules: Multichannel Feed Orchestrator v1

## Jerarquia normativa
1) `sdd/core/constitution-canonical.md`
2) `.agent/rules/workspace-governance.md`
3) `.agent/rules/anclora-nexus.md`
4) `sdd/features/multichannel-feed-orchestrator/multichannel-feed-orchestrator-spec-v1.md`

## Reglas inmutables

- Scope por `org_id` obligatorio en todas las operaciones.
- Prohibido publicar sin validacion previa accesible desde UI.
- Toda ejecucion debe dejar trazabilidad de run.
- No romper compatibilidad con ingestion/properties actuales.

## Reglas de implementacion

- Validaciones por canal deben ser declarativas.
- Manejar tablas/columnas opcionales sin caidas 500 evitables.
- Priorizar UX operativa sobre complejidad visual innecesaria.
