# MASTER PROMPT: HNWI Prospection v1 (ANCLORA-HNWI-001)

**Feature ID**: ANCLORA-HNWI-001

Usar contexto:
- `hnwi-prospection-shared-context.md`
- `hnwi-prospection-spec-v1.md`
- Buyer Persona y Estrategias de Prospección (Mayo 2026)

## Orden de Ejecución (Agents)

1. **Agent A – DB**  
   Aplicar migración `hnwi-prospection-spec-migration.md`  
   Verificar índices y vistas materializadas

2. **Agent B – Backend**  
   - Extender endpoint `/api/ingestion/leads` con campos HNWI
   - Crear servicio de scoring (`hnwi_scoring_service.py`)
   - Añadir eventos FinOps automáticos
   - Implementar endpoint de métricas para Source Observatory

3. **Agent C – n8n + Orchestration**  
   Mejorar workflow a versión v2 (ya generado)
   Añadir nodo de LLM scoring (opcional)
   Configurar alertas automáticas

4. **Agent D – QA**  
   Ejecutar test plan completo (`hnwi-prospection-test-plan-v1.md`)
   Validar E2E con leads reales
   Verificar cumplimiento GDPR

5. **Gate Final**  
   Ejecutar `GATE_FINAL_ANCLORA_HNWI_001.md`

## Reglas de Implementación
- Cada agente entrega handoff claro antes de pasar al siguiente
- Priorizar soluciones zero/low-cost
- Mantener compatibilidad con leads existentes
- Documentar todo en el SDD
- No tocar StateFox, Inmovila ni Idealista

**Salida esperada**: Feature completamente funcional, documentada y lista para producción.