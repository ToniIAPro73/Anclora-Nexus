# SPEC MIGRATION: PROSPECTION UNIFIED WORKSPACE V1

**Feature ID**: ANCLORA-PUW-001  
**Status**: Implemented

## 1. Estrategia

La v1 prioriza unificacion operativa sin romper contratos existentes.  
Se minimiza cambio estructural y se apoya en tablas ya desplegadas (`properties`, `leads`, `tasks`, entidades PBM y metadata de origen/asignacion).

## 2. Cambios de esquema propuestos (si aplican tras discovery)

- Opcion aplicada en v1: sin tablas nuevas obligatorias.
- Trazabilidad de acciones rapidas mediante `audit_log` y tabla `tasks`.
- Indices opcionales quedan para tuning posterior segun volumen.

## 3. SQL candidato (placeholder)

```sql
-- Opcional: index de consulta combinada por org/scope/origen
create index if not exists idx_properties_org_assignee_source
  on public.properties(org_id, assigned_user_id, source_system);

create index if not exists idx_leads_org_assignee_source
  on public.leads(org_id, assigned_user_id, source_system);
```

## 4. Backfill

- No se requiere backfill estructural para v1.
- Reusar asignaciones existentes (`assigned_user_id`) y origen (`source_system`/`source_portal`).

## 5. Rollout

1. Deploy backend con endpoint agregado.
2. Deploy frontend con nueva vista y feature flag.
3. Activacion progresiva por org de prueba.
4. Activacion global tras smoke tests.

## 6. Rollback

- Desactivar feature flag de workspace unificado.
- Mantener vistas actuales como fallback inmediato.
- Si se crean indices nuevos, pueden quedarse sin impacto funcional.
