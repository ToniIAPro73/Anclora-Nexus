PROMPT: Ejecuta gate final de release para `ANCLORA-DQER-001`.

PRECONDICIONES:
1) QA validó entorno (`.env` + `frontend/.env.local`) sin refs hardcodeadas.
2) Backend y frontend apuntan al mismo proyecto Supabase.
2.1) QA usó exclusivamente el `project_ref` derivado de `.env*` (cualquier otro ref invalida el QA).
2.2) QA incluyó evidencia explícita de migraciones SQL aplicadas para esta feature.
3) QA validó i18n completa (`es`, `en`, `de`, `ru`) para textos nuevos/modificados.

GATES:
1) Contrato DB/API respetado.
2) Detección de issues y dedupe correctos.
3) Resolución de entidades trazable y reversible.
4) Aislamiento por org validado.
5) Sin bloqueantes P0/P1.
6) SDD + FEATURES + CHANGELOG actualizados.
7) `ENV_MISMATCH` = none.
8) `I18N_MISSING_KEYS` = none.
9) `QA_INVALID_ENV_SOURCE` = none.
10) `MIGRATION_NOT_APPLIED` = none.

SALIDA:
- GO / NO-GO
- si NO-GO, fixes priorizados
- si GO, plan despliegue + rollback
