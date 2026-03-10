# ANCLORA-GAA-001 v1.2

## Objetivo

Ampliar alertado operativo para cubrir degradación cloud de seller-side source y AI runtime sin introducir un sistema paralelo.

## Alcance

- nuevas alertas `ai_runtime_degraded`
- nuevas alertas `seller_signal_source_degraded`
- dedupe por scope cloud
- metadata accionable con `heartbeat_age_hours`, `retry_count`, `missing_env`

## Contrato

- `version = ANCLORA-GAA-001.v1_2`
- no requiere nueva migración; reutiliza `automation_alerts`
- `alert_scope` adicional: `ai_runtime`, `seller_signal_source`

## Implementación

- backend: `backend/services/automation_service.py`
- frontend: `/automation-alerting`
