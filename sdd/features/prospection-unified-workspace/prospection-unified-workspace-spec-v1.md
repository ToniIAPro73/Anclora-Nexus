# SPEC: PROSPECTION UNIFIED WORKSPACE V1

**Feature ID**: ANCLORA-PUW-001  
**Status**: Specification Phase  
**Owner**: Product + CTO

## 1. Contexto

La prospeccion en Nexus existe en piezas separadas (captacion, matching y gestion de propiedades/contactos). Esto aumenta tiempo operativo y reduce visibilidad real de prioridad comercial.

## 2. Problema

- El equipo alterna entre varias pantallas para una misma operacion.
- Filtros y estados no siempre son equivalentes entre vistas.
- La asignacion por agente y el origen (`source_system`) no se explotan de forma consistente en flujo diario.

## 3. Objetivos

1. Consolidar la operacion de prospeccion en un workspace unico.
2. Reducir clics y cambio de contexto para owner/manager.
3. Mantener visibilidad acotada para agent segun `assigned_user_id`.
4. Preservar contratos de trazabilidad de origen y scoring.

## 4. Requisitos funcionales

### RF-01 Vista unica
- Nueva vista `Prospection Unified Workspace` con paneles: propiedades candidatas, buyers candidatos, matches accionables.

### RF-02 Filtros comunes
- Filtros globales por:
  - `source_system`
  - `org_id`
  - `assigned_user_id`
  - estado comercial
  - rango de score

### RF-03 Acciones rapidas
- Permitir desde la misma vista:
  - crear follow-up task
  - marcar candidate como revisado
  - abrir detalle de propiedad/lead/match sin cambiar de modulo completo

### RF-04 Scope por rol
- `owner/manager`: datos completos de la org.
- `agent`: solo entidades asignadas.

### RF-05 Consistencia de origen
- Mostrar origen unificado (`manual`, `widget`, `pbm`) y portal cuando aplique.

## 5. Requisitos no funcionales

- Tiempo de carga inicial < 2.5s en dataset medio.
- Paginacion server-side en listados > 100 elementos.
- Sin bypass de scope por frontend.

## 6. API/Backend (target)

- Endpoint agregado:
  - `GET /api/prospection/workspace`
    - retorna bloques normalizados: `properties`, `buyers`, `matches`, `totals`.
- Endpoints de acciones:
  - `POST /api/prospection/workspace/actions/followup-task`
  - `POST /api/prospection/workspace/actions/mark-reviewed`

## 7. Frontend (target)

- Nueva ruta:
  - `/(dashboard)/prospection-unified`
- Reutiliza store global para:
  - usuario activo
  - rol activo
  - filtros cross-widget

## 8. Seguridad

- Reusar politicas RLS vigentes.
- Validar en backend `org_id` y rol antes de resolver datos.
- Registrar acciones de usuario en bitacora operativa.

## 9. Criterios de aceptacion

1. Un owner puede operar captacion y matching desde una sola vista.
2. Un agent no puede ver elementos fuera de su asignacion.
3. El origen se presenta de forma consistente en los tres paneles.
4. Se pueden crear tareas de seguimiento desde el workspace.

