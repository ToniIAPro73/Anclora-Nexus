PROMPT: Ejecuta QA de `ANCLORA-CSL-001`.

TAREAS:
0) Validación de entorno (obligatoria, primer paso):
- Leer `.env` y `frontend/.env.local`.
- Confirmar que backend y frontend apuntan al mismo proyecto (`SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_URL`).
- Prohibido asumir, inventar o arrastrar `project_ref` de conversaciones/incidentes previos.
- Si detectas mismatch, detener QA y reportar `ENV_MISMATCH`.

1) Validar DB migration/backfill/rollback.
2) Validar contratos API (create/update/list properties).
3) Validar formato de moneda y unidad de superficie en UI.
4) Validar no-regresión en properties/prospection.
5) Validar aislamiento org.
6) Validación i18n obligatoria:
- Todo texto nuevo/modificado en UI debe existir en `es`, `en`, `de`, `ru`.
- Si falta cualquier traducción, reportar `I18N_MISSING_KEYS` con listado exacto.

SALIDA:
- Reporte QA con:
  - entorno validado (sí/no)
  - proyecto activo detectado (url)
  - tests ejecutados
  - evidencias
  - defectos P0/P1/P2
  - faltantes de i18n (si aplica)
  - decisión previa al gate.
