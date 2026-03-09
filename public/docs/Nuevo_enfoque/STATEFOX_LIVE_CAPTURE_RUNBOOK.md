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
4. En terminal, pulsa `ENTER`.
5. El script guarda `ops/statefox-live-capture.json`.
6. Desde `/intelligence/statefox-bridge`, usar:
   - `Cargar última captura`
   - `Importar última captura`

## Restricciones

- Solo operación local supervisada.
- No se ejecuta en Render ni en producción.
- El artifact local puede contener datos operativos; no debe subirse con capturas reales.
