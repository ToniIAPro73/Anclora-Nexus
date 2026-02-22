---
name: prospection-unified-workspace
description: Implementa un workspace unico para prospeccion (propiedades, buyers y matches) con filtros compartidos, acciones rapidas y visibilidad por rol.
---

# Skill — Prospection Unified Workspace

## Lecturas obligatorias
1) `sdd/core/constitution-canonical.md`
2) `sdd/features/prospection-unified-workspace/prospection-unified-workspace-INDEX.md`
3) `sdd/features/prospection-unified-workspace/prospection-unified-workspace-spec-v1.md`
4) `.agent/rules/feature-prospection-unified-workspace.md`

## Instrucciones
- Implementar primero el endpoint agregador del workspace.
- Reusar contratos de datos existentes antes de crear campos nuevos.
- Aplicar filtrado por rol en backend y frontend.
- Exponer acciones rapidas con trazabilidad.
- Mantener compatibilidad con `/prospection` hasta cierre de feature.

## Stop rules
- No abrir workstreams de rediseño global no ligados a esta feature.
- No introducir bypass del scope por rol.

