---
trigger: manual
---

# Feature Rule — StateFox Telegram Bridge

## Feature ID
`ANCLORA-STFX-002`

## Objetivo
Implementar un bridge supervisado para importar resultados de StateFox desde Telegram hacia `properties`.

## Reglas
1. Tratar el bridge como operación supervisada, no como integración oficial de API.
2. Importar primero a `properties`.
3. Solo proponer derivación a `nexus_sellers` cuando existan señales seller-side explícitas.
4. Preservar `source_url` reproducible (`public_url` o `startapp`) para deduplicación.
5. Toda UI nueva debe usar i18n en `es`, `en`, `de`, `ru`.
