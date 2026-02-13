# Master Test Plan: Intelligence Feature (v1)

## 1. Estrategia de Testing
El objetivo es asegurar la resiliencia del motor de inteligencia y la precisión de sus skills mediante un enfoque de pirámide de tests con coverage target del 85%+.

## 2. Entornos de Test
- **Local**: Pytest + mocks de LLM.
- **Staging**: Supabase Dev + LLM Real (GPT-4o-mini).
- **CI**: GitHub Actions corriendo la suite completa de unitarios y schemas.

## 3. Capas de Verificación
| Capa | Herramienta | Target |
|------|-------------|--------|
| **Unit (Components)** | Pytest | Logic decision points (Governor/Router) |
| **Integration (Orchestrator)** | Pytest-asyncio | LangGraph flows + DB state |
| **Schema Validation** | Pydantic | Input/Output contract compliance |
| **Security/Audit** | HMAC | Firma de integridad en logs |

## 4. Criterios de Éxito
- ✅ 100% de los schemas Pydantic validados.
- ✅ 0 errores de tipo en la suite de tests (Mypy --strict).
- ✅ Respuestas del Orchestrator siempre incluyen un `audit_id` válido.
- ✅ Los skills manejan reintentos y timeouts sin colapsar el sistema.

## 5. Matriz de Cobertura (Test Cases)
- **Governor**: 15 escenarios de decisión.
- **Skills**: 20 escenarios de negocio y error.
- **Orchestrator**: 15 escenarios de flujo y estado.
- **TOTAL**: 50+ Test Cases.
