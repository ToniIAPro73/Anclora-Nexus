---
trigger: always_on
---

# Feature Rules: Explainable Opportunity Ranking v1

## Jerarquia normativa
1) `sdd/core/constitution-canonical.md`
2) `.agent/rules/workspace-governance.md`
3) `.agent/rules/anclora-nexus.md`
4) `sdd/features/explainable-opportunity-ranking/explainable-opportunity-ranking-spec-v1.md`

## Reglas inmutables

- Scope por `org_id` obligatorio en todas las operaciones.
- El ranking debe ser explicable: score sin drivers no es valido.
- Ninguna accion comercial irreversible puede dispararse automaticamente.
- No romper compatibilidad con `prospection-unified-workspace`.

## Reglas de implementacion

- Mantener ponderaciones documentadas y trazables.
- Exponer `next_action` orientada a operativa real del agente.
- Priorizar legibilidad de insights sobre complejidad visual.
