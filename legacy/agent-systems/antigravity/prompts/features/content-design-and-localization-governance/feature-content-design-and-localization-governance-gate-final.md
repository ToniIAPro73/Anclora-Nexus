PROMPT: Ejecuta gate final de release para `ANCLORA-CDLG-001`.

PRECONDICIONES:
1) QA validó entorno desde `.env` + `frontend/.env.local`.
2) Backend/frontend apuntan al mismo proyecto Supabase.
3) i18n completa en `es`, `en`, `de`, `ru`.
4) Sin scripts temporales de prueba en repo.

GATES OBLIGATORIOS:
1) Contrato backend/frontend respetado.
2) Contrato visual respetado (tipografía/layout/spacing).
3) Contrato de navegación escalable respetado.
4) Contrato de botones (`btn-create`/`btn-action`) respetado.
5) Sin bloqueantes P0/P1.
6) `ENV_MISMATCH` = none.
7) `I18N_MISSING_KEYS` = none.
8) `TEST_ARTIFACTS_NOT_CLEANED` = none.
9) SDD + FEATURES + CHANGELOG actualizados.

SALIDA:
- GO / NO-GO
- si NO-GO: fixes priorizados
- si GO: plan despliegue + rollback

