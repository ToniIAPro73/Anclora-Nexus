# Intelligence Engine

Motor de orquestación y gobernanza para agentes de inteligencia en Anclora Nexus.

## Estructura

- **contracts/**: Acuerdos de interfaz entre componentes. Define los schemas de intercambio de datos (JSON/Pydantic).
- **domain-packs/**: Implementación modular de componentes de inteligencia (Governor, Router, Synthesizer).
- **governance/**: Reglas de cumplimiento, schemas de auditoría y políticas de seguridad.

## Contracts (6)
1. `contract-01`: Governor Decision
2. `contract-02`: Query Plan
3. `contract-03`: Synthesizer Output
4. `contract-04`: Strategic Mode
5. `contract-05`: Audit Log
6. `contract-06`: NotebookLM Retrieval

## Uso
Consulte `INDEX.md` en `sdd/features/intelligence/` para la navegación completa de la feature y su integración con el backend.
