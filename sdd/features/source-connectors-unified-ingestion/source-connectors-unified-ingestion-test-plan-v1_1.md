# Test Plan v1.1 - Source Connectors Unified Ingestion

1. Verificar que `backend/api/main.py` monta `/api/ingestion/*`.
2. Validar `LeadIngestionPayload`, `PropertyIngestionPayload` y `SellerSignalIngestionPayload`.
3. Confirmar que `dedupe_key` usa `connector_name`.
4. Reingesta de mismo `external_id` + mismo `connector_name` -> duplicado.
5. `GET /api/ingestion/events` filtra por:
   - `status`
   - `entity_type`
   - `connector_name`
   - `trace_id`
6. `POST /api/ingestion/seller-signals` enruta a `nexus_sellers` con trazabilidad.
7. Los estados persistidos cumplen:
   - `received`
   - `validated`
   - `processed|rejected|failed`
