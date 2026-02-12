# Audit Log Schema v1
## Contrato Formal del Registro de Auditoría de Anclora Intelligence
### Version: 1.0 | Status: Stable | Scope: Anclora Intelligence Phase 1+

---

# 1. PURPOSE

Definir la estructura **oficial, inmutable y formal** del registro de auditoría (audit log) de Anclora Intelligence.

Este esquema:
- Es el contrato entre: **Sistema → Audit Log Storage**
- Garantiza trazabilidad completa de toda decisión
- Permite reconstrucción exacta de qué pasó y por qué
- Facilita debugging, compliance y investigación post-mortem
- Append-only, nunca modificable post-creación
- Compatible con constitution-canonical.md

---

# 2. ESTRUCTURA FORMAL

```python
@dataclass
class AuditLogEntry:
    """Un registro de auditoría inmutable de una operación."""
    
    # ─── IDENTIFICACIÓN ───
    entry_id: str                                      # UUID v4
    timestamp: str                                     # ISO-8601
    correlation_id: str                                # UUID para trazar request
    user_id: str                                       # Toni (o usuario futuro)
    
    # ─── ENTRADA (INPUT) ───
    message: str                                       # Mensaje original del usuario
    message_length: int                                # Caracteres
    
    # ─── PLAN (Router output) ───
    query_plan_id: str                                 # UUID del plan
    query_plan: QueryPlanData                          # Snapshot completo
    
    # ─── DECISIÓN (Governor output) ───
    governor_decision_id: str                          # UUID de decisión
    governor_decision: GovernorDecisionData            # Snapshot completo
    
    # ─── RESPUESTA (Synthesizer output) ───
    synthesizer_output_id: str                         # UUID de respuesta
    synthesizer_output: SynthesizerOutputData          # Snapshot completo
    
    # ─── GOVERNANCE ───
    strategic_mode_version: str                        # Ej: "1.0-validation-phase"
    domain_pack_version: str                           # Ej: "real-estate-mallorca@v0.1"
    
    # ─── ESTADO ───
    status: Literal["success", "error", "partial"]
    error_message: str | None                          # Si status != success
    warnings: list[str]                                # Warnings no-blocking
    
    # ─── AI METADATA ───
    output_ai: bool                                    # True: generado por IA
    model_used: str                                    # Ej: "claude-opus-4-5"
    confidence_overall: Literal["low", "medium", "high"]
    
    # ─── STORAGE ───
    stored_at: str                                     # ISO-8601, cuándo se guardó
    retention_policy: str                              # "permanent" o "archived_after_X"
    
    # ─── INTEGRITY ───
    checksum: str                                      # SHA-256 del contenido
    signature: str                                     # HMAC-SHA256 (si aplica)


@dataclass
class QueryPlanData:
    """Snapshot de QueryPlan guardado en audit."""
    mode: str
    domain_hint: str
    domains_selected: list[str]
    agents_selected: list[str]
    needs_evidence: bool
    needs_skills: bool
    lab_policy: dict
    rationale: str
    confidence: str
    flags: list[str]
    timestamp: str


@dataclass
class GovernorDecisionData:
    """Snapshot de GovernorDecision guardado en audit."""
    diagnosis: str
    recommendation: str
    risks: dict  # {labor, tax, brand, focus}
    next_steps: tuple[str, str, str]
    dont_do: list[str]
    flags: list[str]
    confidence: str
    strategic_mode_version: str
    domains_used: list[str]
    timestamp: str


@dataclass
class SynthesizerOutputData:
    """Snapshot de SynthesizerOutput guardado en audit."""
    answer: str
    meta: dict
    plan: dict
    trace: dict
    evidence: dict
    timestamp: str
```

---

# 3. FIELD DEFINITIONS

## 3.1 IDENTIFICACIÓN

### entry_id
- Valor: UUID v4 único
- Uso: Identificar un entry específico en el log
- Generado: Por sistema en moment de creación
- Nunca cambia: Inmutable

### timestamp
- Valor: ISO-8601 UTC (ej: "2026-02-12T18:14:30.123456Z")
- Uso: Cuándo ocurrió el evento
- Precisión: Mínimo millisegundos
- Ordenador: El audit log está ordenado por timestamp

### correlation_id
- Valor: UUID v4
- Uso: Agrupar todos los logs de un request single
- Razón: Un usuario message → Router → Governor → Synthesizer
  Todos esos pasos comparten el mismo correlation_id
- Debugging: Fácil reconstruir qué pasó para un request

### user_id
- Valor: Identificador único del usuario
- En Phase 1: "toni-user-id" (o similar)
- En Phase 2+: Multi-user support
- Uso: Auditoría de quién hizo qué

---

## 3.2 ENTRADA (INPUT)

### message
- Valor: Mensaje exacto del usuario
- Restricción: No modificado
- Privacidad: Puede contener info sensible (acceso restringido)
- Audit: Necesario para reconstrucción

### message_length
- Valor: len(message) en caracteres
- Uso: Detectar patrones (muy cortos vs. muy largos)
- Optimización: Filtrado rápido en búsquedas

---

## 3.3 PLAN (Router output)

### query_plan_id
- Valor: UUID del QueryPlan
- Relación: Identifica qué plan se generó
- Uso: Ligar message → plan en audit

### query_plan
- Valor: **Snapshot completo** de QueryPlan v1
- No referencia: NUNCA "ver table plan_id=X"
- Razón: Audit debe ser autosuficiente
- Formato: Serialización JSON completa

---

## 3.4 DECISIÓN (Governor output)

### governor_decision_id
- Valor: UUID de la decisión
- Relación: Identifica qué decisión se tomó

### governor_decision
- Valor: **Snapshot completo** de GovernorDecision v1
- Invariante: Debe ser idéntico al snapshot guardado en momento de generación
- Auditoría: Verificar que decision no fue modificada post-creación

---

## 3.5 RESPUESTA (Synthesizer output)

### synthesizer_output_id
- Valor: UUID de la respuesta
- Relación: Identifica qué respuesta se generó

### synthesizer_output
- Valor: **Snapshot completo** de SynthesizerOutput v1
- Invariante: La answer completa, meta, plan, trace, evidence
- Usuario: Lo que el usuario realmente vio

---

## 3.6 GOVERNANCE

### strategic_mode_version
- Valor: Ej: "1.0-validation-phase"
- Uso: Qué Strategic Mode gobernó esta decisión
- Reproducibilidad: Cambiar Strategic Mode → cambiar decisiones
- Auditoría: "¿Por qué esa recomendación?" → "Por Strategic Mode X"

### domain_pack_version
- Valor: Ej: "real-estate-mallorca@v0.1"
- Uso: Qué domain pack se usó
- Phase 2+: Relevante cuando hay múltiples domain packs

---

## 3.7 ESTADO

### status
- Valores:
  - `success` → Query procesada sin errores
  - `error` → Query falló (error_message populated)
  - `partial` → Query procesada pero con warnings

### error_message
- Valor: Mensaje de error si status="error"
- Ej: "Governor: strategic_mode_file not found"
- Debugging: Replicar el error exactamente

### warnings
- Valor: Lista de warnings no-blocking
- Ej: ["audit-write-failed", "confidence-low-due-to-ambiguity"]
- Observabilidad: Alertas tempranas sin fallar la consulta

---

## 3.8 AI METADATA

### output_ai
- Valor: boolean (true si generado por IA, false si fallido)
- Invariante: Debe ser true en success
- Compliance: Marca claramente que es output de IA

### model_used
- Valor: Nombre exacto del modelo
- Ej: "claude-opus-4-5-20251101"
- Reproducibilidad: Qué modelo generó esta respuesta

### confidence_overall
- Valor: Agregación de confidencias (QueryPlan + GovernorDecision)
- Cálculo: max(QueryPlan.confidence, GovernorDecision.confidence)
- Uso: Detectar baja confianza sistémica

---

## 3.9 STORAGE

### stored_at
- Valor: ISO-8601 timestamp
- Uso: Cuándo se guardó en base de datos
- Distinto de: timestamp (cuándo ocurrió)
- Razón: Puede haber delay en escritura

### retention_policy
- Valor: "permanent" | "archived_after_24_months" | similar
- Uso: Política de retención GDPR-compliant
- Governance: constitution-canonical.md define policies

---

## 3.10 INTEGRITY

### checksum
- Valor: SHA-256 del entry completo
- Uso: Detectar si entry fue modificada post-almacenamiento
- Cálculo: SHA256(entry serializado)
- Verificación: Recalcular en lectura

### signature
- Valor: HMAC-SHA256 usando shared secret
- Uso: Verificar que entry proviene del sistema
- Opcional: Puede usarse en Phase 2+ para compliance

---

# 4. INVARIANTS (Reglas Que NO Pueden Romperse)

```
1. entry_id NUNCA null, NUNCA duplicado, NUNCA modificado
2. timestamp NUNCA null, NUNCA en futuro
3. correlation_id NUNCA null, agrupa un request completo
4. user_id NUNCA null
5. message NUNCA null, NUNCA modificado post-creación
6. query_plan NUNCA null, NUNCA modificado post-creación
7. governor_decision NUNCA null, NUNCA modificado post-creación
8. synthesizer_output NUNCA null, NUNCA modificado post-creación
9. status NUNCA null, siempre uno de [success, error, partial]
10. output_ai NUNCA null
11. Audit log APPEND-ONLY: nunca DELETE ni UPDATE
12. Si status=success → output_ai DEBE ser true
13. Si status=error → error_message DEBE estar poblado
14. checksum NUNCA null, SIEMPRE verificable
15. Toda decisión registrada, sin excepciones
```

**Validación:**
```python
def validate_audit_entry(entry: AuditLogEntry) -> bool:
    assert entry.entry_id and len(entry.entry_id) == 36  # UUID
    assert entry.timestamp  # ISO-8601
    assert entry.correlation_id
    assert entry.user_id
    assert entry.message
    assert entry.query_plan is not None
    assert entry.governor_decision is not None
    assert entry.synthesizer_output is not None
    assert entry.status in ["success", "error", "partial"]
    if entry.status == "success":
        assert entry.output_ai == True
    if entry.status == "error":
        assert entry.error_message
    assert entry.checksum
    return True
```

---

# 5. APPEND-ONLY GUARANTEE

```
╔══════════════════════════════════════════════════════════════╗
║                    AUDIT LOG IS IMMUTABLE                    ║
╚══════════════════════════════════════════════════════════════╝

PERMITIDO:
✅ INSERT (append new entry)
✅ SELECT (read for audit/debugging)
✅ VERIFY (checksum validation)

PROHIBIDO:
❌ UPDATE (modificar entry existente)
❌ DELETE (borrar entry)
❌ TRUNCATE (truncar tabla)

VIOLACIÓN:
Si alguien intenta UPDATE/DELETE:
1. Operación rechazada a nivel DB (TRIGGER)
2. Alert emitido
3. Incident escalado a Toni
4. Constitution violation logged
```

---

# 6. SCHEMA SUPABASE (PostgreSQL)

```sql
CREATE TABLE intelligence_audit_log (
    -- Identificación
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL,
    correlation_id UUID NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    
    -- Input
    message TEXT NOT NULL,
    message_length INT NOT NULL,
    
    -- Plan (JSONB para flexibilidad)
    query_plan_id UUID NOT NULL,
    query_plan JSONB NOT NULL,
    
    -- Decision
    governor_decision_id UUID NOT NULL,
    governor_decision JSONB NOT NULL,
    
    -- Output
    synthesizer_output_id UUID NOT NULL,
    synthesizer_output JSONB NOT NULL,
    
    -- Governance
    strategic_mode_version VARCHAR(50) NOT NULL,
    domain_pack_version VARCHAR(50),
    
    -- State
    status VARCHAR(20) NOT NULL DEFAULT 'success',
    error_message TEXT,
    warnings TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- AI Metadata
    output_ai BOOLEAN NOT NULL DEFAULT true,
    model_used VARCHAR(255),
    confidence_overall VARCHAR(20),
    
    -- Storage
    stored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    retention_policy VARCHAR(100) DEFAULT 'permanent',
    
    -- Integrity
    checksum VARCHAR(64) NOT NULL,
    signature VARCHAR(255),
    
    -- Indexing
    UNIQUE(entry_id),
    INDEX idx_timestamp (timestamp DESC),
    INDEX idx_correlation_id (correlation_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- PROTEGER CONTRA MODIFICATIONS
CREATE TRIGGER audit_log_immutable
BEFORE UPDATE ON intelligence_audit_log
FOR EACH ROW
EXECUTE FUNCTION raise_immutable_error();

CREATE FUNCTION raise_immutable_error() RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit log is immutable: UPDATE not allowed';
END;
$$ LANGUAGE plpgsql;

-- PROTEGER CONTRA DELETES
CREATE TRIGGER audit_log_no_delete
BEFORE DELETE ON intelligence_audit_log
FOR EACH ROW
EXECUTE FUNCTION raise_immutable_error();
```

---

# 7. EJEMPLO DE ENTRADA COMPLETA

```json
{
  "entry_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "timestamp": "2026-02-12T18:14:30.123456Z",
  "correlation_id": "req-uuid-xyz123",
  "user_id": "toni-user-id",
  
  "message": "¿Es buen momento para solicitar excedencia en CGI?",
  "message_length": 58,
  
  "query_plan_id": "qp-uuid-001",
  "query_plan": {
    "mode": "deep",
    "domain_hint": "auto",
    "domains_selected": ["transition", "market"],
    "agents_selected": [],
    "needs_evidence": false,
    "needs_skills": false,
    "lab_policy": {
      "allow_lab": false,
      "status": "denied",
      "rationale": "Phase 1: No experimental"
    },
    "rationale": "Detectada intención de cambio...",
    "confidence": "high",
    "flags": [],
    "timestamp": "2026-02-12T18:14:29Z"
  },
  
  "governor_decision_id": "gd-uuid-001",
  "governor_decision": {
    "diagnosis": "Solicitar excedencia...",
    "recommendation": "postpone",
    "risks": {
      "labor": {"level": "high", "rationale": "..."},
      "tax": {"level": "medium", "rationale": "..."},
      "brand": {"level": "low", "rationale": "..."},
      "focus": {"level": "medium", "rationale": "..."}
    },
    "next_steps": ["Paso 1", "Paso 2", "Paso 3"],
    "dont_do": ["No comunicar", "No asumir"],
    "flags": ["labor-risk=HIGH"],
    "confidence": "high",
    "strategic_mode_version": "1.0-validation-phase",
    "domains_used": ["transition", "market"],
    "timestamp": "2026-02-12T18:14:29Z"
  },
  
  "synthesizer_output_id": "so-uuid-001",
  "synthesizer_output": {
    "answer": "[5 bloques formateados]",
    "meta": {...},
    "plan": {...},
    "trace": {...},
    "evidence": {...},
    "timestamp": "2026-02-12T18:14:30Z"
  },
  
  "strategic_mode_version": "1.0-validation-phase",
  "domain_pack_version": "real-estate-mallorca@v0.1",
  
  "status": "success",
  "error_message": null,
  "warnings": [],
  
  "output_ai": true,
  "model_used": "claude-opus-4-5-20251101",
  "confidence_overall": "high",
  
  "stored_at": "2026-02-12T18:14:31Z",
  "retention_policy": "permanent",
  
  "checksum": "sha256(entry-serialized)",
  "signature": null
}
```

---

# 8. AUDITORÍA Y COMPLIANCE

### Qué se puede hacer con el audit log:

✅ **Reproducción exacta:** Dado un entry_id, reconstruir qué pasó  
✅ **Debugging:** Dado correlation_id, ver todas las etapas  
✅ **Cumplimiento GDPR:** Acceso user_id → auditar qué decisiones tomó  
✅ **Mejora continua:** Analizar trends (confianza, dominios, recomendaciones)  
✅ **Compliance:** Verificar que decisions siguen Strategic Mode  

### Qué NO se puede hacer:

❌ Modificar entry existente (DB trigger lo previene)  
❌ Borrar entry (DB trigger lo previene)  
❌ Ejecutar decisión sin registrar en audit  
❌ Guardar "snapshot corrupto" (checksum validation)  

---

# 9. VERSIONING POLICY

**El Audit Log Schema v1 es para toda Phase 1-2.**

Si hay cambios estructurales (nuevos campos, cambios de tipos):
1. Crear `audit-log-schema-v2.md`
2. Migración de datos: schema upgrade script
3. Code cambios: audit_service.py usa nueva estructura
4. No hay backward compatibility: nueva tabla o nueva columna con NULL

---

# 10. STATUS

**Audit Log Schema v1 está formalmente definido.**

✅ Append-only garantizado  
✅ Immutable asegurado por triggers  
✅ Trazabilidad total  
✅ Compliance-ready  
✅ Listo para Phase 1 implementation  

---

**Versión:** 1.0  
**Status:** STABLE CONTRACT  
**Fecha:** Febrero 2026  
**Final:** Los 5 Contratos completados
