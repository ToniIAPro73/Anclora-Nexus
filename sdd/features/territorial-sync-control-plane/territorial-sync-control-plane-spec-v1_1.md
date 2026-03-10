# Spec v1.1 - Territorial Sync Control Plane

Feature ID: `ANCLORA-TSCP-001`

## Problema adicional
El control-plane validaba la fuente territorial, pero seguia faltando una vista operativa del ultimo run real del pipeline territorial. El operador podia saber si el pack era valido, pero no si el pipeline habia corrido bien o mal.

## Objetivo v1.1
Extender la cadena de Fase 2 con un heartbeat operativo visible:

`manifest + raw -> build -> validate -> status -> cron run -> pipeline status -> api -> ui`

## Entregables
- `ops/territorial-pipeline-status.json`
- escritura del ultimo run desde `frontend/src/app/api/cron/territorial-pipeline/route.ts`
- ampliacion de `GET /api/intelligence/territorial-sync-status` con `pipeline_status`
- tarjeta UI con ultimo run, estado y stats basicas

## Contrato pipeline_status
- `status`: `idle | running | success | error`
- `message`
- `started_at`
- `finished_at`
- `last_success_at`
- `last_error_at`
- `stats.signals_received`
- `stats.sellers_created`
- `stats.queries_synced`
- `stats.outreach_processed`

## Reglas
- El estado del pipeline no reemplaza al estado del sync pack: lo complementa.
- Si el pack esta en `error`, el pipeline sigue bloqueado.
- El pipeline debe persistir siempre su estado al arrancar y al terminar, incluso en fallo.

## Criterios de aceptacion
1. El endpoint devuelve `sync_status` y `pipeline_status`.
2. La UI `/intelligence` muestra ultimo run y stats del pipeline.
3. Un operador puede diferenciar entre:
   - pack valido pero pipeline nunca ejecutado,
   - pipeline en curso,
   - pipeline exitoso,
   - pipeline fallido.
