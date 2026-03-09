# SKILL: StateFox Telegram Bridge

## Propósito

Transformar bloques crudos de resultados de StateFox en registros normalizados de prospección.

## Flujo

1. Pegar output crudo de Telegram/StateFox.
2. Parsear precio, título, detalles y enlaces reproducibles.
3. Previsualizar resultados normalizados.
4. Importar en `properties` con `source=statefox`.
5. Marcar candidatos seller-side sin crear sellers automáticamente.

## Verificación

1. `POST /api/intelligence/statefox-bridge/parse` responde 200.
2. `POST /api/intelligence/statefox-bridge/import` crea propiedades sin duplicados.
3. La página `/intelligence/statefox-bridge` permite previsualizar e importar.
