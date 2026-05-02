# Artifacts: n8n Unified Lead Intake

Este directorio contiene los artefactos técnicos listos para importar en n8n.

## Contenido

- `n8n_unified_lead_intake_workflow_v1_1.json`: Workflow unificado para la ingesta de leads desde múltiples fuentes.

## Versión del Workflow

**v1.1 — Backend-First Integration**

Cambios respecto a v1.0:
- Eliminada la escritura directa en Supabase.
- Integración obligatoria con `POST /api/ingestion/leads`.
- Normalización automática de fuentes (Landing, HNWI, Social).
- Scoring y clasificación inicial (Seller/Buyer/HNWI).
- Human Approval Gate mediante notificación interna para Leads Hot.

## Instrucciones de Uso

Consulte el [RUNBOOK](../RUNBOOK_N8N_UNIFIED_LEAD_INTAKE.md) en la raíz de la feature para instrucciones detalladas de despliegue y configuración.
