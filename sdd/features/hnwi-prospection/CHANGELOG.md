# Changelog – ANCLORA-HNWI-001 (HNWI Prospection)

Todos los cambios notables de este proyecto se documentan en este archivo.

---

## [1.0.0] - 2026-05-01

### Añadido
- Especificación completa del feature (spec-v1.md)
- Buyer Persona detallado con 6 nacionalidades prioritarias
- Sistema de scoring HNWI (0-100 puntos)
- Workflow n8n v2 con scoring automático y clasificación Hot/Warm/Cold
- Integración nativa con WhatsApp Qualification (WA-001)
- Migración de base de datos (hnwi_prospection_events + campos en leads)
- Dashboard de métricas recomendado para Source Observatory
- Plan de pruebas completo (test-plan-v1.md)
- Orquestación por agents (master-parallel.md)
- Gate Final definido

### Cambiado
- Workflow n8n original mejorado a versión v2 con:
  - Trigger cada 12 horas
  - Scoring inteligente con reglas
  - Mejor manejo de metadatos (nacionalidad, zona, intención)
  - Logging mejorado

### Documentación
- Guía completa en Word (18KB)
- README.md del feature
- Shared Context
- INDEX del SDD
- 20 búsquedas Boolean optimizadas por nacionalidad

---

## [0.9.0] - 2026-04-30 (Pre-release)

### Añadido
- Primer borrador de Buyer Persona
- Estrategias de prospección por canal
- Workflow n8n inicial (v1)
- Documento guía en Word

---

**Próxima versión planificada**: 1.1.0 (Incluye LLM scoring con Groq y dashboard en Source Observatory)