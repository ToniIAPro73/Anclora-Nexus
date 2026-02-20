# INDEX: ROLE SCOPED WORKSPACE VISIBILITY V1

**Feature ID**: ANCLORA-RSWV-001  
**Versión**: 1.0  
**Status**: Implemented  
**Prioridad**: CRÍTICA

## Documento Map

| Documento | Propósito |
|---|---|
| `sdd/features/role-scoped-workspace-visibility/role-scoped-workspace-visibility-spec-v1.md` | Especificación funcional/técnica |
| `sdd/features/role-scoped-workspace-visibility/role-scoped-workspace-visibility-spec-migration.md` | Migración, backfill y rollback |
| `sdd/features/role-scoped-workspace-visibility/role-scoped-workspace-visibility-test-plan-v1.md` | Plan de pruebas |
| `.agent/rules/feature-role-scoped-workspace-visibility.md` | Reglas inmutables de implementación |
| `.agent/skills/features/role-scoped-workspace-visibility/SKILL.md` | Skill operativa de la feature |
| `.antigravity/prompts/features/role-scoped-workspace-visibility/feature-role-scoped-workspace-visibility-v1.md` | Prompt principal |
| `.antigravity/prompts/features/role-scoped-workspace-visibility/feature-role-scoped-workspace-visibility-agent-d-qa.md` | Prompt Agent D QA |
| `.antigravity/prompts/features/role-scoped-workspace-visibility/feature-role-scoped-workspace-visibility-gate-final.md` | Prompt Gate Final |
| `sdd/features/role-scoped-workspace-visibility/QA_REPORT_ANCLORA_RSWV_001.md` | Reporte QA |
| `sdd/features/role-scoped-workspace-visibility/GATE_FINAL_ANCLORA_RSWV_001.md` | Acta de gate |

## Objetivo

Aplicar visibilidad y operación por rol en Nexus:

- `owner` y `manager`: visión completa de su organización.
- `agent`: acceso solo a su cartera asignada (leads, tareas y propiedades).

Incluye asignación explícita por `assigned_user_id`, refuerzo de seguridad con RLS y adaptación de backend/frontend para que el comportamiento sea consistente.
