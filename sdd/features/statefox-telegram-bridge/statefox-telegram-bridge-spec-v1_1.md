# StateFox Telegram Bridge — Spec v1.1

## Feature ID
`ANCLORA-STFX-002`

## Problema

El bridge v1 ya permitía parsear e importar listings de StateFox, pero seguía siendo demasiado experimental para uso operativo: no derivaba sellers por la perimeter oficial, normalizaba poca metadata y ofrecía trazabilidad limitada.

## Solución

1. Clasificación seller-side por señales explícitas en el bloque supervisado.
2. Importación de propiedades con `source=statefox`, `source_system=manual` y `source_portal=other`.
3. Derivación de sellers mediante unified ingestion con `connector_name=statefox:telegram-bridge`.
4. Normalización de `source_url`, zona y metadata útil para operación.
5. Respuesta de importación con `trace_id`, `snapshot_id` y conteos de sellers creados/duplicados/rechazados.

## No objetivo

No automatizar StateFox sin supervisión ni asumir API oficial.
