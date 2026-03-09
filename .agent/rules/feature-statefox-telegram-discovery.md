---
trigger: manual
---

# Feature Rule — StateFox Telegram Discovery

## Feature ID
`ANCLORA-STFX-001`

## Objetivo
Formalizar la evidencia técnica de StateFox como bot + Telegram Mini App y fijar el contrato de importación para una futura integración supervisada.

## Reglas
1. No asumir API pública de StateFox sin evidencia.
2. Tratar StateFox como adapter supervisado hasta prueba en contrario.
3. Importar resultados primero en `properties`.
4. Solo derivar a `nexus_sellers` cuando existan señales seller-side explícitas.
5. Toda UI nueva debe usar i18n en `es`, `en`, `de`, `ru`.
