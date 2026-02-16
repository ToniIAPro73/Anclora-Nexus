# Spec v1 - Data Quality and Entity Resolution

Feature ID: `ANCLORA-DQER-001`

## 1. Problema
Con múltiples fuentes activas de captación/ingestión, leads y propiedades llegan con duplicados, campos inconsistentes y conflictos de identidad. Esto degrada scoring, matching y productividad comercial.

## 2. Objetivos funcionales
1. Definir reglas de calidad de dato para leads/properties.
2. Detectar duplicados intra-org con score de similitud explicable.
3. Resolver entidades (merge o keep-separate) con trazabilidad.
4. Mantener operación reversible (sin borrado destructivo por defecto).
5. Exponer métricas de calidad por org.

## 3. Reglas de calidad v1

### 3.1 Leads
- Email válido si existe.
- Teléfono normalizado E.164 si existe.
- `source_system` y `source_channel` obligatorios para entradas no manuales.
- Completitud mínima configurable por org (ej.: nombre + un canal de contacto).

### 3.2 Properties
- `price` >= 0.
- Superficies coherentes (`useful_area_m2 <= built_area_m2` cuando ambas existan).
- `source_system` obligatorio.
- Si `source_system != manual`, `source_portal` recomendado.

## 4. Resolución de entidades

### 4.1 Tipos de resolución
- `auto_link`: marca potencial duplicado sin fusionar.
- `suggested_merge`: propuesta para revisión humana.
- `approved_merge`: fusión aprobada por owner/manager.
- `rejected_merge`: decisión explícita de no fusionar.

### 4.2 Score de similitud
- Rango `0..100`.
- Base por señales:
  - exact email (+alto peso)
  - exact phone (+alto peso)
  - nombre normalizado (+peso medio)
  - dirección/zona similar (+peso medio)
  - proximidad precio/superficie (+peso medio-bajo)

## 5. Contrato API v1
- `GET /api/dq/issues`
- `GET /api/dq/metrics`
- `POST /api/dq/resolve`
- `POST /api/dq/recompute`

## 6. Seguridad y permisos
- Aislamiento estricto por `org_id`.
- Owner/Manager:
  - ver issues y aprobar/rechazar merges.
- Agent:
  - solo lectura de issues agregados sin operaciones destructivas.

## 7. No-regresión
- No romper PBM, LSO, POU, CSL ni SCUI.
- Mantener entidades originales si no hay `approved_merge`.
- Operaciones de merge con log auditable.

## 8. KPIs de aceptación
- Reducción de duplicados detectados sin resolver > 30% tras primera pasada.
- Falsos positivos de merge < 5%.
- p95 de recompute por lote base < 500ms por 100 registros.
