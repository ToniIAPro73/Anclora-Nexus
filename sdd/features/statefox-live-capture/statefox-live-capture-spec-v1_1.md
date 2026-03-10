# StateFox Live Capture — Spec v1.1

## Feature ID
`ANCLORA-STFX-003`

## Problema

La captura viva existía, pero dependía demasiado del conocimiento tácito del operador y no dejaba claro si el artifact era importable sin inspección manual.

## Solución

1. Artifact local con `artifact_version`, `capture_mode`, `handoff` y campos de validación.
2. Backend que expone disponibilidad e importabilidad (`import_ready`) de la captura.
3. Importación bloqueada si la captura no es apta para importación.
4. Runbook operativo actualizado con handoff mínimo.
5. UI del bridge con feedback de chars capturados, links públicos y comando SOP.

## No objetivo

No ejecutar Playwright en producción ni automatizar Telegram Web remotamente.
