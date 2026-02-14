---
name: feature-prospection-matching
description: "Implementación de Prospection & Buyer Matching v1 bajo SDD."
---

# Skill — Prospection & Buyer Matching v1

## Lecturas obligatorias
1) `constitution-canonical.md`
2) `.agent/rules/workspace-governance.md`
3) `.agent/rules/anclora-nexus.md`
4) `sdd/features/prospection-matching-INDEX.md`
5) `sdd/features/prospection-matching-spec-v1.md`
6) `sdd/features/prospection-matching-spec-migration.md`
7) `sdd/features/prospection-matching-test-plan-v1.md`

## Método de trabajo
1. Planificar artefactos por capa (DB, backend, frontend, tests).
2. Implementar mínimo viable con contratos estrictos.
3. Verificar scoring, isolation y compliance.
4. Entregar walkthrough con comandos y checks.

## Capa DB
- Crear tablas:
  - `prospected_properties`
  - `buyer_profiles`
  - `property_buyer_matches`
  - `match_activity_log`
- Índices por `org_id`, score y estado.
- Restricciones de consistencia (`unique(property_id,buyer_id)`).

## Capa Backend
- Endpoints CRUD para properties prospectadas y buyers.
- Endpoints para recomputar y consultar matches.
- Servicio de scoring con `score_breakdown`.
- Middleware de validación de membresía/rol.

## Capa Frontend
- Vistas para:
  - propiedades prospectadas,
  - compradores potenciales,
  - matches priorizados.
- Widgets dashboard:
  - `HighTicketRadar`
  - `MatchEngine`

## Testing mínimo
- unit: formulas scoring y validaciones.
- integration: endpoints + DB.
- e2e: flujo property -> buyer -> match -> activity.

