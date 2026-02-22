**Feature ID**: ANCLORA-MFO-001  
**Version**: 1.0  
**Status**: In Progress  
**Priority**: ALTA

## Document Map

| Documento | Proposito |
|---|---|
| `sdd/features/multichannel-feed-orchestrator/multichannel-feed-orchestrator-spec-v1.md` | Especificacion funcional y tecnica |
| `sdd/features/multichannel-feed-orchestrator/multichannel-feed-orchestrator-spec-migration.md` | Migraciones y rollout |
| `sdd/features/multichannel-feed-orchestrator/multichannel-feed-orchestrator-test-plan-v1.md` | Plan de pruebas |
| `.agent/rules/feature-multichannel-feed-orchestrator.md` | Reglas inmutables de implementacion |
| `.agent/skills/features/multichannel-feed-orchestrator/SKILL.md` | Skill operativa |
| `.antigravity/prompts/features/multichannel-feed-orchestrator/feature-multichannel-feed-orchestrator-v1.md` | Prompt principal |

## Objetivo

Publicar cartera en canales externos XML/JSON con validacion previa, visibilidad de estado por canal y trazabilidad de ejecuciones para operacion diaria.

## Alcance v1

- API de workspace de canales feed.
- Validacion por canal con issues.
- Publicacion y dry-run por canal.
- Historial operativo de ejecuciones.
- Pantalla profesional en Operaciones para gestionar todo el ciclo.

## Fuera de alcance v1

- Integraciones certificadas con credenciales reales por canal.
- Mapeos avanzados por pais/mercado.
- Reglas legales locales por jurisdiccion.
