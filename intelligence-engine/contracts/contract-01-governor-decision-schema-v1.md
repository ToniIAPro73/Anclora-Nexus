# Governor Decision Schema v1
## Contrato Formal de Salida del Governor
### Version: 1.0 | Status: Stable | Scope: Anclora Intelligence Phase 1+

---

# 1. PURPOSE

Definir la estructura **oficial, inmutable y formal** de la decisión estratégica generada por el Governor.

Este esquema:
- No puede alterarse dinámicamente en runtime
- Solo cambia mediante versionado explícito en Git
- Es el contrato entre: **Governor → Synthesizer → API → UI → Audit**
- Base para futuras fases (NotebookLM, GEMs, scoring avanzado)
- Extraíble si Intelligence se convierte en producto independiente

---

# 2. ESTRUCTURA FORMAL

```python
@dataclass
class GovernorDecision:
    """Salida oficial del Governor: decisión estratégica estructurada."""
    
    # Análisis de situación
    diagnosis: str                                      # (5-8 líneas max)
    
    # Recomendación categórica
    recommendation: Literal["execute", "postpone", 
                           "reframe", "discard"]
    
    # Evaluación de riesgos (4 dimensiones)
    risks: RiskProfile
    
    # Próximos pasos (EXACTAMENTE 3)
    next_steps: tuple[str, str, str]                  # (no array, tuple fija)
    
    # Contraindicaciones
    dont_do: list[str]                                 # (2-5 elementos)
    
    # Flags operacionales
    flags: list[str]
    
    # Confianza en la recomendación
    confidence: Literal["low", "medium", "high"]
    
    # Metadata de gobernanza
    strategic_mode_version: str                        # (ej: "1.0-validation-phase")
    domains_used: list[str]                            # (copiar de QueryPlan)
    timestamp: datetime                                # (ISO-8601)


@dataclass
class RiskProfile:
    """Evaluación de riesgos en 4 dimensiones."""
    
    labor: RiskItem
    tax: RiskItem
    brand: RiskItem
    focus: RiskItem


@dataclass
class RiskItem:
    """Un riesgo específico con nivel y justificación."""
    
    level: Literal["low", "medium", "high"]
    rationale: str                                     # (1-2 líneas, conciso)
```

---

# 3. FIELD DEFINITIONS

## 3.1 diagnosis (string)

**Descripción:** Análisis breve de la situación real.

**Restricciones:**
- Máximo 5-8 líneas
- Lenguaje claro, sin tecnicismos
- Debe incluir:
  - Qué está pasando realmente
  - Qué dimensión estratégica domina
  - Qué tensión detecta el Governor

**Ejemplo:**
```
Solicitar excedencia en CGI requiere validación previa de caja alternativa.
Actualmente: 0 cierres inmobiliarios, ingresos pasivos €0, cash runway: indefinido.
La decision es irreversible; requiere consolidación de base financiera antes de cambio laboral.
```

---

## 3.2 recommendation (enum)

**Valores permitidos:**
- `execute` → Acción alineada con Strategic Mode, consolida base
- `postpone` → No es el momento, esperar validación
- `reframe` → Reformular enfoque para alinear mejor
- `discard` → No alineado estratégicamente, rechazar

**Regla de Oro:**
- Nunca añadir nuevos valores sin versionado del schema
- Siempre presente, nunca null

**Mapeo a Acciones:**
| Recomendación | Acción del Usuario |
|---|---|
| execute | Proceder con confianza |
| postpone | Esperar, validar hitos, reintentar |
| reframe | Rediseñar enfoque, resubmitir consulta |
| discard | Abandonar, buscar alternativa |

---

## 3.3 risks (RiskProfile)

**Estructura:**
```python
RiskProfile {
    labor: RiskItem,      # Impacto en relación laboral (CGI)
    tax: RiskItem,        # Impacto fiscal/legal
    brand: RiskItem,      # Impacto en diferenciación Anclora
    focus: RiskItem       # Impacto en dispersión de recursos
}
```

**Reglas:**
1. Alinearse con modelo conceptual de `constitution-canonical.md`
2. No crear sistema paralelo de scoring
3. Cada nivel debe justificarse brevemente
4. Nunca omitir una dimensión

**RiskItem Detalle:**
```python
RiskItem {
    level: "low" | "medium" | "high",
    rationale: str  # 1-2 líneas max
}
```

**Criterios por Dimensión:**

| Dimensión | LOW | MEDIUM | HIGH |
|---|---|---|---|
| **labor** | No impacta relación | Impacta parcialmente | Cambio irreversible sin validación |
| **tax** | No toca estructura | Implicaciones menores | Nueva estructura / plusvalía |
| **brand** | Sin impacto público | Visible parcialmente | Expansión de marca prematura |
| **focus** | Dentro del scope | Cierta dispersión | Multiplicación sin validación |

**Ejemplo:**
```python
RiskProfile(
    labor=RiskItem(
        level="high",
        rationale="Excedencia es cambio irreversible sin cash flow validado"
    ),
    tax=RiskItem(
        level="medium",
        rationale="Implicaciones en SS, impuestos, paro involuntario"
    ),
    brand=RiskItem(
        level="low",
        rationale="No afecta posicionamiento Anclora"
    ),
    focus=RiskItem(
        level="medium",
        rationale="Cambio de contexto reduce productividad inicial"
    )
)
```

---

## 3.4 next_steps (tuple de 3 strings)

**Regla Estricta:**
- Exactamente 3 elementos
- No 1, no 2, no 4
- Tipo: `tuple[str, str, str]` (no lista)

**Cada paso debe ser:**
- Accionable en ≤14 días
- Específico (no teórico)
- Verificable (tiene un resultado binario)
- Reversible o pausable

**Estructura Recomendada:**

1. **Paso 1:** Acción concreta
2. **Paso 2:** Señal de validación (¿cómo sé que Paso 1 funcionó?)
3. **Paso 3:** Punto de revisión (¿qué pasa después si Paso 2 se valida?)

**Ejemplo:**
```python
next_steps = (
    "Validar 3 cierres inmobiliarios con comisión neta comprobada (≥€5k each)",
    "Proyectar cash flow para 6 meses sin salario CGI (incluir retenciones, SS)",
    "Revisar con asesor fiscal implicaciones: excedencia vs. renuncia vs. part-time"
)
```

---

## 3.5 dont_do (list de strings)

**Reglas:**
- Mínimo 2 elementos
- Máximo 5 elementos
- Advertencias claras y explícitas
- Debe incluir riesgos de sobreingeniería si aplica

**Propósito:**
- Prevenir acciones por asunción
- Marcar contraindicaciones explícitamente
- Reducir costo de oportunidad

**Ejemplo:**
```python
dont_do = [
    "No comunicar a CGI hasta tener validación completa",
    "No solicitar excedencia sin colchón de 6-12 meses",
    "No asumir que excedencia es renuncia automática",
    "No reducir dedicación a CGI prematuramente"
]
```

---

## 3.6 flags (list de strings)

**Flags Posibles (No Exhaustivo):**

```
overengineering-risk
labor-risk
tax-risk
brand-risk
focus-risk
needs-clarification
audit-write-failed
strategic-mode-parse-failed
lab-access-denied
strategic-misalignment-detected
```

**Reglas:**
- Solo incluir flags si **realmente aplican**
- No inflar flags innecesariamente
- Flag es bandera, no razón
- La razón está en el correspondiente RiskItem

**Ejemplo:**
```python
flags = ["labor-risk=HIGH", "overengineering-risk=MEDIUM", "hitl_required=true"]
```

---

## 3.7 confidence (enum)

**Valores:**
- `low` → Intención difusa, falta contexto
- `medium` → Cierta ambigüedad, interpretación posible
- `high` → Intención clara, dominio evidente

**Criterios de Determinación:**
1. Claridad de intención detectada por Router
2. Nivel de ambigüedad del mensaje original
3. Disponibilidad de contexto
4. Estabilidad del Strategic Mode activo

**Regla:**
- Nunca usar confidence como decoración
- Debe tener sentido real, verificable

---

# 4. INVARIANTS (Reglas Que NO Pueden Romperse)

```
1. recommendation SIEMPRE presente, NUNCA null
2. next_steps SIEMPRE exactamente 3 elementos
3. risks SIEMPRE incluye las 4 dimensiones (labor, tax, brand, focus)
4. Nunca devolver objeto parcial (todos los campos rellenos)
5. Nunca omitir dont_do
6. flags solo si hay riesgo detectado (no decoración)
7. confidence SIEMPRE presente
8. timestamp SIEMPRE en ISO-8601
9. strategic_mode_version debe coincidir con archivo activo
10. domains_used debe ser copia exacta de QueryPlan.domains_selected
```

**Validación en Código:**
```python
def validate_governor_decision(decision: GovernorDecision) -> bool:
    assert decision.recommendation in ["execute", "postpone", "reframe", "discard"]
    assert len(decision.next_steps) == 3
    assert decision.risks is not None
    assert decision.risks.labor is not None
    assert decision.risks.tax is not None
    assert decision.risks.brand is not None
    assert decision.risks.focus is not None
    assert decision.dont_do and len(decision.dont_do) >= 2
    assert decision.confidence in ["low", "medium", "high"]
    return True
```

---

# 5. STRATEGIC MODE BINDING

El GovernorDecision **siempre debe:**

1. Aplicar el Strategic Mode activo
2. Evaluar decisión bajo principio rector: "Consolidar base sólida hoy"
3. Priorizar consolidación de base
4. Penalizar expansión prematura
5. Detectar overengineering automáticamente

**Si una recomendación contradice Strategic Mode:**
- Incluir flag: `strategic-misalignment-detected`
- Justificar en `diagnosis` por qué hay conflicto
- Permitir que usuario revise conscientemente

**Ejemplo de Conflicto:**
```
Strategic Mode v1: "No activar consultoría IA públicamente"
Usuario pregunta: "¿Lanzo Anclora Cognitive Solutions?"

→ Governor.recommendation = "postpone"
→ Governor.flags incluye "strategic-misalignment-detected"
→ Governor.diagnosis explica el conflicto
```

---

# 6. AUDIT COMPATIBILITY

El objeto **completo** GovernorDecision debe poder:

1. **Serializarse a JSON** sin pérdidas
2. **Almacenarse en audit log** como blob immutable
3. **Recuperarse posteriormente** idéntico
4. **Marcarse como** `output_ai=true`
5. **Vincularse con** QueryPlan correspondiente (correlation ID)

**Formato en Audit Log:**
```json
{
  "id": "uuid",
  "timestamp": "2026-02-12T18:14:00Z",
  "user_id": "toni-id",
  "query_plan_id": "qp-uuid",
  "governor_decision": {
    "diagnosis": "...",
    "recommendation": "postpone",
    "risks": {...},
    "next_steps": [...],
    "dont_do": [...],
    "flags": [...],
    "confidence": "high",
    "strategic_mode_version": "1.0-validation-phase",
    "domains_used": ["real_estate_mallorca_premium"],
    "timestamp": "2026-02-12T18:14:00Z"
  },
  "output_ai": true,
  "status": "success"
}
```

---

# 7. VERSIONING POLICY

**Si el esquema cambia:**

1. Incrementar versión (v1.0 → v1.1 → v2.0)
2. Crear nuevo archivo: `governor-decision-schema-v2.md`
3. NO sobrescribir v1
4. Mantener backward compatibility si es posible
5. Documentar cambios en `CHANGELOG.md`

**Cambios que requieren v2:**
- Añadir campos obligatorios
- Eliminar campos existentes
- Cambiar tipo de campo
- Redefinir enum values

**Cambios que NO requieren v2:**
- Hacer campo opcional (si antes era obligatorio)
- Añadir flag nueva
- Actualizar documentación
- Cambiar internal rationale

---

# 8. RATIONALE DE DISEÑO

Este esquema existe para:

✅ **Evitar respuestas difusas** → diagnosis + recommendation explícitos  
✅ **Forzar disciplina estratégica** → Strategic Mode binding  
✅ **Reducir sobreingeniería** → overengineering-risk flag  
✅ **Mantener trazabilidad** → audit log + timestamp + trace  
✅ **Facilitar extracción** → como producto independiente  
✅ **Soportar futuras fases** → sin romper contrato actual  

---

# 9. RELACIÓN CON FUTURAS FASES

### Phase 2
- GovernorDecision v1.0 sin cambios
- QueryPlan comenzará a incluir `needs_evidence`
- Governor evaluará si requiere evidencia

### Phase 3
- EvidenceItems podrán añadirse a Synthesizer output
- **Pero NO modifican GovernorDecision**
- Governor sigue siendo intérprete, no ejecutor
- Evidencia es soporte, no cambio de recomendación

### Phase 4
- Agentes verticales podrán alimentar Governor
- **Pero NO cambian estructura de GovernorDecision**
- Agents son ejecutores, Governor sigue siendo orquestador

### Phase 5
- Domain Packs múltiples pueden cambiar evaluación
- **Pero esquema se mantiene idéntico**
- Versionado de Domain Packs, no de GovernorDecision

---

# 10. EJEMPLO COMPLETO

```python
# Input: QueryPlan + Strategic Mode v1
# Output: GovernorDecision

decision = GovernorDecision(
    diagnosis="""
    Solicitar excedencia en CGI requiere validación previa de caja alternativa.
    Actualmente: 0 cierres inmobiliarios, ingresos pasivos €0.
    La decisión es irreversible; requiere consolidación de base.
    """,
    
    recommendation="postpone",
    
    risks=RiskProfile(
        labor=RiskItem(
            level="high",
            rationale="Cambio irreversible sin cash flow validado"
        ),
        tax=RiskItem(
            level="medium",
            rationale="Implicaciones SS, impuestos, paro involuntario"
        ),
        brand=RiskItem(
            level="low",
            rationale="No afecta posicionamiento"
        ),
        focus=RiskItem(
            level="medium",
            rationale="Cambio de contexto reduce productividad inicial"
        )
    ),
    
    next_steps=(
        "Validar 3 cierres inmobiliarios (≥€5k each comisión neta)",
        "Proyectar cash flow 6 meses sin salario CGI",
        "Revisar con asesor fiscal: excedencia vs. renuncia"
    ),
    
    dont_do=[
        "No comunicar a CGI hasta validación completa",
        "No solicitar excedencia sin colchón 6-12 meses",
        "No asumir excedencia = renuncia automática",
        "No reducir dedicación CGI prematuramente"
    ],
    
    flags=[
        "labor-risk=HIGH",
        "hitl_required=true"
    ],
    
    confidence="high",
    
    strategic_mode_version="1.0-validation-phase",
    domains_used=["real_estate_mallorca_premium"],
    timestamp=datetime.now(timezone.utc)
)
```

---

# 11. STATUS

**GovernorDecision Schema v1 está formalmente definido.**

✅ Congelado hasta nueva versión  
✅ Listo para implementación Phase 1  
✅ Compatible con constitution-canonical.md  
✅ Extraíble para futuros productos  

---

**Versión:** 1.0  
**Status:** STABLE CONTRACT  
**Fecha:** Febrero 2026  
**Próximo:** QueryPlan Schema v1
