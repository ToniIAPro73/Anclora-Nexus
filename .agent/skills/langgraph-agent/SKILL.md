```markdown
---
name: langgraph-agent
description: "Construir el core del agente LangGraph con StateGraph, nodos, edges condicionales, HITL con interrupt(), y checkpointing. Usar cuando se pida implementar el agente, orquestacion, LangGraph, HITL, o nodos del grafo."
---

# LangGraph Agent Core Skill

## Contexto
Lee spec.md Seccion 9 (Orquestacion Agentica) y Seccion 10 (Protocolo HITL) completas.
Lee constitution.md Titulo IV (Protocolo HITL) y Titulo V (Risk Scoring).

## Instrucciones

### Paso 1: Estructura
```
backend/
+-- agents/
|   +-- __init__.py
|   +-- state.py          # AgentState TypedDict (spec.md 9.1)
|   +-- graph.py           # StateGraph definition (spec.md 9.2)
|   +-- nodes/
|   |   +-- __init__.py
|   |   +-- process_input.py
|   |   +-- planner.py
|   |   +-- constitutional_check.py
|   |   +-- tool_selector.py
|   |   +-- transaction_detector.py
|   |   +-- human_approval.py    # interrupt() + Command
|   |   +-- executor.py
|   |   +-- payment_processor.py
|   |   +-- result_evaluator.py
|   |   +-- finalize.py
|   |   +-- emergency_stop.py
|   +-- routing.py         # Funciones de routing condicional
+-- services/
|   +-- llm_service.py     # Multi-provider fallback chain
|   +-- audit_service.py   # HMAC-SHA256 logging
|   +-- risk_scoring.py    # Constitution Titulo V formula
```

### Paso 2: Implementar nodos
Seguir EXACTAMENTE el State Schema de spec.md 9.1 (AgentState con 25 campos).
Implementar los 11 nodos de spec.md 9.2 con sus edges condicionales.
El nodo human_approval DEBE usar interrupt() y retornar Command con goto condicional.

### Paso 3: Risk Scoring
Implementar la formula de Constitution Art. 5.2:
`risk_score = (0.35 * S_amount) + (0.25 * S_recipient) + (0.20 * S_frequency) + (0.20 * S_context)`

### Paso 4: Checkpointing
```python
from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
checkpointer = AsyncPostgresSaver.from_conn_string(SUPABASE_DB_URL)
app = graph.compile(checkpointer=checkpointer, interrupt_before=["human_approval"])
```

### Paso 5: Tests
- Unit test por cada nodo
- Integration test del flujo completo: input > plan > validate > execute > finalize
- Integration test HITL: input > detect monetary > interrupt > approve > payment > complete
- Test risk_scoring con 20 escenarios parametrizados

## Criterios de Aceptacion
- StateGraph compila sin errores con los 11 nodos
- interrupt() pausa correctamente en human_approval
- Command routing post-aprobacion funciona (approved > payment, rejected > planner)
- Risk scoring produce valores correctos para todos los escenarios de Constitution Art. 5.3-5.6
- Constitutional check bloquea acciones que violan limites
- Emergency stop mata agente en < 5 segundos
```