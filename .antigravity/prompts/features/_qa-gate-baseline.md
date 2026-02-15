# BASELINE OBLIGATORIO QA/GATE (todas las features nuevas)

## 1) Validación de entorno (obligatoria)
- Leer `.env` y `frontend/.env.local`.
- Confirmar que backend y frontend apuntan al mismo Supabase (`SUPABASE_URL` vs `NEXT_PUBLIC_SUPABASE_URL`).
- Prohibido usar `project_ref` hardcodeado o heredado de conversaciones/incidentes.
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
- Solo emitir GO cuando ambos estén en verde.
