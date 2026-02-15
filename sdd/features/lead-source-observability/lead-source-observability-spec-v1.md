# SPEC: LEAD SOURCE OBSERVABILITY V1

**Feature ID**: ANCLORA-LSO-001  
**Versión**: 1.0  
**Status**: Specification Phase

## 1. Problema

El CRM no conserva de forma consistente el origen compuesto de los leads (canal + mecanismo + campaña + referrer), lo que reduce calidad operativa y capacidad de atribución.

## 2. Objetivo v1

Registrar y exponer en API/UI el origen técnico y comercial del lead para:

1. Trazabilidad comercial.
2. Segmentación por canal/campaña.
3. Base para políticas de edición por origen.

## 3. Campos de origen (v1)

Sobre entidad `leads`:

- `source_system`: `manual | cta_web | import | referral | partner | social`
- `source_channel`: `website | linkedin | instagram | facebook | email | phone | other`
- `source_campaign` (nullable, text)
- `source_detail` (nullable, text)
- `source_url` (nullable, text)
- `source_referrer` (nullable, text)
- `source_event_id` (nullable, text)
- `captured_at` (nullable, timestamptz)
- `ingestion_mode`: `realtime | batch | manual`

## 4. Reglas funcionales

1. Alta manual en app:
- `source_system='manual'`
- `source_channel='other'`
- `ingestion_mode='manual'`

2. CTA web:
- `source_system='cta_web'`
- `source_channel` según referrer (ej. `linkedin` si viene de LinkedIn)
- `captured_at` obligatorio en flujos automáticos.

3. Si faltan metadatos en captura externa:
- aplicar fallback explícito y auditable (`other`, `unknown campaign`).

## 5. API esperada

1. Endpoint público de captura (si aplica en v1): `POST /api/public/lead-capture`
2. Endpoints privados de leads deben aceptar/retornar campos de origen.
3. Validación de dominio en backend (400 ante valor inválido).

## 6. UI esperada

1. Lista/tabla de contactos:
- columna/badge de origen compuesto.
2. Detalle de lead:
- bloque “Origen y captación” completo.

## 7. Criterios de aceptación

1. Todo lead nuevo tiene origen trazable.
2. Soporte explícito para caso `LinkedIn + CTA`.
3. Datos visibles y filtrables por origen.
4. Sin romper multitenancy ni flujos existentes.

## 8. Fuera de alcance v1

1. Modelos avanzados de atribución multi-touch.
2. Integraciones nativas con APIs de plataformas sociales.
3. Dedupe probabilístico cross-canal avanzado.

