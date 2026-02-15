PROMPT: Ejecuta gate final de release para `ANCLORA-CSL-001`.

ENTRADA:
- Entregables A/B/C/D.
- Reporte QA final.

MANDATORY GATES:
1) DB/API contract respected.
2) Currency formatting correctness by selector.
3) Surface model integrity and unit display correctness.
4) No P0/P1 blockers.
5) SDD/changelog/features updated.

OUTPUT:
- Final decision: GO / NO-GO.
- If NO-GO: prioritized fix list.
- If GO: deployment + rollback plan.
