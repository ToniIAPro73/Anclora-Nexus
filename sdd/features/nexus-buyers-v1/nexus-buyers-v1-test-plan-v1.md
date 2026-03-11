# Test Plan - ANCLORA-NBUY-001 v1.0

1. Verificar que `create_buyer` calcula scores por defecto para `partner_referral`.
2. Verificar que `get_workspace` devuelve `buyer_source_summary`.
3. Verificar que `GET /api/prospection/buyers` acepta `source_type` y `source_platform`.
4. Verificar que `POST /api/prospection/buyers` sigue aceptando payload mínimo.
5. Verificar que `/prospection-unified` compila con el nuevo panel de intake y con buyers enriquecidos.
