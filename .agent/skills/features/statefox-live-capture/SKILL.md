# SKILL: StateFox Live Capture

## Propósito

Reducir fricción operativa entre Telegram Web y el bridge de StateFox mediante una captura viva supervisada.

## Flujo

1. Ejecutar `npm run ops:statefox:capture`.
2. Completar login si hace falta y mostrar resultados de StateFox.
3. Confirmar captura desde terminal.
4. Guardar `ops/statefox-live-capture.json`.
5. Importar desde `/intelligence/statefox-bridge`.

## Verificación

1. Existe `ops/statefox-live-capture.json`.
2. `GET /api/intelligence/statefox-bridge/live-capture` responde 200.
3. `POST /api/intelligence/statefox-bridge/live-capture/import` importa la última captura.
