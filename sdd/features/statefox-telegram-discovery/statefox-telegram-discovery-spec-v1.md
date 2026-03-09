# StateFox Telegram Discovery — Spec v1

## Feature ID
`ANCLORA-STFX-001`

## Problema

Existe evidencia de que StateFox funciona como bot + Telegram Mini App, pero no hay evidencia suficiente de API pública. Hace falta un contrato técnico verificable antes de implementar un bridge productivo.

## Solución

1. Registrar discovery en `ops/statefox-telegram-discovery.json`
2. Exponer discovery vía backend
3. Mostrar discovery en UI interna
4. Fijar estrategia de importación a `properties` y derivación condicional a `nexus_sellers`

## No objetivo

No implementar todavía la automatización viva de Telegram Web ni asumir endpoints privados de StateFox.
