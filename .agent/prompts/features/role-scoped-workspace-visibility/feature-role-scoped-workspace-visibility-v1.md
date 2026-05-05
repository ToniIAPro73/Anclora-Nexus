PROMPT: Implementar feature `role-scoped-workspace-visibility` siguiendo SDD v2.

- Leer:
  - `sdd/features/role-scoped-workspace-visibility/role-scoped-workspace-visibility-INDEX.md`
  - `sdd/features/role-scoped-workspace-visibility/role-scoped-workspace-visibility-spec-v1.md`
  - `sdd/features/role-scoped-workspace-visibility/role-scoped-workspace-visibility-spec-migration.md`
  - `.agent/rules/feature-role-scoped-workspace-visibility.md`
- Ejecutar:
  1. Migración SQL (`assigned_user_id` + RLS).
  2. Backend assignment explícito.
  3. Frontend role-scope filters.
  4. Pruebas de regresión owner/manager/agent.
- Salida obligatoria:
  - lista de archivos modificados
  - riesgos y rollback
  - checklist de QA.
