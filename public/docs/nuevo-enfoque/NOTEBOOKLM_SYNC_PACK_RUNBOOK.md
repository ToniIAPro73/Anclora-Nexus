# NotebookLM Sync Pack Runbook

Objetivo: regenerar `public/data/notebooklm-territorial.sync.json` a partir del cuaderno activo `Inteligencia Territorial Suroeste Mallorca 2026`.

## Archivos implicados

- `ops/notebooklm-territorial-sync-manifest.json`
- `ops/notebooklm-territorial-sync-raw.json`
- `scripts/build-notebooklm-sync-pack.mjs`
- `public/data/notebooklm-territorial.sync.json`

## Flujo

1. Reautenticar NotebookLM MCP si la sesión ha caducado.
2. Ejecutar las queries del manifiesto contra el notebook activo.
3. Guardar las respuestas en `ops/notebooklm-territorial-sync-raw.json`.
4. Ejecutar:

```bash
node scripts/build-notebooklm-sync-pack.mjs
```

5. Verificar que el cron territorial consumirá el pack regenerado.

## Notas

- `vulnerabilidades.md` queda como fallback.
- La fuente principal del pipeline territorial es `public/data/notebooklm-territorial.sync.json`.
- El único bloqueo para automatización 100% autónoma sigue siendo la sesión web de Google requerida por NotebookLM MCP.
