# NotebookLM Retrieval Policy v1
## Contrato Formal de Estrategia de Recuperación de Evidencia
### Version: 1.0 | Status: Stable | Scope: Anclora Intelligence Phase 3+

---

# 1. PURPOSE

Definir la estructura **oficial, inmutable y formal** de la política de recuperación de evidencia desde NotebookLM.

Este contrato:
- Governa **cuándo**, **cómo** y **cuántas veces** buscar evidencia
- Previene dependencia excesiva de retrieval
- Mantiene trazabilidad de búsquedas
- Garantiza que evidence **apoya** decisiones, no las **sobrescribe**
- Evita ruido y sobrecarga de iteraciones
- Compatible con architecture Phase 3+

---

# 2. ESTRUCTURA FORMAL

```python
@dataclass
class NotebookLMRetrievalPolicy:
    """Política de recuperación de evidencia desde NotebookLM."""
    
    # ─── SCOPE ───
    enabled_domains: list[DomainKey]                   # Qué dominios permiten retrieval
    disabled_domains: list[DomainKey]                  # Qué dominios NO usan retrieval
    
    # ─── TRIGGERS ───
    trigger_rules: list[RetrievalTrigger]
    
    # ─── BÚSQUEDA ───
    max_retrieval_calls_per_request: int               # (máximo 2)
    max_refinement_iterations: int                     # (máximo 1)
    retrieval_timeout_seconds: int                     # (máximo 30s de 120s deep)
    
    # ─── RELEVANCIA ───
    relevance_score_threshold: float                   # (0.0-1.0, default 0.70)
    relevance_evaluation_mode: Literal["strict", "lenient"]
    
    # ─── RESULTADOS ───
    max_evidence_items_per_response: int               # (top N, default 5)
    evidence_excerpt_max_chars: int                    # (breve, default 200)
    
    # ─── FAIL MODES ───
    behavior_if_low_relevance: Literal["refine", "skip", "degrade"]
    behavior_if_timeout: Literal["skip", "cache", "error"]
    behavior_if_no_results: Literal["skip", "synthesize_without", "escalate_hitl"]
    
    # ─── GOVERNANCE ───
    evidence_can_override_recommendation: bool         # (NUNCA true)
    governor_can_suppress_retrieval: bool              # (sí, si HITL)
    synthesizer_auto_decides_retrieval: bool           # (sí)
    
    # ─── LOGGING ───
    log_all_queries: bool                              # (append-only)
    log_all_results: bool
    log_relevance_scores: bool


@dataclass
class RetrievalTrigger:
    """Condición para activar retrieval."""
    
    trigger_id: str
    domain: DomainKey
    condition: str                                     # Descripción lógica
    rationale: str                                     # Por qué se activa
    priority: Literal["required", "optional", "conditional"]


@dataclass
class NotebookLMQuery:
    """Una búsqueda individual en NotebookLM."""
    
    query_id: str                                      # UUID
    timestamp: str                                     # ISO-8601
    
    # Input
    original_domain: DomainKey
    original_intent: str                               # Qué pregunta original
    formulated_query: str                              # Query enviada a NotebookLM
    iteration: int                                     # 1 (initial) o 2 (refinement)
    
    # Output
    status: Literal["success", "timeout", "no_results", "error"]
    results: list[EvidenceResult]                      # Top N
    average_relevance: float
    search_duration_ms: int
    
    # Decisión
    included_in_response: bool
    reason_for_inclusion: str


@dataclass
class EvidenceResult:
    """Un resultado individual de búsqueda."""
    
    notebook_id: str
    source_title: str
    excerpt: str                                       # Breve, max 200 chars
    relevance_score: float                             # 0.0-1.0
    confidence_level: Literal["high", "medium", "low"]


@dataclass
class NotebookLMRetrievalLog:
    """Registro de todas las operaciones de retrieval."""
    
    entry_id: str                                      # UUID
    timestamp: str                                     # ISO-8601
    correlation_id: str                                # Link a audit log
    
    # Context
    query_plan_id: str
    governor_decision_id: str
    synthesizer_request_id: str
    
    # Policy applied
    policy_version: str                                # "1.0"
    policy_mode: Literal["dry_run", "active"]
    
    # Queries executed
    queries: list[NotebookLMQuery]
    total_queries_executed: int                        # (máximo 2)
    total_items_retrieved: int
    total_items_used: int
    
    # Decision
    evidence_included: bool
    evidence_status: Literal["available", "not_available", "partial", "degraded"]
    
    # Metrics
    total_duration_ms: int
    average_relevance_overall: float
    success_rate: float                                # % queries exitosas
    
    # Outcome
    status: Literal["success", "partial", "degraded", "failed"]
    notes: str
```

---

# 3. FIELD DEFINITIONS

## 3.1 enabled_domains & disabled_domains

**Valores:**

```python
enabled_domains = ["tax", "transition"]
disabled_domains = ["market", "brand", "system", "growth", "lab"]
```

**Razonamiento:**

| Dominio | Enabled | Por Qué |
|---|---|---|
| **tax** | ✅ | Normativa, legislación, implicaciones fiscales requieren fuentes verificables |
| **transition** | ✅ | Contexto laboral externo, tendencias económicas, datos de mercado |
| **market** | ❌ | Tu expertise en Mallorca SW ES la fuente; no necesitas NotebookLM |
| **brand** | ❌ | Posicionamiento premium es diferenciador tuyo, no externo |
| **system** | ❌ | Procesos internos; no aplica evidence externa |
| **growth** | ❌ | Excluido Phase 2 (dominio deshabilitado) |
| **lab** | ❌ | Experimental; evidence no relevante |

**Implementación:**

```python
def can_retrieve_for_domain(domain: DomainKey) -> bool:
    return domain in enabled_domains
```

---

## 3.2 trigger_rules (Cuándo Buscar)

**5 Triggers Definidos:**

### Trigger #1: Domain-Based (Required)
```python
RetrievalTrigger(
    trigger_id="trigger_001_domain_required",
    domain="tax",
    condition="domain_selected == 'tax'",
    rationale="Tax siempre requiere evidence para validar implicaciones",
    priority="required"
)
```

### Trigger #2: Domain-Based (Required)
```python
RetrievalTrigger(
    trigger_id="trigger_002_domain_required",
    domain="transition",
    condition="domain_selected == 'transition'",
    rationale="Transition requiere contexto laboral externo",
    priority="required"
)
```

### Trigger #3: Low Confidence (Conditional)
```python
RetrievalTrigger(
    trigger_id="trigger_003_confidence_conditional",
    domain=None,  # Aplica a cualquier dominio
    condition="synthesizer_confidence < 0.60 AND domain in enabled_domains",
    rationale="Si confianza baja y dominio permitido, buscar evidence para fortalecer",
    priority="conditional"
)
```

### Trigger #4: Ambiguity Detection (Conditional)
```python
RetrievalTrigger(
    trigger_id="trigger_004_ambiguity_conditional",
    domain=None,
    condition="message_length < 50 OR domain_hint == 'auto'",
    rationale="Si consulta breve o sin claridad, evidence contextualiza",
    priority="conditional"
)
```

### Trigger #5: Manual Governor Override (Optional)
```python
RetrievalTrigger(
    trigger_id="trigger_005_governor_optional",
    domain=None,
    condition="governor_flags contains 'needs_evidence'",
    rationale="Governor puede sugerir (pero Synthesizer decide)",
    priority="optional"
)
```

**Lógica de Activación:**

```
IF domain in enabled_domains:
    trigger = "required" → EJECUTAR búsqueda
ELIF confidence < 0.60 AND domain in enabled_domains:
    trigger = "conditional" → EJECUTAR búsqueda
ELIF governor sugiere needs_evidence:
    trigger = "optional" → SYNTHESIZER DECIDE
ELSE:
    trigger = "none" → SKIP retrieval
```

---

## 3.3 max_retrieval_calls_per_request

**Valor:** 2 (máximo)

**Breakdown:**

```
Call 1: Initial search (siempre)
Call 2: Refinement (solo si relevance < 0.70)
Call 3+: NUNCA (prevenir loops infinitos)
```

**Pseudo-código:**

```python
retrieval_calls = 0

# Call 1: Initial
results_1 = search_notebooklm(query)
retrieval_calls += 1
avg_relevance_1 = calculate_average_relevance(results_1)

if avg_relevance_1 < 0.70 and retrieval_calls < 2:
    # Call 2: Refinement
    refined_query = refine_search_query(original_query, results_1)
    results_2 = search_notebooklm(refined_query)
    retrieval_calls += 1
    avg_relevance_2 = calculate_average_relevance(results_2)
    
    # Use best results
    results = select_best_results(results_1, results_2)
else:
    results = results_1

# STOP: retrieval_calls == 2 or avg_relevance >= 0.70
```

---

## 3.4 relevance_score_threshold

**Valor:** 0.70 (default)

**Interpretación:**

| Score | Significa | Acción |
|---|---|---|
| ≥ 0.90 | Altamente relevante | Incluir sin dudas |
| 0.70-0.89 | Relevante | Incluir, útil |
| 0.50-0.69 | Parcialmente relevante | Considerar refinamiento |
| < 0.50 | Irrelevante | Excluir |

**Cálculo:**

```python
average_relevance = mean([result.relevance_score for result in results])

if average_relevance >= 0.70:
    status = "proceed"
elif average_relevance >= 0.50:
    status = "consider_refinement"
else:
    status = "low_relevance_skip"
```

---

## 3.5 max_evidence_items_per_response

**Valor:** 5 (top 5 items)

**Selección:**

```python
# Ordenar por relevance_score DESC
ranked_results = sorted(results, key=lambda x: x.relevance_score, reverse=True)

# Top 5
evidence_items = ranked_results[:5]

# Incluir en SynthesizerOutput.evidence.items
```

**Razón:** 5 items es suficiente para contextualizar sin sobrecargar response.

---

## 3.6 evidence_excerpt_max_chars

**Valor:** 200 caracteres max

**Rationale:** 
- Breve pero sustantivo (1-2 párrafos)
- Legible en UI
- No reproducción de contenido completo (copyright)
- Mantiene atención en la recomendación, no en el excerpt

**Ejemplo válido (180 chars):**
```
"La Ley de Vivienda 2024 establece que los trabajadores con
contrato indefinido tienen derecho a solicitar excedencia voluntaria
con reincorporación garantizada en un máximo de 4 años."
```

**Ejemplo inválido (>200 chars):**
```
"La Ley de Vivienda 2024, que entró en vigor el 1 de junio de 2024,
es una normativa integral que afecta múltiples aspectos de la relación
laboral, incluyendo derechos de trabajadores, protecciones especiales,
y procedimientos de excedencia..." [❌ demasiado]
```

---

## 3.7 behavior_if_low_relevance

**Valor:** "refine" (máximo 1 intento de refinamiento)

```python
if average_relevance < 0.70:
    # Intentar refinar (1 sola vez)
    refined_query = ai_refine_query(original_query, results)
    refined_results = search_notebooklm(refined_query)
    avg_refined = calculate_average_relevance(refined_results)
    
    if avg_refined >= 0.70:
        results = refined_results  # Usar refined
    else:
        # Aún bajo: proceder sin evidence
        evidence_status = "partial"
        include_evidence = False
```

---

## 3.8 behavior_if_timeout

**Valor:** "skip" (no bloquear respuesta)

```python
try:
    results = search_notebooklm(query, timeout=30)
except TimeoutError:
    # No esperar más
    results = []
    evidence_status = "degraded"
    log_warning("NotebookLM retrieval timeout")
```

**Razón:** Synthesizer tiene presupuesto de 120s deep. Si NotebookLM tarda >30s, mejor responder sin evidence que timeout.

---

## 3.9 behavior_if_no_results

**Valor:** "synthesize_without" (responder sin evidence)

```python
if not results or all(score < 0.50 for score, _ in results):
    # No hay resultados relevantes
    synthesizer_output.evidence.status = "not_available"
    synthesizer_output.evidence.items = []
    
    # Responder normalmente (sin evidence)
    # Answer sigue siendo válido
```

---

## 3.10 evidence_can_override_recommendation

**Valor:** `false` (NUNCA CAMBIAR)

```python
# INVARIANTE CRÍTICA:
assert governor_decision.recommendation == synthesizer_output.meta.recommendation
# Evidence NUNCA cambia recomendación
```

**Razón:** 
- Governor evalúa bajo principio rector + Strategic Mode
- Evidence es soporte, no fuente de verdad
- Si "postpone" → evidence no convierte a "execute"
- Si "reframe" → evidence no cambia recomendación

---

## 3.11 governor_can_suppress_retrieval

**Valor:** `true` (sí puede)

```python
if governor_flags contains "no_retrieval_needed":
    skip_notebooklm_retrieval()
    evidence_status = "not_available"
```

**Ejemplo:** Governor puede detectar que aunque domain="tax", el contexto ya es claro y no requiere evidencia.

---

## 3.12 synthesizer_auto_decides_retrieval

**Valor:** `true` (sí decide)

```python
# Synthesizer evalúa:
def should_retrieve(query_plan, governor_decision):
    # Check 1: Domain permite
    if query_plan.domains_selected[0] not in enabled_domains:
        return False
    
    # Check 2: Governor sugirió?
    if "needs_evidence" in governor_decision.flags:
        return True
    
    # Check 3: Confianza baja?
    if query_plan.confidence == "low":
        return True
    
    # Check 4: Default para tax/transition?
    if query_plan.domains_selected[0] in ["tax", "transition"]:
        return True
    
    return False
```

---

# 4. INVARIANTS (Reglas Que NO Pueden Romperse)

```
1. max_retrieval_calls_per_request = 2 (NUNCA más)
2. max_refinement_iterations = 1 (NUNCA más)
3. relevance_threshold >= 0.70 (NUNCA bajar)
4. evidence_can_override_recommendation = false (NUNCA cambiar)
5. evidence_excerpt_max_chars <= 200 (NUNCA expandir)
6. max_evidence_items <= 5 (NUNCA más)
7. enabled_domains = ["tax", "transition"] (NUNCA expandir Phase 2)
8. retrieval_timeout <= 30 segundos (NUNCA más)
9. Todos los queries registrados en audit log (NUNCA omitir)
10. Total request time <= 120s deep (NUNCA exceder)
```

---

# 5. QUERY FORMULATION (Cómo Buscar)

## Principios

1. **Especificidad:** Query debe ser conciso + específico
2. **Sin Sesgos:** No sugerir respuesta en la query
3. **Dominio-Aware:** Terminar con dominio explícitamente
4. **Versión Original:** Guardar query original antes de refinar

## Ejemplos

### Domain: tax

**Query Original (si mensaje = "¿Excedencia en CGI?"):**
```
"Implicaciones fiscales excedencia voluntaria España 2024 
+ impacto en Social Security + derechos de reincorporación"
```

**Query Refinada (si relevance baja):**
```
"Tratamiento fiscal excedencia indefinido vs renuncia + 
Ley de Vivienda 2024 derechos"
```

### Domain: transition

**Query Original (si mensaje = "¿Cambio de carrera?"):**
```
"Mercado laboral real estate Mallorca 2024-2025 + 
oportunidades sector lujo + tendencias independientes"
```

**Query Refinada:**
```
"Agentes inmobiliarios independientes España + ingresos 
medio + viabilidad modelos alternativos"
```

---

# 6. EXAMPLE: FULL RETRIEVAL FLOW

```
INPUT:
message = "¿Solicito excedencia o renuncia en CGI?"
query_plan.domains_selected = ["transition", "tax"]
governor_decision.recommendation = "postpone"
confidence = "medium"

STEP 1: Check triggers
├─ domain = "tax" ∈ enabled_domains? ✅ YES
├─ domain = "transition" ∈ enabled_domains? ✅ YES
└─ trigger_priority = "required" → RETRIEVE

STEP 2: Plan retrieval
├─ query_1_domain = "tax"
├─ query_1_text = "Implicaciones fiscales excedencia 2024..."
├─ query_2_domain = "transition" (si time permits)
├─ OR refine query_1 si relevance baja
└─ max_calls = 2

STEP 3: Execute query_1 (tax)
├─ search_notebooklm(query_1_text)
├─ results = [item1, item2, item3, item4, item5]
├─ avg_relevance = 0.82
├─ status = "success" ✅
└─ Include in evidence

STEP 4: Check relevance
├─ avg_relevance (0.82) >= threshold (0.70)? ✅ YES
├─ behavior = "proceed"
├─ max_calls already = 1
└─ Don't refine

STEP 5: Execute query_2 (transition) [if time permits]
├─ Remaining budget = 120 - 25 (query_1) - 10 (overhead) = 85s
├─ search_notebooklm(query_2_text)
├─ results = [item1, item2, item3]
├─ avg_relevance = 0.68
├─ status = "success"
└─ Marginal, but include (time budget available)

STEP 6: Select top items
├─ All items: 5 + 3 = 8 total
├─ Rank by relevance_score DESC
├─ Select top 5
├─ Trim excerpts to 200 chars
└─ Finalize evidence items

STEP 7: Package for Synthesizer
├─ evidence.status = "available"
├─ evidence.items = [top 5]
├─ evidence_included = true
└─ Include in SynthesizerOutput

STEP 8: Log everything
├─ NotebookLMRetrievalLog entry created
├─ total_queries_executed = 2
├─ total_items_retrieved = 8
├─ total_items_used = 5
├─ average_relevance_overall = 0.77
├─ status = "success"
└─ Append to audit log

OUTPUT:
SynthesizerOutput.evidence = {
  status: "available",
  items: [
    {notebook_id: "nb-001", source_title: "...", excerpt: "...", relevance_score: 0.89},
    {notebook_id: "nb-002", source_title: "...", excerpt: "...", relevance_score: 0.85},
    ...
  ]
}
```

---

# 7. ANTI-PATTERNS (Qué NO hacer)

```
❌ Loop infinito de refinamientos (max 1)
❌ Usar evidence para cambiar recomendación (NUNCA)
❌ Expandir enabled_domains sin justificación Phase 3
❌ Exceder 30s por búsqueda (rompe presupuesto 120s)
❌ Usar evidence snippets de >200 chars (UI readability)
❌ Ignorar timeout (bloquea respuesta)
❌ No registrar queries en audit log (trazabilidad)
❌ Bajar relevance_threshold sin versionado (inconsistencia)
```

---

# 8. PHASE BINDING

## Phase 2
```python
NotebookLM = disabled
QueryPlan.needs_evidence = false (siempre)
SynthesizerOutput.evidence.status = "not_available"
Retrieval policy = not active
```

## Phase 3+ (Activation)
```python
NotebookLM = enabled (selective)
QueryPlan.needs_evidence = true (si tax|transition)
SynthesizerOutput.evidence.status = "available" (si retrieved)
Retrieval policy = ACTIVE (this contract)
```

---

# 9. AUDIT COMPATIBILITY

**Cada retrieval se registra en `NotebookLMRetrievalLog`:**

```json
{
  "entry_id": "uuid",
  "timestamp": "2026-02-12T18:14:30Z",
  "correlation_id": "req-uuid",
  "policy_version": "1.0",
  "total_queries_executed": 2,
  "queries": [
    {
      "query_id": "qry-001",
      "iteration": 1,
      "formulated_query": "...",
      "status": "success",
      "average_relevance": 0.82,
      "results_count": 5
    },
    {
      "query_id": "qry-002",
      "iteration": 1,
      "formulated_query": "...",
      "status": "success",
      "average_relevance": 0.68,
      "results_count": 3
    }
  ],
  "evidence_included": true,
  "evidence_status": "available",
  "total_items_used": 5,
  "status": "success"
}
```

---

# 10. GOVERNOR DIRECTIVES

Governor carga esta policy en startup y la aplica:

```python
class Governor:
    def __init__(self):
        self.retrieval_policy = load_notebooklm_retrieval_policy_v1()
    
    def evaluate_retrieval_need(self, query_plan: QueryPlan):
        """¿Debería Synthesizer buscar evidence?"""
        
        # Check enabled domains
        domain = query_plan.domains_selected[0]
        if domain not in self.retrieval_policy.enabled_domains:
            return False
        
        # Check if Governor should suppress
        if self.decision_flags contains "no_retrieval_needed":
            return False
        
        # Check HITL override
        if self.escalation_level == "HITL":
            return False  # Let human decide
        
        return True
```

---

# 11. VERSIONING POLICY

**Si necesita cambios:**

1. Cambiar enabled_domains → v1.1
2. Cambiar relevance_threshold → v1.1
3. Cambiar max_retrieval_calls → v1.2 (cambio significativo)
4. Cambiar evidence_can_override → v2.0 (NUNCA, pero si ocurre)

**Nunca:** Modificar policy en runtime.  
**Siempre:** Versionado explícito en Git.

---

# 12. STATUS

**NotebookLM Retrieval Policy v1 está formalmente definido.**

✅ Congelado hasta nueva versión  
✅ Listo para Phase 3 implementation  
✅ Compatible con GovernorDecision + SynthesizerOutput  
✅ Audit-friendly  
✅ Anti-dependencia (max 2 calls, 1 refinement)  

---

# 13. EJEMPLO: CONTRARIO (LO QUE NO HACER)

```
❌ BAD POLICY (Anti-pattern):
max_retrieval_calls = 10           # Loop infinito
max_refinement_iterations = 5      # Sobreoptimización
relevance_threshold = 0.30         # Ruido
evidence_can_override = true       # NUNCA
enabled_domains = ALL              # Scope explosion

❌ RESULTADO:
- Latency explosion
- Dependencia excesiva de NotebookLM
- Evidence contradice Governor
- Overhead cognitivo
- Costo $$$

✅ ESTE POLICY (Correcto):
max_retrieval_calls = 2            # Disciplina
max_refinement_iterations = 1      # Eficiencia
relevance_threshold = 0.70         # Calidad
evidence_can_override = false      # Gobernanza
enabled_domains = [tax, transition] # Selectivo

✅ RESULTADO:
- Latency controlado (<120s)
- Evidence apoya, no decide
- Presupuesto respetado
- Decisiones gobiernadas
- Escalable Phase 3+
```

---

# 14. ROADMAP FUTURO

### Phase 3 (Now)
```
✅ Activate policy v1.0
✅ Implement NotebookLM integration
✅ Monitor performance + relevance
```

### Phase 4 (Later)
```
→ Policy v1.1 if needed (minor adjustments)
→ Multi-domain retrieval (if justified)
→ Smarter query formulation (ML)
```

### Phase 5+ (Way Later)
```
→ Policy v2.0 (major redesign)
→ Custom knowledge bases per domain
→ Advanced evidence synthesis
```

---

# 15. FINAL NOTES

This policy ensures:

✅ **Simplicity:** 2 calls max, clear rules  
✅ **Speed:** 30s per search, <120s total  
✅ **Quality:** 0.70 threshold, top 5 items  
✅ **Governance:** Evidence supports, doesn't override  
✅ **Scalability:** Selective domains, Phase 3+ ready  
✅ **Discipline:** Anti-dependence, logged retrieval  

---

**Versión:** 1.0  
**Status:** STABLE CONTRACT  
**Fecha:** Febrero 12, 2026  
**Next Phase:** Phase 3 Implementation

🎯 **Evidence apoya decisiones. Governor las toma. Tú las gobiernas.**
