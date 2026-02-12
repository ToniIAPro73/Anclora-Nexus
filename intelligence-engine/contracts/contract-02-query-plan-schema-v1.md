# QueryPlan Schema v1
## Contrato Formal de Salida del Router
### Version: 1.0 | Status: Stable | Scope: Anclora Intelligence Phase 1+

---

# 1. PURPOSE

Definir la estructura **oficial, inmutable y formal** del plan de consulta generado por el Router.

Este esquema:
- Es el contrato entre: **Router → Governor → Synthesizer → UI → Audit**
- No puede romperse sin versionado explícito en Git
- Debe ser expresivo suficientemente para Fase 2-5 sin cambios frecuentes
- Controla cómo se enruta la consulta a través del sistema
- Soporta crecimiento sin romper el contrato

---

# 2. ESTRUCTURA FORMAL

```python
@dataclass
class QueryPlan:
    """Plan de consulta emitido por Router: entrada a Governor."""
    
    # Modo de operación
    mode: Literal["fast", "deep"]
    
    # Hint del usuario (preferencia, no mandato)
    domain_hint: Literal["auto", "market", "brand", "tax", 
                         "transition", "system", "growth", "lab"]
    
    # Dominios seleccionados (1-3)
    domains_selected: list[DomainKey]                  # (len 1-3)
    
    # Agentes a utilizar (preparado para Phase 4+)
    agents_selected: list[str]                         # (vacío en Phase 2)
    
    # ¿Requiere evidencia NotebookLM?
    needs_evidence: bool                               # (false en Phase 2)
    
    # ¿Requiere ejecutar skills?
    needs_skills: bool                                 # (false en Phase 2)
    
    # Política de acceso a laboratorio
    lab_policy: LabPolicy
    
    # Justificación de selección de dominios
    rationale: str                                     # (5-10 líneas max)
    
    # Confianza en la clasificación
    confidence: Literal["low", "medium", "high"]
    
    # Flags operacionales
    flags: list[str]
    
    # Timestamp
    timestamp: datetime                                # (ISO-8601)


# Type Aliases
DomainKey = Literal["market", "brand", "tax", "transition", 
                    "system", "growth", "lab"]


@dataclass
class LabPolicy:
    """Control de acceso a laboratorio tecnológico."""
    
    allow_lab: bool
    status: Literal["denied", "conditional", "approved"]
    rationale: str                                     # (1-2 líneas)
```

---

# 3. FIELD DEFINITIONS

## 3.1 mode (enum)

**Valores:**
- `fast` → Análisis rápido, prioriza rapidez sobre exhaustividad
- `deep` → Análisis exhaustivo, permite multidominio

**Comportamiento Asociado:**

| Mode | Dominios Permitidos | Tiempo | Uso Típico |
|---|---|---|---|
| `fast` | 1-2 | <60 seg | Decisiones simples, claras |
| `deep` | 1-3 | <120 seg | Decisiones complejas, multidominio |

**Regla:**
- Nunca cambiar mode en runtime
- Usuario puede sugerir, pero Router decide basado en claridad

---

## 3.2 domain_hint (enum)

**Valores:**
- `auto` → Router decide sin preferencia del usuario
- Cualquier DomainKey → Preferencia fuerte del usuario

**Reglas:**
- Es **preferencia**, no mandato absoluto
- Router puede sobreescribir si detecta ambigüedad
- Si sobrescribe, incluir flag `domain-hint-overridden`

**Ejemplo:**
```python
QueryPlan(
    domain_hint="auto",  # Usuario no sugiere
    domains_selected=["market"],  # Router elige
    flags=[]
)

QueryPlan(
    domain_hint="tax",  # Usuario sugiere impuestos
    domains_selected=["tax", "transition"],  # Router respeta + expande
    flags=[]
)
```

---

## 3.3 domains_selected (list)

**Definición:**
```python
DomainKey = Literal[
    "market",      # Análisis de mercado / real estate
    "brand",       # Diferenciación / posicionamiento
    "tax",         # Fiscalidad / estructura legal
    "transition",  # Cambios de rol/carrera
    "system",      # Operaciones / procesos
    "growth",      # Expansión / nuevas líneas
    "lab"          # Laboratorio tecnológico (Fase 2+)
]
```

**Reglas Estrictas:**

1. **Length:** `len(domains_selected) ∈ [1..3]`
   - Mínimo 1 dominio
   - Máximo 3 dominios

2. **Mode Binding:**
   - `mode="fast"` → preferencia 1 dominio (máximo 2)
   - `mode="deep"` → máximo 3 dominios

3. **Lab Never Auto:**
   - "lab" nunca puede aparecer por decisión automática del Router
   - Si se requiere "lab", debe ser autorizado explícitamente por Governor
   - Reflejado en `lab_policy.status="approved"`

4. **Order Doesn't Matter:**
   - Dominios no tienen precedencia en lista
   - Pero order puede cambiar para optimización UI

**Ejemplo:**
```python
QueryPlan(
    mode="fast",
    domains_selected=["market"],  # 1 dominio, OK
    ...
)

QueryPlan(
    mode="deep",
    domains_selected=["tax", "transition", "system"],  # 3 dominios, OK
    ...
)

QueryPlan(
    mode="fast",
    domains_selected=["market", "brand"],  # 2 en fast, OK (frontera)
    ...
)
```

---

## 3.4 agents_selected (list)

**Tipo:**
```python
agents_selected: list[str]  # IDs de agentes, ej ["lead_enricher", "market_analyst"]
```

**Reglas Phase 2:**
- Siempre vacío: `agents_selected = []`
- No se invoca ningún agente especializado

**Reglas Phase 4+:**
- Puede poblarse con agentes específicos
- Máximo 3 agentes simultáneamente
- Los agentes alimentan contexto al Governor, pero no cambian su estructura

**Ejemplo:**
```python
# Phase 2
QueryPlan(
    agents_selected=[],  # Vacío
    ...
)

# Phase 4+
QueryPlan(
    agents_selected=["market_analyst", "compliance_auditor"],  # 2 agentes
    ...
)
```

---

## 3.5 needs_evidence (boolean)

**Default:** `false` en Phase 2

**Semántica:**
- `true` → La consulta requiere evidencia desde NotebookLM
- `false` → Se puede responder sin evidencia (análisis puro)

**Casos Típicos para Evidence:**

| Caso | needs_evidence |
|---|---|
| Decisión laboral | `true` |
| Fiscalidad / normas | `true` |
| Copy de marca / reputación | Normalmente `false` |
| Análisis estratégico puro | `false` |
| Validación de datos | `true` |

**Regla:**
- En Phase 2, Governor ignora este flag
- En Phase 3+, Synthesizer lo usa para buscar evidencia en NotebookLM

---

## 3.6 needs_skills (boolean)

**Default:** `false` en Phase 2

**Semántica:**
- `true` → Requiere ejecutar skills operativas del engine
- `false` → Análisis puro, sin ejecución de skills

**Activación Phase 4+:**
- Si Governor requiere datos operativos (ej: cash flow actual)
- Synthesizer invoca skills correspondientes

---

## 3.7 lab_policy (LabPolicy)

**Estructura:**
```python
@dataclass
class LabPolicy:
    allow_lab: bool
    status: Literal["denied", "conditional", "approved"]
    rationale: str
```

**Default Phase 2:**
```python
LabPolicy(
    allow_lab=False,
    status="denied",
    rationale="Phase 1: No experimental features"
)
```

**Estados Posibles:**

| Status | Significado | allow_lab |
|---|---|---|
| `denied` | Laboratorio bloqueado | false |
| `conditional` | Disponible bajo condiciones | true (parcial) |
| `approved` | Acceso completo | true |

**Reglas:**
- Por defecto: `denied` y `allow_lab=false`
- Solo Governor puede cambiar a "approved"
- Si lab está aprobado, añadir flag `lab-access-approved`
- Si lab denegado pero usuario pidió, añadir flag `lab-access-denied`

**Ejemplo:**
```python
# Denegado por defecto
QueryPlan(
    lab_policy=LabPolicy(
        allow_lab=False,
        status="denied",
        rationale="Phase 1: Experimental access blocked"
    ),
    flags=[]  # Sin flag, porque no pidió lab explícitamente
)

# Usuario pidió lab explícitamente
QueryPlan(
    lab_policy=LabPolicy(
        allow_lab=False,
        status="denied",
        rationale="User requested lab, but not authorized in Phase 1"
    ),
    flags=["lab-access-requested", "lab-access-denied"]
)

# Governor aprueba acceso (futuro, después Phase 2)
QueryPlan(
    lab_policy=LabPolicy(
        allow_lab=True,
        status="approved",
        rationale="User validated for experimental features"
    ),
    flags=["lab-access-approved"]
)
```

---

## 3.8 rationale (string)

**Descripción:** Justificación breve del Router sobre por qué eligió esos dominios.

**Restricciones:**
- Máximo 5-10 líneas
- Lenguaje entendible para usuario final (no técnico)
- Visible en UI panel "Plan de consulta"

**Debe Incluir:**
- Por qué eligió esos dominios específicos
- Qué señales detectó
- Cómo interpretó el domain_hint

**Ejemplo:**
```
Detectada intención de cambio laboral (keywords: "excedencia", "renuncia").
Seleccionado dominio "transition" para análisis de carrera.
También incluido "market" para validar tracción inmobiliaria actual.
```

---

## 3.9 confidence (enum)

**Valores:**
- `low` → Intención difusa, falta contexto
- `medium` → Cierta ambigüedad, múltiples interpretaciones posibles
- `high` → Intención clara, dominio evidente

**Criterios de Determinación:**

| Factor | Impacto |
|---|---|
| Intención clara del usuario | +confidence |
| Mensaje ambiguo | -confidence |
| Dominio evidente | +confidence |
| Multidominio potencial | -confidence |
| Context disponible | +confidence |
| Falta de información | -confidence |

**Regla:**
- No usar confidence como decoración
- Debe representar realidad medible

---

## 3.10 flags (list)

**Flags Posibles:**

```
needs-clarification           # Mensaje ambiguo
domain-hint-overridden        # Router cambió domain_hint del usuario
lab-access-requested          # Usuario pidió lab explícitamente
lab-access-denied             # Lab bloqueado por Strategic Mode
lab-access-approved           # Lab aprobado
strategic-mode-parse-failed   # Error parseando Strategic Mode
router-ambiguity-detected     # Router no está seguro
mode-forced-deep              # Router forzó deep por complejidad
```

**Reglas:**
- No inflar flags
- Solo incluir si realmente aplica
- Deben representar condiciones reales

---

# 4. INVARIANTS (Reglas Que NO Pueden Romperse)

```
1. domains_selected NUNCA vacío (length >= 1)
2. Nunca más de 3 dominios en domains_selected
3. mode SIEMPRE presente, NUNCA null
4. confidence SIEMPRE presente
5. lab_policy SIEMPRE presente (aunque status="denied")
6. rationale SIEMPRE presente
7. agents_selected siempre una lista (puede ser vacía en Phase 2)
8. needs_evidence y needs_skills siempre presentes
9. timestamp SIEMPRE en ISO-8601
10. QueryPlan nunca parcial (todos los campos rellenos)
```

**Validación:**
```python
def validate_query_plan(plan: QueryPlan) -> bool:
    assert plan.domains_selected and len(plan.domains_selected) >= 1
    assert len(plan.domains_selected) <= 3
    assert plan.mode in ["fast", "deep"]
    assert plan.confidence in ["low", "medium", "high"]
    assert plan.lab_policy is not None
    assert plan.rationale
    assert plan.timestamp is not None
    return True
```

---

# 5. PHASE BINDING (Comportamiento por Fases)

## Phase 2

```python
QueryPlan(
    mode="fast" | "deep",
    domain_hint="auto" | DomainKey,
    domains_selected=[...],  # 1-3 dominios
    agents_selected=[],      # VACÍO
    needs_evidence=False,    # No hay NotebookLM
    needs_skills=False,      # No hay skill execution
    lab_policy=LabPolicy(
        allow_lab=False,
        status="denied",
        rationale="Phase 1: No experimental"
    ),
    rationale="...",
    confidence="low|medium|high",
    flags=[...],
    timestamp=now()
)
```

## Phase 3

```python
QueryPlan(
    # ... igual que Phase 2, pero:
    needs_evidence=True,     # Puede ser true ahora
    agents_selected=[],      # Aún vacío
    # lab_policy sigue denied por defecto
)
```

## Phase 4

```python
QueryPlan(
    # ... igual, pero:
    agents_selected=["agent1", "agent2"],  # Puede poblarse
    needs_skills=True,                      # Puede ser true
)
```

## Phase 5

```python
QueryPlan(
    # Estructura idéntica, solo Domain Packs pueden cambiar mapeos internos
)
```

---

# 6. AUDIT COMPATIBILITY

QueryPlan debe poder:

1. **Serializarse a JSON** sin pérdidas
2. **Almacenarse en audit log** como blob immutable
3. **Recuperarse posteriormente** idéntico
4. **Vincularse con** GovernorDecision correspondiente

**Formato en Audit Log:**
```json
{
  "query_plan_id": "uuid",
  "timestamp": "2026-02-12T18:14:00Z",
  "user_id": "toni-id",
  "message": "original user message",
  "query_plan": {
    "mode": "deep",
    "domain_hint": "auto",
    "domains_selected": ["market"],
    "agents_selected": [],
    "needs_evidence": false,
    "needs_skills": false,
    "lab_policy": {...},
    "rationale": "...",
    "confidence": "high",
    "flags": [],
    "timestamp": "2026-02-12T18:14:00Z"
  },
  "status": "success"
}
```

---

# 7. VERSIONING POLICY

**Si el esquema cambia:**

1. Crear `query-plan-schema-v2.md`
2. NO sobrescribir v1
3. Mantener backward compatibility si es posible
4. Documentar cambios en `CHANGELOG.md`

**Cambios que requieren v2:**
- Nuevos DomainKey
- Redefinir estructura de LabPolicy
- Cambiar invariants

**Cambios que NO requieren v2:**
- Añadir nuevo flag
- Actualizar documentación
- Cambiar internal rationale

---

# 8. RATIONALE DE DISEÑO

Este esquema:

✅ **Permite enrutado controlado** → max 3 dominios, no "todo"  
✅ **Evita multiagente descontrolado** → agents_selected limitado  
✅ **Se alinea con Strategic Mode** → lab_policy control  
✅ **Facilita UI explicable** → rationale visible en "Plan de consulta"  
✅ **Soporta crecimiento futuro** → Phase 2-5 sin romper  

---

# 9. RELACIÓN CON OTROS CONTRATOS

```
QueryPlan (Router output)
    ↓ (contrato v1)
Governor (recibe QueryPlan)
    ↓ (contrato v1)
GovernorDecision (Governor output)
    ↓ (contrato v1)
Synthesizer (recibe GovernorDecision)
    ↓ (contrato v1)
SynthesizerOutput (salida final)
```

**El QueryPlan establece el alcance.**  
**El GovernorDecision toma la decisión.**  
**El SynthesizerOutput la presenta.**

---

# 10. EJEMPLO COMPLETO

```python
# Entrada: mensaje del usuario
message = "¿Es buen momento para solicitar excedencia en CGI?"

# Output del Router
plan = QueryPlan(
    mode="deep",
    domain_hint="auto",
    domains_selected=["transition", "market"],
    agents_selected=[],
    needs_evidence=False,
    needs_skills=False,
    lab_policy=LabPolicy(
        allow_lab=False,
        status="denied",
        rationale="Phase 1: No experimental features"
    ),
    rationale="""
    Detectada intención de cambio laboral (keywords: "excedencia").
    Seleccionado "transition" para análisis de carrera.
    Incluido "market" para validar tracción inmobiliaria.
    """,
    confidence="high",
    flags=[],
    timestamp=datetime.now(timezone.utc)
)

# Este QueryPlan se pasa al Governor
# Governor genera GovernorDecision basándose en este plan
```

---

# 11. STATUS

**QueryPlan Schema v1 está formalmente definido.**

✅ Congelado hasta nueva versión  
✅ Listo para implementación Phase 1  
✅ Compatible con constitution-canonical.md  
✅ Soporta crecimiento Phase 2-5  

---

**Versión:** 1.0  
**Status:** STABLE CONTRACT  
**Fecha:** Febrero 2026  
**Próximo:** SynthesizerOutput Schema v1
