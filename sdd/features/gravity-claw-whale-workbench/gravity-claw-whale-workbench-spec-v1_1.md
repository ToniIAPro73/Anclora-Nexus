# SPEC: GRAVITY CLAW WHALE WORKBENCH V1.1

**Feature ID**: ANCLORA-GCWW-001  
**Status**: Hardening  
**Owner**: Product + CTO

## Contexto

La workbench ya existia, pero `/sellers` seguia mostrando oportunidades territoriales hardcoded. Eso generaba una inconsistencia directa entre discurso comercial y datos operativos reales.

## Objetivo v1.1

Sustituir el bloque territorial fijo de `/sellers` por oportunidades derivadas del backend territorial activo.

## Requisitos funcionales

### RF-01 Oportunidades vivas
- `/sellers` debe consultar `GET /api/intelligence/territorial-summary`.
- Debe renderizar las oportunidades a partir de `summary[zona]`.

### RF-02 Priorizacion visual
- Ordenar por `metadata.urgencia` cuando exista.
- Mostrar hasta 5 oportunidades.

### RF-03 Degradacion segura
- Si el backend no responde o no hay datos, el bloque debe degradar de forma clara.

## No funcionales

- Sin nueva tabla ni migracion.
- Sin duplicar datos territoriales en frontend.
- Mantener consistencia con `RadarTerritorial`.

## Criterios de aceptacion

1. `/sellers` deja de contener oportunidades territoriales hardcoded.
2. El bloque se alimenta de backend vivo.
3. La vista sigue siendo util cuando no hay datos.
