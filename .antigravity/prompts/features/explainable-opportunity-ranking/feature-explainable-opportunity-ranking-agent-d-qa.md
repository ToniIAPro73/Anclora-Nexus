# Agent D - QA Prompt (ANCLORA-EOR-001)

Validar:
1) Contrato `GET /api/prospection/opportunities/ranking`.
2) Orden correcto por `opportunity_score`.
3) Explainability no vacia (`drivers`, `top_factors`, `next_action`).
4) Filtros (`limit`, `match_status`, `min_opportunity_score`) operativos.
5) Pantalla `/opportunity-ranking` renderiza estados y datos correctamente.
6) i18n completo en `es/en/de/ru` para menu y pantalla.
