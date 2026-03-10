---
trigger: always_on
---

# Feature Rules: Seller Memory Semantic Recall v1

## Normative Priority
1) sdd/core/constitution-canonical.md
2) .agent/rules/workspace-governance.md
3) .agent/rules/anclora-nexus.md
4) sdd/features/seller-memory-semantic-recall/seller-memory-semantic-recall-spec-v1.md

## Rules
- Toda memoria seller-side debe redactar PII antes de persistir contexto reusable.
- El retrieval debe ser explicable: cada match debe indicar por que fue recuperado.
- La memoria no sustituye el historial transaccional en `seller_interactions`; lo resume y lo hace recuperable.
- La feature debe degradar de forma segura si la migracion no esta aplicada o si faltan dependencias de AI runtime.
- El workbench debe consumir la memoria semantica sin romper el flujo actual de dossier, drafts e interacciones.
