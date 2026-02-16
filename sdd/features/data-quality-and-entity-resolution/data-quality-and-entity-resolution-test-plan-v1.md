# Test Plan v1 - Data Quality and Entity Resolution

Feature ID: `ANCLORA-DQER-001`

## Objetivo
Validar detección de issues, deduplicación y resolución de entidades sin regresión funcional en flujos core.

## Alcance
- Migraciones + rollback.
- API DQ.
- Recompute de candidatos.
- Aislamiento por org.
- No-regresión en leads/properties/prospection/matching.

## Tipos de prueba

### Unit
- Normalización de señales de comparación.
- Cálculo de `similarity_score`.
- Clasificación de severidad por tipo de issue.

### Integración
- Creación de issue por registro inválido.
- Detección de candidato duplicado (lead/property).
- Aprobación/rechazo de merge y log de resolución.
- Recompute idempotente por org.

### No-regresión
- CRUD de leads/properties intacto.
- PBM/SCUI/LSO sin caída por capa DQ.
- Rendimiento aceptable en consulta de issues.

## Casos críticos
1. Mismo email + org => candidato score alto.
2. Mismo teléfono + distinto org => no candidato cross-org.
3. `approve_merge` crea log y actualiza status candidato.
4. `undo_merge` preserva trazabilidad.
5. Rollback completo sin residuos.

## Criterios GO/NO-GO
GO si:
- 0 defectos P0/P1.
- Sin fuga cross-org.
- Score y decisiones consistentes con contrato.
- UI sin keys faltantes de i18n.

NO-GO si:
- Merge irreversible sin log/rollback.
- Duplicación masiva por recompute.
- `I18N_MISSING_KEYS` detectado.
