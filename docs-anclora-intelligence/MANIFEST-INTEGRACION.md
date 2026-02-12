# ANCLORA INTELLIGENCE v1.0 — MANIFEST DE INTEGRACIÓN
## Guía para Integrar Archivos en Repositorio Anclora Nexus
### Febrero 2026

---

# 1. ESTRUCTURA RECOMENDADA EN REPO

```
Anclora-Nexus/
│
├─ DOCUMENTACIÓN EXISTENTE
│  ├── constitution-canonical.md         ✅ (existente, no modificar)
│  ├── product-spec-v0.md               ✅ (existente, no modificar)
│  ├── spec.md                          ✅ (existente, no modificar)
│  └── .agent/
│      ├── rules/                       (existente)
│      │   └── [rules existentes]
│      └── skills/                      (existente)
│          └── [skills existentes]
│
├─ NUEVOS ARCHIVOS INTELLIGENCE
│  ├── intelligence-constitution.md      ← CREAR (normas supremas Intelligence)
│  ├── intelligence-product-spec-v1.md  ← CREAR (especificación funcional)
│  ├── intelligence-spec-v1.md          ← CREAR (referencia técnica)
│  │
│  ├─ .agent/
│  │  ├── rules/
│  │  │   └── anclora-intelligence.md   ← CREAR (directrices operacionales)
│  │  └── skills/
│  │      └── intelligence-skills.yaml  ← CREAR (catálogo MCP)
│  │
│  ├─ .antigravity/
│  │  └── prompts/
│  │      └── antigravity-prompt-intelligence.md  ← CREAR (prompt construcción)
│  │
│  └─ intelligence-engine/              ← CREAR (configuración extraíble)
│     ├── governance/
│     │   └── strategic-mode-registry.md  ← CREAR (versionado Git)
│     ├── domain-packs/
│     │   └── real-estate-mallorca-premium.yaml  ← CREAR (domain pack v1)
│     └── config.yaml                    ← CREAR (config general)
│
└─ backend/intelligence/                ← CREAR (implementación Python)
   ├── __init__.py
   ├── types.py                          (Phase 1)
   ├── orchestrator.py                   (Phase 1)
   ├── router.py                         (Phase 1)
   ├── strategic_mode_loader.py          (Phase 1)
   ├── governor.py                       (Phase 1)
   ├── synthesizer.py                    (Phase 1)
   ├── notebook_bridge.py                (Phase 2 - stub)
   ├── domain_registry.py                (Phase 5 - stub)
   └── utils/
       ├── risk_evaluator.py             (Phase 1)
       ├── strategic_mode_parser.py      (Phase 1)
       └── constants.py                  (Phase 1)

frontend/src/pages/intelligence/         ← CREAR (React components)
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

# 2. ARCHIVOS ENTREGADOS (6 DOCUMENTOS)

## 2.1. intelligence-constitution.md

**Ubicación:** Raíz del repo (junto a constitution-canonical.md)

**Propósito:** Normas supremas específicas de Anclora Intelligence

**Contenido:**
- Definiciones y glosario (8 términos específicos)
- Jerarquía normativa (7 niveles)
- Reglas de Oro de Intelligence (5 capítulos)
- Contrato de respuesta (formato fijo)
- Riesgos y escalaciones
- Integración con constitution-canonical.md
- Disposiciones transitorias (fases)

**Integración:**
- Leerla ANTES de cualquier otra especificación
- Referencia obligatoria en toda decisión técnica
- Establece límites inviolables

**Status:** ✅ Listo para integración

---

## 2.2. intelligence-product-spec-v1.md

**Ubicación:** Raíz del repo (junto a product-spec-v0.md)

**Propósito:** Especificación funcional de Intelligence (qué hace)

**Contenido:**
- Contexto y propósito (definición, principio rector, ecosistema)
- Capacidades core (5 capacidades Phase 1)
- Análisis de riesgo multidominio
- Gobernanza por Strategic Mode
- UI (Control Center, layout, zones)
- Workflows y casos de uso (3 user stories)
- Scope y limitaciones (qué SÍ/NO hace)
- Diferimientos explícitos (Phase 2+)
- Métricas de éxito

**Integración:**
- Referencia obligatoria para Product, UX, QA
- Define requirements funcionales
- Establece "Definition of Done" para Phase 1

**Status:** ✅ Listo para integración

---

## 2.3. intelligence-spec-v1.md

**Ubicación:** Raíz del repo (junto a spec.md)

**Propósito:** Especificación técnica de Intelligence (cómo funciona)

**Contenido:**
- Arquitectura general (visión, componentes, carpetas)
- Types y contratos de datos (dataclasses, enums)
- 5 componentes core (Router, StrategicModeLoader, Governor, Synthesizer, Orchestrator)
- Integración con Supabase (schema DB)
- FastAPI endpoints (3 rutas)
- Frontend (componentes React)
- Deployment (variables de entorno, error handling)

**Integración:**
- Referencia obligatoria para desarrollo backend/frontend
- Define interface contracts entre componentes
- Schema database (copy to supabase/migrations/)

**Status:** ✅ Listo para integración

---

## 2.4. anclora-intelligence-rules.md

**Ubicación:** `.agent/rules/anclora-intelligence.md`

**Propósito:** Directrices operacionales (reglas explícitas de governance)

**Contenido:**
- Principios operacionales (regla #1: principio rector)
- Anti-patterns y señales de riesgo (6 anti-patterns específicos)
- Reglas explícitas de Governor (reglas #7-#13)
- Señales de validación y progresión (hitos Phase 1-3)
- Monitoreo y escalación (red flags, revisión periódica)

**Integración:**
- Referencia obligatoria para QA y governance
- Define lo que Governor DEBE hacer
- Documenta anti-patterns a evitar

**Status:** ✅ Listo para integración

---

## 2.5. intelligence-skills.yaml

**Ubicación:** `.agent/skills/intelligence-skills.yaml`

**Propósito:** Catálogo MCP de skills (funciones disponibles)

**Contenido:**
- 5 skills Phase 1 (Router, StrategicModeLoader, RiskEvaluator, Governor, Synthesizer)
- 2 skills Phase 2 (DomainRegistry, NotebookLM Bridge) — deferred
- Skills Phase 3+ — deferred
- Jerarquía de activación
- Input/Output schemas (YAML)
- Heurísticas de detección
- Ejemplos de invocación
- Dependencias entre skills
- Versionado

**Integración:**
- Referencia obligatoria para implementación de skills
- Define interfaces MCP
- Catálogo para futuras integraciones

**Status:** ✅ Listo para integración

---

## 2.6. antigravity-prompt-intelligence.md

**Ubicación:** `.antigravity/prompts/antigravity-prompt-intelligence.md`

**Propósito:** Prompt para Antigravity IDE (construcción en Gemini 3 Flash)

**Contenido:**
- Instrucciones meta (qué hacer con este prompt)
- Contexto fundacional (por qué Intelligence existe)
- Estructura arquitectónica (jerarquía de normas)
- Decisiones técnicas clave (4 decisiones críticas)
- Anti-patterns a evitar (3 anti-patterns)
- Flujo de construcción (10 fases ordenadas)
- Testing strategy
- Checkpoints y validación
- Notas de construcción
- Contacto con Toni (escalaciones)

**Integración:**
- Usar como referencia durante desarrollo
- Copy-paste el contexto a Antigravity IDE
- Repite checklist en sección 7.1 antes de cada commit

**Status:** ✅ Listo para integración

---

# 3. NUEVO CONTENIDO A CREAR (NO ENTREGADO)

Estos archivos deben ser creados en el repo conforme se avance en implementación:

## 3.1. `intelligence-engine/governance/strategic-mode-registry.md`

**Ubicación:** intelligence-engine/governance/strategic-mode-registry.md

**Contenido (Ejemplo Phase 1):**

```yaml
# Strategic Mode Registry — Anclora Intelligence
## Versión activa: 1.0-validation-phase

version: "1.0-validation-phase"
effective_date: "2026-02-01"

phase: "validation"
description: "Validar tracción inmobiliaria antes de expansión"

principles:
  main: "Consolidar base sólida hoy para decidir con libertad mañana"
  sub_principles:
    - "Generación de ingresos reales es prioridad 1"
    - "Estabilidad financiera reduce riesgo"

priorities_ordered:
  1: "Generación ingresos en Real Estate"
  2: "Validación cash flow (≥3 cierres)"
  3: "Estabilidad financiera personal"
  4: "Simplificación operativa"
  5: "Motor estratégico disciplinado"

hard_constraints:
  - "No cambios laborales sin validación cash flow"
  - "No activar consultoría IA públicamente"
  - "No SL sin facturación comprobada"

active_domains:
  - "real_estate_mallorca_premium"

max_domains_per_query: 3
allow_lab_mode: false

git_version_hash: "[hash del commit que activó esta versión]"
```

**Nota:** Este archivo es versionado EXCLUSIVAMENTE en Git. Cambio = nuevo commit.

---

## 3.2. `intelligence-engine/domain-packs/real-estate-mallorca-premium.yaml`

**Ubicación:** intelligence-engine/domain-packs/real-estate-mallorca-premium.yaml

**Contenido (Esquema):**

```yaml
name: "Real Estate Mallorca Premium"
version: "1.0"
status: "ACTIVE_PHASE_1"

description: "Dominio de inversión inmobiliaria premium en suroeste de Mallorca"

geographical_scope:
  - "Palma"
  - "Son Vida"
  - "Andratx"
  - "Puerto de Andratx"
  - "Calvià"
  - "Portals"

buyer_profile:
  primary: "Internacional"
  language: "Inglés fluido"
  budget_range: "€2M+"
  motivation: "Inversión, segunda residencia, diversificación"

focus_areas:
  - "Inversión estratégica"
  - "Experiencia premium"
  - "Diferenciación tecnológica discreta"

constraints:
  - "No captación masiva low-cost"
  - "Enfoque en calidad sobre volumen"
  - "Posicionamiento exclusivo"

validation_criteria:
  min_cash_monthly: 5000
  min_cierres_validated: 3
  min_duration_months: 6
```

---

## 3.3. `backend/intelligence/` (implementación Python)

Estructura que será llenada conforme se codifique según Antigravity Prompt:

```
backend/intelligence/
├── __init__.py
├── types.py                  ← Enums, dataclasses
├── orchestrator.py           ← Orquestador principal
├── router.py                 ← Clasificación intención
├── strategic_mode_loader.py  ← Lectura Strategic Mode
├── governor.py               ← Lógica de recomendación
├── synthesizer.py            ← Construcción respuesta
├── utils/
│   ├── risk_evaluator.py     ← Evaluación riesgos
│   ├── strategic_mode_parser.py ← Parser YAML
│   └── constants.py          ← Constantes
└── tests/
    ├── test_types.py
    ├── test_router.py
    ├── test_governor.py
    ├── test_synthesizer.py
    └── test_orchestrator_e2e.py
```

---

## 3.4. `frontend/src/pages/intelligence/` (React components)

Estructura que será llenada según spec-v1.md:

```
frontend/src/pages/intelligence/
├── index.tsx                    ← Página /intelligence
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

## 3.5. Database Migrations

En `supabase/migrations/`:

```sql
-- Crear tabla intelligence_audit_log
CREATE TABLE intelligence_audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    message TEXT NOT NULL,
    router_output JSONB NOT NULL,
    governor_output JSONB NOT NULL,
    synthesizer_output TEXT NOT NULL,
    strategic_mode_version VARCHAR(50),
    domain_packs_used TEXT[],
    flags TEXT[],
    ai_generated BOOLEAN DEFAULT true,
    status VARCHAR(20),
    error_detail TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intelligence_user_timestamp 
  ON intelligence_audit_log(user_id, timestamp DESC);
```

---

# 4. PASOS DE INTEGRACIÓN (CHECKLIST)

## 4.1. Preparación (Before Day 1)

- [ ] Copiar 6 archivos entregados a rutas especificadas en sección 2
- [ ] Crear carpeta `intelligence-engine/` y subdirectorios
- [ ] Crear carpeta `backend/intelligence/`
- [ ] Crear carpeta `frontend/src/pages/intelligence/`
- [ ] Leer en orden: Constitution → Product Spec → Technical Spec

## 4.2. Implementación Backend (Phase A-G en Antigravity Prompt)

- [ ] Crear `backend/intelligence/types.py` (tipos)
- [ ] Crear `backend/intelligence/strategic_mode_loader.py` (Strategic Mode)
- [ ] Crear `backend/intelligence/router.py` (Router)
- [ ] Crear `backend/intelligence/utils/risk_evaluator.py` (Risk evaluation)
- [ ] Crear `backend/intelligence/governor.py` (Governor)
- [ ] Crear `backend/intelligence/synthesizer.py` (Synthesizer)
- [ ] Crear `backend/intelligence/orchestrator.py` (Orchestrator)

## 4.3. Implementación Frontend (Phase I)

- [ ] Crear componentes React en `frontend/src/pages/intelligence/`
- [ ] Implementar Control Center UI (/intelligence route)
- [ ] Conectar hooks a API endpoints

## 4.4. Implementación API (Phase H)

- [ ] Crear endpoint POST /api/intelligence/query
- [ ] Crear endpoint GET /api/intelligence/history
- [ ] Crear endpoint GET /api/intelligence/strategic-mode
- [ ] Error handling, validación

## 4.5. Base de Datos

- [ ] Crear migration: intelligence_audit_log table
- [ ] Crear migration: intelligence_strategic_mode_history table
- [ ] Crear migration: intelligence_domain_packs table

## 4.6. Strategic Mode y Domain Packs

- [ ] Crear `intelligence-engine/governance/strategic-mode-registry.md`
- [ ] Crear `intelligence-engine/domain-packs/real-estate-mallorca-premium.yaml`
- [ ] Crear `intelligence-engine/config.yaml`

## 4.7. Testing y Validación

- [ ] Unit tests: types, router, governor, synthesizer
- [ ] Integration tests: orchestrator e2e
- [ ] Validación constitucional: checklist sección 7.1
- [ ] Performance testing: response times

## 4.8. Documentación Final

- [ ] Actualizar README.md con Intelligence section
- [ ] Documentar deploying Intelligence (Vercel/Railway)
- [ ] Documentar acceso y uso
- [ ] Changelog: Primera versión

---

# 5. REFERENCIAS CRUZADAS

## Jerarquía Normativa Vigente

```
1. constitution-canonical.md          ← SUPREMA
2. intelligence-constitution.md       ← NUEVA (subordinada a 1)
3. intelligence-product-spec-v1.md   ← NUEVA (subordinada a 2)
4. intelligence-spec-v1.md            ← NUEVA (subordinada a 3)
5. anclora-intelligence-rules.md      ← NUEVA (subordinada a 4)
6. intelligence-skills.yaml           ← NUEVA (subordinada a 5)
```

## Ubicaciones Clave en Repo

| Documento | Ubicación | Tipo |
|---|---|---|
| Normas Supremas | Raíz del repo | Markdown |
| Rules operacionales | .agent/rules/ | Markdown |
| Skills MCP | .agent/skills/ | YAML |
| Antigravity Prompt | .antigravity/prompts/ | Markdown |
| Strategic Mode | intelligence-engine/governance/ | Markdown |
| Domain Packs | intelligence-engine/domain-packs/ | YAML |
| Código Python | backend/intelligence/ | Python |
| Componentes React | frontend/src/pages/intelligence/ | TypeScript |

---

# 6. NOTAS IMPORTANTES

## 6.1. Cambios a Documentos Existentes

**NO MODIFICAR:**
- constitution-canonical.md (suprema, inviolable)
- product-spec-v0.md (describe Nexus v0, Intelligence es complemento)
- spec.md (describe Nexus technical core)

**REFERENCIAS CRUZADAS PERMITIDAS:**
- Agregar sección "Intelligence Integration" en README.md
- Agregar sección "Intelligence Audit" en security documentation
- Documentar nuevas endpoints en API documentation

## 6.2. Strategic Mode es Versionado Git

Cambiar Strategic Mode (versión, constraints, dominios):

```bash
# 1. Editar intelligence-engine/governance/strategic-mode-registry.md
# 2. Commit con justificación explícita
git add intelligence-engine/governance/strategic-mode-registry.md
git commit -m "Update Strategic Mode v1.0 → v1.1

Justificación:
- Validados 3 cierres inmobiliarios
- Cash flow estable €5k+/mes
- Preparar Phase 2: multi-dominio
- Activar Founder OS Strategy Pack (dormant)

Cambios:
- Phase: validation → scaling
- Prioridades: reordenar
- Hard constraints: agregar regla X
- Active domains: agregar real_estate + founder_os_prep
"
```

## 6.3. Rollback y Recuperación

Si algo falla en implementación:

1. Todo está en Git → rollback posible
2. Audit log inmutable → auditar decisiones
3. Tests → validar que no se rompa Constitution

---

# 7. ROADMAP FUTURO

| Fase | Timeline | Hito | Status |
|---|---|---|---|
| **Phase 1** | M1-M2 (Feb-Mar 2026) | Core Intelligence funcional | IN PROGRESS |
| **Phase 2** | M2-M3 (Mar-Apr) | NotebookLM + multi-dominio prep | PLANNED |
| **Phase 3** | M3-M4 (Apr-May) | GEM agents + domain packs | PLANNED |
| **Phase 4** | M4-M5 (May-Jun) | Extracción de Intelligence | PLANNED |
| **Phase 5** | M5-M6 (Jun-Jul) | Intelligence como módulo independiente | PLANNED |

---

# COLOFÓN

Estos 6 documentos + implementación constituyen **Anclora Intelligence v1.0**.

El sistema está diseñado para ser:

✅ **Disciplinado:** Jerarquía normativa clara, no variaciones  
✅ **Auditable:** Audit log inmutable, trazabilidad total  
✅ **Extraíble:** Módulo independiente en Phase 5  
✅ **Escalable:** Fase 1 simple → Fase 5 sofisticada  

Versión Manifest: **1.0**  
Estado: **Norma Vigente**  
Última actualización: **Febrero 2026**

---

**Próximo paso:** Importar estos archivos al repo Anclora Nexus y comenzar Phase A (tipos) con Antigravity IDE.
