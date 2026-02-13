# Test Cases: Orchestrator Workflow

## State Management
1. **TC-ORC-01**: Inicialización correcta del estado de LangGraph.
2. **TC-ORC-02**: Transición Router -> Governor según intención.
3. **TC-ORC-03**: Paso de variables de contexto (`org_id`, `user_id`) entre nodos.
4. **TC-ORC-04**: Manejo de estado persistente entre varios turnos de chat.

## Workflow Sequences
5. **TC-ORC-05**: Flujo completo: Input -> Plan -> Execute -> Synthesize -> Audit.
6. **TC-ORC-06**: Short-circuit: Synthesizer responde directamente a queries triviales.
7. **TC-ORC-07**: Re-routing: El Governor decide cambiar el plan en mitad de ejecución.

## Integración de Componentes
8. **TC-ORC-08**: Synthesizer integra correctamente los resultados crudos de los skills.
9. **TC-ORC-09**: Audit Logger captura el error si un paso intermedio falla.
10. **TC-ORC-10**: Verificación de firma HMAC generada al final del flujo.

## Edge Cases
11. **TC-ORC-11**: Cancelación de tarea en progreso por el usuario.
12. **TC-ORC-12**: Recursión infinita detectada y cortada (Max steps = 5).
13. **TC-ORC-13**: Fallback a LLM Alternativo si el primario lanza cuota excedida.
14. **TC-ORC-14**: Manejo de respuestas vacías de los componentes internos.
15. **TC-ORC-15**: Latencia: El orquestador mantiene el heartbeat activo en tareas largas.
