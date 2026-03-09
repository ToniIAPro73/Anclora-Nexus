# StateFox Telegram Discovery Runbook

## Propósito

Documentar de forma operativa el flujo real de StateFox como bot + Mini App de Telegram antes de implementar un bridge productivo en Anclora Nexus.

## Evidencia actual

1. StateFox devuelve listados de venta/alquiler tras recibir ubicación o contexto de búsqueda.
2. El bot muestra un botón `Open`, consistente con una Telegram Mini App.
3. La Mini App presenta módulos y portales (`Idealista`, `Fotocasa`, `Milanuncios`, `Indomio`, etc.).
4. La documentación oficial de Telegram confirma:
   - botón `Open App`
   - Mini Apps de bot
   - deep links `startapp`
5. En sesión supervisada de Telegram Web se observaron contratos reproducibles:
   - `https://t.me/StateFoxBot?startapp=<payload>`
   - `https://es.statefox.com/public/ln/property/...`

## Objetivo técnico de discovery

Confirmar si el flujo se puede abrir y reproducir con un contrato estable:

- deep link `t.me/...?...startapp=...`
- `web_app` directa
- o solo navegación interna de Telegram Web

Estado actual: `GO` para bridge supervisado MVP.

## Decisión de importación

- Destino principal: `properties`
- Destino secundario: `nexus_sellers`
- Regla: solo derivar a `nexus_sellers` cuando existan señales seller-side explícitas.

## Pasos manuales recomendados

1. Abrir `StateFox` en Telegram Web.
2. Activar `Open`.
3. Inspeccionar si la URL cambia a un patrón `t.me/...startapp=...` o WebApp reproducible.
4. Lanzar una búsqueda por ubicación o zona.
5. Verificar si los resultados contienen:
   - título
   - precio
   - zona
   - tipología
   - habitaciones
   - baños
   - superficie
   - enlace de ficha
   - datos seller-side
6. Registrar si el listing viene de agencia o particular.

## Criterios para GO del bridge

1. Apertura reproducible de la Mini App.
2. Consulta supervisada repetible.
3. Resultado parseable con campos mínimos para `properties`.
4. Regla clara para derivación a `nexus_sellers`.

## Criterios de NO-GO

1. Sin contrato de apertura reproducible.
2. UI demasiado volátil o cerrada.
3. Resultados no estructurados o no extraíbles.
4. Restricción fuerte de sesión que impida operación supervisada consistente.
