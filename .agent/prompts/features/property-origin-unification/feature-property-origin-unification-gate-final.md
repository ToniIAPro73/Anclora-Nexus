PROMPT: Ejecuta gate final de release para `ANCLORA-POU-001`.

ENTRADA:
- Entregables A/B/C/D.
- Reporte QA final.

GATES OBLIGATORIOS:
1) Contrato DB/API respetado.
2) Origen y portal persisten correctamente.
3) UI muestra señales comerciales sin solapes ni regresión.
4) Sin bloqueantes P0/P1.
5) SDD/changelog/features actualizados.

SALIDA:
- Decisión GO / NO-GO.
- Si NO-GO: fixes priorizados.
- Si GO: plan de despliegue y rollback.

