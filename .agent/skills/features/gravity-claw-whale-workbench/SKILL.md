---
name: gravity-claw-whale-workbench
description: Completa Fase 4 con una mesa de trabajo comercial por seller, artefactos multicanal y memoria operativa reutilizable.
---

# Skill - Gravity Claw Whale Workbench v1

## Mandatory Reading
1) sdd/core/constitution-canonical.md
2) sdd/features/gravity-claw-whale-workbench/gravity-claw-whale-workbench-INDEX.md
3) sdd/features/gravity-claw-whale-workbench/gravity-claw-whale-workbench-spec-v1.md
4) sdd/features/gravity-claw-whale-workbench/gravity-claw-whale-workbench-spec-v1_1.md
5) sdd/features/gravity-claw-whale-workbench/gravity-claw-whale-workbench-spec-v1_2.md
5) .agent/rules/feature-gravity-claw-whale-workbench.md

## Instructions
- Implementa la workbench como una unica ficha operativa por seller.
- Genera y persiste artefactos multicanal reutilizables.
- Reutiliza `seller_interactions` antes de proponer nuevas tablas.
- Mantiene el control humano sobre cualquier outreach externo.
- Si `/sellers` muestra inteligencia territorial, debe venir del backend operacional.
- La workbench debe devolver canal recomendado, siguiente paso y highlights de memoria recuperada.

## Stop Rules
- No crear automatizacion de envio real en v1.
- No introducir embeddings o pgvector en esta fase.
- No fragmentar la workbench en varias pantallas nuevas.
