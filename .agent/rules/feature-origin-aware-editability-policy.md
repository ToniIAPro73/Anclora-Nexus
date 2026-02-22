---
trigger: always_on
---

# Feature Rules: Origin Aware Editability Policy v1

## Jerarquia normativa
1) `sdd/core/constitution-canonical.md`
2) `.agent/rules/workspace-governance.md`
3) `.agent/rules/anclora-nexus.md`
4) `sdd/features/origin-aware-editability-policy/origin-aware-editability-policy-spec-v1.md`

## Reglas inmutables

- Prohibido permitir sobrescritura de trazabilidad de origen en entidades no manuales.
- Policy por origen debe ser declarativa y reusable.
- Policy debe aplicarse antes de persistencia (saneo de payload).
- UX debe informar por qué hay campos bloqueados.
- Todo texto nuevo debe estar en `es/en/de/ru`.
