# INDEX: NEXUS MVP V1

**Feature ID**: ANCLORA-NXMVP-001  
**Version**: 1.0  
**Status**: Defined  
**Priority**: ALTA

## Document Map

| Documento | Proposito |
|---|---|
| `sdd/features/nexus-mvp-v1/nexus-mvp-v1-spec-v1.md` | Especificacion funcional y operativa del MVP |
| `sdd/features/nexus-mvp-v1/prompts/nexus-mvp-v1-prompt.md` | Prompt funcional de la feature dentro de SDD |
| `.agent/rules/feature-nexus-mvp-v1.md` | Reglas inmutables de alcance y rollout |
| `.agent/skills/features/nexus-mvp-v1/SKILL.md` | Skill operativa para implementar cambios compatibles con el MVP |
| `.antigravity/prompts/features/nexus-mvp-v1/feature-nexus-mvp-v1-v1.md` | Prompt principal de ejecucion |

## Objetivo

Reducir `Anclora Nexus` a una superficie inicial enfocada en captacion de propiedades, captacion de compradores y seguimiento comercial diario, sin eliminar las capacidades ya construidas fuera del MVP.

## Alcance v1

- Sidebar reducida al flujo operativo esencial.
- Priorizacion del trabajo diario sobre sellers, buyers/leads, properties y tasks.
- Prospection mantenida solo como capa ligera de soporte.
- Resto de features fuera de la navegacion principal pero preservadas en codigo y rutas.

## Fuera de alcance v1

- Borrado de features existentes.
- Rediseño visual global.
- Replanteamiento completo de modelos de datos.
- Activacion de nuevos workstreams ejecutivos, de partners o de observabilidad avanzada.
