# TEST PLAN: LEAD SOURCE OBSERVABILITY V1

**Feature ID**: ANCLORA-LSO-001

## 1. Objetivo

Verificar persistencia, validación y visualización del origen de leads.

## 2. Casos críticos

1. Alta manual
- Crea lead manual.
- Esperado: `source_system=manual`, `source_channel=other`, `ingestion_mode=manual`.

2. Captura CTA web
- Simula POST público con referrer de LinkedIn.
- Esperado: `source_system=cta_web`, `source_channel=linkedin`, `source_detail='LinkedIn+CTA'`.

3. Validaciones de dominio
- Envía `source_system` inválido.
- Esperado: `400`.

4. Listado de leads
- Verificar presencia de campos de origen en respuesta.

5. UI Leads
- Ver badges/labels de origen sin regresión.

6. Multitenancy
- Org A no visualiza leads de Org B.

## 3. No regresión

1. Flujo lead intake existente sigue operativo.
2. No regresión en edición/borrado/listado.

