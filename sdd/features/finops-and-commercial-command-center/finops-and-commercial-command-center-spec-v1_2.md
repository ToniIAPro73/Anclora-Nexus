# ANCLORA-FCCC-001 v1.2

## Objetivo

Convertir el command center en la capa ejecutiva única de salud cloud, no solo de KPIs comerciales.

## Alcance

- warning/critical checks cloud
- estado ejecutivo de `territorial sync`, `territorial pipeline`, `seller signal source` y `AI runtime`
- sin duplicar lógica; reutiliza `cloud_ops_service`

## Contrato

- `version = ANCLORA-FCCC-001.v1_2`
- `OperationalOverview` añade:
  - `cloud_warning_checks`
  - `cloud_critical_checks`
  - `seller_signal_source_status`
  - `ai_runtime_status`

## Implementación

- backend: `backend/services/command_center_service.py`
- frontend: `/command-center`
