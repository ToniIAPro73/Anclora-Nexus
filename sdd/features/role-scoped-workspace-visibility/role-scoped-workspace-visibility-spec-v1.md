# SPEC: ROLE SCOPED WORKSPACE VISIBILITY V1

## 0. Meta
- Feature: role-scoped-workspace-visibility
- Version: v1
- ID: ANCLORA-RSWV-001
- Depends on:
  - `sdd/core/constitution-canonical.md`
  - `sdd/core/product-spec-v0.md`
  - `sdd/features/multitenant/spec-multitenant-v1.md`

## 1. Objetivo
Garantizar que el rol `agent` solo vea y opere datos asignados a su usuario en `leads`, `tasks` y `properties`, mientras `owner` y `manager` mantienen visión completa de su organización.

## 2. Alcance
- Incluye:
  - Columnas `assigned_user_id` en entidades operativas.
  - Backfill inicial desde reglas de routing existentes.
  - RLS por rol para aislamiento real en DB.
  - Ajustes backend para asignación explícita.
  - Ajustes frontend para consultas con scope por rol.
- No incluye:
  - Motor avanzado de reparto por SLA/capacidad.
  - Reasignación masiva asistida por UI.

## 3. Cambios en datos
- Tablas/columnas nuevas:
  - `public.leads.assigned_user_id`
  - `public.tasks.assigned_user_id`
  - `public.properties.assigned_user_id`
- Índices:
  - `(org_id, assigned_user_id)` en las tres tablas.
- Backfill:
  - `leads.assigned_user_id` desde `notes.routing.assigned_user_id` cuando exista UUID válido.
  - `tasks.assigned_user_id` desde `leads.assigned_user_id` vía `related_lead_id`.

## 4. Cambios en backend
- `backend/services/supabase_service.py`
  - Carga de workload por `assigned_user_id` (con fallback legacy en `notes.routing`).
- `backend/agents/nodes/all_nodes.py`
  - Inserción de lead con `assigned_user_id`.
  - Tareas de follow-up/admin con `assigned_user_id`.
  - Conserva `notes.routing` como compatibilidad transitoria.

## 5. Cambios en frontend
- `frontend/src/lib/store.ts`
  - Resolución de scope por sesión (`org_id`, `role`, `user_id`).
  - Filtro por `assigned_user_id` para rol `agent`.
- `frontend/src/components/layout/NotificationPanel.tsx`
  - Carga inicial y realtime filtrados por scope.

## 6. Seguridad
- RLS/policies:
  - `owner/manager`: acceso completo en su `org_id`.
  - `agent`: acceso select/update limitado a filas con `assigned_user_id = auth.uid()`.
- Cumplimiento:
  - Se evita exposición cruzada entre agentes de la misma organización.

## 7. Criterios de aceptación
- [ ] Agent ve solo leads asignados a su user.
- [ ] Agent ve solo tareas asignadas a su user.
- [ ] Agent ve solo propiedades asignadas a su user.
- [ ] Owner y Manager mantienen visión global.
- [ ] Lead nuevo desde CTA/manual se asigna automáticamente a agente menos cargado.
- [ ] Notificaciones no muestran eventos fuera del scope del agente.
