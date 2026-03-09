---
trigger: always_on
---

# Feature Rules: Gravity Claw Whale Workbench v1

## Normative Priority
1) sdd/core/constitution-canonical.md
2) .agent/rules/workspace-governance.md
3) .agent/rules/anclora-nexus.md
4) sdd/features/gravity-claw-whale-workbench/gravity-claw-whale-workbench-spec-v1.md

## Immutable Rules
- No envio automatico real a canales externos sin HITL.
- No introducir vector DB en v1.
- Toda memoria adicional debe persistirse en `seller_interactions` o derivarse de ella.
- La ficha del seller debe seguir siendo util aunque no existan artefactos previos.

## Implementation Rules
- Reusar el endpoint `generate-dossier`; no duplicar la generacion.
- Tipificar artefactos con `metadata.artifact`.
- Mantener el drawer como workbench operativa unica.
- Priorizar claridad comercial sobre complejidad de UX.
