# ANCLORA INTELLIGENCE — TECHNICAL SPECIFICATION v1.0
## Arquitectura, APIs, y Integración con Anclora Nexus
### Especificación Técnica para Implementación

> **Audiencia:** Desarrolladores Python/FastAPI, arquitectos de sistemas.
> **Dependencias:** constitution-canonical.md, intelligence-constitution.md, intelligence-product-spec-v1.md
> **Stack:** Python 3.11+, FastAPI, LangGraph, PostgreSQL/Supabase, OpenAI/Anthropic APIs

---

# PARTE I — ARQUITECTURA GENERAL

## 1. Visión Arquitectónica

Anclora Intelligence vive **dentro** de Anclora Nexus como capa orquestadora estratégica superior:

```
┌────────────────────────────────────────────────┐
│ ANCLORA NEXUS (Sistema Operativo Base)         │
│                                                │
│  ┌─────────────────────────────────────────┐ │
│  │ AGENTS (Lead Intake, Prospection, Recap)│ │
│  │ STATE GRAPH (LangGraph core)            │ │
│  │ EXECUTION ENGINE (FastAPI, Supabase)    │ │
│  └─────────────────────────────────────────┘ │
│                 ↑                              │
│  ┌─────────────────────────────────────────┐ │
│  │ ANCLORA INTELLIGENCE (Orchestrator)     │ │
│  │                                         │ │
│  │ Router → Governor → Synthesizer         │ │
│  │ Strategic Mode Loader                   │ │
│  │ Domain Registry                         │ │
│  │ Control Center UI                       │ │
│  └─────────────────────────────────────────┘ │
│                                                │
└────────────────────────────────────────────────┘
```

**Decisión Arquitectónica Clave:**
- Intelligence es **orquestador Python clásico**, no nuevo LangGraph
- No crea motor de ejecución nuevo
- No duplica estado management
- Accede a Nexus core vía interfaces claras (HTTP, DB queries)
- **Extraíble por diseño**: puede copiarse a repo independiente sin modificación lógica

## 2. Componentes Core

| Componente | Responsabilidad | Ubicación | Estado Phase 1 |
|---|---|---|---|
| **Router** | Clasificar intención de consulta, seleccionar dominios (máx 3) | `backend/intelligence/router.py` | IMPLEMENTED |
| **Strategic Mode Loader** | Leer Strategic Mode versionado en Git, parsearlo, exponerlo como objeto | `backend/intelligence/strategic_mode_loader.py` | IMPLEMENTED |
| **Governor** | Aplicar Strategic Mode a QueryPlan, evaluar riesgos, generar GovernorDecision | `backend/intelligence/governor.py` | IMPLEMENTED |
| **Synthesizer** | Construir respuesta final con formato fijo (diagnóstico → recomendación → riesgos → pasos) | `backend/intelligence/synthesizer.py` | IMPLEMENTED |
| **Orchestrator** | Orquestar flujo Router → Governor → Synthesizer, manejar errors | `backend/intelligence/orchestrator.py` | IMPLEMENTED |
| **Control Center UI** | Interfaz /intelligence con chat, decision console, plan panel | `frontend/src/pages/intelligence/` | Phase 1 PARTIAL |
| **NotebookLM Bridge** | Integración con NotebookLM para evidence layer | `backend/intelligence/notebook_bridge.py` | [DIFERIDO Phase 2] |
| **Domain Registry** | Catálogo de Domain Packs, validación, activación | `backend/intelligence/domain_registry.py` | [DIFERIDO Phase 5] |

## 3. Estructura de Carpetas

```
Anclora-Nexus/
├── backend/intelligence/
│   ├── __init__.py
│   ├── types.py                         # Type hints (QueryPlan, GovernorDecision, etc.)
│   ├── orchestrator.py                  # Orquestador principal
│   ├── router.py                        # Clasificación de intención + selección dominio
│   ├── strategic_mode_loader.py         # Lectura Strategic Mode desde Git
│   ├── governor.py                      # Evaluación de riesgos + recomendación
│   ├── synthesizer.py                   # Construcción de respuesta final
│   ├── notebook_bridge.py               # [DIFERIDO Phase 2]
│   ├── domain_registry.py               # [DIFERIDO Phase 5]
│   └── utils/
│       ├── risk_evaluator.py            # Lógica de evaluación de riesgos
│       ├── strategic_mode_parser.py     # Parser YAML de Strategic Mode
│       └── constants.py                 # Constantes (límites, flags, etc.)
│
├── intelligence-engine/                 # Configuración extraíble
│   ├── governance/
│   │   └── strategic-mode-registry.md   # Strategic Mode activo (Git-versionado)
│   ├── domain-packs/
│   │   └── real-estate-mallorca-premium.yaml
│   └── config.yaml                      # Configuración Intelligence
│
├── frontend/src/pages/intelligence/
│   ├── index.tsx                        # Página /intelligence
│   ├── components/
│   │   ├── ChatConsole.tsx
│   │   ├── DecisionConsole.tsx
│   │   ├── QueryPlanPanel.tsx
│   │   └── RiskChips.tsx
│   └── hooks/
│       ├── useIntelligenceQuery.ts
│       └── useStrategicMode.ts
│
└── .agent/
    └── rules/
        └── anclora-intelligence.md      # Directrices operacionales
```

---

# PARTE II — TIPOS Y CONTRATOS DE DATOS

## 4. Type Definitions (backend/intelligence/types.py)

```python
from typing import Literal, Optional, Dict, List, Any
from dataclasses import dataclass
from enum import Enum
from datetime import datetime

# ──── ENUMS ────

class Recommendation(str, Enum):
    EXECUTE = "Ejecutar"
    DEFER = "Postergar"
    REFORMULATE = "Reformular"
    DISCARD = "Descartar"

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class QueryMode(str, Enum):
    FAST = "fast"
    DEEP = "deep"

class RiskCategory(str, Enum):
    LABOR = "labor"
    TAX = "tax"
    BRAND = "brand"
    FOCUS = "focus"

# ──── DATA CLASSES ────

@dataclass
class QueryPlan:
    """Salida del Router: plan de análisis"""
    domains_selected: List[str]
    rationale: str
    confidence: float  # 0.0-1.0
    flags: List[str]
    mode: QueryMode
    query_hint: Optional[str] = None
    timestamp: datetime = None

@dataclass
class RiskAssessment:
    """Evaluación de riesgo por categoría"""
    category: RiskCategory
    level: RiskLevel
    score: float  # 0.0-1.0 (heredado de constitution-canonical)
    rationale: str

@dataclass
class GovernorDecision:
    """Salida del Governor: decisión estructurada"""
    recommendation: Recommendation
    diagnosis: str
    risks: List[RiskAssessment]
    next_steps: List[str]  # Exactamente 3
    dont_do: List[str]
    flags: List[str]
    hitl_required: bool
    strategic_mode_version: str
    domains_used: List[str]
    timestamp: datetime = None

@dataclass
class StrategicMode:
    """Configuración estratégica versionada"""
    version: str
    phase: str
    principles: Dict[str, Any]
    priorities_ordered: List[str]
    hard_constraints: List[str]
    active_domains: List[str]
    max_domains_per_query: int = 3
    allow_lab_mode: bool = False
    effective_date: str
    loaded_from_git: bool = True

@dataclass
class DomainPack:
    """Definición de dominio especializado"""
    name: str
    description: str
    geographical_scope: Optional[List[str]]
    buyer_profile: Optional[str]
    focus_areas: List[str]
    constraints: List[str]
    version: str

@dataclass
class IntelligenceAuditEntry:
    """Registro inmutable de consulta"""
    user_id: str
    timestamp: datetime
    message: str
    router_output: QueryPlan
    governor_output: GovernorDecision
    synthesizer_output: str
    strategic_mode_version: str
    domain_packs_used: List[str]
    flags: List[str]
    ai_generated: bool = True
    status: Literal["success", "error", "escalated"] = "success"
    error_detail: Optional[str] = None
```

---

# PARTE III — COMPONENTES CORE

## 5. Router: Clasificación de Intención y Selección de Dominio

**Responsabilidad:**
- Clasificar intención de consulta (cambio laboral, expansión, decisión inmobiliaria, etc.)
- Seleccionar dominios relevantes (máx 3)
- Generar `QueryPlan` estructurado

**Interfaz:**

```python
# backend/intelligence/router.py

async def route_query(
    message: str,
    domain_hint: Optional[str] = None,
    mode: QueryMode = QueryMode.FAST,
    context: Optional[Dict[str, Any]] = None,
) -> QueryPlan:
    """
    Clasifica intención y selecciona dominios.
    
    Args:
        message: Consulta del usuario (natural language)
        domain_hint: Sugerencia de dominio (ej: "real_estate", "labor", etc.)
        mode: Fast (1-2 dominios) o Deep (máx 3)
        context: Contexto adicional (usuario, timestamp, etc.)
    
    Returns:
        QueryPlan: dominios_selected, rationale, confidence, flags, mode
    
    Raises:
        ValueError: Si message inválido
        DomainNotFoundError: Si domain_hint no existe
    """
    
    # 1. Clasificar intención con LLM (GPT-4o-mini vía LLMService)
    # 2. Extraer dominio primario + secundarios (si aplica)
    # 3. Validar contra dominios activos en Strategic Mode
    # 4. Respetar límite mode (Fast: 1-2, Deep: 3)
    # 5. Calcular confidence basado en claridad y relevancia
    # 6. Generar rationale ("Por qué se seleccionó este dominio")
    # 7. Marcar flags (overengineering-risk, lab-mode, etc.)
    # 8. Retornar QueryPlan

@dataclass
class RouterConfig:
    max_domains_fast: int = 2
    max_domains_deep: int = 3
    llm_model: str = "gpt-4o-mini"
    temperature: float = 0.3  # Determinístico
```

**Reglas:**
- Fast mode: máx 1-2 dominios (análisis rápido, ≈60 seg)
- Deep mode: máx 3 dominios (análisis exhaustivo, ≈120 seg)
- Lab mode nunca se activa automáticamente
- domain_hint es preferencia fuerte, no mandato absoluto
- Si intención es ambigua: Deep mode automático

## 6. Strategic Mode Loader: Lectura de Configuración Versionada en Git

**Responsabilidad:**
- Leer Strategic Mode versionado en Git
- Parsearlo (YAML)
- Exponerlo como objeto `StrategicMode` estructurado
- Cachear con validación

**Interfaz:**

```python
# backend/intelligence/strategic_mode_loader.py

class StrategicModeLoader:
    def __init__(self, git_repo_path: str):
        """
        Args:
            git_repo_path: Ruta del repo Anclora Nexus
        """
        self.git_repo_path = git_repo_path
        self.strategic_mode_path = "intelligence-engine/governance/strategic-mode-registry.md"
        self._cache: Optional[StrategicMode] = None
        self._cache_timestamp: Optional[datetime] = None

    async def load_active_strategic_mode(
        self,
        use_cache: bool = True,
        cache_ttl_seconds: int = 3600,
    ) -> StrategicMode:
        """
        Carga Strategic Mode activo desde Git.
        
        Args:
            use_cache: Si usar caché (por defecto sí)
            cache_ttl_seconds: TTL del caché
        
        Returns:
            StrategicMode: Objeto estructurado
        
        Raises:
            StrategicModeNotFoundError: Si archivo no existe
            StrategicModeParseError: Si YAML inválido
        """
        
        # 1. Si caché válida: retornar
        if use_cache and self._is_cache_valid(cache_ttl_seconds):
            return self._cache
        
        # 2. Leer archivo desde disco
        raw_content = self._read_from_git(self.strategic_mode_path)
        
        # 3. Parsear YAML (custom parser que valida schema)
        parsed = self._parse_strategic_mode_yaml(raw_content)
        
        # 4. Validar contra schema (version, phase, constraints, etc.)
        validated = self._validate_schema(parsed)
        
        # 5. Cachear
        self._cache = validated
        self._cache_timestamp = datetime.now()
        
        # 6. Retornar
        return validated

    def get_cached_mode(self) -> Optional[StrategicMode]:
        """Obtener Strategic Mode cacheada (sin recargar)"""
        return self._cache

    def invalidate_cache(self):
        """Invalidar caché (fuerza recarga en siguiente llamada)"""
        self._cache = None
        self._cache_timestamp = None
```

**Regla Crítica:**
- Strategic Mode **NUNCA** se modifica desde UI o endpoint
- Cambio = commit en Git con justificación en mensaje
- Loader fallaría de forma segura si no puede parsear

## 7. Governor: Aplicación de Strategic Mode y Evaluación de Riesgos

**Responsabilidad:**
- Recibir `QueryPlan` del Router
- Cargar Strategic Mode vía `StrategicModeLoader`
- Aplicar reglas del Strategic Mode
- Evaluar riesgos (labor, tax, brand, focus)
- Generar `GovernorDecision`

**Interfaz:**

```python
# backend/intelligence/governor.py

class Governor:
    def __init__(
        self,
        strategic_mode_loader: StrategicModeLoader,
        llm_service,
        db_service,
    ):
        self.strategic_mode_loader = strategic_mode_loader
        self.llm_service = llm_service
        self.db_service = db_service

    async def govern(
        self,
        query_plan: QueryPlan,
        user_message: str,
        user_context: Optional[Dict[str, Any]] = None,
    ) -> GovernorDecision:
        """
        Aplica Strategic Mode y genera recomendación.
        
        Args:
            query_plan: Salida del Router
            user_message: Mensaje original del usuario
            user_context: Contexto de usuario (historial, metadata, etc.)
        
        Returns:
            GovernorDecision: Recomendación estructurada
        """
        
        # 1. Cargar Strategic Mode
        mode = await self.strategic_mode_loader.load_active_strategic_mode()
        
        # 2. Extraer principio rector y restricciones
        principles = mode.principles  # Ej: "Consolidar base sólida hoy..."
        constraints = mode.hard_constraints  # Ej: "No activar consultoría IA..."
        
        # 3. Aplicar Strategic Mode a QueryPlan
        strategic_assessment = self._apply_strategic_mode(
            query_plan=query_plan,
            strategic_mode=mode,
            user_message=user_message,
        )
        
        # 4. Evaluar riesgos (labor, tax, brand, focus)
        risks = await self._evaluate_risks(
            message=user_message,
            domains=query_plan.domains_selected,
            user_context=user_context,
        )
        
        # 5. Generar recomendación
        recommendation = self._generate_recommendation(
            strategic_assessment=strategic_assessment,
            risks=risks,
            principles=principles,
        )
        
        # 6. Generar próximos 3 pasos (siempre exactamente 3)
        next_steps = self._generate_next_steps(
            recommendation=recommendation,
            domains=query_plan.domains_selected,
        )
        
        # 7. Generar "Qué NO hacer"
        dont_do = self._generate_contraindicators(
            recommendation=recommendation,
            risks=risks,
        )
        
        # 8. Determinar si HITL requerido
        hitl_required = self._assess_hitl_requirement(
            recommendation=recommendation,
            risks=risks,
        )
        
        # 9. Compilar flags
        flags = self._compile_flags(
            strategic_assessment=strategic_assessment,
            risks=risks,
            recommendation=recommendation,
        )
        
        # 10. Retornar GovernorDecision
        return GovernorDecision(
            recommendation=recommendation,
            diagnosis=strategic_assessment["diagnosis"],
            risks=risks,
            next_steps=next_steps,
            dont_do=dont_do,
            flags=flags,
            hitl_required=hitl_required,
            strategic_mode_version=mode.version,
            domains_used=query_plan.domains_selected,
        )

    async def _evaluate_risks(
        self,
        message: str,
        domains: List[str],
        user_context: Optional[Dict],
    ) -> List[RiskAssessment]:
        """
        Evalúa riesgos en 4 categorías.
        
        Utiliza heurísticas + LLM para:
        - Labor: Detecta palabras clave (excedencia, renuncia, contrato)
        - Tax: Detecta implicaciones fiscales (SL, consultoría, estructura)
        - Brand: Detecta impacto en diferenciación Anclora
        - Focus: Detecta dispersión de recursos
        """
        # Implementación con reglas heurísticas + LLM classification
        pass
```

## 8. Synthesizer: Construcción de Respuesta Final

**Responsabilidad:**
- Recibir `GovernorDecision`
- Construir respuesta final con formato fijo
- Asegurar claridad, accionabilidad, tono premium

**Interfaz:**

```python
# backend/intelligence/synthesizer.py

class Synthesizer:
    async def synthesize(
        self,
        governor_decision: GovernorDecision,
        user_message: str,
        mode: QueryMode = QueryMode.FAST,
    ) -> str:
        """
        Construye respuesta final en formato estructurado.
        
        Returns:
            str: Respuesta estructurada (markdown)
            
        Formato:
        ────────────────────
        ## DIAGNÓSTICO
        [Análisis de la situación]
        
        ## RECOMENDACIÓN
        **[Ejecutar | Postergar | Reformular | Descartar]**
        
        Justificación: [Lógica clara]
        
        ## RIESGOS ASOCIADOS
        - **Labor**: [nivel] — [rationale]
        - **Tax**: [nivel] — [rationale]
        - **Brand**: [nivel] — [rationale]
        - **Focus**: [nivel] — [rationale]
        
        ## PRÓXIMOS 3 PASOS
        1. [Paso 1]
        2. [Paso 2]
        3. [Paso 3]
        
        ## QUÉ NO HACER AHORA
        - [Contraindicación 1]
        - [Contraindicación 2]
        - [Contraindicación 3]
        
        ---
        [metadata: domains, confidence, flags, ai_generated=true]
        ────────────────────
        """
        
        # 1. Construir diagnóstico (texto claro, no técnico)
        diagnosis_section = self._format_diagnosis(governor_decision.diagnosis)
        
        # 2. Construir recomendación con justificación
        recommendation_section = self._format_recommendation(
            recommendation=governor_decision.recommendation,
            diagnosis=governor_decision.diagnosis,
        )
        
        # 3. Construir tabla de riesgos
        risks_section = self._format_risks(governor_decision.risks)
        
        # 4. Construir 3 pasos (validar exactamente 3)
        assert len(governor_decision.next_steps) == 3
        steps_section = self._format_steps(governor_decision.next_steps)
        
        # 5. Construir "Qué NO hacer"
        dont_section = self._format_dont_do(governor_decision.dont_do)
        
        # 6. Compilar respuesta final
        response = self._compile_response(
            diagnosis=diagnosis_section,
            recommendation=recommendation_section,
            risks=risks_section,
            steps=steps_section,
            dont_do=dont_section,
        )
        
        # 7. Agregar metadata
        metadata = self._format_metadata(governor_decision)
        
        return response + "\n\n" + metadata
```

## 9. Orchestrator: Orquestador Principal

**Responsabilidad:**
- Coordinar flujo Router → Governor → Synthesizer
- Manejar errores y escalaciones
- Registrar en audit log
- Retornar respuesta final

**Interfaz:**

```python
# backend/intelligence/orchestrator.py

class IntelligenceOrchestrator:
    def __init__(
        self,
        router: Router,
        strategic_mode_loader: StrategicModeLoader,
        governor: Governor,
        synthesizer: Synthesizer,
        db_service,
    ):
        self.router = router
        self.strategic_mode_loader = strategic_mode_loader
        self.governor = governor
        self.synthesizer = synthesizer
        self.db_service = db_service

    async def process_query(
        self,
        message: str,
        user_id: str,
        mode: QueryMode = QueryMode.FAST,
        domain_hint: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Procesa consulta end-to-end.
        
        Returns:
            {
                "response": str (respuesta final),
                "query_plan": QueryPlan,
                "governor_decision": GovernorDecision,
                "audit_id": str,
                "status": "success|error|escalated"
            }
        """
        
        audit_entry = None
        
        try:
            # 1. ROUTER
            query_plan = await self.router.route_query(
                message=message,
                mode=mode,
                domain_hint=domain_hint,
            )
            
            # 2. GOVERNOR
            governor_decision = await self.governor.govern(
                query_plan=query_plan,
                user_message=message,
                user_context={"user_id": user_id},
            )
            
            # 3. SYNTHESIZER
            response = await self.synthesizer.synthesize(
                governor_decision=governor_decision,
                user_message=message,
                mode=mode,
            )
            
            # 4. AUDIT LOG
            audit_entry = IntelligenceAuditEntry(
                user_id=user_id,
                timestamp=datetime.now(),
                message=message,
                router_output=query_plan,
                governor_output=governor_decision,
                synthesizer_output=response,
                strategic_mode_version=governor_decision.strategic_mode_version,
                domain_packs_used=query_plan.domains_selected,
                flags=governor_decision.flags,
                status="success" if not governor_decision.hitl_required else "escalated",
            )
            
            await self._write_audit_log(audit_entry)
            
            # 5. RETORNAR
            return {
                "response": response,
                "query_plan": query_plan,
                "governor_decision": governor_decision,
                "audit_id": audit_entry.id if audit_entry else None,
                "status": audit_entry.status if audit_entry else "error",
            }
            
        except Exception as e:
            # Error handling
            audit_entry = IntelligenceAuditEntry(
                user_id=user_id,
                timestamp=datetime.now(),
                message=message,
                status="error",
                error_detail=str(e),
            )
            await self._write_audit_log(audit_entry)
            raise

    async def _write_audit_log(self, entry: IntelligenceAuditEntry) -> None:
        """Escribir en audit log (Supabase, append-only)"""
        # Implementación: INSERT en intelligence_audit_log table
        pass
```

---

# PARTE IV — INTEGRACIÓN CON SUPABASE Y API

## 10. Schema de Base de Datos

```sql
-- Tabla: intelligence_audit_log (append-only)
CREATE TABLE intelligence_audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    message TEXT NOT NULL,
    
    -- Router output (JSON)
    router_output JSONB NOT NULL,  -- QueryPlan
    
    -- Governor output (JSON)
    governor_output JSONB NOT NULL,  -- GovernorDecision
    
    -- Synthesizer output
    synthesizer_output TEXT NOT NULL,
    
    -- Metadata
    strategic_mode_version VARCHAR(50),
    domain_packs_used TEXT[],
    flags TEXT[],
    ai_generated BOOLEAN DEFAULT true,
    status VARCHAR(20) CHECK (status IN ('success', 'error', 'escalated')),
    error_detail TEXT,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT immutable_log CHECK (created_at = NOW())
);

CREATE INDEX idx_intelligence_user_timestamp ON intelligence_audit_log(user_id, timestamp DESC);
CREATE INDEX idx_intelligence_status ON intelligence_audit_log(status);

-- Tabla: intelligence_strategic_mode_history (histórico versionado)
CREATE TABLE intelligence_strategic_mode_history (
    id BIGSERIAL PRIMARY KEY,
    version VARCHAR(50) UNIQUE NOT NULL,
    phase VARCHAR(50),
    content JSONB NOT NULL,  -- StrategicMode completo
    git_commit_hash VARCHAR(100),
    effective_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(255),
    reason TEXT
);

-- Tabla: intelligence_domain_packs (catálogo de dominios)
CREATE TABLE intelligence_domain_packs (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    version VARCHAR(50),
    content JSONB NOT NULL,  -- DomainPack completo
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 11. FastAPI Endpoints

```python
# backend/api/intelligence.py

from fastapi import APIRouter, Depends, HTTPException
from backend.intelligence.orchestrator import IntelligenceOrchestrator

router = APIRouter(prefix="/api/intelligence", tags=["Intelligence"])

@router.post("/query")
async def post_intelligence_query(
    message: str,
    mode: QueryMode = QueryMode.FAST,
    domain_hint: Optional[str] = None,
    current_user = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    POST /api/intelligence/query
    
    Procesa consulta a Anclora Intelligence.
    
    Body:
    {
        "message": "¿Es buen momento para solicitar excedencia?",
        "mode": "deep",
        "domain_hint": "real_estate"
    }
    
    Response:
    {
        "response": "[Respuesta estructurada]",
        "query_plan": {...},
        "governor_decision": {...},
        "audit_id": "uuid",
        "status": "success|escalated|error"
    }
    """
    
    orchestrator: IntelligenceOrchestrator = get_orchestrator()
    
    result = await orchestrator.process_query(
        message=message,
        user_id=current_user.id,
        mode=mode,
        domain_hint=domain_hint,
    )
    
    return result

@router.get("/history")
async def get_intelligence_history(
    limit: int = 10,
    current_user = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    """
    GET /api/intelligence/history?limit=10
    
    Obtiene últimas N consultas del usuario.
    """
    
    db = get_db_service()
    entries = await db.query(
        "SELECT * FROM intelligence_audit_log WHERE user_id = %s ORDER BY timestamp DESC LIMIT %s",
        (current_user.id, limit),
    )
    
    return [entry.to_dict() for entry in entries]

@router.get("/strategic-mode")
async def get_strategic_mode(
    current_user = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    GET /api/intelligence/strategic-mode
    
    Obtiene Strategic Mode activo (información, no modificación).
    """
    
    loader: StrategicModeLoader = get_strategic_mode_loader()
    mode = await loader.load_active_strategic_mode()
    
    return {
        "version": mode.version,
        "phase": mode.phase,
        "principles": mode.principles,
        "priorities": mode.priorities_ordered,
        "active_domains": mode.active_domains,
        "effective_date": mode.effective_date,
    }
```

---

# PARTE V — CONTROL CENTER UI (FRONTEND)

## 12. Componentes React

```typescript
// frontend/src/pages/intelligence/index.tsx

import React, { useState } from 'react';
import { ChatConsole } from './components/ChatConsole';
import { DecisionConsole } from './components/DecisionConsole';
import { QueryPlanPanel } from './components/QueryPlanPanel';
import { RiskChips } from './components/RiskChips';
import { useIntelligenceQuery } from './hooks/useIntelligenceQuery';
import { QueryMode, GovernorDecision } from '@/types/intelligence';

export default function IntelligencePage() {
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<QueryMode>('fast');
  const [domainHint, setDomainHint] = useState<string | null>(null);
  
  const { query, response, loading, error } = useIntelligenceQuery();

  const handleSubmit = async () => {
    if (!message.trim()) return;
    await query(message, mode, domainHint);
    setMessage('');
  };

  return (
    <div className="intelligence-control-center">
      <div className="main-layout">
        {/* LEFT: Chat Console */}
        <div className="chat-zone">
          <ChatConsole
            message={message}
            setMessage={setMessage}
            onSubmit={handleSubmit}
            loading={loading}
            response={response}
          />
        </div>

        {/* RIGHT: Decision Console + Query Plan */}
        <div className="decision-zone">
          <DecisionConsole
            mode={mode}
            setMode={setMode}
            domainHint={domainHint}
            setDomainHint={setDomainHint}
            confidence={response?.governor_decision?.confidence}
          />
          
          {response?.governor_decision && (
            <>
              <QueryPlanPanel decision={response.governor_decision} />
              <RiskChips risks={response.governor_decision.risks} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

# PARTE VI — DEPLOYMENT Y OPERATIONS

## 13. Variables de Entorno

```bash
# .env (development)
INTELLIGENCE_STRATEGIC_MODE_PATH="intelligence-engine/governance/strategic-mode-registry.md"
INTELLIGENCE_MAX_DOMAINS=3
INTELLIGENCE_MAX_RESPONSE_TIME_SECONDS=120
INTELLIGENCE_LLM_MODEL="gpt-4o-mini"
INTELLIGENCE_LLM_TEMPERATURE=0.3
INTELLIGENCE_AUDIT_LOG_TABLE="intelligence_audit_log"
```

## 14. Error Handling

```python
# backend/intelligence/exceptions.py

class IntelligenceError(Exception):
    """Base exception para Intelligence"""
    pass

class StrategicModeNotFoundError(IntelligenceError):
    """Strategic Mode no encontrado en Git"""
    pass

class StrategicModeParseError(IntelligenceError):
    """Error parseando YAML del Strategic Mode"""
    pass

class RouterError(IntelligenceError):
    """Error en clasificación de intención"""
    pass

class GovernorError(IntelligenceError):
    """Error en evaluación de riesgos"""
    pass

class SynthesizerError(IntelligenceError):
    """Error construyendo respuesta final"""
    pass

class AuditLogError(IntelligenceError):
    """Error escribiendo en audit log (no rompe endpoint)"""
    pass
```

---

# COLOFÓN

Anclora Intelligence es orquestador Python clásico que **no crea motor nuevo**, está **diseñado para ser extraíble**, y respeta la jerarquía normativa de constitution-canonical.

Versión: **1.0-spec**  
Estado: **Norma Vigente (Phase 1)**  
Última actualización: **Febrero 2026**
