# BASELINE OBLIGATORIO QA/GATE (todas las features nuevas)

Uso obligatorio:
- Copiar o referenciar este baseline en cada prompt `agent-d-qa` y `gate-final` de cualquier feature nueva.
- Este baseline prevalece sobre plantillas antiguas sin validación de entorno/i18n.
- Complementar con: `.antigravity/prompts/features/_feature-delivery-baseline.md`.

## 1) Validación de entorno (obligatoria)
- Leer `.env` y `frontend/.env.local`.
- Confirmar que backend y frontend apuntan al mismo Supabase (`SUPABASE_URL` vs `NEXT_PUBLIC_SUPABASE_URL`).
- Prohibido usar `project_ref` hardcodeado o heredado de conversaciones/incidentes.
- Prohibido usar cualquier `project_ref` no presente en `.env*` (si ocurre: `QA_INVALID_ENV_SOURCE`).
- Reportar en QA/Gate el `project_ref` efectivo derivado de `.env*` y la evidencia usada.
- Si aparece cualquier referencia a otro proyecto durante QA, invalidar ejecucion y marcar `QA_INVALID_ENV_SOURCE`.
- Si hay mismatch: reportar `ENV_MISMATCH` y detener.

## 2) Validación i18n (obligatoria)
- Todo texto nuevo/modificado visible en UI debe existir en:
  - `es`
  - `en`
  - `de`
  - `ru`
- Si falta alguna key: reportar `I18N_MISSING_KEYS` con listado exacto.

## 3) Reglas de decisión en Gate
- Si `ENV_MISMATCH` != none -> NO-GO.
- Si `I18N_MISSING_KEYS` != none -> NO-GO.
- Si `MIGRATION_NOT_APPLIED` != none -> NO-GO.
- Si `VISUAL_REGRESSION_P0` != none -> NO-GO.
- Si `QA_INVALID_ENV_SOURCE` != none -> NO-GO.
- Solo emitir GO cuando ambos estén en verde.

## 4) Validación visual/layout (obligatoria)
- Validar que no hay:
  - Solapes de texto, chips, badges, botones o cabeceras.
  - Dropdowns fuera de contenedor visible.
  - Scroll vertical innecesario en desktop para vistas principales.
- Validar consistencia de tipografía y spacing con el dashboard existente.
- Validar contrato global de botones (`btn-create` para crear, `btn-action` para no-creacion).
- Si hay regresión visual crítica: reportar `VISUAL_REGRESSION_P0`.

## 5) Validación de migración aplicada (obligatoria)
- Confirmar que las tablas/columnas esperadas existen en el entorno objetivo.
- Si Agent B/C/D se ejecuta sin migración aplicada, bloquear con `MIGRATION_NOT_APPLIED`.
- QA debe listar exactamente que migraciones SQL de la feature se verificaron como aplicadas.
- Gate no puede emitir GO si falta evidencia de aplicacion de migraciones SQL en el proyecto validado.

## 6) Limpieza de scripts temporales (obligatoria)
- Antes de emitir GO, QA/Gate debe verificar que no quedan scripts temporales de pruebas/diagnostico creados durante la iteracion.
- Si existen artefactos temporales sin justificar, reportar `TEST_ARTIFACTS_NOT_CLEANED`.
- `TEST_ARTIFACTS_NOT_CLEANED` implica NO-GO hasta limpieza.
