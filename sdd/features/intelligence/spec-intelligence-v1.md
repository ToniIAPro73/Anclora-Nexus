# SPEC — Intelligence (v1, reverse-spec)

## 0) Alcance
Incluye:
- UI /intelligence
- Backend orchestrator (router, governor, synthesizer)
- Integración con audit/logs
- Uso interno (no producto público)

No incluye:
- SaaS externo
- Multiagente complejo
- Infraestructura pesada

## 1) Entrada
- Query del usuario
- Contexto de sesión (org_id si aplica)
- Modo estratégico u operativo

## 2) Salida esperada
- Diagnóstico
- Recomendación
- Riesgos / trade-offs
- Próximos pasos concretos
- Qué NO hacer

## 3) Implementación real (paths)
- backend/intelligence/**
- intelligence-engine/**
- frontend/src/**/intelligence/**

## 4) Criterios de aceptación
- No rompe otras features
- No introduce sobreingeniería
- Mantiene coherencia con Fase 1 (validación inmobiliaria)
