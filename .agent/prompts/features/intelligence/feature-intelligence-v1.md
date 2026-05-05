PROMPT: Mantener y extender la feature 'Intelligence' bajo SDD v2.

LECTURAS OBLIGATORIAS (en orden)
1) sdd/core/constitution-canonical.md
2) sdd/core/product-spec-v0.md
3) sdd/core/spec-core-v1.md
4) .agent/rules/workspace-governance.md
5) sdd/features/intelligence/INDEX.md
6) sdd/features/intelligence/spec-intelligence-v1.md

FUENTE DE VERDAD DE IMPLEMENTACIÓN
- backend/intelligence/**
- intelligence-engine/**
- frontend/src/**/intelligence/**

REGLAS
- No convertir Intelligence en producto público.
- No introducir sobreingeniería.
- No modificar core sin versionado explícito.
- Mantener coherencia con Fase 1 (validación inmobiliaria).
- Cualquier cambio debe incluir: plan + implementación + verificación + walkthrough final.

ENTREGA ESPERADA
1) Plan
2) Archivos modificados
3) Verificación / tests
4) Cómo probarlo localmente
