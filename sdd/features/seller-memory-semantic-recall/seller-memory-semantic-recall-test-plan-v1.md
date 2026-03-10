# Test Plan v1 - Seller Memory Semantic Recall

1. Validar redaccion de PII antes de persistencia derivada.
2. Validar que `sync` crea memoria para interacciones no indexadas.
3. Validar scoring explicable en retrieval.
4. Validar que `workbench` incorpora bloque `memory`.
5. Validar rutas:
   - `GET /api/sellers/{seller_id}/memory`
   - `POST /api/sellers/{seller_id}/memory/rebuild`
6. Validar degradacion segura si falta tabla derivada.
