# PROMPT: GRAVITY CLAW WHALE WORKBENCH V1

Implementa una mesa de trabajo comercial por seller de alta prioridad en Anclora Nexus.

## Objetivo

Desde `/sellers`, el usuario debe poder:
- generar dossier de captacion
- generar borrador email
- generar borrador WhatsApp
- generar brief de llamada
- obtener un resumen de contexto reutilizable
- registrar interacciones manuales
- consultar historial reciente

## Reglas

- Reusar `seller_interactions`.
- Persistir cada artefacto con `metadata.artifact`.
- No crear envio automatico a canales externos.
- Mantener compatibilidad con el endpoint existente `generate-dossier`.
- Añadir docs de feature completas: spec, index, test-plan, QA, gate, rule, skill.
