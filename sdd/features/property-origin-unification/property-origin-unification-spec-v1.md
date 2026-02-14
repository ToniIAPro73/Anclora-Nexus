# SPEC: PROPERTY ORIGIN UNIFICATION V1

**Feature ID**: ANCLORA-POU-001  
**Version**: 1.0  
**Status**: Specification Phase

## 1. Problema

Actualmente la pantalla `Propiedades` mezcla inmuebles de varios flujos sin trazabilidad consistente:

- No siempre queda claro el origen real de cada propiedad.
- Los datos de matching (buyer, score, comisión) no se ven de forma homogénea.
- El origen por portal no está normalizado.

## 2. Objetivo v1

Dar visibilidad unificada y accionable de origen + vínculo comercial en cada ficha de propiedad.

## 3. Alcance funcional

1. Origen normalizado por propiedad:
- `manual`
- `widget`
- `pbm`

2. Portal fuente opcional:
- `idealista`, `fotocasa`, `facebook`, `instagram`, `rightmove`, `kyero`, `other`.

3. En ficha de propiedad (lista):
- Badge de origen legible.
- Badge de portal (si existe).
- Buyer potencial (top match), `% match`, comisión estimada (si existe vínculo).

4. Alta/edición manual:
- Captura de `source_system`.
- Captura de `source_portal`.

## 4. Modelo de datos v1

Extensión de `properties`:

- `source_system TEXT NOT NULL DEFAULT 'manual'`
- `source_portal TEXT NULL`

Checks:

- `source_system IN ('manual','widget','pbm')`
- `source_portal IS NULL OR source_portal IN ('idealista','fotocasa','facebook','instagram','rightmove','kyero','other')`

## 5. Reglas de negocio

1. `source_system='manual'` cuando alta desde modal.
2. `source_system='widget'` cuando alta desde skill/flujo de prospección automática.
3. `source_system='pbm'` cuando propiedad nace en prospección+matching o queda enlazada de forma persistente a PBM.
4. Si existen múltiples matches, mostrar:
- `topBuyerName` del match con mayor `match_score`.
- `bestMatchScore`.
- `bestCommission`.

## 6. API/servicios

Backend:

- `POST /properties`: aceptar `source_system`, `source_portal`.
- `GET /properties`: devolver ambos campos.
- Job/skill de widget: setear `source_system='widget'`.

Frontend:

- `createProperty()` envía `source_system` y `source_portal`.
- Vista `Propiedades` renderiza badges y datos de match.

## 7. Criterios de aceptación

1. Toda propiedad muestra origen claro.
2. No hay regresiones en alta manual.
3. Propiedades con match muestran buyer + score + comisión.
4. Datos de portal visibles cuando existan.
5. Sin romper multitenancy ni filtros `org_id`.

## 8. Fuera de alcance v1

- Normalizador semántico avanzado de portales.
- Dedupe fuzzy cross-source automático global.
- Motor de reconciliación histórico completo.

