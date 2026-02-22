# Test Plan - Explainable Opportunity Ranking v1

## Objetivo
Validar que el ranking de oportunidad sea interpretable, estable y útil para priorización comercial.

## Backend
1. `GET /api/prospection/opportunities/ranking`
- Debe devolver lista ordenada por `opportunity_score` descendente.
- Debe incluir `total`, `limit`, `scope`.

2. Filtros
- `match_status` aplica filtro real.
- `min_opportunity_score` excluye resultados por debajo de umbral.
- `limit` controla tamaño de respuesta.

3. Explainability
- Cada item incluye `drivers` con `match_score`, `commission_potential`, `buyer_motivation`.
- `top_factors` no vacío cuando existe `score_breakdown`.
- `next_action` no vacío y coherente con banda (`hot/warm/cold`).

4. Seguridad por rol
- Owner/Manager ven scope global de organización.
- Agent ve solo registros asignados o autorizados por su scope.

## Frontend
1. La pantalla `/opportunity-ranking` carga sin errores.
2. Los KPIs (total/hot/warm/cold) cuadran con datos recibidos.
3. Cambiar filtros dispara refresco de datos.
4. Cada card muestra score, drivers y recomendación de acción.
5. Estados de loading/error/empty funcionan correctamente.

## i18n
1. Revisar keys nuevas en `es/en/de/ru`.
2. Sidebar muestra etiqueta localizada de menú.
3. No quedan textos hardcodeados visibles en la pantalla.

## Criterios QA
- Sin errores TS/Lint en archivos modificados.
- No ruptura de rutas existentes.
- Mensajes de error legibles para usuario final.
