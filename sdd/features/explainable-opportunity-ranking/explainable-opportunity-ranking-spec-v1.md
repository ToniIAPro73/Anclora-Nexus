# Explainable Opportunity Ranking v1 - Spec

## Problema
Los matches se ordenan por `match_score`, pero comercialmente falta:
- ponderar valor económico,
- ponderar motivación real del buyer,
- explicar por qué una oportunidad sube o baja,
- proponer siguiente acción operativa.

## Objetivo
Crear ranking comercial explicable para acelerar cierre y foco del equipo.

## Diseño v1

### Endpoint
- `GET /api/prospection/opportunities/ranking`
- Query params:
  - `limit` (1..100)
  - `min_opportunity_score` (0..100)
  - `match_status` (opcional)

### Score compuesto (v1)
- `opportunity_score = 0.65 * match_score + 0.20 * commission_norm + 0.15 * buyer_motivation`
- `commission_norm` normalizado contra la comisión máxima del conjunto.

### Explicabilidad
- `drivers`: match_score, comisión potencial, motivación buyer.
- `top_factors`: top 3 factores del `score_breakdown` original.
- `confidence`: indicador simple según disponibilidad de factores.

### Recomendación operativa
- `next_action` sugerida según score y estado de match.
- `priority_band`: `hot` / `warm` / `cold`.

### Frontend
- Nueva ruta: `/opportunity-ranking`.
- Vista ejecutiva con:
  - KPIs (`hot/warm/cold`),
  - filtros básicos,
  - cards de oportunidad con desglose explicable.

## Criterios de aceptación
- Devuelve ranking ordenado por `opportunity_score`.
- Cada ítem incluye explicación y `next_action`.
- UI muestra ranking operativo con filtros y estilo Nexus.
- i18n completa en `es/en/de/ru`.
