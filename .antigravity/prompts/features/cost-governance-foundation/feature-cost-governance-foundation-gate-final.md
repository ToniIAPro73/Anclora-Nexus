PROMPT: Ejecuta gate final de release para `ANCLORA-CGF-001`.

ENTRADA:
- Entregables A/B/C/D.
- Reporte QA final.

GATES OBLIGATORIOS:
1) Contrato DB/API respetado.
2) Presupuesto y consumo por org correctos.
3) Guardrails warning/hard-stop correctos.
4) Sin bloqueantes P0/P1.
5) SDD/changelog/features actualizados.

SALIDA:
- Decision GO / NO-GO.
- Si NO-GO: fixes priorizados.
- Si GO: plan de despliegue y rollback.
