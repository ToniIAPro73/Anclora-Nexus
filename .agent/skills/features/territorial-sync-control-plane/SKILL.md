---
name: territorial-sync-control-plane
description: Valida, publica y expone el estado operativo del sync pack territorial de NotebookLM.
---

# Skill - Territorial Sync Control Plane v1

## Mandatory Reading
1) public/docs/nuevo-enfoque/SOP_NOTEBOOKLM_TERRITORIAL_SYNC_PACK.md
2) sdd/features/territorial-sync-control-plane/territorial-sync-control-plane-INDEX.md
3) sdd/features/territorial-sync-control-plane/territorial-sync-control-plane-spec-v1.md
4) sdd/features/territorial-sync-control-plane/territorial-sync-control-plane-spec-v1_1.md
5) sdd/features/territorial-sync-control-plane/territorial-sync-control-plane-spec-v1_2.md
6) .agent/rules/feature-territorial-sync-control-plane.md

## Instructions
- Editar primero `ops/notebooklm-territorial-sync-raw.json`.
- Ejecutar siempre `npm run ops:notebooklm:build-sync-pack` y luego `npm run ops:notebooklm:validate-sync-pack`.
- Ejecutar despues `npm run ops:notebooklm:ops-summary` para confirmar owner, frescura y fallback.
- No publicar si `ops/notebooklm-territorial-sync-status.json` queda en `error`.
- No considerar cerrado el refresh si faltan `runbook_refs`, owner operativo o `next_action` visible por API.
- Persistir el ultimo estado del pipeline en `ops/territorial-pipeline-status.json`.
- Verificar backend con `GET /api/intelligence/territorial-sync-status`.
- Verificar frontend con la tarjeta de control en `/intelligence`.
