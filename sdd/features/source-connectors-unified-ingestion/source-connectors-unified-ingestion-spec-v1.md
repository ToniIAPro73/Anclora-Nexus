# Spec v1 - Source Connectors Unified Ingestion

Feature ID: `ANCLORA-SCUI-001`

## 1. Problema
Las entradas de datos (portales, redes, CTA, importaciones manuales) están fragmentadas. Eso dispara coste de mantenimiento, inconsistencias de modelo y regresiones.

## 2. Objetivos
1. Definir un contrato único de ingestión para leads y propiedades.
2. Estandarizar conectores por fuente con validación centralizada.
3. Garantizar idempotencia y trazabilidad completa.
4. Exponer estado operativo de ingestión por org y por fuente.

## 3. Contrato canónico v1

### 3.1 Lead canonical payload
- `org_id`
- `external_id`
- `source_system` (`manual`, `cta_web`, `import`, `referral`, `partner`, `social`)
- `source_channel` (`website`, `linkedin`, `instagram`, `facebook`, `email`, `phone`, `other`)
- `source_detail`, `source_url`, `source_referrer`
- `captured_at`
- datos negocio (`name`, `email`, `phone`, `budget`, etc.)

### 3.2 Property canonical payload
- `org_id`
- `external_id`
- `source_system` (`manual`, `widget`, `pbm`, `import`)
- `source_portal` (`idealista`, `fotocasa`, `facebook`, `instagram`, `rightmove`, `kyero`, `other`)
- `captured_at`
- datos negocio (`title`, `address`, `price_eur`, `zone`, superficies, etc.)

## 4. Flujo operativo
1. Conector recibe payload externo.
2. Normalizador transforma a contrato canónico.
3. Validador aplica reglas (schema + business rules).
4. Upsert idempotente en entidad final.
5. Registrar evento en log de ingestión.

## 5. Reglas de negocio
- Idempotencia por `(org_id, connector_name, external_id, entity_type)`.
- Rechazo de payload inválido con detalle de error.
- Reintentos controlados para errores transitorios.
- No permitir operaciones cross-org.

## 6. API v1
- `POST /api/ingestion/leads` (internal)
- `POST /api/ingestion/properties` (internal)
- `GET /api/ingestion/events` (owner/manager)
- `GET /api/ingestion/events/{id}` (owner/manager)

## 7. Seguridad
- Endpoints de ingestión protegidos por credenciales de servicio.
- Logging de actor técnico (`connector_name`, `trace_id`).
- Sanitización de campos externos para evitar inyección en notas/textos.

## 8. KPIs
- >99% de payloads procesados sin error crítico.
- p95 de procesamiento < 400ms por item (sin scraping).
- duplicados efectivos <2% del total por fuente.
