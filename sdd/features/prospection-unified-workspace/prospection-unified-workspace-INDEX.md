# INDEX: PROSPECTION UNIFIED WORKSPACE V1

**Feature ID**: ANCLORA-PUW-001  
**Version**: 1.0  
**Status**: Implemented  
**Priority**: ALTA

## Document Map

| Documento | Proposito |
|---|---|
| `sdd/features/prospection-unified-workspace/prospection-unified-workspace-spec-v1.md` | Especificacion funcional y tecnica |
| `sdd/features/prospection-unified-workspace/prospection-unified-workspace-spec-migration.md` | Migraciones y rollout |
| `sdd/features/prospection-unified-workspace/prospection-unified-workspace-test-plan-v1.md` | Plan de pruebas |
| `sdd/features/prospection-unified-workspace/QA_REPORT_ANCLORA_PUW_001.md` | Resultado QA formal |
| `sdd/features/prospection-unified-workspace/GATE_FINAL_ANCLORA_PUW_001.md` | Decision de gate final |
| `.agent/rules/feature-prospection-unified-workspace.md` | Reglas inmutables de implementacion |
| `.agent/skills/features/prospection-unified-workspace/SKILL.md` | Skill operativa |
| `.antigravity/prompts/features/prospection-unified-workspace/feature-prospection-unified-workspace-v1.md` | Prompt principal |

## Objetivo

Unificar en una sola experiencia operativa la prospeccion manual/widget/PBM para reducir friccion diaria y acelerar conversion comercial, respetando el aislamiento por organizacion y por rol ya desplegado.

## Alcance v1

- Vista unificada de pipeline de prospeccion (manual + PBM + widget).
- Filtros consistentes por fuente, estado comercial y asignacion.
- Acciones operativas rapidas desde una sola pantalla (sin saltos innecesarios).
- Endpoints de acciones rapidas para `followup-task` y `mark-reviewed`.
- Reutilizacion de contratos existentes de `source_system`, `assigned_user_id` y scoring.

## Fuera de alcance v1

- Rediseño visual completo del dashboard.
- Nuevo motor de scoring.
- Cambios en pricing/finops.
