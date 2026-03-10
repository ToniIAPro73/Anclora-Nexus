# StateFox Live Capture — Test Plan v1.1

1. Verificar que `ops/statefox-live-capture.json` incluye metadata de handoff y validación.
2. Verificar `GET /api/intelligence/statefox-bridge/live-capture` con `import_ready=true/false`.
3. Verificar `POST /api/intelligence/statefox-bridge/live-capture/import` rechaza artifacts no válidos.
4. Verificar la UI `/intelligence/statefox-bridge` muestra disponibilidad e importabilidad de la captura.
