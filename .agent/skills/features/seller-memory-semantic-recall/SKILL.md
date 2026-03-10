---
name: seller-memory-semantic-recall
description: Construye memoria semantica por seller a partir de seller_interactions con redaccion de PII, retrieval explicable y superficie operativa en el workbench.
---

# Skill - Seller Memory Semantic Recall v1

## Mandatory Reading
1) sdd/features/seller-memory-semantic-recall/seller-memory-semantic-recall-INDEX.md
2) sdd/features/seller-memory-semantic-recall/seller-memory-semantic-recall-spec-v1.md
3) sdd/features/seller-memory-semantic-recall/seller-memory-semantic-recall-spec-v1_1.md
4) sdd/features/seller-memory-semantic-recall/seller-memory-semantic-recall-spec-migration.md
5) .agent/rules/feature-seller-memory-semantic-recall.md

## Instructions
- Reutilizar `seller_interactions` como source of truth y generar memoria derivada.
- Persistir solo contenido redactado y resumen semantico reusable.
- Exponer retrieval explicable por `query`, `keyword_hits`, `artifact_match` y recencia.
- Si el provider de embeddings está listo, persistir `embedding`, `embedding_status`, `embedding_provider` y `embedding_model`.
- Integrar la memoria en el seller workbench antes de extender otros paneles.
- Mantener fallback deterministico si embeddings no están disponibles.
