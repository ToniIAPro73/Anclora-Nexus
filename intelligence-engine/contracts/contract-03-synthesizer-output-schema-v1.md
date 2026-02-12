# SynthesizerOutput Schema v1
## Contrato Formal de Salida del Synthesizer
### Version: 1.0 | Status: Stable | Scope: Anclora Intelligence Phase 1+

---

# 1. PURPOSE

Definir la estructura **oficial, inmutable y formal** de la respuesta final generada por el Synthesizer.

Este esquema:
- Es el contrato entre: **Synthesizer → API → UI → Audit**
- Consume GovernorDecision v1 + QueryPlan v1
- En Phase 3+ puede incluir EvidenceItems
- Debe mantenerse estable para no romper frontend ni auditoría
- Permite que lógica interna evolucione sin cambiar contrato

---

# 2. ESTRUCTURA FORMAL

```python
@dataclass
class SynthesizerOutput:
    """Respuesta final de Intelligence: lo que ve el usuario."""
    
    # Contenido textual principal
    answer: str                                        # (respuesta formateada)
    
    # Metadata de decisión + resumen de riesgos
    meta: Meta
    
    # Vista de alto nivel del plan
    plan: PlanView
    
    # Trazabilidad y explicabilidad
    trace: Trace
    
    # Evidencia de soporte (vacía en Phase 2)
    evidence: EvidenceView


@dataclass
class Meta:
    """Metadatos de la decisión."""
    
    mode: Literal["fast", "deep"]
    domain_hint: Literal["auto", "market", "brand", "tax", 
                         "transition", "system", "growth", "lab"]
    confidence: Literal["low", "medium", "high"]
    flags: list[str]
    recommendation: Literal["execute", "postpone", "reframe", "discard"]
    risk_summary: RiskSummary
    version: MetaVersion


@dataclass
class RiskSummary:
    """Resumen de riesgos para UI (chips de color)."""
    
    labor: Literal["low", "medium", "high"]
    tax: Literal["low", "medium", "high"]
    brand: Literal["low", "medium", "high"]
    focus: Literal["low", "medium", "high"]


@dataclass
class MetaVersion:
    """Versionado de componentes."""
    
    schema_version: str                                # ("1.0")
    strategic_mode_id: str                             # (ej: "v1-validation-phase")
    domain_pack_id: str                                # (ej: "real-estate-mallorca@v0.1")


@dataclass
class PlanView:
    """Vista de alto nivel del plan para UI."""
    
    domains_selected: list[str]
    rationale: str
    lab_policy: LabPolicyView


@dataclass
class LabPolicyView:
    """Vista del estado de laboratorio."""
    
    status: Literal["denied", "conditional", "approved"]
    rationale: str


@dataclass
class Trace:
    """Trazabilidad y explicabilidad auditables."""
    
    query_plan_id: str                                 # (UUID o hash)
    governor_decision_id: str                          # (UUID o hash)
    created_at: str                                    # (ISO-8601)
    output_ai: bool                                    # (siempre true)


@dataclass
class EvidenceView:
    """Vista de evidencia (vacía en Phase 2)."""
    
    status: Literal["not_available", "available"]
    items: list[EvidenceItemView]


@dataclass
class EvidenceItemView:
    """Un ítem de evidencia de NotebookLM."""
    
    notebook_id: str
    source_title: str
    excerpt: str
    relevance_score: float
```

---

# 3. FIELD DEFINITIONS

## 3.1 answer (string)

**Descripción:** Contenido textual final mostrado al usuario.

**Formato Fijo (Invariante Crítico):**

La respuesta DEBE seguir exactamente este orden:

```
┌─────────────────────────────────────────┐
│ 1. DIAGNÓSTICO                          │
│    [5-8 líneas de análisis]             │
│                                         │
│ 2. RECOMENDACIÓN                        │
│    [Ejecutar|Postergar|Reformular|...] │
│    [Justificación lógica]               │
│                                         │
│ 3. RIESGOS ASOCIADOS                    │
│    - Labor: [LEVEL] — [rationale]      │
│    - Tax: [LEVEL] — [rationale]        │
│    - Brand: [LEVEL] — [rationale]      │
│    - Focus: [LEVEL] — [rationale]      │
│                                         │
│ 4. PRÓXIMOS 3 PASOS                     │
│    1. [Paso 1]                          │
│    2. [Paso 2]                          │
│    3. [Paso 3]                          │
│                                         │
│ 5. QUÉ NO HACER AHORA                   │
│    - [Contraindicación 1]               │
│    - [Contraindicación 2]               │
│    - [Contraindicación 3]               │
│                                         │
│ [metadata: domains, confidence, flags]  │
└─────────────────────────────────────────┘
```

**Restricciones:**
- Orden fijo: no se permite variar
- Max 800 palabras total
- Tono: Premium, discreto, directo
- Sin tecnicismos innecesarios
- Accionable antes que exhaustivo

**Regla de Oro:**
- No se permite "respuesta libre"
- Siempre 5 bloques en este orden
- Si no se pueden llenar los 5 bloques, error

---

## 3.2 meta (Meta)

**Propósito:** Metadatos de la decisión para UI y auditoría.

**Fields:**

### meta.mode
- Valor: `fast` | `deep`
- Origen: QueryPlan.mode
- Uso: UI muestra qué modo se usó

### meta.domain_hint
- Valor: `auto` | DomainKey
- Origen: QueryPlan.domain_hint
- Uso: UI muestra qué sugirió usuario

### meta.confidence
- Valor: `low` | `medium` | `high`
- Origen: QueryPlan.confidence
- Uso: UI muestra confianza del análisis

### meta.flags
- Valor: lista de strings
- Origen: QueryPlan.flags
- Uso: UI puede filtrar/mostrar flags críticos

### meta.recommendation
- Valor: `execute` | `postpone` | `reframe` | `discard`
- Origen: GovernorDecision.recommendation
- **Invariante:** Debe coincidir exactamente
- Uso: UI destaca recomendación principal

### meta.risk_summary
- Valor: 4 levels (labor, tax, brand, focus)
- Origen: GovernorDecision.risks.*.level
- Uso: UI muestra chips de color (🟢 low, 🟡 medium, 🔴 high)

### meta.version
- Valor: Schema version + IDs de componentes
- Uso: Auditoría, reproducibilidad
- `schema_version`: Fijo "1.0" para v1
- `strategic_mode_id`: ID del archivo que gobernó
- `domain_pack_id`: ID del pack usado

**Ejemplo:**
```python
Meta(
    mode="deep",
    domain_hint="auto",
    confidence="high",
    flags=["labor-risk=HIGH", "hitl_required=true"],
    recommendation="postpone",
    risk_summary=RiskSummary(
        labor="high",
        tax="medium",
        brand="low",
        focus="medium"
    ),
    version=MetaVersion(
        schema_version="1.0",
        strategic_mode_id="v1-validation-phase",
        domain_pack_id="real-estate-mallorca@v0.1"
    )
)
```

---

## 3.3 plan (PlanView)

**Propósito:** Vista de alto nivel del plan para UI panel.

**Fields:**

### plan.domains_selected
- Valor: lista de DomainKey
- Origen: QueryPlan.domains_selected
- **Invariante:** Debe ser idéntico
- Uso: UI muestra qué dominios se usaron

### plan.rationale
- Valor: string (5-10 líneas)
- Origen: QueryPlan.rationale
- Uso: UI muestra justificación del plan
- Restricción: Lenguaje entendible para usuario final

### plan.lab_policy
- Valor: LabPolicyView
- Origen: QueryPlan.lab_policy
- Uso: UI muestra acceso a laboratorio
- Campos:
  - `status`: "denied" | "conditional" | "approved"
  - `rationale`: Explicación breve

**Ejemplo:**
```python
PlanView(
    domains_selected=["transition", "market"],
    rationale="""
    Detectada intención de cambio laboral.
    Seleccionado "transition" para análisis de carrera.
    Incluido "market" para validar tracción inmobiliaria.
    """,
    lab_policy=LabPolicyView(
        status="denied",
        rationale="Phase 1: No experimental features"
    )
)
```

---

## 3.4 trace (Trace)

**Propósito:** Trazabilidad y explicabilidad controlada (no debugging técnico).

**Fields:**

### trace.query_plan_id
- Valor: UUID o hash determinista de QueryPlan
- Uso: Correlacionar request → plan → decision
- Auditoría: Recuperar plan original

### trace.governor_decision_id
- Valor: UUID o hash determinista de GovernorDecision
- Uso: Correlacionar plan → decision → output
- Auditoría: Recuperar decisión original

### trace.created_at
- Valor: ISO-8601 timestamp
- Ejemplo: "2026-02-12T18:14:30Z"
- Uso: Cuándo se generó la respuesta

### trace.output_ai
- Valor: Siempre `true`
- Uso: Marcar que es generado por IA
- Invariante: NUNCA false (si es false, hay error crítico)

**Regla:**
- `trace` no es para debugging técnico
- Es para explicabilidad auditable
- Usuario NO ve trace (solo auditoría)

**Ejemplo:**
```python
Trace(
    query_plan_id="qp-abc123def456",
    governor_decision_id="gd-xyz789uvw012",
    created_at="2026-02-12T18:14:30Z",
    output_ai=True
)
```

---

## 3.5 evidence (EvidenceView)

**Propósito:** Soporte evidencial de la recomendación.

**Phase 2 (Default):**
```python
evidence = EvidenceView(
    status="not_available",
    items=[]
)
```

**Phase 3+ (Con NotebookLM):**
```python
evidence = EvidenceView(
    status="available",
    items=[
        EvidenceItemView(
            notebook_id="nb-001",
            source_title="Ley de Vivienda 2024",
            excerpt="Artículo 45: Derechos de trabajadores...",
            relevance_score=0.92
        ),
        # ... más items (max 5)
    ]
)
```

**Fields:**

### evidence.status
- Valores: `not_available` | `available`
- `not_available` en Phase 2
- `available` en Phase 3+ si hay items

### evidence.items
- Valor: lista de EvidenceItemView
- En Phase 2: vacía `[]`
- En Phase 3+: top N items (default N=5)
- Orden: Por relevancia descendente

### EvidenceItemView

| Field | Valor | Uso |
|---|---|---|
| `notebook_id` | string | Identificar fuente |
| `source_title` | string | Mostrar en UI |
| `excerpt` | string | Breve (1-2 párrafos) |
| `relevance_score` | float | 0.0-1.0, ordenar |

**Restricción:**
- `excerpt` debe ser breve y útil
- Evitar bloques largos (UI readability)
- Máximo 200 caracteres por excerpt

---

# 4. INVARIANTS (Reglas Que NO Pueden Romperse)

```
1. answer SIEMPRE presente y en formato fijo (5 bloques)
2. meta SIEMPRE presente
3. meta.recommendation SIEMPRE coincide con GovernorDecision.recommendation
4. meta.risk_summary SIEMPRE refleja GovernorDecision.risks.*.level
5. plan.domains_selected SIEMPRE refleja QueryPlan.domains_selected
6. trace.output_ai SIEMPRE true
7. evidence.status = "not_available" en Phase 2
8. No omitir campos: output nunca parcial
9. answer orden NUNCA cambia: diagnóstico → recomendación → riesgos → pasos → qué no hacer
10. answer max 800 palabras
```

**Validación:**
```python
def validate_synthesizer_output(output: SynthesizerOutput) -> bool:
    assert output.answer
    assert output.meta is not None
    assert output.meta.recommendation is not None
    assert output.plan is not None
    assert output.trace is not None
    assert output.trace.output_ai == True
    assert output.evidence is not None
    assert output.evidence.status in ["not_available", "available"]
    # Validar que answer contiene 5 bloques
    assert "DIAGNÓSTICO" in output.answer
    assert "RECOMENDACIÓN" in output.answer
    assert "RIESGOS" in output.answer
    assert "PRÓXIMOS 3 PASOS" in output.answer
    assert "QUÉ NO HACER" in output.answer
    return True
```

---

# 5. PHASE BINDING

## Phase 2

```python
SynthesizerOutput(
    answer="[5 bloques fijos]",
    meta=Meta(...),
    plan=PlanView(...),
    trace=Trace(...),
    evidence=EvidenceView(
        status="not_available",
        items=[]
    )
)
```

## Phase 3+

```python
SynthesizerOutput(
    answer="[5 bloques fijos, posiblemente con references a evidencia]",
    meta=Meta(...),
    plan=PlanView(...),
    trace=Trace(...),
    evidence=EvidenceView(
        status="available",
        items=[...]  # Relleno desde NotebookLM bridge
    )
)
```

**El cambio de Phase 2 → Phase 3 es completamente backward compatible:**
- Phase 2 clients ignoran evidence si está vacía
- Phase 3 clients usan evidence si está disponible
- El contrato NO cambia

---

# 6. AUDIT COMPATIBILITY

SynthesizerOutput completo debe poder:

1. **Serializarse a JSON** sin pérdidas
2. **Almacenarse en audit log**
3. **Recuperarse posteriormente** idéntico
4. **Mantener integridad** (HMAC, según constitution-canonical)

**Formato en Audit Log:**
```json
{
  "id": "uuid",
  "timestamp": "2026-02-12T18:14:30Z",
  "user_id": "toni-id",
  "query_plan_id": "qp-abc123",
  "governor_decision_id": "gd-xyz789",
  "synthesizer_output": {
    "answer": "...",
    "meta": {...},
    "plan": {...},
    "trace": {...},
    "evidence": {...}
  },
  "output_ai": true,
  "status": "success"
}
```

---

# 7. VERSIONING POLICY

**Si el esquema cambia:**

1. Crear `synthesizer-output-schema-v2.md`
2. NO sobrescribir v1
3. Mantener compatibilidad con UI si es posible
4. Documentar cambios en `CHANGELOG.md`

**Cambios que requieren v2:**
- Cambiar orden de bloques en answer
- Añadir campo obligatorio nuevo
- Redefinir estructura de evidence
- Cambiar invariants

**Cambios que NO requieren v2:**
- Rellenar evidence en Phase 3 (backward compatible)
- Añadir nuevos fields opcionales
- Actualizar documentación
- Cambiar internal rationale

---

# 8. RATIONALE DE DISEÑO

Este contrato:

✅ **Asegura UI estable** → aunque cambie lógica interna  
✅ **Conserva explicabilidad** → sin exponer detalles sensibles  
✅ **Mantiene audit consistente** → trazabilidad total  
✅ **Permite introducir evidencia** → Phase 3 sin romper nada  
✅ **Refuerza disciplina** → respuestas formalizadas, no "libres"  
✅ **Soporta crecimiento** → Phase 2-5 sin cambios frecuentes  

---

# 9. INTEGRATION CON OTROS CONTRATOS

```
QueryPlan (entrada Router)
         ↓
GovernorDecision (salida Governor)
         ↓
SynthesizerOutput (ESTE CONTRATO, salida final)
    ↓
API/UI/Audit
```

**Relaciones:**

| Campo SynthesizerOutput | Origen | Invariante |
|---|---|---|
| `meta.recommendation` | GovernorDecision.recommendation | Idéntico |
| `meta.risk_summary` | GovernorDecision.risks.*.level | Reflejar |
| `plan.domains_selected` | QueryPlan.domains_selected | Idéntico |
| `plan.rationale` | QueryPlan.rationale | Copiar |
| `trace.query_plan_id` | QueryPlan id | Referenciar |
| `trace.governor_decision_id` | GovernorDecision id | Referenciar |

---

# 10. EJEMPLO COMPLETO

```python
output = SynthesizerOutput(
    answer="""
## DIAGNÓSTICO
Solicitar excedencia en CGI requiere validación previa de caja alternativa.
Actualmente: 0 cierres inmobiliarios, cash runway sin excedencia: indefinido.

## RECOMENDACIÓN
**POSTERGAR** (6-12 meses)
Excedencia es cambio irreversible que requiere base estable.

## RIESGOS
- Labor [HIGH]: Pérdida contrato indefinido, estabilidad
- Tax [MEDIUM]: Implicaciones SS, impuestos, paro involuntario
- Brand [LOW]: N/A
- Focus [MEDIUM]: Cambio de contexto reduce productividad

## PRÓXIMOS 3 PASOS
1. Validar 3 cierres inmobiliarios (≥€5k comisión neta each)
2. Proyectar cash flow 6 meses sin salario CGI
3. Revisar con asesor fiscal: excedencia vs. renuncia

## QUÉ NO HACER AHORA
- No comunicar a CGI hasta validación completa
- No solicitar excedencia sin colchón 6-12 meses
- No asumir excedencia = renuncia automática
    """,
    
    meta=Meta(
        mode="deep",
        domain_hint="auto",
        confidence="high",
        flags=["labor-risk=HIGH", "hitl_required=true"],
        recommendation="postpone",
        risk_summary=RiskSummary(
            labor="high",
            tax="medium",
            brand="low",
            focus="medium"
        ),
        version=MetaVersion(
            schema_version="1.0",
            strategic_mode_id="v1-validation-phase",
            domain_pack_id="real-estate-mallorca@v0.1"
        )
    ),
    
    plan=PlanView(
        domains_selected=["transition", "market"],
        rationale="Detectada intención de cambio laboral. Seleccionado transition para análisis. Incluido market para validar tracción inmobiliaria.",
        lab_policy=LabPolicyView(
            status="denied",
            rationale="Phase 1: No experimental"
        )
    ),
    
    trace=Trace(
        query_plan_id="qp-abc123def456",
        governor_decision_id="gd-xyz789uvw012",
        created_at="2026-02-12T18:14:30Z",
        output_ai=True
    ),
    
    evidence=EvidenceView(
        status="not_available",
        items=[]
    )
)
```

---

# 11. STATUS

**SynthesizerOutput Schema v1 está formalmente definido.**

✅ Congelado hasta nueva versión  
✅ Listo para implementación Phase 1  
✅ Compatible con constitution-canonical.md  
✅ Backward compatible para Phase 3+ (evidence)  

---

**Versión:** 1.0  
**Status:** STABLE CONTRACT  
**Fecha:** Febrero 2026  
**Próximo:** Strategic Mode Schema v1
