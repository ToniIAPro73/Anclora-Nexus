PROMPT: Ejecuta QA de `ANCLORA-CGF-001`.

TAREAS:
0) Validación de entorno (obligatoria, primer paso):
- Leer `.env` y `frontend/.env.local`.
- Confirmar que backend y frontend apuntan al mismo `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_URL`.
- Prohibido asumir o inventar `project_ref`.
- Si detectas mismatch, detener QA y reportar: "ENV_MISMATCH".

1) Validar migracion/backfill/rollback.
2) Validar contratos API FinOps.
3) Validar aislamiento por org.
4) Validar warning/hard-stop.
5) Validar no-regresion en dashboard/prospection/properties/leads.
6) Validación i18n obligatoria:
- Todo texto nuevo/modificado en UI debe estar en `es`, `en`, `de`, `ru`.
- Si falta alguno, reportar `I18N_MISSING_KEYS` con listado exacto.

SALIDA:
- Reporte QA con:
  - entorno validado (sí/no)
  - proyecto activo detectado (url)
  - tests ejecutados
  - evidencias
  - defectos P0/P1/P2
  - faltantes de i18n (si aplica)
  - decision previa al gate.
