# NotebookLM Sync Pack Runbook

Objetivo: regenerar `public/data/notebooklm-territorial.sync.json` a partir del cuaderno activo `Inteligencia Territorial Suroeste Mallorca 2026`, con ownership, ventana de frescura y fallback explícitos.

## Archivos implicados

- `ops/notebooklm-territorial-sync-manifest.json`
- `ops/notebooklm-territorial-sync-raw.json`
- `scripts/build-notebooklm-sync-pack.mjs`
- `scripts/validate-notebooklm-sync-pack.mjs`
- `scripts/notebooklm-sync-ops-summary.mjs`
- `public/data/notebooklm-territorial.sync.json`
- `ops/notebooklm-territorial-sync-status.json`

## Flujo

1. Reautenticar NotebookLM MCP si la sesión ha caducado.
2. Ejecutar las queries del manifiesto contra el notebook activo.
3. Guardar las respuestas en `ops/notebooklm-territorial-sync-raw.json`.
4. Ejecutar:

```bash
node scripts/build-notebooklm-sync-pack.mjs
```

5. Validar y revisar el resumen operativo:

```bash
node scripts/validate-notebooklm-sync-pack.mjs
node scripts/notebooklm-sync-ops-summary.mjs
```

6. Verificar que el cron territorial consumirá el pack regenerado.

## Notas

- `vulnerabilidades.md` queda como fallback.
- La fuente principal del pipeline territorial es `public/data/notebooklm-territorial.sync.json`.
- Owner operativo actual: `Owner / Ops (Toni)`.
- Cadencia recomendada: `lunes` y `jueves` (`Europe/Madrid`).
- SLO de recuperación operativo: `24h`.
- El único bloqueo para automatización 100% autónoma sigue siendo la sesión web de Google requerida por NotebookLM MCP.
