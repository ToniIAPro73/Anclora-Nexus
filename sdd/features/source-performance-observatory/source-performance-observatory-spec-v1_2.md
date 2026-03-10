# ANCLORA-SPO-001 v1.2

## Objetivo

Extender el observatorio con checks cloud sintéticos reutilizables para que soporte y producto vean la misma salud operativa que usan las alertas y el command center.

## Alcance

- scorecards cloud para `territorial sync`, `territorial pipeline`, `seller signal source` y `AI runtime`
- `freshness`, `heartbeat_age_hours`, `latency_ms`, `retry_count` y `ops_message`
- resumen agregado de checks `healthy/warning/critical`
- sin migración nueva

## Contrato

- `version = ANCLORA-SPO-001.v1_2`
- `ObservatorySummary` añade `cloud_checks_total`, `cloud_checks_healthy`, `cloud_checks_warning`, `cloud_checks_critical`
- `SourceScorecard` añade `heartbeat_age_hours`, `latency_ms`, `retry_count`, `ops_message`

## Implementación

- backend: `backend/services/cloud_ops_service.py`, `backend/services/source_observatory_service.py`
- frontend: `/source-observatory`
- i18n requerida para nuevas etiquetas
