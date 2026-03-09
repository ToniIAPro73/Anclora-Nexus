# StateFox Telegram Bridge — Spec v1

## Feature ID
`ANCLORA-STFX-002`

## Problema

StateFox emite resultados útiles en Telegram, pero el sistema necesitaba un puente supervisado para convertir esos bloques crudos en registros de prospección trazables.

## Solución

1. Endpoint de parseo supervisado.
2. Endpoint de importación autenticada.
3. Parser para bloques de listings con `startapp` y URLs públicas.
4. UI interna de previsualización e importación.
5. Deduplicación por `source_url`.

## No objetivo

No automatizar todavía la navegación viva de Telegram Web ni crear sellers automáticamente desde cada listing.
