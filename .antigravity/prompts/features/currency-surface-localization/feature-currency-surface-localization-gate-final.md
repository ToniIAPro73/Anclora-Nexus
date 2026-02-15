PROMPT: Ejecuta gate final de release para `ANCLORA-CSL-001`.

ENTRADA:
- Entregables A/B/C/D.
- Reporte QA final.

PRECONDICIONES OBLIGATORIAS:
1) QA validó entorno leyendo `.env` y `frontend/.env.local` (sin `project_ref` hardcodeado).
2) Backend y frontend apuntan al mismo proyecto Supabase.
3) Se validó i18n de textos nuevos/modificados en `es`, `en`, `de`, `ru`.

GATES OBLIGATORIOS:
1) Contrato DB/API respetado.
2) Persistencia y reglas de superficie/moneda correctas.
3) UI sin regresiones en properties/prospection/dashboard.
4) Sin bloqueantes P0/P1.
5) SDD/changelog/features actualizados.
6) Sin faltantes de traducción (`I18N_MISSING_KEYS` = none).

SALIDA:
- Decisión GO / NO-GO.
- Si NO-GO: lista corta de fixes priorizados.
- Si GO: plan de despliegue y rollback.
