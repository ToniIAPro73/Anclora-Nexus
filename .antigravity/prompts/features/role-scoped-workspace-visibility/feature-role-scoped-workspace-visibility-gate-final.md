PROMPT: Ejecuta gate final de release para `ANCLORA-RSWV-001`.

BASELINE OBLIGATORIO:
- Aplicar `.antigravity/prompts/features/_qa-gate-baseline.md`.

PRECONDICIONES:
1) QA validó entorno (`.env` + `frontend/.env.local`) sin refs hardcodeadas.
2) Migración `033_role_scoped_workspace_visibility.sql` aplicada.
3) Backend y frontend desplegados con cambios de scope por rol.
4) QA i18n en verde (`es`, `en`, `de`, `ru`) para textos nuevos/modificados.

GATES:
1) Contrato DB/API respetado (`assigned_user_id` + routing operativo).
2) Scope por rol validado:
   - owner/manager ven todo en org.
   - agent solo asignados.
3) Sin bloqueantes P0/P1.
4) SDD + RULES + SKILL + PROMPTS presentes.
5) `FEATURES.md` y `CHANGELOG.md` actualizados a estado release.
6) `ENV_MISMATCH`, `I18N_MISSING_KEYS`, `MIGRATION_NOT_APPLIED`, `VISUAL_REGRESSION_P0` = none.

SALIDA:
- GO / NO-GO
- Si NO-GO: fixes priorizados.
- Si GO: plan de despliegue final + rollback operativo.
