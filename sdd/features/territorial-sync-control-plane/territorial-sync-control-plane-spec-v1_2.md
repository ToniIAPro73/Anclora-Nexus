# Spec v1.2 - Territorial Sync Control Plane

Feature ID: `ANCLORA-TSCP-001`

## Problema adicional
El control-plane territorial ya validaba el `sync pack` y mostraba el ultimo run del pipeline, pero seguia faltando un contrato operativo completo para que cualquier operador pudiera refrescar o recuperar la fuente sin depender de conocimiento tacito.

## Objetivo v1.2
Endurecer el refresh territorial como operacion reproducible:

`manifest + operational_contract -> raw -> build -> validate -> ops summary -> api -> ui`

## Entregables
- `operational_contract` versionado en `ops/notebooklm-territorial-sync-manifest.json`
- status enriquecido con:
  - `freshness_state`
  - `next_refresh_due_at`
  - `operational_contract`
  - `runbook_status`
  - `next_action`
- script CLI `npm run ops:notebooklm:ops-summary`
- tarjeta UI `/intelligence` ampliada con owner, frescura, fallback, runbooks y siguiente accion
- correccion de paths legacy `Nuevo_enfoque -> nuevo-enfoque`

## Contrato operativo
- `operational_contract.owner_display`
- `operational_contract.owner_team`
- `operational_contract.schedule.cadence`
- `operational_contract.schedule.recommended_days[]`
- `operational_contract.schedule.timezone`
- `operational_contract.recovery_slo_hours`
- `operational_contract.runbook_refs[]`
- `operational_contract.fallback_policy.primary_source`
- `operational_contract.fallback_policy.fallback_source`
- `operational_contract.fallback_policy.activation_rule`
- `operational_contract.fallback_policy.manual_edit_forbidden`

## Reglas
- El manifiesto es la fuente de verdad del contrato operativo.
- Los runbooks declarados deben existir fisicamente en el repo.
- El fallback solo se activa si el sync pack falla o no existe.
- La UI no debe requerir inspeccion manual de ficheros para saber owner, frescura o siguiente accion.

## Criterios de aceptacion
1. `validate-sync-pack` produce un status con owner, cadencia, fallback y runbooks.
2. `get_territorial_sync_status()` enriquece tambien el payload si el status no estuviera completo.
3. `/api/intelligence/territorial-sync-status` devuelve el contrato enriquecido.
4. `/intelligence` muestra owner, frescura, runbooks, fallback y siguiente accion.
5. Un operador puede ejecutar o recuperar el refresh mirando solo SOP/runbook/API/UI.
