# Agent A - DB Prompt (ANCLORA-EOR-001)

Objetivo:
- Confirmar que el ranking se puede calcular con el schema actual.
- Identificar gaps de columnas/indices para performance.
- Proponer migracion minima solo si es estrictamente necesaria.

Validaciones:
1) Disponibilidad de campos para score compuesto.
2) Disponibilidad de `score_breakdown` o alternativa.
3) Riesgos de query latency por joins/agregaciones.
