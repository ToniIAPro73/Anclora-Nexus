---
trigger: always_on
---

# Feature Rules: Prospection Unified Workspace v1

## Jerarquia normativa
1) `sdd/core/constitution-canonical.md`
2) `.agent/rules/workspace-governance.md`
3) `.agent/rules/anclora-nexus.md`
4) `sdd/features/prospection-unified-workspace/prospection-unified-workspace-spec-v1.md`

## Reglas inmutables

- Mantener scope estricto por `org_id`.
- Respetar visibilidad por rol ya definida en RSWV:
  - `owner/manager`: vista completa de org.
  - `agent`: solo asignado.
- No duplicar logica de origen: reutilizar `source_system` y `source_portal`.
- No degradar endpoints existentes de prospection actual durante v1.

## Reglas de implementacion

- Priorizar agregacion backend antes de montar UI compleja.
- Asegurar paginacion y filtros consistentes en los tres paneles.
- Toda accion rapida debe dejar trazabilidad.

