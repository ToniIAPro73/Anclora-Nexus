PROMPT: Ejecuta QA de `ANCLORA-CDLG-001`.

TAREAS:
0) Validación de entorno (obligatoria):
- Leer `.env` y `frontend/.env.local`.
- Confirmar backend/frontend apuntan al mismo proyecto Supabase.
- Si hay mismatch: `ENV_MISMATCH` y detener.
- Prohibido usar `project_ref` externo a `.env*`.

1) Validar contratos backend/frontend implementados.
2) Validar i18n completa (`es`, `en`, `de`, `ru`) para todo texto nuevo/modificado.
3) Validar consistencia visual y de layout:
- tipografía,
- espaciado lateral,
- ausencia de scroll vertical innecesario.
4) Validar contrato de botones:
- `btn-create` para acciones de alta,
- `btn-action` para recalcular/refrescar/recomputar/etc.
5) Validar no-regresión en dashboard/prospection/intelligence/properties/leads.
6) Validar limpieza de artefactos temporales de prueba.

SALIDA:
- Reporte QA con:
  - entorno validado (sí/no),
  - proyecto activo detectado,
  - evidencias y tests,
  - defectos P0/P1/P2,
  - `I18N_MISSING_KEYS` (si aplica),
  - `TEST_ARTIFACTS_NOT_CLEANED` (si aplica),
  - decisión previa al gate.

