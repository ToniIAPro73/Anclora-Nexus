# TEST PLAN: PROSPECTION UNIFIED WORKSPACE V1

**Feature ID**: ANCLORA-PUW-001  
**Status**: Draft

## 1. Unit tests

- Normalizacion de bloques `properties/buyers/matches`.
- Merge de filtros globales con filtros locales de panel.
- Reglas de visibilidad por rol (`owner/manager` vs `agent`).

## 2. Integration tests

- `GET /api/prospection/workspace` retorna datos consistentes por org.
- `agent` recibe solo registros asignados.
- `POST .../followup-task` crea tarea ligada al elemento origen.
- `POST .../mark-reviewed` persiste estado y audit event.

## 3. E2E

1. Owner abre workspace y opera pipeline sin salir de la vista.
2. Agent abre workspace y no ve cartera de otros agentes.
3. Cambio de filtros actualiza los 3 paneles de forma sincronizada.

## 4. Regression focus

- No romper `/prospection` actual hasta cutover final.
- No romper listado de `contacts`, `properties`, `tasks`.
- Notificaciones siguen scope por rol.

## 5. Criterio de pase

- 0 fallos en scope por rol.
- 0 fugas de datos cross-org.
- Smoke completo en entorno de staging.

