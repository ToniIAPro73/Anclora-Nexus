# Spec Migration - Territorial Sync Control Plane

## Impacto
- `scripts/build-notebooklm-sync-pack.mjs` ahora escribe también status.
- nuevo script `scripts/validate-notebooklm-sync-pack.mjs`.
- `ops/notebooklm-territorial-sync-manifest.json` incorpora freshness y source refs.
- el cron territorial consume el status como gate de ejecución.
- Intelligence expone el estado por API y UI.
