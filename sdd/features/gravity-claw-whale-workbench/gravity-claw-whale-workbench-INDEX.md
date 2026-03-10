# INDEX: GRAVITY CLAW WHALE WORKBENCH V1

**Feature ID**: ANCLORA-GCWW-001  
**Version**: 1.0  
**Status**: Implemented  
**Priority**: ALTA

## Document Map

| Documento | Proposito |
|---|---|
| `sdd/features/gravity-claw-whale-workbench/gravity-claw-whale-workbench-spec-v1.md` | Especificacion funcional y tecnica |
| `sdd/features/gravity-claw-whale-workbench/gravity-claw-whale-workbench-spec-v1_1.md` | Hardening sellers + inteligencia territorial viva |
| `sdd/features/gravity-claw-whale-workbench/gravity-claw-whale-workbench-spec-v1_2.md` | Consola contextual con memoria recuperada |
| `sdd/features/gravity-claw-whale-workbench/gravity-claw-whale-workbench-spec-migration.md` | Impacto de migracion y rollout |
| `sdd/features/gravity-claw-whale-workbench/gravity-claw-whale-workbench-test-plan-v1.md` | Plan de pruebas |
| `sdd/features/gravity-claw-whale-workbench/gravity-claw-whale-workbench-test-plan-v1_1.md` | Plan de pruebas hardening |
| `sdd/features/gravity-claw-whale-workbench/gravity-claw-whale-workbench-test-plan-v1_2.md` | Plan de pruebas consola contextual |
| `sdd/features/gravity-claw-whale-workbench/QA_REPORT_ANCLORA_GCWW_001.md` | Resultado QA formal |
| `sdd/features/gravity-claw-whale-workbench/QA_REPORT_ANCLORA_GCWW_001_v1_1.md` | Resultado QA hardening |
| `sdd/features/gravity-claw-whale-workbench/QA_REPORT_ANCLORA_GCWW_001_v1_2.md` | Resultado QA consola contextual |
| `sdd/features/gravity-claw-whale-workbench/GATE_FINAL_ANCLORA_GCWW_001.md` | Decision de gate final |
| `sdd/features/gravity-claw-whale-workbench/GATE_FINAL_ANCLORA_GCWW_001_v1_1.md` | Gate final hardening |
| `sdd/features/gravity-claw-whale-workbench/GATE_FINAL_ANCLORA_GCWW_001_v1_2.md` | Gate final consola contextual |
| `.agent/rules/feature-gravity-claw-whale-workbench.md` | Reglas inmutables de implementacion |
| `.agent/skills/features/gravity-claw-whale-workbench/SKILL.md` | Skill operativa |
| `.antigravity/prompts/features/gravity-claw-whale-workbench/feature-gravity-claw-whale-workbench-v1.md` | Prompt principal |
| `.antigravity/prompts/features/gravity-claw-whale-workbench/feature-gravity-claw-whale-workbench-v1_2.md` | Prompt extension contextual |

## Objetivo

Convertir Gravity Claw en una mesa de trabajo comercial reutilizable para sellers de alta prioridad: dossier, drafts multicanal, briefing de llamada, resumen de contexto y registro manual de interacciones desde una sola ficha.

## Alcance v1

- Endpoint agregado `GET /api/sellers/{seller_id}/workbench`.
- `generate-dossier` ampliado para producir email, WhatsApp, call brief y context brief.
- Ficha lateral de seller con logging manual de interacciones.
- Persistencia de todos los artefactos en `seller_interactions`.

## Fuera de alcance v1

- Memoria vectorial/pgvector.
- Generacion PDF nativa.
- Envio automatico a Gmail/Outlook/WhatsApp Business.

## Alcance v1.2

- La workbench deja de ser solo registro y pasa a exponer consola comercial accionable.
- El drawer muestra canal recomendado, siguiente paso, readiness y highlights de memoria recuperada.
