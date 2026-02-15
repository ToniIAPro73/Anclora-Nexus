PROMPT: Ejecuta gate final de release para `ANCLORA-CGF-001`.

ENTRADA:
- Entregables A/B/C/D.
- Reporte QA final.

PRECONDICIÓN:
- QA debe haber validado explícitamente entorno (`.env` y `frontend/.env.local`) sin `project_ref` hardcodeado.
- Cualquier referencia a proyecto distinto al entorno activo invalida el gate.
- QA debe haber validado i18n en `es`, `en`, `de`, `ru` para textos nuevos/modificados.

GATES OBLIGATORIOS:
1) Contrato DB/API respetado.
2) Presupuesto y consumo por org correctos.
3) Guardrails warning/hard-stop correctos.
4) Sin bloqueantes P0/P1.
5) SDD/changelog/features actualizados.
6) `I18N_MISSING_KEYS` = none.

SALIDA:
- Decision GO / NO-GO.
- Si NO-GO: fixes priorizados.
- Si GO: plan de despliegue y rollback.
