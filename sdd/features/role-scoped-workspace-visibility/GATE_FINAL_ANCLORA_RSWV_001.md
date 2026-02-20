# Gate Final: ANCLORA-RSWV-001

## Decisión
🟢 GO

## Checklist de gate
1. Contrato DB/API (`assigned_user_id` + routing): OK
2. Scope por rol owner/manager/agent: OK
3. P0/P1 abiertos: none
4. Artefactos SDD + rules + skill + prompts: OK
5. `FEATURES.md` y `CHANGELOG.md` actualizados: OK
6. Bloqueantes baseline (`ENV_MISMATCH`, `I18N_MISSING_KEYS`, `MIGRATION_NOT_APPLIED`, `VISUAL_REGRESSION_P0`): none

## Plan de rollback
1. Revertir backend/frontend a commit anterior.
2. En DB:
   - desactivar/eliminar policies RLS de feature,
   - eliminar índices `(org_id, assigned_user_id)`,
   - opcional: eliminar columnas `assigned_user_id` si no hay dependencia operativa.
3. Verificar restauración de accesos y listados.
