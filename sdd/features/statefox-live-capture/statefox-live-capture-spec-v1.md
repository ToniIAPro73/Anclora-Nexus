# StateFox Live Capture — Spec v1

## Feature ID
`ANCLORA-STFX-003`

## Problema

El bridge actual requiere pegar manualmente bloques crudos de Telegram. Falta una forma supervisada de capturar una sesión viva de StateFox sin introducir automatización en producción.

## Solución

1. Script local Playwright con perfil persistente.
2. Artifact local en `ops/statefox-live-capture.json`.
3. Endpoints backend para leer/importar la última captura.
4. UI del bridge con botones para cargar/importar la captura viva.

## No objetivo

No ejecutar Playwright en Render ni automatizar StateFox sin supervisión humana.
