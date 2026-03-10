# Spec v1.1 - Source Connectors Unified Ingestion

Feature ID: `ANCLORA-SCUI-001`

## Objetivo v1.1
Cerrar la brecha entre la migracion SQL y la implementacion backend real, y ampliar el perimetro de ingestion a seller-side signals.

## Alcance

### Incluye
- alineacion de estados con schema SQL real:
  - `received`
  - `validated`
  - `processed`
  - `rejected`
  - `failed`
- dedupe por `connector_name`
- `trace_id` consistente
- filtros operativos en `GET /api/ingestion/events`
- endpoint `POST /api/ingestion/seller-signals`
- extension DB para `entity_type = seller_signal`

### No incluye
- autenticacion fuerte por conector externo
- retries distribuidos
- cola asíncrona real

## Cambios backend
- `backend/models/ingestion.py`
- `backend/services/ingestion_service.py`
- `backend/api/routes/ingestion.py`
- `backend/api/main.py`

## Cambios DB
- migracion `041_ingestion_entity_type_seller_signal.sql`

## Criterios de aceptacion
1. La app FastAPI activa expone rutas de ingestion.
2. Los estados persistidos coinciden con la migracion `029`.
3. Seller-side signals pueden entrar por `/api/ingestion/seller-signals`.
4. `GET /api/ingestion/events` acepta filtros operativos.
