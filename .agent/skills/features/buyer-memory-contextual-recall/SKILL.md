---
name: buyer-memory-contextual-recall
description: Implementa memoria contextual buyer-side derivada del perfil, matches y actividad comercial, con preview en prospection y rutas de rebuild/search.
---

## Leer primero

1. `backend/services/seller_memory_service.py`
2. `sdd/features/seller-memory-semantic-recall/seller-memory-semantic-recall-spec-v1_1.md`
3. `sdd/features/nexus-buyers-v1/nexus-buyers-v1-spec-v1.md`
4. `.agent/rules/feature-buyer-memory-contextual-recall.md`

## Metodo

1. Crear `buyer_memory_records`.
2. Derivar memoria desde perfil buyer, matches y actividad.
3. Reutilizar embeddings y retrieval híbrido.
4. Exponer preview en workspace buyer-side y rutas de rebuild/search.
