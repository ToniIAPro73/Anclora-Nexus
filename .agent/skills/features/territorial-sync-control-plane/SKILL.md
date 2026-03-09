---
name: territorial-sync-control-plane
description: Valida, publica y expone el estado operativo del sync pack territorial de NotebookLM.
---

# Skill - Territorial Sync Control Plane v1

## Mandatory Reading
1) public/docs/Nuevo_enfoque/SOP_NOTEBOOKLM_TERRITORIAL_SYNC_PACK.md
2) sdd/features/territorial-sync-control-plane/territorial-sync-control-plane-INDEX.md
3) sdd/features/territorial-sync-control-plane/territorial-sync-control-plane-spec-v1.md
4) .agent/rules/feature-territorial-sync-control-plane.md

## Instructions
- Editar primero `ops/notebooklm-territorial-sync-raw.json`.
- Ejecutar siempre `npm run ops:notebooklm:build-sync-pack` y luego `npm run ops:notebooklm:validate-sync-pack`.
- No publicar si `ops/notebooklm-territorial-sync-status.json` queda en `error`.
- Verificar backend con `GET /api/intelligence/territorial-sync-status`.
- Verificar frontend con la tarjeta de control en `/intelligence`.
