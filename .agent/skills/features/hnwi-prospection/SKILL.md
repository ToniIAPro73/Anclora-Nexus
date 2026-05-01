---
name: hnwi-prospection
description: Implementa y opera la feature HNWI Prospection con scoring, ingestión y outreach email-first sobre leads.
---

# Skill - HNWI Prospection v1

## Mandatory Reading
1) sdd/features/hnwi-prospection/hnwi-prospection-INDEX.md
2) sdd/features/hnwi-prospection/hnwi-prospection-spec-v1.md
3) sdd/features/hnwi-prospection/hnwi-prospection-spec-migration.md
4) sdd/features/hnwi-prospection/hnwi-prospection-test-plan-v1.md
5) .agent/rules/feature-hnwi-prospection.md

## Instructions
- Tratar `leads` como punto de entrada canónico de HNWI Prospection.
- Normalizar payloads externos al contrato real de `/api/ingestion/leads`.
- Resolver scoring HNWI en backend y no duplicarlo en n8n más allá de validaciones ligeras.
- Persistir trazabilidad comercial en `hnwi_prospection_events` y `lead_interactions`.
- Preparar `lead_brief` y `email_draft` para leads `hot` con email verificado.
- Usar `send-supervised/email` o envío nativo SMTP solo cuando el transporte esté disponible.
- Mantener Source Observatory y FinOps alineados con el naming `hnwi-prospection:<channel>`.
