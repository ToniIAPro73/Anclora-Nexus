```markdown
---
name: langgraph-core
description: "Construir el StateGraph LangGraph con 7 nodos (process_input, planner, limit_check, executor, result_handler, audit_logger, finalize), LLM service con fallback, y risk scoring adaptado para leads. Usar cuando se pida implementar agentes, LangGraph, orquestación, o backend core."
---

# LangGraph Core — Anclora Nexus v0

## Contexto
Lee spec.md Sección 9 para arquitectura base StateGraph.
Lee product-spec-v0.md Sección 3.6 para el grafo simplificado de 7 nodos.

## Instrucciones

### Paso 1: Estructura
```
backend/
├── agents/
│   ├── __init__.py
│   ├── state.py              # AgentState TypedDict (simplificado)
│   ├── graph.py               # StateGraph 7 nodos
│   └── nodes/
│       ├── __init__.py
│       ├── process_input.py
│       ├── planner.py
│       ├── limit_check.py
│       ├── executor.py
│       ├── result_handler.py
│       ├── audit_logger.py
│       └── finalize.py
├── skills/
│   ├── __init__.py
│   ├── lead_intake.py         # Skill 1
│   ├── prospection.py         # Skill 2
│   └── recap.py               # Skill 3
├── services/
│   ├── __init__.py
│   ├── llm_service.py         # OpenAI + Anthropic fallback
│   ├── supabase_service.py    # CRUD Supabase
│   ├── audit_service.py       # HMAC-SHA256 audit logging
│   └── risk_scoring.py        # Priorización de leads
├── api/
│   ├── __init__.py
│   ├── agents.py              # POST /agents/{skill_name}
│   ├── leads.py               # CRUD leads
│   ├── properties.py          # CRUD properties
│   └── tasks.py               # CRUD tasks
├── models/
│   ├── __init__.py
│   ├── lead.py                # Pydantic models
│   ├── property.py
│   └── task.py
├── requirements.txt
└── main.py                    # FastAPI app
```

### Paso 2: AgentState simplificado
```python
from typing import TypedDict

class AgentState(TypedDict):
    # Input
    input_data: dict
    skill_name: str
    org_id: str
    user_id: str

    # Planning
    plan: str
    selected_skill: str

    # Limits
    limits_ok: bool
    limit_violation: str | None

    # Execution
    skill_output: dict | None
    error: str | None

    # Audit
    audit_logged: bool
    agent_log_id: str | None

    # Result
    final_result: dict | None
    status: str  # success, error, blocked
```

### Paso 3: Implementar 7 nodos
Seguir product-spec-v0.md Sección 3.6 para el flujo.
El nodo `executor` invoca directamente la función Python del skill (sin Docker sandbox).

### Paso 4: Risk Scoring para Leads
```python
def calculate_lead_priority(lead: dict) -> tuple[float, int]:
    """
    Retorna (priority_score 0.0-1.0, priority_scale 1-5).
    Factores: budget (0.35), urgency (0.25), fit (0.25), source_quality (0.15).
    """
    budget_score = normalize_budget(lead.get('budget_range', ''), min_target=500_000)
    urgency_score = {'low': 0.2, 'medium': 0.5, 'high': 0.8, 'immediate': 1.0}.get(
        lead.get('urgency', 'medium'), 0.5
    )
    fit_score = calculate_property_fit(lead.get('property_interest', ''))
    source_score = {'referral': 1.0, 'web': 0.7, 'exp': 0.8, 'linkedin': 0.5, 'cold': 0.3}.get(
        lead.get('source', 'web'), 0.5
    )

    priority_score = round(
        0.35 * budget_score + 0.25 * urgency_score + 0.25 * fit_score + 0.15 * source_score, 2
    )

    if priority_score >= 0.8: scale = 5
    elif priority_score >= 0.6: scale = 4
    elif priority_score >= 0.4: scale = 3
    elif priority_score >= 0.2: scale = 2
    else: scale = 1

    return priority_score, scale
```

### Paso 5: LLM Service con Fallback
```python
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic

class LLMService:
    def __init__(self):
        self.primary = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)
        self.creative = ChatAnthropic(model="claude-3-5-sonnet-20241022", temperature=0.7)

    async def summarize(self, text: str) -> str:
        """Primary model para resúmenes rápidos."""
        return (await self.primary.ainvoke(text)).content

    async def generate_copy(self, context: str) -> str:
        """Creative model para copy persuasivo."""
        return (await self.creative.ainvoke(context)).content

    async def analyze(self, data: str) -> str:
        """Primary con fallback a creative."""
        try:
            return (await self.primary.ainvoke(data)).content
        except Exception:
            return (await self.creative.ainvoke(data)).content
```

### Paso 6: Tests
- `tests/test_graph.py` — StateGraph compila y ejecuta con mock skill
- `tests/test_lead_intake.py` — Skill produce output válido con datos de prueba
- `tests/test_risk_scoring.py` — 10 escenarios parametrizados

## Criterios de Aceptación
- StateGraph compila con 7 nodos y edges correctos
- Skill lead_intake procesa un lead de prueba en < 30s
- Risk scoring produce valores correctos para todos los escenarios
- limit_check bloquea cuando se excede max_daily_leads
- audit_logger escribe en audit_log y agent_logs
- LLM fallback funciona cuando primary falla
```
