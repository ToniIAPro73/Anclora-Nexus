# Test Plan v1 - Source Connectors Unified Ingestion

Feature ID: `ANCLORA-SCUI-001`

## Objetivo
Validar ingestión unificada, idempotencia y trazabilidad por fuente sin regresión en leads/properties.

## Alcance
- Migraciones y rollback.
- API de ingestión.
- Validación de contrato canónico.
- Dedupe por `dedupe_key`.
- Aislamiento por `org_id`.

## Tipos de prueba

### Unit
- Construcción de `dedupe_key`.
- Validación schema canonical lead/property.
- Mapeos de `source_system` y `source_channel/source_portal`.

### Integración
- Ingestión lead válida -> creación/actualización esperada.
- Ingestión property válida -> creación/actualización esperada.
- Reintento mismo `external_id` -> sin duplicado.
- Payload inválido -> evento `rejected` con error detallado.

### No-regresión
- CRUD existente de leads y properties sigue operativo.
- Features LSO/POU/PBM sin degradación.

## Casos críticos
1. Connector deshabilitado -> rechazo controlado.
2. Status pipeline: received -> validated -> processed.
3. Error transitorio -> status failed + retry posible.
4. Cross-org request -> 403.

## Criterios GO/NO-GO
GO si:
- 0 P0/P1.
- Duplicados bloqueados correctamente.
- Eventos y trazabilidad completos.

NO-GO si:
- Se crean entidades duplicadas por reingesta.
- Hay fuga cross-org.
- No queda evidencia técnica de errores de ingestión.
