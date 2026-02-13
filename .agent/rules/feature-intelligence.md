---
trigger: always_on
---

# Feature Rules — Intelligence (SDD v2)

## Jerarquía normativa
1) sdd/core/constitution-canonical.md
2) sdd/features/intelligence/spec-intelligence-v1.md
3) intelligence-engine/contracts/**

## Reglas de Ejecución de Skills
- **Validación Pre-vuelo**: Todo skill debe validar su input schema antes de llamar a servicios externos.
- **Output Estricto**: Todo output de skill debe ser parseado vía Pydantic. Jamás retornar diccionarios planos.
- **Audit Requirement**: Cada ejecución exitosa o fallida DEBE generar una entrada en `audit_log` con el `agent_id` correspondiente.

## Orchestration Rules
- El Governor es la máxima autoridad para decisiones estratégicas.
- El Router solo decide el "camino", no la ejecución de la tarea.
- El Synthesizer es el responsable único de la respuesta final al usuario.

## Error Handling & Logging
- Usar logging estructurado (JSON) para facilitar el parsing por otros agentes.
- Implementar retries con backoff en llamadas a LLM.
- Fallback obligatorio: Si GPT-4o-mini falla, intentar con Claude 3.5 Sonnet.

## Reglas duras (Inmutables)
- No convertir Intelligence en producto público.
- No introducir multiagente complejo sin nueva versión de spec.
- Mantener enfoque Fase 1: soporte a validación inmobiliaria.
- No modificar core sin versionado explícito.