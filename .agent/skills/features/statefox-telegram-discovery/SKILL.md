# SKILL: StateFox Telegram Discovery

## Propósito

Convertir evidencia observada de StateFox en un contrato técnico verificable dentro del repo.

## Flujo

1. Leer evidencia oficial de Telegram Mini Apps.
2. Consolidar observación supervisada en `ops/statefox-telegram-discovery.json`.
3. Exponer esa evidencia por backend.
4. Mostrarla en UI interna para decisión operativa.
5. Fijar estrategia de importación:
   - `properties` primero
   - `nexus_sellers` solo por señal seller-side

## Verificación

1. `GET /api/intelligence/statefox-discovery` responde 200.
2. La UI de inteligencia muestra el card StateFox.
3. La página interna detalla evidencia, entrypoints y strategy.
