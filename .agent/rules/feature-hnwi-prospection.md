---
trigger: always_on
---

# Feature Rules: HNWI Prospection v1

## Normative Priority
1) sdd/core/constitution-canonical.md
2) .agent/rules/workspace-governance.md
3) .agent/rules/anclora-nexus.md
4) sdd/features/hnwi-prospection/hnwi-prospection-INDEX.md
5) sdd/features/hnwi-prospection/hnwi-prospection-spec-v1.md
6) sdd/features/hnwi-prospection/hnwi-prospection-spec-migration.md
7) sdd/features/hnwi-prospection/hnwi-prospection-test-plan-v1.md

## Rules
- Prioridad absoluta a métodos zero/low-cost y open source.
- No depender de StateFox, Inmovila ni Idealista para el MVP HNWI.
- El canal de outreach del MVP es `email-first`, no WhatsApp.
- Solo preparar outreach automático para leads `hot` con `email_verified=true`.
- Mantener la feature sobre `leads` como entidad de entrada; no forzar conversión a `buyer_profiles` en el MVP.
- Identificar la procedencia HNWI por `connector_name=hnwi-prospection:<channel>` y `hnwi_source_channel`.
- Todo draft o intento de envío debe quedar trazado en `lead_interactions`.
- FinOps debe registrar `capability_code=hnwi_prospection` sin bloquear la ingesta si falla.
