# StateFox Live Capture Runbook

## Propósito

Capturar una sesión viva de Telegram Web con resultados visibles de StateFox y reutilizar esa captura para importar propiedades en Anclora Nexus.

## Comando

```bash
npm run ops:statefox:capture
```

## Flujo operativo

1. Se abre Chromium con perfil persistente en `ops/statefox-playwright-profile`.
2. Si Telegram pide login, el operador lo completa.
3. El operador abre `StateFox`, ejecuta la búsqueda deseada y deja los resultados visibles.
4. Verificar visualmente que hay texto de resultados y links `StateFoxBot?startapp=` o URLs públicas `es.statefox.com`.
5. En terminal, pulsa `ENTER`.
6. El script guarda `ops/statefox-live-capture.json`.
7. Desde `/intelligence/statefox-bridge`, usar:
   - `Cargar última captura`
   - `Importar última captura`

## Handoff mínimo

- Artefacto esperado: `ops/statefox-live-capture.json`
- Validación mínima:
  - `raw_text_present = true`
  - `statefox_links_count > 0` o `public_property_links_count > 0`
- Punto de importación: `POST /api/intelligence/statefox-bridge/live-capture/import`
- Pantalla operativa: `/intelligence/statefox-bridge`

## Restricciones

- Solo operación local supervisada.
- No se ejecuta en Render ni en producción.
- El artifact local puede contener datos operativos; no debe subirse con capturas reales.
