# Backlog de Entrega Productiva 30/60/90 - Anclora Nexus

Fecha de corte: 2026-03-10

Este backlog convierte el diagnóstico del plan AntiGravity en una hoja de ejecución real por sprints.

La regla de gobierno es obligatoria para cualquier cambio relevante:

`rules -> skills -> prompts -> specs -> migraciones -> backend -> frontend -> tests -> QA report -> gate final`

---

## 1. Contrato de entrega por feature

Toda feature nueva, o toda ampliación material de una feature existente, debe entregarse con este paquete end-to-end:

### Artefactos funcionales mínimos

- `sdd/features/<feature>/...-INDEX.md`
- `sdd/features/<feature>/...-spec-vX.md`
- `sdd/features/<feature>/...-spec-migration.md`
- `sdd/features/<feature>/...-test-plan-vX.md`
- `sdd/features/<feature>/QA_REPORT_<ID>.md`
- `sdd/features/<feature>/GATE_FINAL_<ID>.md`

### Artefactos de arquitectura AntiGravity

- `.agent/rules/feature-<feature>.md`
- `.agent/skills/features/<feature>/SKILL.md`
- `.antigravity/prompts/features/<feature>/feature-<feature>-vX.md`

### Cuando la feature sea multiagente o transversal

Añadir además:

- `.antigravity/prompts/features/<feature>/feature-<feature>-shared-context.md`
- `.antigravity/prompts/features/<feature>/feature-<feature>-master-parallel.md`
- `.antigravity/prompts/features/<feature>/feature-<feature>-agent-a-db.md`
- `.antigravity/prompts/features/<feature>/feature-<feature>-agent-b-backend.md`
- `.antigravity/prompts/features/<feature>/feature-<feature>-agent-c-frontend.md`
- `.antigravity/prompts/features/<feature>/feature-<feature>-agent-d-qa.md`
- `.antigravity/prompts/features/<feature>/feature-<feature>-gate-final.md`

### Artefactos técnicos

- Migración numerada en `supabase/migrations/`
- Implementación backend
- Implementación frontend
- Tests backend y/o frontend
- Registro o actualización en `sdd/features/FEATURES.md`

### Criterio de “feature cerrada”

No se considera cerrada una feature si falta cualquiera de estas piezas:

- spec aprobable
- rule
- skill
- prompt
- tests
- QA report
- gate final

---

## 2. Principios para este backlog

1. Reutilizar features existentes cuando el gap sea endurecimiento o ampliación natural.
2. Crear feature nueva solo cuando el gap no encaje limpiamente en una feature ya modelada.
3. Priorizar siempre lo que cierre producción real antes que lo cosmético.
4. No abrir trabajo frontend aislado sin contrato backend y criterio de aceptación verificable.

---

## 3. Mapa de backlog por horizonte

## Horizonte 0-30 días

Objetivo: operación verificable diaria.

### Sprint 1

#### BL-001 - ANCLORA-TSCP-001 v1.1 - Hardening del pipeline territorial oficial

- Tipo: extensión de feature existente
- Feature base: `territorial-sync-control-plane`
- Resultado esperado:
  - cron territorial tratado como pipeline oficial,
  - status visible,
  - run reproducible,
  - fallback controlado,
  - errores operables.
- Artefactos a crear o extender:
  - `sdd/features/territorial-sync-control-plane/territorial-sync-control-plane-spec-v1_1.md`
  - `sdd/features/territorial-sync-control-plane/territorial-sync-control-plane-test-plan-v1_1.md`
  - `sdd/features/territorial-sync-control-plane/QA_REPORT_ANCLORA_TSCP_001_v1_1.md`
  - `sdd/features/territorial-sync-control-plane/GATE_FINAL_ANCLORA_TSCP_001_v1_1.md`
  - `.agent/rules/feature-territorial-sync-control-plane.md`
  - `.agent/skills/features/territorial-sync-control-plane/SKILL.md`
  - `.antigravity/prompts/features/territorial-sync-control-plane/feature-territorial-sync-control-plane-v1_1.md`
- Cambios técnicos previstos:
  - endurecer `frontend/src/app/api/cron/territorial-pipeline/route.ts`
  - exponer último run, resultado y error operativo
  - definir contrato de entrada/salida del pipeline territorial
- Dependencias:
  - `ANCLORA-TSCP-001` v1
- Criterio de aceptación:
  - un operador puede saber si el pipeline está listo, cuándo corrió y por qué falló sin inspeccionar ficheros manualmente

#### BL-002 - ANCLORA-GCWW-001 v1.1 - Seller workspace sin hardcodes territoriales

- Tipo: extensión de feature existente
- Feature base: `gravity-claw-whale-workbench`
- Resultado esperado:
  - el bloque de oportunidades territoriales de sellers deja de usar contenido fijo y pasa a usar backend real
- Artefactos a crear o extender:
  - `sdd/features/gravity-claw-whale-workbench/gravity-claw-whale-workbench-spec-v1_1.md`
  - `sdd/features/gravity-claw-whale-workbench/gravity-claw-whale-workbench-test-plan-v1_1.md`
  - `sdd/features/gravity-claw-whale-workbench/QA_REPORT_ANCLORA_GCWW_001_v1_1.md`
  - `sdd/features/gravity-claw-whale-workbench/GATE_FINAL_ANCLORA_GCWW_001_v1_1.md`
  - `.agent/rules/feature-gravity-claw-whale-workbench.md`
  - `.agent/skills/features/gravity-claw-whale-workbench/SKILL.md`
  - `.antigravity/prompts/features/gravity-claw-whale-workbench/feature-gravity-claw-whale-workbench-v1_1.md`
- Cambios técnicos previstos:
  - sustituir hardcodes en `frontend/src/app/(dashboard)/sellers/page.tsx`
  - alimentar sellers con `territorial-summary` o endpoint derivado específico
- Criterio de aceptación:
  - sellers muestra oportunidades reales derivadas del caché territorial, no traducciones/mock estáticos

### Sprint 2

#### BL-003 - ANCLORA-SCUI-001 v1.0 - Implementación real de conectores seller-side

- Tipo: llevar una feature en especificación a implementación
- Feature base: `source-connectors-unified-ingestion`
- Resultado esperado:
  - un contrato único para importar señales seller-side desde snapshot, Firecrawl y StateFox
- Artefactos obligatorios:
  - completar paquete de implementación de `sdd/features/source-connectors-unified-ingestion/`
  - crear `.agent/rules/feature-source-connectors-unified-ingestion.md`
  - usar `.agent/skills/features/source-connectors-unified-ingestion/SKILL.md`
  - completar prompts de implementación y gate bajo `.antigravity/prompts/features/source-connectors-unified-ingestion/`
- Cambios técnicos previstos:
  - contrato canónico de señales seller
  - idempotencia y deduplicación homogénea
  - origen live prioritario + fallback snapshot
  - observabilidad por fuente
- Dependencias:
  - BL-001
- Criterio de aceptación:
  - una misma ruta operacional acepta señales de varias fuentes con el mismo contrato y trazabilidad

#### BL-004 - ANCLORA-SEWS-001 v1.1 - HITL utilizable en operación diaria

- Tipo: extensión de feature existente
- Feature base: `supervised-email-whatsapp-send`
- Resultado esperado:
  - Toni puede abrir, enviar y confirmar outreach supervisado de forma consistente
- Artefactos a crear o extender:
  - `sdd/features/supervised-email-whatsapp-send/supervised-email-whatsapp-send-spec-v1_1.md`
  - `sdd/features/supervised-email-whatsapp-send/supervised-email-whatsapp-send-test-plan-v1_1.md`
  - `sdd/features/supervised-email-whatsapp-send/QA_REPORT_ANCLORA_SEWS_001_v1_1.md`
  - `sdd/features/supervised-email-whatsapp-send/GATE_FINAL_ANCLORA_SEWS_001_v1_1.md`
  - `.agent/rules/feature-supervised-email-whatsapp-send.md`
  - `.agent/skills/features/supervised-email-whatsapp-send/SKILL.md`
  - `.antigravity/prompts/features/supervised-email-whatsapp-send/feature-supervised-email-whatsapp-send-v1_1.md`
- Cambios técnicos previstos:
  - mejorar persistencia de canales
  - endurecer confirmación de envío
  - asegurar trazabilidad de draft -> launch -> confirm-send
- Dependencias:
  - BL-002
- Criterio de aceptación:
  - el flujo supervisado puede usarse con sellers reales sin pasos ambiguos ni pérdida de auditoría

---

## Horizonte 31-60 días

Objetivo: operación escalable con menos intervención manual.

### Sprint 3

#### BL-005 - ANCLORA-STFX-002 v1.1 - Bridge StateFox orientado a importación productiva

- Tipo: extensión de feature existente
- Feature base: `statefox-telegram-bridge`
- Resultado esperado:
  - parseo/importación más estable y útil para pipeline seller-side
- Artefactos a crear o extender:
  - `sdd/features/statefox-telegram-bridge/statefox-telegram-bridge-spec-v1_1.md`
  - `sdd/features/statefox-telegram-bridge/statefox-telegram-bridge-test-plan-v1_1.md`
  - `sdd/features/statefox-telegram-bridge/QA_REPORT_ANCLORA_STFX_002_v1_1.md`
  - `sdd/features/statefox-telegram-bridge/GATE_FINAL_ANCLORA_STFX_002_v1_1.md`
  - `.agent/rules/feature-statefox-telegram-bridge.md`
  - `.agent/skills/features/statefox-telegram-bridge/SKILL.md`
  - `.antigravity/prompts/features/statefox-telegram-bridge/feature-statefox-telegram-bridge-v1_1.md`
- Cambios técnicos previstos:
  - enriquecer contrato de importación
  - clasificar mejor listings útiles para `properties` y `nexus_sellers`
  - normalizar mejor `source_url`, zona y metadata
- Dependencias:
  - BL-003
- Criterio de aceptación:
  - StateFox deja de ser solo un bridge experimental y pasa a fuente operable supervisada

#### BL-006 - ANCLORA-STFX-003 v1.1 - Live capture con SOP y handoff operativo

- Tipo: extensión de feature existente
- Feature base: `statefox-live-capture`
- Resultado esperado:
  - captura viva reproducible por operador sin depender del conocimiento tácito actual
- Artefactos a crear o extender:
  - `sdd/features/statefox-live-capture/statefox-live-capture-spec-v1_1.md`
  - `sdd/features/statefox-live-capture/statefox-live-capture-test-plan-v1_1.md`
  - `sdd/features/statefox-live-capture/QA_REPORT_ANCLORA_STFX_003_v1_1.md`
  - `sdd/features/statefox-live-capture/GATE_FINAL_ANCLORA_STFX_003_v1_1.md`
  - `.agent/rules/feature-statefox-live-capture.md`
  - `.agent/skills/features/statefox-live-capture/SKILL.md`
  - `.antigravity/prompts/features/statefox-live-capture/feature-statefox-live-capture-v1_1.md`
- Cambios técnicos previstos:
  - runbook final de operación
  - validaciones de artifact capturado
  - feedback de disponibilidad/importabilidad
- Dependencias:
  - BL-005
- Criterio de aceptación:
  - cualquier operador del proyecto puede repetir la captura supervisada con una tasa baja de error

### Sprint 4

#### BL-007 - ANCLORA-SPO-001 v1.1 - Observabilidad de fuentes y cobertura real

- Tipo: extensión de feature existente
- Feature base: `source-performance-observatory`
- Resultado esperado:
  - visibilidad de rendimiento por fuente, cobertura y fallos operativos
- Artefactos a crear o extender:
  - `sdd/features/source-performance-observatory/source-performance-observatory-spec-v1_1.md`
  - `sdd/features/source-performance-observatory/source-performance-observatory-test-plan-v1_1.md`
  - `sdd/features/source-performance-observatory/QA_REPORT_ANCLORA_SPO_001_v1_1.md`
  - `sdd/features/source-performance-observatory/GATE_FINAL_ANCLORA_SPO_001_v1_1.md`
  - `.agent/rules/feature-source-performance-observatory.md`
  - `.agent/skills/features/source-performance-observatory/SKILL.md`
  - `.antigravity/prompts/features/source-performance-observatory/feature-source-performance-observatory-v1_1.md`
- Cambios técnicos previstos:
  - métricas por fuente
  - volumen importado
  - deduplicados
  - fallos
  - frescura
- Dependencias:
  - BL-003
  - BL-005
- Criterio de aceptación:
  - la dirección puede ver qué fuente está produciendo valor y cuál está degradada

#### BL-008 - ANCLORA-GAA-001 v1.1 - Alertado operativo del pipeline

- Tipo: extensión de feature existente
- Feature base: `guardrailed-automation-and-alerting`
- Resultado esperado:
  - alertas reales cuando fallen cron, sync territorial o conectores
- Artefactos a crear o extender:
  - `sdd/features/guardrailed-automation-and-alerting/guardrailed-automation-and-alerting-spec-v1_1.md`
  - `sdd/features/guardrailed-automation-and-alerting/guardrailed-automation-and-alerting-test-plan-v1_1.md`
  - `sdd/features/guardrailed-automation-and-alerting/QA_REPORT_ANCLORA_GAA_001_v1_1.md`
  - `sdd/features/guardrailed-automation-and-alerting/GATE_FINAL_ANCLORA_GAA_001_v1_1.md`
  - `.agent/rules/feature-guardrailed-automation-and-alerting.md`
  - `.agent/skills/features/guardrailed-automation-and-alerting/SKILL.md`
  - `.antigravity/prompts/features/guardrailed-automation-and-alerting/feature-guardrailed-automation-and-alerting-v1_1.md`
- Dependencias:
  - BL-001
  - BL-007
- Criterio de aceptación:
  - fallo operativo importante implica alerta visible y accionable, no silencio

---

## Horizonte 61-90 días

Objetivo: operación autónoma y defendible en producción.

### Sprint 5

#### BL-009 - ANCLORA-SMSR-001 v1.0 - Seller Memory Semantic Recall

- Tipo: nueva feature
- Motivo:
  - hoy existe memoria de interacciones, pero no memoria semántica real por seller
- Objetivo:
  - reanudar conversaciones y generar outreach con contexto semántico útil
- Carpeta propuesta:
  - `sdd/features/seller-memory-semantic-recall/`
- Artefactos obligatorios:
  - `sdd/features/seller-memory-semantic-recall/seller-memory-semantic-recall-INDEX.md`
  - `sdd/features/seller-memory-semantic-recall/seller-memory-semantic-recall-spec-v1.md`
  - `sdd/features/seller-memory-semantic-recall/seller-memory-semantic-recall-spec-migration.md`
  - `sdd/features/seller-memory-semantic-recall/seller-memory-semantic-recall-test-plan-v1.md`
  - `sdd/features/seller-memory-semantic-recall/QA_REPORT_ANCLORA_SMSR_001.md`
  - `sdd/features/seller-memory-semantic-recall/GATE_FINAL_ANCLORA_SMSR_001.md`
  - `.agent/rules/feature-seller-memory-semantic-recall.md`
  - `.agent/skills/features/seller-memory-semantic-recall/SKILL.md`
  - `.antigravity/prompts/features/seller-memory-semantic-recall/feature-seller-memory-semantic-recall-v1.md`
  - si se implementa de forma transversal: paquete completo de `shared-context`, `master-parallel`, `agent-a/b/c/d`, `gate-final`
- Cambios técnicos previstos:
  - store semántico con pgvector o alternativa equivalente
  - redacción/filtrado de PII antes de vectorizar
  - retrieval en workbench y generación de drafts
- Dependencias:
  - BL-004
  - BL-007
- Criterio de aceptación:
  - el sistema reutiliza contexto histórico relevante de forma explicable y segura

### Sprint 6

#### BL-010 - ANCLORA-GCWW-001 v1.2 - Whale workbench con memoria y contexto recuperado

- Tipo: extensión de feature existente
- Feature base: `gravity-claw-whale-workbench`
- Objetivo:
  - conectar el workbench actual con memoria semántica y contexto acumulado
- Artefactos a crear o extender:
  - `sdd/features/gravity-claw-whale-workbench/gravity-claw-whale-workbench-spec-v1_2.md`
  - `sdd/features/gravity-claw-whale-workbench/gravity-claw-whale-workbench-test-plan-v1_2.md`
  - `sdd/features/gravity-claw-whale-workbench/QA_REPORT_ANCLORA_GCWW_001_v1_2.md`
  - `sdd/features/gravity-claw-whale-workbench/GATE_FINAL_ANCLORA_GCWW_001_v1_2.md`
  - `.agent/rules/feature-gravity-claw-whale-workbench.md`
  - `.agent/skills/features/gravity-claw-whale-workbench/SKILL.md`
  - `.antigravity/prompts/features/gravity-claw-whale-workbench/feature-gravity-claw-whale-workbench-v1_2.md`
- Dependencias:
  - BL-009
- Criterio de aceptación:
  - el workbench deja de ser solo registro y pasa a ser consola de contexto comercial real

#### BL-011 - ANCLORA-FCCC-001 v1.1 - Control operativo final de costes y pipeline

- Tipo: extensión de feature existente
- Feature base: `finops-and-commercial-command-center`
- Objetivo:
  - exponer en command center costes, throughput y conversión del nuevo sistema productivo
- Artefactos a crear o extender:
  - `sdd/features/finops-and-commercial-command-center/finops-and-commercial-command-center-spec-v1_1.md`
  - `sdd/features/finops-and-commercial-command-center/finops-and-commercial-command-center-test-plan-v1_1.md`
  - `sdd/features/finops-and-commercial-command-center/QA_REPORT_ANCLORA_FCCC_001_v1_1.md`
  - `sdd/features/finops-and-commercial-command-center/GATE_FINAL_ANCLORA_FCCC_001_v1_1.md`
  - `.agent/rules/feature-finops-and-commercial-command-center.md`
  - `.agent/skills/features/finops-and-commercial-command-center/SKILL.md`
  - `.antigravity/prompts/features/finops-and-commercial-command-center/feature-finops-and-commercial-command-center-v1_1.md`
- Dependencias:
  - BL-007
  - BL-008
  - BL-009
- Criterio de aceptación:
  - dirección puede ver coste, rendimiento y valor generado del pipeline sin leer logs técnicos

#### BL-012 - Release Candidate Productivo

- Tipo: hardening transversal
- No es una feature nueva; es un gate de release
- Entregables:
  - build frontend limpio
  - tests backend reproducibles
  - smoke test con datos reales
  - revisión de compliance scraping/datos
  - decisión formal de go/no-go
- Artefactos mínimos:
  - `public/docs/Nuevo_enfoque/RELEASE_CANDIDATE_PRODUCTIVO_Q2_2026.md`
  - actualización de `progress.md`
  - actualización de `architecture.md`
  - actualización de `sdd/features/FEATURES.md`
- Dependencias:
  - BL-001 a BL-011 cerrados o aceptados con waiver explícito

---

## 4. Orden de ejecución recomendado

1. BL-001
2. BL-002
3. BL-003
4. BL-004
5. BL-005
6. BL-006
7. BL-007
8. BL-008
9. BL-009
10. BL-010
11. BL-011
12. BL-012

---

## 5. Definición de sprint terminado

Un sprint no termina si solo hay código.

Debe cerrar:

- spec actualizada
- rule actualizada
- skill actualizada
- prompt actualizado
- implementación
- test plan
- QA report
- gate final
- changelog de estado en la documentación operativa

---

## 6. Primer paquete que conviene ejecutar ya

Si el objetivo es mover el sistema a producción lo antes posible, el primer lote correcto es:

1. `BL-001` - hardening del pipeline territorial
2. `BL-002` - eliminación de hardcodes en sellers
3. `BL-003` - implementación efectiva de conectores seller-side
4. `BL-004` - supervised send operativo

Ese lote convierte el estado actual en un sistema operable, aunque todavía no totalmente autónomo.
