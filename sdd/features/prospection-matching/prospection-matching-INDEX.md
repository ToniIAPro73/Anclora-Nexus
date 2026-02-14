# INDEX: PROSPECTION & BUYER MATCHING V1

**Feature ID**: ANCLORA-PBM-001  
**Versión**: 1.0  
**Status**: Specification Phase  
**Prioridad**: CRITICAL

---

## DOCUMENTO MAP

| Documento | Propósito |
|---|---|
| `sdd/features/prospection-matching-spec-v1.md` | Especificación funcional y técnica |
| `sdd/features/prospection-matching-spec-migration.md` | Plan de migraciones + backfill |
| `sdd/features/prospection-matching-test-plan-v1.md` | Estrategia de pruebas |
| `.agent/rules/feature-prospection-matching.md` | Reglas inmutables de implementación |
| `.agent/skills/features/prospection-matching-SKILL.md` | Skill de ejecución para agente |
| `.antigravity/prompts/feature-prospection-matching-v1.md` | Prompt principal |
| `.antigravity/prompts/feature-prospection-matching-shared-context.md` | Contexto común multi-agente |
| `.antigravity/prompts/feature-prospection-matching-master-parallel.md` | Orquestación Agents A/B/C/D |

---

## ALCANCE V1

- Prospección de inmuebles de alto ticket en canales permitidos.
- Prospección de compradores potenciales y normalización de perfil.
- Motor de vínculo comprador-propiedad con `match_score` explicable.
- Base de datos de enlaces para investigación y seguimiento comercial.
- Widgets de priorización comercial en dashboard.

No incluido v1:
- Automatización agresiva fuera de términos de plataforma.
- Contactación masiva sin control humano.
- Predicción ML avanzada (se deja para v1.1+).

---

## ESTRUCTURA SDD OBJETIVO

```
sdd/features/prospection-matching/
  INDEX.md
  spec-prospection-matching-v1.md
  spec-prospection-matching-migration.md
  tests/test-specifications/test-plan-v1.md
  tests/test-specifications/test-cases-*.md
```

Nota: por limitación actual de permisos de carpetas en este workspace, los artefactos v1 se almacenan temporalmente en formato plano bajo `sdd/features/` y se podrán mover a la estructura final cuando se habilite creación de subdirectorios.

