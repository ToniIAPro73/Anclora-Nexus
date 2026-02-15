PROMPT: Ejecuta gate final de release para `ANCLORA-PBM-001`.

ENTRADA:
- Entregables A/B/C/D.
- Test report QA final.

GATES OBLIGATORIOS (todos en verde):
1) Contrato DB/API respetado.
2) Seguridad y org isolation verificados.
3) Scores en rango y breakdown explicable.
4) Sin bloqueantes P0/P1.
5) Documentación SDD y changelog actualizados.

SALIDA:
- Decisión final: GO / NO-GO.
- Si NO-GO: lista corta de fixes priorizados.
- Si GO: plan de despliegue y rollback.
