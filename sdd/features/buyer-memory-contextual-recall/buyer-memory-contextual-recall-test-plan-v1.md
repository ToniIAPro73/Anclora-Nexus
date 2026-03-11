# Test Plan - ANCLORA-BMCR-001 v1.0

1. Verificar que `rebuild_for_buyer()` genera memoria de perfil, match y actividad.
2. Verificar que la redacción PII se aplica al perfil buyer.
3. Verificar que `search()` usa `vector_hybrid` cuando embeddings están listos.
4. Verificar rutas:
   - `GET /api/prospection/buyers/{buyer_id}/memory`
   - `POST /api/prospection/buyers/{buyer_id}/memory/rebuild`
5. Verificar que `prospection-unified` renderiza highlights buyer-side.
