---
trigger: manual
---

# Feature Rule — StateFox Telegram Bridge

## Feature ID
`ANCLORA-STFX-002`

## Objetivo
Implementar un bridge supervisado para importar resultados de StateFox desde Telegram hacia `properties` y derivar sellers solo cuando haya evidencia seller-side verificable.

## Reglas
1. Tratar el bridge como operación supervisada, no como integración oficial de API.
2. Importar primero a `properties`.
3. Derivar a `nexus_sellers` a través de la perimeter de unified ingestion, no mediante inserciones ad hoc.
4. Solo proponer derivación a `nexus_sellers` cuando existan señales seller-side explícitas.
5. Preservar `source_url` reproducible (`public_url` o `startapp`) para deduplicación.
6. Normalizar `zone`, `source_system`, `source_portal` y metadata mínima operativa en cada importación.
7. Toda ejecución debe devolver trazabilidad mínima (`trace_id`, `snapshot_id` o equivalente).
5. Toda UI nueva debe usar i18n en `es`, `en`, `de`, `ru`.
