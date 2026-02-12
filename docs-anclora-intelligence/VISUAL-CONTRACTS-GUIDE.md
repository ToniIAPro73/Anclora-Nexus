# 🏗️ ANCLORA INTELLIGENCE v1 — ESTRUCTURA DE CONTRATOS
## Guía Visual & Referencias Rápidas

---

# 📊 VISTA AÉREA: FLUJO DE DATOS

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USUARIO ENVÍA MENSAJE                          │
│                 "¿Es buen momento para solicitar excedencia?"            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
                ▼                                 ▼
        ┌──────────────────┐          ┌──────────────────────────┐
        │  ROUTER PROCESA  │          │  LEE STRATEGIC MODE v1   │
        │   Mensaje        │          │  - Principio            │
        └────────┬─────────┘          │  - Prioridades          │
                 │                    │  - Hard Constraints     │
                 │                    │  - Active Domains       │
        GENERA ──┼────────────────────│  - Filtering Rules      │
                 │                    └──────────────────────────┘
                 ▼
        ┌──────────────────────────────────────────┐
        │    QUERY PLAN v1 Schema                  │
        │  (CONTRACT #2)                           │
        │  - mode: "deep" | "fast"                 │
        │  - domain_hint: "auto" | DomainKey       │
        │  - domains_selected: [...1-3...]         │
        │  - agents_selected: []                   │
        │  - lab_policy: {status, rationale}       │
        │  - confidence: low|medium|high           │
        │  - flags: [...]                          │
        └────────────────┬─────────────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────────────┐
        │    GOVERNOR EVALÚA                       │
        │  (Lee QueryPlan + Strategic Mode)        │
        │                                          │
        │  1. ¿Consolida base? (PRINCIPIO)        │
        │  2. ¿Valida prioridades? (WEIGHTS)      │
        │  3. ¿Violates hard constraints? (HC)    │
        │  4. ¿Detecta overengineering?           │
        │  5. ¿Escala a HITL?                     │
        └────────────────┬─────────────────────────┘
                         │
        EMITE ───────────┼────────────────┐
                         │                │
                         ▼                ▼
        ┌──────────────────────────────────┐
        │  GOVERNOR DECISION v1 Schema     │
        │  (CONTRACT #1)                   │
        │  - diagnosis: string             │
        │  - recommendation:               │
        │    execute|postpone|             │
        │    reframe|discard               │
        │  - risks:                        │
        │    {labor, tax, brand, focus}    │
        │  - next_steps: (3 exactos)       │
        │  - dont_do: [2-5]                │
        │  - flags: [...]                  │
        │  - confidence:                   │
        │    low|medium|high               │
        └────────────────┬──────────────────┘
                         │
                         ▼
        ┌──────────────────────────────────────────────┐
        │   SYNTHESIZER INTEGRA                        │
        │  (Lee GovernorDecision + QueryPlan)          │
        │                                              │
        │  answer_text ← GovernorDecision              │
        │  meta ← GovernorDecision + QueryPlan         │
        │  plan ← QueryPlan                            │
        │  trace ← IDs + timestamps (audit trail)      │
        │  evidence ← [] (vacío Phase 1)               │
        └────────────────┬─────────────────────────────┘
                         │
        EMITE ───────────┼────────────────┐
                         │                │
                         ▼                ▼
        ┌────────────────────────────────────────────┐
        │  SYNTHESIZER OUTPUT v1 Schema              │
        │  (CONTRACT #3)                             │
        │  - answer: [5 bloques formateados]         │
        │  - meta: {recommendation, confidence,      │
        │    risk_summary, version}                  │
        │  - plan: {domains, rationale, lab_policy}  │
        │  - trace: {ids, timestamps, output_ai}     │
        │  - evidence: {status, items}               │
        └────────────────┬─────────────────────────────┘
                         │
                ┌────────┴────────┐
                │                 │
                ▼                 ▼
        ┌──────────────┐  ┌──────────────────────────┐
        │ USUARIO VE   │  │  AUDIT LOG v1 Schema     │
        │ RESPUESTA    │  │  (CONTRACT #5)           │
        │              │  │                          │
        │ [5 bloques]  │  │  - entry_id (UUID)       │
        │              │  │  - timestamp (ISO-8601)  │
        │              │  │  - QueryPlan snapshot    │
        │              │  │  - GovernorDecision snap │
        │              │  │  - SynthesizerOutput snap│
        │              │  │  - status (success|error)│
        │              │  │  - checksum (SHA-256)    │
        │              │  │  - APPEND-ONLY           │
        └──────────────┘  └──────────────────────────┘
```

---

# 📋 TABLA COMPARATIVA: LOS 5 CONTRATOS

| Aspecto | Contract #1 | Contract #2 | Contract #3 | Contract #4 | Contract #5 |
|---|---|---|---|---|---|
| **Nombre** | Governor Decision | Query Plan | Synthesizer Output | Strategic Mode | Audit Log |
| **Archivo** | `...01-gov...` | `...02-query...` | `...03-synth...` | `...04-strategic...` | `...05-audit...` |
| **Propósito** | Decisión del Governor | Plan del Router | Respuesta final | Gobernación del sistema | Trazabilidad inmutable |
| **Origen** | Governor interno | Router → entrada a Governor | Synthesizer → salida | Archivo Git (governance) | Toda operación |
| **Destino** | Synthesizer, Audit | Governor, Audit | API/UI, Audit | Governor (en startup) | Supabase PostgreSQL |
| **Modificable** | No (snapshot en audit) | No (snapshot en audit) | No (snapshot en audit) | Solo vía Git commit | NUNCA (APPEND-ONLY) |
| **Size** | 12 KB | 15 KB | 17 KB | 25 KB | 16 KB |
| **Dataclasses** | 3 | 2 | 5 | YAML | 3 |
| **Invariants** | 10 | 10 | 10 | 10 | 15 |
| **Phase 1 Ready** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Versión Actual** | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 |

---

# 🔄 CICLO DE VIDA DE UNA CONSULTA

```
STAGE 1: ENTRADA
├─ Timestamp: T0
├─ User message recibido
├─ correlation_id generado (UUID)
└─ entry_id del audit log reservado

STAGE 2: PLANNING (Router)
├─ Lee Strategic Mode v1
├─ Analiza message
├─ Genera QueryPlan v1
│  ├─ mode, domain_hint, domains_selected, etc.
│  └─ timestamp: T1
├─ Snapshot → Audit Log (pendiente)
└─ QueryPlan → Governor

STAGE 3: DECISION (Governor)
├─ Lee QueryPlan v1
├─ Lee Strategic Mode v1 (nuevamente)
├─ Evalúa bajo principio rector
├─ Genera GovernorDecision v1
│  ├─ diagnosis, recommendation, risks, next_steps, etc.
│  └─ timestamp: T2
├─ Snapshot → Audit Log (pendiente)
└─ GovernorDecision → Synthesizer

STAGE 4: SYNTHESIS (Synthesizer)
├─ Lee QueryPlan v1
├─ Lee GovernorDecision v1
├─ Genera SynthesizerOutput v1
│  ├─ answer (5 bloques)
│  ├─ meta, plan, trace, evidence
│  └─ timestamp: T3
├─ Snapshot → Audit Log (pendiente)
└─ SynthesizerOutput → API/UI

STAGE 5: AUDIT (Database)
├─ entry_id + correlation_id
├─ QueryPlan snapshot (completo)
├─ GovernorDecision snapshot (completo)
├─ SynthesizerOutput snapshot (completo)
├─ status = "success"
├─ checksum = SHA-256(entry)
├─ Almacenar en PostgreSQL (APPEND-ONLY)
└─ Timestamp final: T4 (stored_at)

STAGE 6: DELIVERY
├─ SynthesizerOutput → Usuario
├─ Answer visible
├─ Meta en sidebar (confidence, flags, risks)
├─ Plan panel visible
└─ Evidence panel (vacío Phase 1)
```

---

# 🎯 CONTRATOS vs. RESPONSABLES

| Responsable | Contrato Principal | Contrato de Entrada | Contrato de Salida |
|---|---|---|---|
| **Router** | QueryPlan v1 | message | QueryPlan |
| **Governor** | GovernorDecision v1 | QueryPlan v1 | GovernorDecision |
| **Synthesizer** | SynthesizerOutput v1 | GovernorDecision + QueryPlan | SynthesizerOutput |
| **Sistema Completo** | Strategic Mode v1 | — | — |
| **Base de Datos** | Audit Log v1 | Toda operación | Audit Log entry |

---

# 🔐 INVARIANTS CRÍTICOS POR CONTRATO

## Contract #1: GovernorDecision
```
✅ recommendation NUNCA null
✅ next_steps EXACTAMENTE 3 (no menos, no más)
✅ risks SIEMPRE tiene las 4 dimensiones
✅ dont_do NUNCA vacío (2-5 elementos)
✅ confidence SIEMPRE presente
✅ NUNCA parcial (todos los campos)
```

## Contract #2: QueryPlan
```
✅ domains_selected NUNCA vacío (1-3)
✅ mode SIEMPRE fast | deep
✅ lab_policy SIEMPRE presente
✅ confidence SIEMPRE presente
✅ rationale SIEMPRE presente
✅ NUNCA más de 3 dominios
```

## Contract #3: SynthesizerOutput
```
✅ answer SIEMPRE en formato fijo (5 bloques)
✅ meta.recommendation IDÉNTICO a GovernorDecision.recommendation
✅ meta.risk_summary REFLEJA GovernorDecision.risks
✅ plan.domains_selected IDÉNTICO a QueryPlan.domains_selected
✅ trace.output_ai SIEMPRE true
✅ NUNCA parcial (todos los campos)
```

## Contract #4: Strategic Mode
```
✅ version SIEMPRE coincide con Schema version
✅ principle NUNCA vacío
✅ priorities SIEMPRE ordenadas
✅ hard_constraints SON LEY (nunca ignoradas)
✅ NUNCA modificado en runtime (solo Git)
✅ Governor siempre lo carga en startup
```

## Contract #5: Audit Log
```
✅ entry_id NUNCA null, NUNCA duplicado
✅ timestamp NUNCA en futuro
✅ QueryPlan snapshot NUNCA null
✅ GovernorDecision snapshot NUNCA null
✅ SynthesizerOutput snapshot NUNCA null
✅ APPEND-ONLY: nunca UPDATE/DELETE
✅ DB triggers previenen violaciones
```

---

# 🚀 IMPLEMENTACIÓN POR FASES

## Phase 1: Core Implementation
```
✅ QueryPlan v1 Schema → types.py + validación
✅ GovernorDecision v1 Schema → types.py + validación
✅ SynthesizerOutput v1 Schema → types.py + validación
✅ Strategic Mode v1 → archivo Git + loader
✅ Audit Log v1 → PostgreSQL + append-only
✅ Full E2E: message → QueryPlan → Decision → Output → Audit
```

## Phase 2: Extensions (sin cambiar contratos)
```
✅ QueryPlan.needs_evidence = true (opcional Phase 2)
✅ SynthesizerOutput.evidence.status = "available" (relleno Phase 3)
✅ Nuevas domains en QueryPlan (system)
✅ Strategic Mode v1.1 (ajustes menores)
✅ Governor directives expandidos
```

## Phase 3+: Growth (versionado explícito)
```
✅ QueryPlan v1.1 si nuevos dominios
✅ Strategic Mode v1.2, v1.3, etc.
✅ SynthesizerOutput v2.0 si cambios mayores
✅ Audit Log v1 sin cambios (backward compatible)
```

---

# 📖 ORDEN DE LECTURA RECOMENDADO

### Para Arquitectos / Gobernanza
1. Strategic Mode Schema v1 (CONTRACT #4) — Entiende principio rector
2. Constitution (si no la has leído)
3. Governor Decision Schema v1 (CONTRACT #1) — Cómo se toman decisiones

### Para Desarrolladores Backend
1. Query Plan Schema v1 (CONTRACT #2) — Input al sistema
2. Governor Decision Schema v1 (CONTRACT #1) — Qué genera Governor
3. Synthesizer Output Schema v1 (CONTRACT #3) — Qué genera Synthesizer
4. Audit Log Schema v1 (CONTRACT #5) — Dónde se almacenan

### Para Desarrolladores Frontend
1. Synthesizer Output Schema v1 (CONTRACT #3) — Qué recibe UI
2. Query Plan Schema v1 (CONTRACT #2) — Para panel "Plan"
3. Strategic Mode Schema v1 (CONTRACT #4) — Para entender contexto

### Para QA / Testing
1. Audit Log Schema v1 (CONTRACT #5) — Qué verificar
2. Governor Decision Schema v1 (CONTRACT #1) — Invariants
3. Synthesizer Output Schema v1 (CONTRACT #3) — Validar respuestas
4. Query Plan Schema v1 (CONTRACT #2) — Validar planes

---

# 🔗 MAPA DE REFERENCIAS CRUZADAS

```
QueryPlan v1
    ├─ Usa DomainKey (definida en Contract #2)
    ├─ Define mode: fast|deep
    ├─ Limita: max 3 dominios (regla del Governor)
    └─ Input al Governor

GovernorDecision v1
    ├─ Usa RiskItem (estructura definida)
    ├─ Emite recommendation (4 valores)
    ├─ next_steps: exactamente 3 (ley de Dios)
    ├─ Se guarda completo en Audit Log
    └─ Input al Synthesizer

SynthesizerOutput v1
    ├─ answer: formato fijo 5 bloques
    ├─ meta: resumen de decisión
    ├─ plan: copia de QueryPlan.domains_selected
    ├─ trace: referencia a ids de QueryPlan + GovernorDecision
    ├─ evidence: vacío Phase 1, relleno Phase 3+
    └─ Se guarda completo en Audit Log

Strategic Mode v1
    ├─ Define principle: "Consolidate base today..."
    ├─ Establece priorities (pesos)
    ├─ Crea hard_constraints (prohibiciones)
    ├─ Activa dominios: market, brand, tax, transition, system
    ├─ Desactiva: growth (Phase 4+), lab (never auto)
    ├─ Governor lo carga y lo aplica a toda decisión
    └─ Se versionada exclusivamente en Git

Audit Log v1
    ├─ Almacena snapshot de QueryPlan completo
    ├─ Almacena snapshot de GovernorDecision completo
    ├─ Almacena snapshot de SynthesizerOutput completo
    ├─ Registra status, error_message, warnings
    ├─ Calcula checksum (SHA-256)
    ├─ APPEND-ONLY (triggers previenen cambios)
    └─ Permite reproducción exacta de qué pasó
```

---

# 🏁 RESUMEN EJECUTIVO (3 LÍNEAS)

1. **QueryPlan v1** define QUÉ dominio(s) se van a analizar
2. **GovernorDecision v1** define QUÉ recomendación se emite
3. **SynthesizerOutput v1** define CÓMO se presenta al usuario
4. **Strategic Mode v1** GOBIERNA cómo se toman todas las decisiones
5. **Audit Log v1** REGISTRA PERMANENTEMENTE qué ocurrió (APPEND-ONLY)

**Todo está versionado, documentado y congelado para Phase 1.**

---

**Status:** ✅ COMPLETE  
**Contratos:** 5/5 Formalizados  
**Total Size:** ~100 KB  
**Lines of Doc:** 3,600+  
**Ready for:** Phase 1 Implementation

🚀 Consolidate. Decide. Execute.
