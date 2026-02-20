# MIGRATION SPEC: ROLE SCOPED WORKSPACE VISIBILITY V1

## Objetivo
Migrar a modelo de asignación explícita por usuario y activar RLS por rol para `leads`, `tasks` y `properties`.

## Cambios SQL
1. Añadir `assigned_user_id UUID NULL` en:
   - `public.leads`
   - `public.tasks`
   - `public.properties`
2. Añadir índices `(org_id, assigned_user_id)`.
3. Backfill:
   - Leads desde `notes.routing.assigned_user_id`.
   - Tasks desde `related_lead_id -> leads.assigned_user_id`.
4. Activar RLS y crear policies de select/update/insert por rol.

## Rollback
1. Desactivar y eliminar policies creadas por esta feature.
2. Eliminar índices `(org_id, assigned_user_id)`.
3. Eliminar columnas `assigned_user_id` (solo si no hay dependencias).

## Validación post-migración
1. `owner`/`manager` listan datasets completos de su org.
2. `agent` solo obtiene filas asignadas.
3. Inserciones de lead/task desde backend rellenan `assigned_user_id`.
