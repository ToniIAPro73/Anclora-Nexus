---
trigger: manual
---

# Feature Rule — StateFox Live Capture

## Feature ID
`ANCLORA-STFX-003`

## Objetivo
Capturar una sesión viva de Telegram Web con StateFox de forma supervisada y reutilizarla para importar resultados al bridge actual.

## Reglas
1. El capturador corre localmente con Playwright, nunca en producción.
2. La sesión se persiste en `ops/statefox-playwright-profile`.
3. La salida queda en `ops/statefox-live-capture.json`.
4. El artifact debe incluir metadata de handoff y validaciones mínimas para operación.
5. El backend solo lee e importa esa captura; no controla Telegram Web remotamente.
6. La API debe exponer disponibilidad e importabilidad de la captura.
7. Toda importación sigue entrando primero en `properties`.
