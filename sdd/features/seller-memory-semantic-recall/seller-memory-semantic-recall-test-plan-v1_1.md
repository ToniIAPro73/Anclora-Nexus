# Test Plan v1.1 - Seller Memory Semantic Recall

1. Aplicar migraciones `043` y `044`.
2. Ejecutar rebuild de memoria con provider embeddings deshabilitado y verificar fallback léxico.
3. Ejecutar rebuild con provider embeddings habilitado y verificar `embedding_status=ready`.
4. Consultar `GET /api/sellers/{id}/memory` y verificar:
   - `retrieval_mode`
   - `vector_ready_records`
   - `reasons` con `vector_similarity` cuando aplique
5. Verificar que `whale_dossier` incorpora memoria recuperada.
6. Verificar que el drawer muestra modo de retrieval y recuento vectorial.
