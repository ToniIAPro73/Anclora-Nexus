---
name: feature-cost-governance-foundation
description: "Implementacion de Cost Governance Foundation v1 bajo SDD."
---

# Skill - Cost Governance Foundation v1

## Lecturas obligatorias
1) `constitution-canonical.md`
2) `.agent/rules/workspace-governance.md`
3) `.agent/rules/anclora-nexus.md`
4) `sdd/features/cost-governance-foundation/cost-governance-foundation-INDEX.md`
5) `sdd/features/cost-governance-foundation/cost-governance-foundation-spec-v1.md`
6) `sdd/features/cost-governance-foundation/cost-governance-foundation-spec-migration.md`
7) `sdd/features/cost-governance-foundation/cost-governance-foundation-test-plan-v1.md`

## Metodo de trabajo
1. Congelar contrato DB/API antes de codificar.
2. Implementar por capas: DB -> backend -> frontend -> QA.
3. Mantener aislamiento `org_id` como regla absoluta.
4. Entregar checklist de verificaciones y riesgos.

## DB
- Tablas: `org_cost_policies`, `org_cost_usage_events`, `org_cost_alerts`.
- Indices por `org_id`, `created_at`, `capability_code`.
- Checks de rangos de umbral y coste.

## Backend
- Endpoints de presupuesto, consumo y alertas.
- Guardrails warning/hard-stop.
- Logging interno de consumo por capability.

## Frontend
- Vista minima de coste en dashboard/settings.
- Estado de presupuesto y alertas activas.
- Sin romper UX actual.

## QA minimo
- migration + rollback.
- unit de calculo umbrales.
- integration de endpoints FinOps.
- no-regresion en flujos core.
