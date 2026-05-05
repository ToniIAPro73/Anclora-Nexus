# Master Parallel Prompt — Role Scoped Workspace Visibility

Agent A (DB):
- Crear migración con columnas `assigned_user_id`, índices y RLS.
- Backfill inicial de asignaciones.

Agent B (Backend):
- Asegurar que intake persiste `assigned_user_id` en leads/tasks.
- Ajustar lógica de workload por asignación explícita.

Agent C (Frontend):
- Aplicar scope por rol en fetch de leads/tasks/properties.
- Asegurar campana de notificaciones con el mismo scope.

Agent D (QA):
- Ejecutar test plan owner/manager/agent.
- Reportar riesgos y regresiones.
