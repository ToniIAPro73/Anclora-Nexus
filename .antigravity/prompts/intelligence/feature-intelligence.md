# PROMPT: ANCLORA INTELLIGENCE REFACTOR (v1)

**Objetivo**: Refactorear el motor de inteligencia y sus skills siguiendo el patrón SDD v2 y resolviendo desalineaciones críticas.

## Contexto de Referencia
- SDD Pattern: `sdd/features/multitenant/`
- Audit Input: `audit-intelligence.txt`
- Current Spec: `sdd/features/intelligence/spec-intelligence-v1.md`

## Instrucciones para Agentes (E/F/G/H)

### 1. Refactor de Skills (Agent E/F)
- **Origen**: `backend/skills/*.py`
- **Destino**: `sdd/features/intelligence/skills/`
- **Cambios requeridos**:
    - Implementar validación Pydantic estricta.
    - Agregar structured logging (JSON).
    - Implementar retry logic (3 retries).
    - Eliminar `any` types y asegurar 100% type hints.

### 2. Backend Intelligence Components (Agent G)
- Refactorear `governor.py`, `router.py`, `synthesizer.py` en `backend/intelligence/components/`.
- Asegurar alineación con `intelligence-engine/contracts/`.
- Implementar interfaces abstractas para facilitar extractibilidad.

### 3. Orchestration & Audit (Agent H)
- Actualizar `orchestrator.py` para manejar el nuevo flujo de auditoría.
- Registrar cada decisión estratégica en `intelligence_audit_log`.

## Criterios de Aceptación
- [ ] Desalineación #2 y #4 resueltas.
- [ ] Skills movidos a la ubicación oficial SDD.
- [ ] Test coverage > 85% en componentes refactoreados.
- [ ] Audit log inmutable verificado con HMAC-SHA256.

## Timeline
- **Fase 1 (Planning/Refactor Code)**: 4-5 horas.
- **Fase 2 (Migration/Testing)**: 2-4 horas.
- **Total**: 6-9 horas.

## Nota de Desalineación #4
Este archivo resuelve la desalineación #4 al proporcionar el prompt maestro necesario para la regeneración de la feature.
