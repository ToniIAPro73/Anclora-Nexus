---
name: feature-intelligence
description: "Implementación y mantenimiento de Intelligence bajo SDD v2."
---

# Skill — Feature Intelligence (SDD v2)

## Lecturas obligatorias (en orden)
1) sdd/core/constitution-canonical.md
2) sdd/core/product-spec-v0.md
3) sdd/features/intelligence/INDEX.md
4) sdd/features/intelligence/spec-intelligence-v1.md
5) sdd/features/intelligence/skills-specification.md

## Métodos de Desarrollo
- **run_lead_intake**: Procesa data cruda de leads, asigna prioridad LLM y persiste en DB.
- **run_prospection_weekly**: Analiza leads activos y cruza con inventario de propiedades para generar recomendaciones.
- **run_recap_weekly**: Consolida actividad semanal en un informe de alto valor para el agente.

## Implementación de Skills (Pattern)
1. **Modelado**: Crear models Pydantic en `sdd/features/intelligence/skills/models.py`.
2. **Validación**: Implementar pre-vuelo en el skill para evitar llamadas LLM con basura.
3. **Ejecución**: Usar `LLMService` con el fallback configurado en el core.
4. **Audit**: Llamar a `audit_logger` con el schema definido en `AUDIT-LOG-SCHEMA.md`.

## Testing Pattern
- Cada skill debe tener un archivo de test en `sdd/features/intelligence/tests/`.
- Mockear servicios externos (LLM, Supabase).
- Verificar que el error handling captura fallos de API externos sin colapsar.
