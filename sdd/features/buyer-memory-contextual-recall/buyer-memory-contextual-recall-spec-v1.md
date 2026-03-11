# Spec - ANCLORA-BMCR-001 v1.0

## Problema

`ANCLORA-NBUY-001` ya captura buyers y los prioriza, pero todavía no conserva contexto útil y recuperable sobre perfil, matches y actividad comercial.

## Objetivo

Construir una memoria buyer-side explicable y reutilizable.

## Alcance

- tabla `buyer_memory_records`
- rebuild desde:
  - `buyer_profiles`
  - `property_buyer_matches`
  - `match_activity_log`
- búsqueda lexical/vector híbrida
- preview en la cola de buyers de `/prospection-unified`
- rutas de `search` y `rebuild`

## Criterio de salida

Cada buyer puede mostrar highlights contextuales sin abrir una pantalla nueva y la memoria puede reconstruirse o consultarse vía API.
