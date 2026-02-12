# ANCLORA INTELLIGENCE v1.0 — ÍNDICE COMPLETO
## Guía de Navegación de Toda la Entrega
### Febrero 2026

---

# 📑 ARCHIVOS ENTREGADOS (8 DOCUMENTOS)

## **NIVEL 0: EMPEZAR AQUÍ**

### 📋 [RESUMEN-EJECUTIVO.md](./RESUMEN-EJECUTIVO.md)
**Lectura: 10-15 minutos**

Síntesis ejecutiva del proyecto:
- ¿Qué se entregó? (7 archivos)
- ¿Cuál es el propósito? (Sistema nervioso estratégico)
- ¿Cuál es la arquitectura? (5 componentes core)
- ¿Cuáles son las decisiones clave? (5 decisiones)
- ¿Cómo se implementa? (Timeline estimado)

**👉 EMPEZAR POR AQUÍ si es tu primera vez.**

### 📍 [MANIFEST-INTEGRACION.md](./MANIFEST-INTEGRACION.md)
**Lectura: 10-15 minutos**

Guía práctica de integración al repo:
- Estructura de carpetas recomendada
- Ubicación de cada archivo
- Contenido a crear (código, migrations)
- Checklist de integración paso a paso
- Referencias cruzadas

**👉 LEER DESPUÉS del resumen ejecutivo antes de comenzar la integración.**

---

## **NIVEL 1: NORMAS Y PRINCIPIOS**

### 📜 [intelligence-constitution.md](./intelligence-constitution.md)
**Lectura: 20-30 minutos | Referencia obligatoria**

Normas supremas de Anclora Intelligence:
- Definiciones (glosario de 8 términos)
- Jerarquía normativa (7 niveles)
- Reglas de Oro de Intelligence (5 capítulos)
  - Soberanía de decisión estratégica
  - Identidad y transparencia
  - Límites de dominio
  - Gobernanza estratégica
  - Trazabilidad y auditoría
- Contrato de respuesta (formato fijo, 5 secciones)
- Riesgos y escalaciones
- Integración con constitution-canonical.md

**💡 Toda decisión técnica debe poder justificarse con referencia a este documento.**

**👉 LEER COMO SEGUNDA LECTURA después del resumen ejecutivo.**

### 📋 [anclora-intelligence-rules.md](./anclora-intelligence-rules.md)
**Lectura: 15-20 minutos | Referencia operacional**

Directrices explícitas de gobernanza:
- Principio rector: "Consolidar base sólida hoy..."
- 6 anti-patterns clave (sobreingeniería, multiplicación, cambios laborales, expansión marca, etc.)
- 13 reglas operacionales (Reglas #7-#13 del Governor)
- Hitos de validación por fase (Phase 1-3)
- Red flags críticas (monitoreo)
- Revisión periódica

**💡 Referencia obligatoria para QA, governance y validación constitucional.**

**👉 LEER MIENTRAS SE CODIFICA para validar contra anti-patterns.**

---

## **NIVEL 2: ESPECIFICACIÓN FUNCIONAL Y TÉCNICA**

### 🎯 [intelligence-product-spec-v1.md](./intelligence-product-spec-v1.md)
**Lectura: 20-30 minutos | Referencia para Product y UX**

Especificación funcional: "Qué hace Intelligence"
- Contexto y propósito
- Principio rector (explicado operativamente)
- Capacidades core (5 capacidades Phase 1)
  - Consulta estratégica estructurada
  - Análisis de riesgo multidominio
  - Gobernanza por Strategic Mode
  - Recomendaciones estructuradas
  - Detección de overengineering
- UI/UX (Control Center, layout, zones)
- Workflows: 3 casos de uso completos
- Scope: Qué SÍ/NO hace Intelligence
- Diferimientos explícitos (Phase 2+)
- Métricas de éxito

**👉 LEER ANTES DE INICIAR FRONTEND o confirmación de requirements.**

### 🔧 [intelligence-spec-v1.md](./intelligence-spec-v1.md)
**Lectura: 30-40 minutos | Referencia para Desarrollo**

Especificación técnica: "Cómo funciona Intelligence"
- Arquitectura general (visión, componentes, carpetas)
- Type definitions (dataclasses, enums, schemas)
- 5 componentes core:
  - Router (clasificación intención)
  - Strategic Mode Loader (lectura versionada Git)
  - Governor (evaluación riesgos + recomendación)
  - Synthesizer (construcción respuesta)
  - Orchestrator (orquestación end-to-end)
- Integración Supabase (schema DB)
- FastAPI endpoints (3 rutas)
- Frontend architecture (React components)
- Deployment (env vars, error handling)

**👉 REFERENCIA TÉCNICA OBLIGATORIA durante desarrollo backend/frontend.**

---

## **NIVEL 3: CATÁLOGO Y CONSTRUCCIÓN**

### 🛠️ [intelligence-skills.yaml](./intelligence-skills.yaml)
**Lectura: 10-15 minutos | Referencia MCP**

Catálogo de skills (funciones disponibles):
- 5 skills Phase 1 (implementadas)
  - SKILL_001: Router Classification
  - SKILL_002: Strategic Mode Loader
  - SKILL_003: Risk Evaluator
  - SKILL_004: Governor Decision Engine
  - SKILL_005: Response Synthesizer
- 2 skills Phase 2 (deferred)
- Skills Phase 3+ (deferred)
- Input/Output schemas (YAML format)
- Heurísticas de detección
- Ejemplos de invocación
- Dependencias entre skills
- Versionado y changelog

**👉 Consulta durante implementación para validar interfaces.**

### 🎨 [antigravity-prompt-intelligence.md](./antigravity-prompt-intelligence.md)
**Lectura: 20-30 minutos | Referencia para Construcción**

Prompt para Antigravity IDE (construcción disciplinada):
- Instrucciones meta (qué hacer con prompt)
- Contexto fundacional (quién eres, por qué existe Intelligence)
- Estructura arquitectónica (jerarquía de normas, componentes)
- Decisiones técnicas clave (4 decisiones críticas)
- Anti-patterns a evitar (3 anti-patterns prohibidos)
- Flujo de construcción (10 fases ordenadas A-J)
- Testing strategy (unit, integration, constitutional validation)
- Checkpoints y validación (checklist de aceptación)
- Notas de construcción (errores comunes, escalaciones)

**👉 COPIA-PEGA EN ANTIGRAVITY IDE antes de comenzar Phase A.**

---

# 🗂️ ESTRUCTURA DE CARPETAS (REPO)

```
Anclora-Nexus/

├─ 📄 DOCUMENTOS NORMATIVOS (Raíz)
│  ├── intelligence-constitution.md          ← Reglas Supremas Intelligence
│  ├── intelligence-product-spec-v1.md       ← Qué hace
│  ├── intelligence-spec-v1.md               ← Cómo funciona
│  └── (junto a constitution-canonical.md, spec.md, product-spec-v0.md)
│
├─ .agent/
│  ├── rules/
│  │   └── anclora-intelligence.md           ← Directrices Operacionales
│  └── skills/
│      └── intelligence-skills.yaml          ← Catálogo MCP
│
├─ .antigravity/
│  └── prompts/
│      └── antigravity-prompt-intelligence.md ← Prompt Construcción
│
├─ intelligence-engine/                       ← NUEVA CARPETA
│  ├── governance/
│  │   └── strategic-mode-registry.md       ← Strategic Mode v1 (Git)
│  ├── domain-packs/
│  │   └── real-estate-mallorca-premium.yaml ← Domain Pack v1
│  └── config.yaml                           ← Config general
│
├─ backend/intelligence/                     ← NUEVA CARPETA (Python)
│  ├── __init__.py
│  ├── types.py                    (Phase 1)
│  ├── orchestrator.py             (Phase 1)
│  ├── router.py                   (Phase 1)
│  ├── strategic_mode_loader.py    (Phase 1)
│  ├── governor.py                 (Phase 1)
│  ├── synthesizer.py              (Phase 1)
│  ├── notebook_bridge.py          (Phase 2 - stub)
│  ├── domain_registry.py          (Phase 5 - stub)
│  └── utils/
│      ├── risk_evaluator.py       (Phase 1)
│      ├── strategic_mode_parser.py (Phase 1)
│      └── constants.py            (Phase 1)
│
└─ frontend/src/pages/intelligence/           ← NUEVA CARPETA (React)
   ├── index.tsx
   ├── components/
   │   ├── ChatConsole.tsx
   │   ├── DecisionConsole.tsx
   │   ├── QueryPlanPanel.tsx
   │   └── RiskChips.tsx
   └── hooks/
       ├── useIntelligenceQuery.ts
       └── useStrategicMode.ts
```

---

# 📚 GUÍA DE LECTURA POR ROL

## 👨‍💼 Para Toni (Fundador / Usuario)

**Lectura Recomendada (30 minutos):**

1. ✅ [RESUMEN-EJECUTIVO.md](./RESUMEN-EJECUTIVO.md) — Visión general
2. ✅ [MANIFEST-INTEGRACION.md](./MANIFEST-INTEGRACION.md) — Plan de integración
3. ✅ [intelligence-constitution.md](./intelligence-constitution.md) — Normas (secciones 1-3)
4. ✅ [intelligence-product-spec-v1.md](./intelligence-product-spec-v1.md) — Capacidades

**Después:** Confirmar alineación con Strategic Mode v1 (Validation Phase)

---

## 👨‍💻 Para Desarrolladores (Backend)

**Lectura Recomendada (60 minutos):**

1. ✅ [RESUMEN-EJECUTIVO.md](./RESUMEN-EJECUTIVO.md) — Contexto
2. ✅ [intelligence-spec-v1.md](./intelligence-spec-v1.md) — Arquitectura técnica
3. ✅ [intelligence-constitution.md](./intelligence-constitution.md) — Normas (secciones 2-3)
4. ✅ [antigravity-prompt-intelligence.md](./antigravity-prompt-intelligence.md) — Construcción (secciones 3-7)
5. ✅ [intelligence-skills.yaml](./intelligence-skills.yaml) — Interfaces MCP

**Después:** Copy-paste Antigravity Prompt → IDE → iniciar Phase A

---

## 🎨 Para Desarrolladores (Frontend)

**Lectura Recomendada (40 minutos):**

1. ✅ [RESUMEN-EJECUTIVO.md](./RESUMEN-EJECUTIVO.md) — Contexto
2. ✅ [intelligence-product-spec-v1.md](./intelligence-product-spec-v1.md) — Sección "UI/UX"
3. ✅ [intelligence-spec-v1.md](./intelligence-spec-v1.md) — Sección "Frontend"
4. ✅ [antigravity-prompt-intelligence.md](./antigravity-prompt-intelligence.md) — Sección "Phase I"

**Después:** Implementar Control Center UI (/intelligence route)

---

## 🧪 Para QA y Governance

**Lectura Recomendada (50 minutos):**

1. ✅ [RESUMEN-EJECUTIVO.md](./RESUMEN-EJECUTIVO.md) — Contexto
2. ✅ [anclora-intelligence-rules.md](./anclora-intelligence-rules.md) — Todas las secciones
3. ✅ [intelligence-constitution.md](./intelligence-constitution.md) — Secciones "Reglas de Oro"
4. ✅ [antigravity-prompt-intelligence.md](./antigravity-prompt-intelligence.md) — Sección "Testing Strategy"

**Después:** Preparar test cases contra anti-patterns y Constitutional Compliance

---

# ⏱️ HITOS Y DELIVERABLES

| Hito | Documento | Status |
|---|---|---|
| Arquitectura definida | Constitution + Product Spec + Tech Spec | ✅ DONE |
| Governance establecida | Rules + Skills Catalog | ✅ DONE |
| Prompt de construcción | Antigravity Prompt | ✅ DONE |
| Plan de integración | Manifest | ✅ DONE |
| Resumen ejecutivo | Resumen-Ejecutivo + Index | ✅ DONE |
| **Implementation Phase 1** | Backend + Frontend | ⏳ IN PROGRESS |
| **Testing Phase 1** | Unit + Integration + Validation | ⏳ PLANNED |
| **Launch Phase 1** | Production deployment | ⏳ PLANNED |

---

# 📞 PREGUNTAS FRECUENTES

## ¿Por dónde empiezo?

1. Lee [RESUMEN-EJECUTIVO.md](./RESUMEN-EJECUTIVO.md) (10 min)
2. Lee [MANIFEST-INTEGRACION.md](./MANIFEST-INTEGRACION.md) (10 min)
3. Lee [intelligence-constitution.md](./intelligence-constitution.md) (20 min)
4. Importa archivos al repo según Manifest
5. Copy-paste [antigravity-prompt-intelligence.md](./antigravity-prompt-intelligence.md) a IDE
6. Comienza Phase A (Types)

## ¿Qué es lo más importante?

1. **Principio Rector:** "Consolidar base sólida hoy para decidir con libertad mañana"
2. **Jerarquía Normativa:** Constitution prevalece siempre
3. **Governor es intérprete:** No ejecuta acciones
4. **Strategic Mode inmutable:** Solo Git
5. **HITL obligatorio:** Para cambios irreversibles

## ¿Cuánto tiempo toma Phase 1?

**22-27 días** (Feb 1 - Mar 1)

- Prep: 1 día
- Backend: 12-14 días (Phases A-G)
- API: 2 días (Phase H)
- Frontend: 4-5 días (Phase I)
- Testing: 3-4 días (Phase J)

## ¿Cómo se valida que cumple Constitutional requirements?

Checklist en [antigravity-prompt-intelligence.md](./antigravity-prompt-intelligence.md) Sección 7.1

- 12 checks obligatorios
- Antes de CADA commit
- Si alguno falla → PARAR y revisar

## ¿Qué pasa si algo no encaja con specificación?

Documenta y escalala a Toni:
1. Sección específica de spec que tiene dudas
2. Propone opción A vs. opción B
3. Espera feedback
4. NO asumir, NO improvisar

---

# 🔗 REFERENCIAS CRUZADAS

## Archivos que se referencian mutuamente

```
Constitution (normas)
  ├─→ Product Spec (qué hace)
  ├─→ Technical Spec (cómo funciona)
  ├─→ Rules (directrices)
  └─→ Antigravity Prompt (construcción)

Product Spec (requirements)
  ├─→ Constitution (validación)
  └─→ Technical Spec (implementación)

Technical Spec (interfaces)
  ├─→ Constitution (validación)
  ├─→ Product Spec (requirements)
  ├─→ Skills Catalog (MCP)
  └─→ Antigravity Prompt (código)

Skills Catalog (funciones)
  ├─→ Technical Spec (interfaces)
  └─→ Antigravity Prompt (implementación)

Antigravity Prompt (construcción)
  ├─→ Constitution (validación)
  ├─→ Technical Spec (referencia)
  └─→ Rules (anti-patterns)
```

---

# ✅ VALIDACIÓN FINAL

**Antes de comenzar implementación, confirma:**

- [ ] ¿Entiendo el Principio Rector?
- [ ] ¿He leído Constitution?
- [ ] ¿He revisado Manifest de integración?
- [ ] ¿Tengo Antigravity IDE setup?
- [ ] ¿He copiado el prompt a IDE?
- [ ] ¿Entiendo los 5 componentes core?
- [ ] ¿Conozco las 3 decisiones técnicas clave?
- [ ] ¿Sé dónde va cada archivo?
- [ ] ¿Tengo el timeline claro?
- [ ] ¿Sé a quién contactar si hay dudas?

Si alguno es NO → relée esa sección antes de empezar.

---

# 📋 PRÓXIMOS PASOS

1. **Esta semana:** Toni revisa entrega, confirma alineación
2. **Próxima semana:** Import archivos al repo + setup Antigravity
3. **Semana 3-4:** Phase A-J según Antigravity Prompt (22-27 días)
4. **Semana 5+:** Testing, validación, deployment Phase 1

---

# 📊 ESTADÍSTICAS DE ENTREGA

| Métrica | Valor |
|---|---|
| Documentos entregados | 8 |
| Líneas de especificación | 6.000+ |
| Componentes core | 5 |
| Fases de desarrollo | 5 |
| Anti-patterns documentados | 6 |
| Reglas operacionales | 13 |
| Skills catalog | 5 Phase 1, 7 Phase 2+ |
| Hitos de validación | 9 |

---

# 🎯 MISIÓN

**Anclora Intelligence es sistema disciplinado para maximizar opcionalidad estratégica.**

No es experimento técnico.
No es sobreingeniería.
Es motor nervioso que previene errores y consolida base.

---

**Versión:** 1.0  
**Estado:** Completo y listo para implementación  
**Fecha:** Febrero 2026  
**Próximo:** Phase 1 Implementation (Feb 1 - Mar 1)

---

**¿Preguntas? Contacta a Toni o revisa la sección de ese documento.**
