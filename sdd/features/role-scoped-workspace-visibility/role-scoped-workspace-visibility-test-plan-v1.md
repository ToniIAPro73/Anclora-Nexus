# TEST PLAN: ROLE SCOPED WORKSPACE VISIBILITY V1

## 1. Objetivo
Validar que la visibilidad por rol y la asignación por usuario funcionan de forma consistente en DB, backend y frontend.

## 2. Casos críticos

1. Owner ve todos los leads/tasks/properties de su org.
2. Manager ve todos los leads/tasks/properties de su org.
3. Agent A solo ve datos con `assigned_user_id = Agent A`.
4. Agent B no ve datos de Agent A.
5. Nuevo lead desde CTA crea:
   - lead con `assigned_user_id`
   - task follow-up con `assigned_user_id`
6. Campana de notificaciones en agent muestra solo eventos asignados.

## 3. SQL checks

```sql
select id, name, assigned_user_id from public.leads order by created_at desc limit 20;
select id, title, assigned_user_id from public.tasks order by created_at desc limit 20;
select id, address, assigned_user_id from public.properties order by created_at desc limit 20;
```

## 4. Criterio de salida

- Todos los casos críticos en verde.
- Sin regresiones visibles para owner/manager.
- Sin exposición cruzada de datos entre agentes.
