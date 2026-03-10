# SKILL: StateFox Telegram Bridge

## Propósito

Transformar bloques crudos de resultados de StateFox en registros normalizados de prospección.

## Flujo

1. Pegar output crudo de Telegram/StateFox.
2. Parsear precio, título, detalles y enlaces reproducibles.
3. Previsualizar resultados normalizados.
4. Importar en `properties` con `source=statefox`.
5. Clasificar candidatos seller-side por señales explícitas.
6. Derivar esos candidatos a `nexus_sellers` a través de unified ingestion.

## Verificación

1. `POST /api/intelligence/statefox-bridge/parse` responde 200.
2. `POST /api/intelligence/statefox-bridge/import` crea propiedades sin duplicados y reporta sellers derivados.
3. La página `/intelligence/statefox-bridge` permite previsualizar e importar.
4. La respuesta incluye trazabilidad mínima (`trace_id`, `snapshot_id`) y conteos seller-side.
