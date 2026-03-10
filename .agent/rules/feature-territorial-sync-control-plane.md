---
trigger: always_on
---

# Feature Rules: Territorial Sync Control Plane v1

## Normative Priority
1) sdd/core/constitution-canonical.md
2) .agent/rules/workspace-governance.md
3) .agent/rules/anclora-nexus.md
4) sdd/features/territorial-sync-control-plane/territorial-sync-control-plane-spec-v1.md
5) sdd/features/territorial-sync-control-plane/territorial-sync-control-plane-spec-v1_1.md
6) sdd/features/territorial-sync-control-plane/territorial-sync-control-plane-spec-v1_2.md

## Rules
- El sync pack territorial sigue siendo la fuente principal del pipeline.
- `vulnerabilidades.md` permanece como fallback, nunca como fuente primaria.
- No editar manualmente `public/data/notebooklm-territorial.sync.json` ni `ops/notebooklm-territorial-sync-status.json`.
- No editar manualmente `ops/territorial-pipeline-status.json`.
- El cron territorial debe rechazar un pack con estado `error`.
- Toda visibilidad de estado debe derivar de manifiesto + raw + build validado.
- El pipeline territorial debe persistir el ultimo resultado operativo con `status`, `started_at`, `finished_at` y `stats`.
- El manifiesto territorial debe declarar `owner_display`, `schedule`, `runbook_refs` y `fallback_policy`.
- El status del control-plane debe exponer `freshness_state`, `next_refresh_due_at`, `runbook_status` y `next_action`.
- Los `runbook_refs` declarados deben existir en el repo para considerar recuperable el refresh territorial.
