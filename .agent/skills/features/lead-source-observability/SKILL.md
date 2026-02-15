---
name: lead-source-observability
description: Implement and maintain lead/customer source traceability for Anclora Nexus. Use when defining or changing lead origin schema, ingestion mapping (manual, CTA web, social+CTA, import, referral), API contracts, and UI display/filtering for source attribution.
---

# Lead Source Observability

## Workflow

1. Leer:
- `sdd/features/lead-source-observability/lead-source-observability-INDEX.md`
- `sdd/features/lead-source-observability/lead-source-observability-spec-v1.md`
- `sdd/features/lead-source-observability/lead-source-observability-spec-migration.md`
- `.agent/rules/feature-lead-source-observability.md`

2. Implementar por orden:
- DB migration/backfill
- Backend contract y validaciones
- Frontend render/filters
- QA

3. Mantener compatibilidad:
- No romper `source` legacy hasta finalizar migración funcional.

## Contracto mínimo v1

- `source_system`
- `source_channel`
- `source_campaign`
- `source_detail`
- `source_url`
- `source_referrer`
- `source_event_id`
- `captured_at`
- `ingestion_mode`

## Stop Rules

- No mezclar cambios de moneda/superficie en esta skill.
- No tocar features no relacionadas.
- 1 bloque = 1 commit.

