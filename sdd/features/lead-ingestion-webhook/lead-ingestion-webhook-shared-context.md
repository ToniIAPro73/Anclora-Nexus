# Lead Ingestion Webhook - Shared Context

## CONTEXTO COMPARTIDO

### Repositorios Involucrados
- `anclora-nexus` (Python/FastAPI)
- `n8n` (Workflow de automatización)
- `anclora-private-estates-landing` (Vite + React)

### Dependencias
- Tabla `nexus_leads`
- Webhook n8n

### Estado Actual (Mayo 2026)
- Endpoint básico existe
- Falta validación completa
- Falta conexión con formulario de Landing
- Falta manejo de errores

### Decisiones Técnicas
- Validación con Pydantic
- Autenticación con API Key
- GDPR consent requerido
- Respuesta estándar {id, message, status}

---

**Fin del Shared Context**