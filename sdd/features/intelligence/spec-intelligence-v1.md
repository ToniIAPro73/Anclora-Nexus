# SPEC — Intelligence (v1.1, Refactored)

## 0) Alcance
Incluye:
- UI /intelligence
- Backend orchestrator (router, governor, synthesizer)
- Integración con audit/logs
- Orquestación de Skills (lead_intake, prospection_weekly, recap_weekly)
- Uso interno (no producto público)

No incluye:
- SaaS externo
- Multiagente complejo
- Infraestructura pesada

## 1) Skills Specification
Los skills son los brazos ejecutores de la inteligencia. Cada uno debe cumplir con:
- **Validación**: Uso de Pydantic para input/output traits.
- **Resiliencia**: Retry logic (3 intentos) con exponential backoff.
- **Auditoría**: Registro obligatorio en `intelligence_audit_log`.

### Skills de Fase 1:
1. **lead_intake**: Clasifica leads por prioridad (1-5) usando GPT-4o-mini.
2. **prospection_weekly**: Cruza leads con propiedades en venta (Mallorca SW).
3. **recap_weekly**: Genera informe dominical con KPIs y tono de lujo.

## 2) Estrategia de Testing (Mirror Multi-Tenant)
Se requiere un coverage del 85%+ en backend.

### Capas de Test:
- **Unitarios**: Governor, Router, Synthesizer aislados.
- **Integration**: Orchestrator interactuando con DB y Mock LLM.
- **Skill Tests**: Validación de schemas y lógica de negocio para cada skill.
- **Compliance**: Verificación de firmas HMAC en el audit log.

## 3) Deuda Técnica y Plan de Refactor
Actual desalineación #1 (Skills en `backend/skills`) será resuelta moviendo el código a `sdd/features/intelligence/skills/` y aplicando validación estricta.

### Plan:
1. Definir Pydantic models para cada skill.
2. Implementar structured logging (JSON).
3. Migrar lógica a la nueva ubicación SDD.

## 4) Error Handling Requirements
- Los errores no deben romper el flujo del orchestrator.
- Fallback a "operación degradada" si el LLM primario falla (Claude 3.5 Sonnet).
- Error codes específicos para cada fallo de pre-condición (Falta de datos, Timeouts).

## 5) Criterios de Aceptación
- No rompe otras features.
- No introduce sobreingeniería.
- Mantiene coherencia con Fase 1 (validación inmobiliaria).
- Todas las ejecuciones de skills son auditables y verificables.
