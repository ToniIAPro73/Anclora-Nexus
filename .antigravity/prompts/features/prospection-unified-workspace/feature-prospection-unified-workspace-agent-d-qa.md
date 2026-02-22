# Agent D QA Prompt — ANCLORA-PUW-001

Objetivo: validar que el workspace unificado cumple funcionalidad, scope y no regresiona vistas existentes.

## Checklist minimo
- [ ] Owner/Manager ven datos completos de org.
- [ ] Agent solo ve registros asignados.
- [ ] Filtros sincronizan paneles sin inconsistencias.
- [ ] Crear follow-up task desde workspace funciona.
- [ ] `/prospection` legacy sigue operativo.
- [ ] Sin fuga cross-org.

## Salida requerida
- Reporte QA en markdown con:
  - hallazgos por severidad
  - evidencia (ruta/componente/endpoint)
  - resultado final: `PASS` o `FAIL`

