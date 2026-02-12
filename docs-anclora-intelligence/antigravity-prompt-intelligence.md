# ANTIGRAVITY IDE PROMPT — ANCLORA INTELLIGENCE v1.0
## Instrucciones Operativas para Construcción Disciplinada
### Para Toni Amengual — Antigravity IDE (Gemini 3 Flash, Planning Mode)

---

# SECCIÓN 0: INSTRUCCIONES META

**Modo Operativo:** Antigravity IDE, Gemini 3 Flash, Planning Mode.

**Objetivo Primario:** Traducir especificación de Anclora Intelligence a código ejecutable Python 3.11+, respetando jerarquía normativa y arquitectura definida.

**Constraint Meta:** Este prompt es subordinado a `intelligence-constitution.md`. Si existe conflicto, la Constitución prevalece.

**Filosofía de Construcción:**

```
1. Leer arquitectura antes de escribir código
2. Validar cada componente contra Constitution
3. No añadir features no especificadas
4. Priorizar simplicidad sobre sofisticación
5. Garantizar extractibilidad desde el inicio
```

---

# SECCIÓN 1: CONTEXTO FUNDACIONAL

## 1.1. ¿Por Qué Existe Anclora Intelligence?

Eres Toni, ingeniero con 24+ años de experiencia, constructor natural de sistemas.

**Posición actual:**
- Empleado CGI (estable, ≈43k anuales)
- Autónomo en Baleares (cuota reducida 80€/mes)
- Iniciando actividad inmobiliaria premium (Mallorca SW)

**Objetivo estratégico:**
Libertad estructurada en 2-3 años, no dependencia única.

**Rol de Intelligence:**
Sistema nervioso estratégico que **previene** sobreingeniería y **consolida base** antes de expandir.

## 1.2. Principio Rector (Memorizar)

```
STRATEGIC MODE v1 — VALIDATION PHASE

"Consolidar base sólida hoy para decidir con libertad mañana."

Cada recomendación de Intelligence debe responder:
1. ¿Consolida base financiera? [Sí/No]
2. ¿Reduce riesgo estructural? [Sí/No]
3. ¿Aumenta opcionalidad futura? [Sí/No]
4. ¿Es expansión prematura? [Sí/No]
5. ¿Puede esperar hasta validación? [Sí/No]

Si 1-3 = Sí → EJECUTAR
Si 4-5 = Sí → POSTERGAR
Si ambiguo → REFORMULAR
Si imposible → DESCARTAR
```

## 1.3. Stack Técnico (No Cambiar)

**Backend:**
- Python 3.11+
- FastAPI (no Strelit, no Django)
- PostgreSQL/Supabase (RLS + audit log)
- OpenAI + Anthropic APIs (dual)
- Orquestador Python clásico (NO nuevo LangGraph)

**Frontend:**
- Next.js + React
- Tailwind CSS
- TypeScript (strict mode)

**Infrastructure:**
- Vercel (frontend)
- Railway (backend)
- Supabase (DB + auth)

**No usar:**
- Nuevos frameworks IA
- Bases de datos experimentales
- Arquitecturas multi-tenant innecesarias

---

# SECCIÓN 2: ESTRUCTURA ARQUITECTÓNICA

## 2.1. Jerarquía de Normas (Obligatoria)

```
1. constitution-canonical.md          ← SUPREMA (Golden Rules de Nexus)
   ↓ no puede contradecir
2. intelligence-constitution.md       ← ESPECÍFICA (reglas Intelligence)
   ↓ no puede contradecir
3. intelligence-product-spec-v1.md   ← ESPECIFICACIÓN FUNCIONAL
   ↓ no puede contradecir
4. intelligence-spec-v1.md            ← REFERENCIA TÉCNICA
   ↓ no puede contradecir
5. anclora-intelligence-rules.md      ← DIRECTRICES OPERACIONALES
   ↓ no puede contradecir
6. intelligence-skills.yaml           ← CATÁLOGO MCP
   ↓ no puede contradecir
7. Este prompt (Antigravity)          ← CONSTRUCCIÓN
```

**Acción si conflicto:** Parar. Esclarecer con Toni. No asumir.

## 2.2. Componentes Core (5 Módulos Obligatorios)

```
backend/intelligence/
├── orchestrator.py      ← PUNTO DE ENTRADA (orquesta flujo end-to-end)
├── router.py            ← CLASIFICACIÓN DE INTENCIÓN (max 3 dominios)
├── strategic_mode_loader.py  ← LECTURA STRATEGIC MODE (Git versionado)
├── governor.py          ← APLICACIÓN REGLAS + RIESGOS
├── synthesizer.py       ← CONSTRUCCIÓN RESPUESTA ESTRUCTURADA
└── types.py             ← TYPE HINTS (dataclasses immutables)
```

**Dependencias internas:**

```
orchestrator
├── router
├── strategic_mode_loader
├── governor
│   ├── risk_evaluator
│   └── strategic_mode_loader
└── synthesizer
    └── governor
```

## 2.3. Ubicación en Nexus (No Cambiar)

Intelligence **vive dentro** de Anclora Nexus como capa superior.

NO es:
- Módulo separado
- Repo independiente
- LangGraph nuevo
- Motor de ejecución

SÍ es:
- Orquestador que consume interfaces de Nexus (HTTP, DB)
- Diseñado para ser extraíble sin modificación lógica
- Subordinado a constitution-canonical.md

---

# SECCIÓN 3: DECISIONES TÉCNICAS CLAVE

## 3.1. Strategic Mode: Versionado Git, Inmutable en Runtime

**Decisión Arquitectónica:**

Strategic Mode define contexto operativo (principios, restricciones, dominios activos).

```yaml
Ubicación: intelligence-engine/governance/strategic-mode-registry.md

Propiedades:
  - Versionado EXCLUSIVAMENTE en Git
  - Cambio = commit documentado
  - NUNCA se edita desde UI o endpoint
  - Loader cachea por 3600s (configurable)
  - Fallo al parsear = excepción (fail-fast)

Ejemplo Phase 1:
  version: "1.0-validation-phase"
  phase: "validation"
  principles:
    main: "Consolidar base sólida hoy para decidir con libertad mañana"
  priorities_ordered:
    1: "Generación ingresos en Real Estate"
    2: "Validación cash flow"
  hard_constraints:
    - "No cambios laborales sin validación"
    - "No activar consultoría IA públicamente"
    - "No SL sin facturación comprobada"
  active_domains:
    - "real_estate_mallorca_premium"
```

**Implementación (strategic_mode_loader.py):**

```python
class StrategicModeLoader:
    def __init__(self, git_repo_path: str):
        self.strategic_mode_path = "intelligence-engine/governance/strategic-mode-registry.md"
        self._cache: Optional[StrategicMode] = None
        self._cache_timestamp: Optional[datetime] = None

    async def load_active_strategic_mode(
        self,
        use_cache: bool = True,
        cache_ttl_seconds: int = 3600,
    ) -> StrategicMode:
        """
        Carga Strategic Mode versionado desde Git.
        
        Flujo:
        1. Si caché válida → retornar
        2. Leer archivo desde disco
        3. Parsear YAML con validación schema
        4. Cachear resultado
        5. Retornar objeto StrategicMode
        
        NUNCA:
        - Editar archivo
        - Hardcodear valores
        - Ignorar versión Git
        """
        if use_cache and self._is_cache_valid(cache_ttl_seconds):
            return self._cache
        
        raw_content = self._read_from_git(self.strategic_mode_path)
        parsed = self._parse_strategic_mode_yaml(raw_content)
        validated = self._validate_schema(parsed)
        
        self._cache = validated
        self._cache_timestamp = datetime.now()
        
        return validated
```

## 3.2. Governor: Intérprete de Strategic Mode, No Ejecutor

**Decisión Arquitectónica:**

Governor NO es ejecutor autónomo. Es **intérprete**.

```
Responsabilidades:
1. Recibir QueryPlan del Router
2. Cargar Strategic Mode vía StrategicModeLoader
3. Aplicar reglas del Strategic Mode a QueryPlan
4. Evaluar riesgos (labor, tax, brand, focus)
5. Generar GovernorDecision con diagnóstico + recomendación

NO hace:
- Ejecutar acciones
- Modificar Strategic Mode
- Saltarse reglas
- Ignorar flags de riesgo
```

**Implementación (governor.py):**

```python
class Governor:
    async def govern(
        self,
        query_plan: QueryPlan,
        user_message: str,
        user_context: Optional[Dict[str, Any]] = None,
    ) -> GovernorDecision:
        """
        Aplica Strategic Mode y genera recomendación.
        
        Flujo:
        1. Cargar Strategic Mode vía loader
        2. Extraer principios y restricciones
        3. Aplicar Strategic Mode a QueryPlan
        4. Evaluar riesgos (labor, tax, brand, focus)
        5. Generar recomendación (Ejecutar|Postergar|Reformular|Descartar)
        6. Generar próximos 3 pasos (EXACTAMENTE 3)
        7. Generar contraindicaciones explícitas
        8. Evaluar si HITL requerido
        9. Compilar flags
        10. Retornar GovernorDecision
        """
        
        # 1. Load Strategic Mode
        strategic_mode = await self.strategic_mode_loader.load_active_strategic_mode()
        
        # 2-9. Lógica de gobierno (ver spec-v1.md)
        
        # 10. Return
        return GovernorDecision(
            recommendation=recommendation,
            diagnosis=diagnosis,
            risks=risks,
            next_steps=next_steps,  # EXACTAMENTE 3
            dont_do=dont_do,
            flags=flags,
            hitl_required=hitl_required,
            strategic_mode_version=strategic_mode.version,
            domains_used=query_plan.domains_selected,
        )
```

## 3.3. Respuesta Estructurada: Formato Fijo, No Variaciones

**Decisión Arquitectónica:**

Toda respuesta de Intelligence respeta **estrictamente** este orden:

```
1. DIAGNÓSTICO
   Análisis de la situación, factores, incertidumbres

2. RECOMENDACIÓN
   Una de: Ejecutar | Postergar | Reformular | Descartar
   Con justificación lógica explícita

3. RIESGOS
   - Labor [LEVEL]: rationale
   - Tax [LEVEL]: rationale
   - Brand [LEVEL]: rationale
   - Focus [LEVEL]: rationale

4. PRÓXIMOS 3 PASOS
   1. [Paso 1]
   2. [Paso 2]
   3. [Paso 3]

5. QUÉ NO HACER AHORA
   - [Contraindicación 1]
   - [Contraindicación 2]
   - [Contraindicación 3]

[metadata: domains, confidence, flags, ai_generated=true]
```

**Restricciones:**

- Max 800 palabras
- Tono: Premium, discreto, directo
- Sin tecnicismos innecesarios
- Accionable antes que exhaustivo

## 3.4. Audit Log: Append-Only, Inmutable, Sin Excepciones

**Decisión Arquitectónica:**

Toda consulta se registra en `intelligence_audit_log`.

```sql
CREATE TABLE intelligence_audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    message TEXT NOT NULL,
    router_output JSONB NOT NULL,
    governor_output JSONB NOT NULL,
    synthesizer_output TEXT NOT NULL,
    strategic_mode_version VARCHAR(50),
    domain_packs_used TEXT[],
    flags TEXT[],
    status VARCHAR(20),  -- 'success', 'error', 'escalated'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT immutable CHECK (created_at = NOW())
);
```

**Regla crítica:**
- Fallo en audit NO rompe endpoint
- Se añade flag `audit-write-failed=true`
- Se registra en error_log

---

# SECCIÓN 4: ANTI-PATTERNS Y SEÑALES DE RIESGO

## 4.1. Anti-Pattern #1: Sobreingeniería Tecnológica Prematura

**No hacer:**

```python
# ❌ INCORRECTO: Crear NotebookLM integration antes de Phase 2
class NotebookLMBridge:
    # Implementación completa en Phase 1
    pass

# ❌ INCORRECTO: Multi-dominio operativo en Phase 1
# Real Estate + Founder OS + Consulting simultáneamente

# ❌ INCORRECTO: API enterprise-grade sin necesidad
# GraphQL, subscriptions, webhooks en Phase 1
```

**Hacer:**

```python
# ✅ CORRECTO: Stub para Phase 2, no implementado
class NotebookLMBridge:
    """[DEFERRED Phase 2]"""
    pass

# ✅ CORRECTO: Un dominio activo en Phase 1
active_domains = ["real_estate_mallorca_premium"]

# ✅ CORRECTO: REST endpoints simples
@router.post("/api/intelligence/query")
async def post_query(message: str, mode: QueryMode):
    # Implementación simple, escalable
    pass
```

## 4.2. Anti-Pattern #2: Lógica Fuera de Constitution

**No hacer:**

```python
# ❌ INCORRECTO: Reglas duplicadas, no heredadas
def evaluate_risk(message):
    if "excedencia" in message:
        risk = "HIGH"  # Hardcoded, no principio rector
    return risk

# ❌ INCORRECTO: Modificar Strategic Mode desde código
if mode == "experimental":
    strategic_mode.allow_lab_mode = True  # PROHIBIDO
```

**Hacer:**

```python
# ✅ CORRECTO: Reglas heredadas de Constitution
async def evaluate_risk(message, strategic_mode):
    # Governor aplica principios de Strategic Mode
    # Evalúa contra hard_constraints
    pass

# ✅ CORRECTO: Strategic Mode es inmutable en runtime
strategic_mode = await loader.load_active_strategic_mode(use_cache=True)
# Leer, no modificar
```

## 4.3. Anti-Pattern #3: No Respetar HITL

**No hacer:**

```python
# ❌ INCORRECTO: Recomendar cambio laboral sin HITL
if "excedencia" in message:
    recommendation = "EJECUTAR"  # VIOLACIÓN CONSTITUCIONAL

# ❌ INCORRECTO: Ignorar hitl_required flag
if governor_decision.hitl_required:
    # Ejecutar de todas formas
    pass
```

**Hacer:**

```python
# ✅ CORRECTO: HITL es automático en cambios laboral/fiscal
if cambio_laboral or tax_implication or labor_risk_high:
    governor_decision.hitl_required = True
    governor_decision.recommendation = "POSTERGAR"  # Esperar confirmación

# ✅ CORRECTO: Respetar hitl_required
if governor_decision.hitl_required:
    endpoint_status = "escalated"  # No "success"
    ui_shows_message = "Requiere confirmación humana"
```

---

# SECCIÓN 5: FLUJO DE CONSTRUCCIÓN (ORDEN RECOMENDADO)

## Fase A: Tipos y Estructuras (types.py)

```python
# 1. Definir enums (Recommendation, RiskLevel, QueryMode, RiskCategory)
# 2. Definir dataclasses (QueryPlan, RiskAssessment, GovernorDecision, etc.)
# 3. Validar contra spec-v1.md
# 4. Tests: Asegurar immutabilidad, schema compliance
```

## Fase B: Strategic Mode Loader

```python
# 1. Implementar StrategicModeLoader class
# 2. Método load_active_strategic_mode
# 3. Caché con TTL
# 4. Validación schema YAML
# 5. Tests: Cargar phase 1 Strategic Mode, caché, expiración
```

## Fase C: Router

```python
# 1. Implementar Router class
# 2. Método route_query(message, mode, domain_hint)
# 3. LLM classification (GPT-4o-mini)
# 4. Límites: Fast 1-2, Deep máx 3
# 5. Tests: Casos típicos, edge cases
```

## Fase D: Risk Evaluator (Utilidad para Governor)

```python
# 1. Heurísticas de detección (labor, tax, brand, focus)
# 2. Mapping de keywords y contexto
# 3. LLM classification para casos ambiguos
# 4. Tests: Validar detección de riesgos
```

## Fase E: Governor

```python
# 1. Implementar Governor class
# 2. Método govern(query_plan, user_message, context)
# 3. Carga Strategic Mode vía loader
# 4. Aplica reglas y constraints
# 5. Evalúa riesgos
# 6. Genera recomendación (decision tree)
# 7. Genera 3 pasos (validar LENGTH == 3)
# 8. Evalúa HITL requirement
# 9. Tests: Todos los casos de uso en product-spec
```

## Fase F: Synthesizer

```python
# 1. Implementar Synthesizer class
# 2. Método synthesize(governor_decision, mode)
# 3. Formato fijo: diagnóstico → recomendación → riesgos → pasos → qué no hacer
# 4. Validar max 800 palabras
# 5. Tests: Output format compliance
```

## Fase G: Orchestrator

```python
# 1. Implementar IntelligenceOrchestrator class
# 2. Método process_query(message, user_id, mode, domain_hint)
# 3. Coordinar: Router → Governor → Synthesizer
# 4. Error handling
# 5. Audit log
# 6. Tests: End-to-end flujo
```

## Fase H: FastAPI Endpoints

```python
# 1. POST /api/intelligence/query
# 2. GET /api/intelligence/history
# 3. GET /api/intelligence/strategic-mode
# 4. Error handling, validación
# 5. Tests: HTTP contracts
```

## Fase I: Frontend Control Center

```typescript
// 1. Página /intelligence
// 2. ChatConsole component
// 3. DecisionConsole component
// 4. QueryPlanPanel component
// 5. RiskChips component
// 6. Hooks: useIntelligenceQuery
// 7. Tests: Rendering, user interactions
```

## Fase J: Integración y Testing

```
# 1. Tests de integration (backend + frontend)
# 2. Validate contra intelligence-constitution.md
# 3. Security review (HITL, audit, escalation)
# 4. Performance testing (response time, cache)
# 5. Documentación final
```

---

# SECCIÓN 6: TESTING STRATEGY

## 6.1. Unit Tests Obligatorios

```python
# tests/test_types.py
# - Immutabilidad de dataclasses
# - Schema validation

# tests/test_strategic_mode_loader.py
# - Cargar Strategic Mode v1
# - Caché functionality
# - Parse error handling

# tests/test_router.py
# - Clasificación de intención
# - Límites de dominio
# - Domain hint preference

# tests/test_governor.py
# - Evaluación de riesgos
# - Decision tree (Ejecutar|Postergar|Reformular|Descartar)
# - HITL requirement detection
# - Exactamente 3 pasos

# tests/test_synthesizer.py
# - Formato fijo de respuesta
# - Max 800 palabras
# - Tono premium
```

## 6.2. Integration Tests

```python
# tests/test_orchestrator_e2e.py
# Casos de uso completos:
# - "¿Solicito excedencia?"
# - "¿Activo consultoría IA?"
# - "¿Invierto en herramientas?"
# - Validar respuesta estructurada end-to-end
```

## 6.3. Validación Constitucional

```python
# Automatizar checks:
# - ¿Toda recomendación respeta Strategic Mode?
# - ¿HITL activado para cambios laborales?
# - ¿Próximos 3 pasos exactamente?
# - ¿Audit log registrada?
```

---

# SECCIÓN 7: CHECKPOINTS Y VALIDACIÓN

## 7.1. Before You Commit (Checklist)

```
□ ¿Código respeta intelligence-constitution.md?
□ ¿Todos los componentes están implementados (Phase 1)?
□ ¿Tests pasan (unit + integration)?
□ ¿HITL escalation funciona correctamente?
□ ¿Audit log se registra sin fallos?
□ ¿Strategic Mode es inmutable en runtime?
□ ¿Respuesta structurada respeta formato fijo?
□ ¿Próximos 3 pasos son exactamente 3?
□ ¿No hay código deferred hardcodeado?
□ ¿Código es extraíble (sin acoplamiento a Nexus)?
```

## 7.2. Hito: Intelligence v1.0 Phase 1 Complete

**Criterios de Aceptación:**

✅ Backend: Todos 5 componentes funcionando  
✅ Frontend: Control Center UI con chat + decision console  
✅ API: 3 endpoints (query, history, strategic-mode)  
✅ Tests: 90%+ coverage, todos los casos de uso  
✅ Validación constitucional: 100%  
✅ Audit log: 100% de consultas registradas  
✅ Documentación: Actualizada y coherente  

---

# SECCIÓN 8: NOTAS DE CONSTRUCCIÓN

## 8.1. Errores Comunes a Evitar

❌ **Crear múltiples dominios en Phase 1**  
   → Solo "real_estate_mallorca_premium" está activo

❌ **Hardcodear Strategic Mode**  
   → Debe ser versionado en Git

❌ **Ignorar HITL en cambios laborales**  
   → VIOLACIÓN CONSTITUCIONAL

❌ **Respuesta sin 3 pasos exactamente**  
   → Validar length == 3

❌ **Ejecutar acciones desde Intelligence**  
   → Governor es intérprete, no ejecutor

❌ **Modificar audit log histórico**  
   → Append-only, inmutable

## 8.2. Recursos Constantes

```
Documentos:
  - intelligence-constitution.md (normas supremas)
  - intelligence-product-spec-v1.md (qué hace)
  - intelligence-spec-v1.md (cómo funciona)
  - anclora-intelligence-rules.md (directrices)
  - intelligence-skills.yaml (catálogo MCP)

Strategic Mode v1:
  - intelligence-engine/governance/strategic-mode-registry.md

Base histórica:
  - Anclora Nexus repo (constitution-canonical.md, spec.md, etc.)
```

## 8.3. Contacto con Toni (Escalaciones)

Si en algún momento del desarrollo surgen **dudas sobre interpretación** de spec:

1. Documentar la pregunta
2. Referencia a sección específica de spec
3. Proponer opción A vs. opción B
4. Esperar feedback de Toni

**No asumir**. **No improvisar**. **No cambiar spec sin confirmación**.

---

# COLOFÓN

Esta es la hoja de ruta para construir Anclora Intelligence v1.0 con disciplina arquitectónica.

**Recuerda:**

```
Tu rol NO es innovar la arquitectura.
Tu rol SÍ es traducir especificación a código limpio, 
testeable, auditable y subordinado a Constitution.

Cada línea de código es una decisión.
Cada decisión debe poder justificarse con referencia a:
  - constitution-canonical.md
  - intelligence-constitution.md
  - intelligence-spec-v1.md
  - anclora-intelligence-rules.md

Si no puede justificarse → no va en Phase 1.
```

**Principio Rector (Repite mentalmente mientras codeas):**

```
"Consolidar base sólida hoy para decidir con libertad mañana."
```

---

Versión: **1.0-antigravity-prompt**  
Estado: **Norma Vigente (Phase 1)**  
Última actualización: **Febrero 2026**  
Audiencia: **Toni Amengual + Antigravity IDE (Gemini 3 Flash)**
