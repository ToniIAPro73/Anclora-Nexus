# Nexus Branch Workflow

Anclora Nexus usa un flujo de ramas permanente:

development -> staging -> production

## Ramas permanentes

- development: integración y pruebas internas.
- staging: preproducción y validación final.
- production: producción.

## Ramas temporales

Los agentes IA y cambios puntuales deben usar:

- feat/<agente>-<descripcion>
- fix/<agente>-<descripcion>
- chore/<agente>-<descripcion>
- hotfix/<agente>-<descripcion>

## Reglas

- No trabajar directamente en staging ni production.
- No hacer force push.
- No borrar ramas remotas sin verificar que están mergeadas.
- No tocar secretos ni variables reales.
- Todo cambio debe entrar primero en development.
- La promoción válida es development -> staging -> production.

## Checks mínimos actuales

- npm run lint
- npm run build
- npm run ops:syncxml-pilot:check-env

Si se añaden test o typecheck al repo en el futuro, deberán incorporarse al flujo.
