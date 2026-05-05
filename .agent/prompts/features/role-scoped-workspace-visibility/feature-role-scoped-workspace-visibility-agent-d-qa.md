PROMPT: Ejecuta QA de `ANCLORA-RSWV-001` (Role Scoped Workspace Visibility v1).

BASELINE OBLIGATORIO:
- Aplicar `.antigravity/prompts/features/_qa-gate-baseline.md` completo.

TAREAS:
0) Validación de entorno (obligatoria, primer paso)
- Leer `.env` y `frontend/.env.local`.
- Confirmar que backend y frontend apuntan al mismo Supabase (`SUPABASE_URL` vs `NEXT_PUBLIC_SUPABASE_URL`).
- Si hay mismatch: `ENV_MISMATCH` y detener.

1) Validar migración 033 aplicada
- Verificar existencia de columnas:
  - `leads.assigned_user_id`
  - `tasks.assigned_user_id`
  - `properties.assigned_user_id`
- Verificar índices `(org_id, assigned_user_id)`.
- Verificar RLS activado y policies creadas.
- Si falta evidencia: `MIGRATION_NOT_APPLIED`.

2) Validar contrato funcional por rol
- `owner` y `manager`: visión completa en org.
- `agent`: solo filas asignadas.
- Sin exposición cruzada entre agentes.

3) Validar backend intake/routing
- Lead nuevo persistido con `assigned_user_id`.
- Follow-up task con `assigned_user_id`.
- Fallback legacy `notes.routing` solo transitorio.

4) Validar frontend scope
- Listados de leads/tasks/properties respetan rol.
- Campana de notificaciones respeta rol.

5) Validación i18n obligatoria
- Textos nuevos/modificados en UI presentes en `es`, `en`, `de`, `ru`.
- Si falta cualquier key: `I18N_MISSING_KEYS`.

SALIDA:
- Reporte QA con:
  - entorno validado (sí/no)
  - migración aplicada (sí/no + evidencia)
  - defectos P0/P1/P2
  - `ENV_MISMATCH`
  - `I18N_MISSING_KEYS`
  - `MIGRATION_NOT_APPLIED`
  - conclusión GO/NO-GO
