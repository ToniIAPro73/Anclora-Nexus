# Spec v1.1 - Seller Memory Semantic Recall

## Objetivo

Evolucionar la memoria seller-side desde scoring semántico explicable a retrieval híbrido con embeddings reales, manteniendo fallback léxico y redacción de PII.

## Alcance

- persistir embeddings reales en `seller_memory_records`
- retrieval `vector_hybrid` cuando el provider está listo
- fallback `lexical` cuando no lo está
- exponer `retrieval_mode` y `vector_ready_records`
- reutilizar memoria recuperada en `whale_dossier`

## Contrato funcional adicional

1. Cada `memory_record` puede almacenar:
   - `embedding`
   - `embedding_dimensions`
   - `embedding_provider`
   - `embedding_model`
   - `embedding_status`
2. `search()` devuelve:
   - `retrieval_mode`
   - `vector_ready_records`
   - `reasons` con `vector_similarity` cuando aplique
3. El drawer seller-side debe dejar visible si la memoria va en modo vectorial o léxico.

## Reglas

- Nunca vectorizar contenido sin redacción previa de PII.
- No fallar el workbench si el provider de embeddings no está configurado.
- La memoria recuperada debe poder alimentar dossier y outreach, no solo el drawer.

## Criterios de aceptación

- existe migración para columnas de embeddings
- rebuild vectoriza registros nuevos o pendientes cuando el provider está disponible
- search usa ranking híbrido verificable
- `whale_dossier` incorpora memoria recuperada en sus prompts
