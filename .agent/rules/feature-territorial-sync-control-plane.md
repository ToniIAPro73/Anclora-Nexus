---
trigger: always_on
---

# Feature Rules: Territorial Sync Control Plane v1

## Normative Priority
1) sdd/core/constitution-canonical.md
2) .agent/rules/workspace-governance.md
3) .agent/rules/anclora-nexus.md
4) sdd/features/territorial-sync-control-plane/territorial-sync-control-plane-spec-v1.md

## Rules
- El sync pack territorial sigue siendo la fuente principal del pipeline.
- `vulnerabilidades.md` permanece como fallback, nunca como fuente primaria.
- No editar manualmente `public/data/notebooklm-territorial.sync.json` ni `ops/notebooklm-territorial-sync-status.json`.
- El cron territorial debe rechazar un pack con estado `error`.
- Toda visibilidad de estado debe derivar de manifiesto + raw + build validado.
