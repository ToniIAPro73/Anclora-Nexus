# ⚡ QUICK REFERENCE CARD
## Anclora Intelligence v1 — 5 Contratos (Resumen de 1 Página)

---

# 📋 LOS 5 CONTRATOS EN 30 SEGUNDOS

| # | Nombre | Propósito | Key Fields | Status |
|---|---|---|---|---|
| **1** | **GovernorDecision v1** | Decisión del Governor | recommendation, risks, next_steps (3×), dont_do | ✅ Congelado |
| **2** | **QueryPlan v1** | Plan del Router | mode, domains_selected (1-3), lab_policy | ✅ Congelado |
| **3** | **SynthesizerOutput v1** | Respuesta final | answer (5 bloques), meta, plan, trace, evidence | ✅ Congelado |
| **4** | **Strategic Mode v1** | Gobernanza | principle, priorities, hard_constraints, active_domains | ✅ Congelado |
| **5** | **Audit Log v1** | Trazabilidad | entry_id, snapshots, checksum, APPEND-ONLY | ✅ Congelado |

---

# 🔄 FLUJO EN 10 PASOS

```
1. Usuario → message
2. Router → QueryPlan v1 (Contract #2)
3. Governor lee Strategic Mode v1 (Contract #4)
4. Governor → GovernorDecision v1 (Contract #1)
5. Synthesizer lee QueryPlan + GovernorDecision
6. Synthesizer → SynthesizerOutput v1 (Contract #3)
7. Audit Log almacena snapshots (Contract #5)
8. Usuario ← SynthesizerOutput (5 bloques)
9. DB: Entry APPEND-ONLY en PostgreSQL
10. Done ✅
```

---

# 🎯 INVARIANTS CRÍTICOS (NUNCA ROMPER)

### Contract #1: GovernorDecision
- ✅ next_steps EXACTAMENTE 3
- ✅ recommendation: execute|postpone|reframe|discard
- ✅ risks: 4 dimensiones (labor, tax, brand, focus)
- ✅ NUNCA parcial

### Contract #2: QueryPlan
- ✅ domains_selected: 1-3 (nunca 0, nunca >3)
- ✅ mode: fast|deep
- ✅ lab_policy SIEMPRE presente
- ✅ NUNCA parcial

### Contract #3: SynthesizerOutput
- ✅ answer: 5 bloques (orden fijo)
- ✅ meta.recommendation = GovernorDecision.recommendation
- ✅ plan.domains = QueryPlan.domains
- ✅ NUNCA parcial

### Contract #4: Strategic Mode
- ✅ principle: gobernanza rector
- ✅ hard_constraints: SON LEY
- ✅ NUNCA modificado en runtime
- ✅ Solo Git, con versionado

### Contract #5: Audit Log
- ✅ APPEND-ONLY (triggers lo previenen)
- ✅ Snapshots COMPLETOS (QueryPlan, GovernorDecision, SynthesizerOutput)
- ✅ checksum: SHA-256(entry)
- ✅ NUNCA UPDATE/DELETE

---

# 💾 STORAGE & VERSIONADO

```
Supabase PostgreSQL:
├─ intelligence_audit_log (APPEND-ONLY)
│  ├─ entry_id (UUID PK)
│  ├─ query_plan (JSONB snapshot)
│  ├─ governor_decision (JSONB snapshot)
│  ├─ synthesizer_output (JSONB snapshot)
│  ├─ checksum (SHA-256)
│  └─ Triggers: prevent UPDATE/DELETE ✅

Git (Strategic Mode):
├─ strategic-mode-v1-validation-phase.md
├─ strategic-mode-v1.1-xxx.md (cuando cambios)
└─ strategic-mode-v2.0-xxx.md (cuando cambios mayores)

Python dataclasses:
├─ QueryPlan
├─ GovernorDecision
├─ SynthesizerOutput
└─ AuditLogEntry (con Supabase)

TypeScript interfaces:
├─ IQueryPlan
├─ IGovernorDecision
├─ ISynthesizerOutput
└─ Para UI/components
```

---

# 🛠️ IMPLEMENTACIÓN (22-27 días)

| Día | Tarea | Owner |
|---|---|---|
| 1-3 | Crear types.py (dataclasses) | Backend |
| 4-5 | Crear validadores | Backend |
| 6-8 | Crear API endpoints (/query, /history) | Backend |
| 9-11 | Crear UI components (Control Center) | Frontend |
| 12-13 | Audit log table + triggers | DB |
| 14-15 | E2E testing | QA |
| 16-20 | Integration testing | QA |
| 21-22 | Final validation + fixes | All |
| 23+ | Phase 1 COMPLETE ✅ | — |

---

# 📥 DESCARGAS (HOY)

```
contract-01-governor-decision-schema-v1.md
contract-02-query-plan-schema-v1.md
contract-03-synthesizer-output-schema-v1.md
contract-04-strategic-mode-schema-v1.md
contract-05-audit-log-schema-v1.md
INDEX-5-CONTRATOS.md (índice completo)
VISUAL-CONTRACTS-GUIDE.md (guía visual)
```

Total: **~120 KB de especificación**

---

# 🚀 PRÓXIMOS PASOS (AHORA)

1. ✅ Descargar los 5 contratos
2. ✅ Leer en orden: 2→1→3→4→5
3. ⏭️ Crear carpeta `intelligence-engine/contracts/` en repo
4. ⏭️ Copiar archivos ahí
5. ⏭️ Comenzar Phase 1 implementation

---

# 🔐 GARANTÍAS

✅ **Contratos congelados** hasta nueva versión  
✅ **Backward compatible** (ej: evidence Phase 3)  
✅ **Constitutional compliant** (constitution-canonical.md)  
✅ **Extraíble** para futuro Founder OS  
✅ **Listo para producción** Phase 1  

---

# 📊 STATS

| Métrica | Valor |
|---|---|
| Contratos formalizados | 5 |
| Total documentación | ~120 KB |
| Dataclasses definidas | 15+ |
| Invariants documentadas | 50+ |
| Ejemplos incluidos | 20+ |
| Schema SQL definido | ✅ |
| Flujo E2E documentado | ✅ |
| Timeline estimado | 22-27 días |

---

**Status:** ✅ LISTO PARA USAR  
**Fecha:** Febrero 12, 2026  
**Version:** 1.0 STABLE

🎯 **Consolida base hoy. Decide con libertad mañana.**
