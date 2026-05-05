PROMPT: Ejecuta QA de `ANCLORA-SCUI-001`.

TAREAS:
0) Validación de entorno (obligatoria, primer paso):
- Leer `.env` y `frontend/.env.local`.
- Confirmar que backend y frontend apuntan al mismo proyecto (`SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_URL`).
- Prohibido asumir o inventar `project_ref`.
- Si hay mismatch, detener QA y reportar `ENV_MISMATCH`.

1) Validar migración/backfill/rollback.
2) Validar contrato API de ingestión.
3) Validar idempotencia/deduplicación.
4) Validar aislamiento org.
5) Validar no-regresión en leads/properties/prospection.
6) Validación i18n obligatoria:
- Todo texto nuevo/modificado en UI debe existir en `es`, `en`, `de`, `ru`.
- Si falta cualquiera, reportar `I18N_MISSING_KEYS`.

SALIDA:
- Reporte QA con:
  - entorno validado (sí/no)
  - proyecto activo detectado (url)
  - evidencias
  - defectos P0/P1/P2
  - faltantes de i18n (si aplica).
