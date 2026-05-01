# Guía Detallada de Orquestación – HNWI Prospection (ANCLORA-HNWI-001)

## 1. Visión General de la Orquestación

La orquestación del sistema HNWI Prospection sigue un modelo de **agentes secuenciales** con handoff claro entre fases, similar al patrón usado en otros features del repositorio (source-connectors-unified-ingestion, source-performance-observatory).

**Flujo General:**
```
Agent A (DB) → Agent B (Backend) → Agent C (n8n) → Agent D (QA) → Gate Final
```

---

## 2. Agent A – Base de Datos

### Responsabilidades
- Aplicar migración `20260502_hnwi_prospection.sql`
- Crear tabla `hnwi_prospection_events`
- Añadir columnas a la tabla `leads`
- Crear índices y vista materializada
- Verificar integridad de datos

### Entregables
- Script de migración ejecutado
- Reporte de verificación post-migración
- Documentación de rollback

### Criterios de Handoff
- Migración aplicada sin errores
- Índices creados y funcionales
- Vista `hnwi_prospection_metrics` accesible

---

## 3. Agent B – Backend (FastAPI)

### Responsabilidades
- Extender el endpoint `POST /api/ingestion/leads`
- Crear `hnwi_scoring_service.py`
- Implementar lógica de scoring (reglas + futuro LLM)
- Añadir generación automática de eventos FinOps
- Crear flujo de outreach `email-first` para leads HNWI

### Archivos a Modificar/Crear
- `backend/api/routes/ingestion.py` (extensión)
- `backend/services/hnwi_scoring_service.py` (nuevo)
- `backend/services/finops.py` (extensión)
- `backend/api/routes/source_observatory.py` (extensión)

### Entregables
- Código funcional y documentado
- Tests unitarios pasando
- Documentación de contratos de API actualizada

---

## 4. Agent C – n8n + Orchestration

### Responsabilidades
- Importar y configurar workflow `n8n_hnwi_prospection_workflow_v2.json`
- Configurar variables de entorno (`NEXUS_API_URL`, `NEXUS_SERVICE_TOKEN`, `PUBLIC_CTA_ORG_ID`)
- Configurar preparación automática de brief + email draft para leads Hot
- Configurar alertas automáticas (baja tasa de respuesta, exceso de leads Hot sin email, etc.)
- Documentar el workflow

### Entregables
- Workflow funcionando en producción
- Documentación de configuración
- Logs de ejecución de 48h sin errores

---

## 5. Agent D – QA

### Responsabilidades
- Ejecutar el `hnwi-prospection-test-plan-v1.md`
- Validar E2E con leads reales de diferentes canales y nacionalidades
- Verificar cumplimiento GDPR
- Ejecutar pruebas de carga (100+ leads)
- Validar integración con email supervised/native email

### Entregables
- Reporte de QA con % de tests pasados
- Evidencias de pruebas E2E
- Lista de defectos (si los hay) con severidad

---

## 6. Gate Final

### Criterios de Aceptación
- 95%+ de tests pasando
- No hay P0 o P1 abiertos
- Tiempo de procesamiento < 5 segundos por lead
- Cumplimiento GDPR verificado
- Documentación completa

### Decisión
- **GO**: Feature lista para producción
- **NO-GO**: Plan de fixes priorizado (máximo 5 días)

---

## 7. Herramientas y Tecnologías

| Fase | Herramienta | Propósito |
|------|-------------|---------|
| DB | Supabase + psql | Migraciones y verificación |
| Backend | FastAPI + Pytest | Desarrollo y tests |
| Orchestration | n8n | Automatización de flujos |
| QA | Postman + n8n Execution Log | Pruebas de API y workflows |
| Monitoring | Source Observatory + FinOps | Métricas y alertas |

---

## 8. Cronograma Estimado

| Semana | Agente | Entregable Principal |
|--------|--------|----------------------|
| 1      | A + B  | Migración + Backend básico |
| 2      | B + C  | Scoring + Workflow v2 |
| 3      | C + D  | Automatización + QA inicial |
| 4      | D + Gate | QA final + Gate |

---

**Fin de la Guía de Orquestación**
