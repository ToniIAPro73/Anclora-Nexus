# Spec v1 - Territorial Sync Control Plane

Feature ID: `ANCLORA-TSCP-001`

## Problema
Fase 2 ya tenía SOP, sync pack y cron, pero no tenía una capa de validación y trazabilidad visible que permitiera afirmar que el pack publicado era coherente con manifiesto + raw y seguía siendo la fuente primaria del pipeline.

## Objetivo
Cerrar Fase 2 dentro del perímetro del repo dejando una cadena verificable:
`manifest + raw -> build -> validate -> status -> api -> ui -> cron gate`

## Entregables
- script build enriquecido
- script validate independiente
- `ops/notebooklm-territorial-sync-status.json`
- endpoint `GET /api/intelligence/territorial-sync-status`
- tarjeta de estado en `/intelligence`
- bloqueo del cron si el status es `error`

## Reglas
- El pack sigue siendo fuente primaria.
- El fallback markdown no reemplaza al pack mientras el status sea `ready` o `warning`.
- Un status `error` bloquea el cron territorial.

## Cierre
Fase 2 pasa a `100%` en el repo porque el control operacional y la trazabilidad quedan implementados. La limitación MCP/Google sigue siendo externa, pero ya está encapsulada en el flujo manual del raw source y no impide gobernanza end-to-end del sistema.
