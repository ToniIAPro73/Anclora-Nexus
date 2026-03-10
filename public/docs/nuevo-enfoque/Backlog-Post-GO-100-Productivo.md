# Backlog Post-GO hacia 100% Productivo - Anclora Nexus

Fecha de corte: `2026-03-10`
Estado base de partida: `RC GO`
Referencia: `public/docs/nuevo-enfoque/Guia-Detallada-Ejecucion-AntiGravity.md`

Este backlog recoge exclusivamente lo que falta para pasar de un release candidate validado y usable a una operación totalmente autónoma, trazable y endurecida en cloud.

No incluye la feature de manual de usuario ni trabajo documental periférico.

---

## 1. Valoración actual

### Lectura ejecutiva

- El diagnóstico histórico de `73%` ya no representa el estado real del repo tras el cierre de `BL-001` a `BL-012`.
- El sistema ya tiene:
  - control-plane territorial,
  - ingesta seller-side,
  - bridge StateFox,
  - supervised send HITL,
  - observabilidad base,
  - alertado operativo,
  - seller memory v1,
  - workbench contextual,
  - command center productivo,
  - smoke test con resultado `GO`.
- El gap principal ya no está en “construcción base”, sino en:
  - autonomía de fuentes live,
  - eliminación de manualidad crítica,
  - canales reales nativos,
  - memoria vectorial real,
  - observabilidad cloud y hardening de configuración legacy.

### Estimación actual

- Estado global estimado: **88%**
- Resto para 100%: **12%**

### Riesgos reales que siguen abiertos

1. Conectores live todavía no cerrados como operación autónoma diaria.
2. Dependencia parcial de procesos manuales alrededor de NotebookLM / StateFox.
3. Outreach todavía sin canal nativo trazable end-to-end.
4. Memoria semántica sin vector store real.
5. Deuda estructural de `single-tenant v0` y `org_id` por defecto en skills legacy.
6. Observabilidad cloud todavía incompleta para operación continua.

---

## 2. Contrato de ejecución

Toda nueva capability de este backlog debe seguir el paquete completo:

`rules -> skills -> prompts -> specs -> migraciones -> backend -> frontend -> tests -> QA report -> gate final`

No se considera cerrado ningún bloque si falta cualquiera de estas piezas:

- spec aprobable
- rule
- skill
- prompt
- implementación técnica
- tests
- QA report
- gate final

---

## 3. Orden de importancia

## BL-next-01 - Conector live seller-side autónomo

Estado: `Closed`

### Objetivo

Cerrar una fuente primaria de señales seller-side que funcione sin paso manual de operador.

### Alcance

- convertir StateFox o Firecrawl en fuente primaria operativa,
- conservar snapshot/manual solo como fallback,
- garantizar idempotencia, dedupe, trazabilidad y retry.

### Resultado esperado

- el sistema recibe señales seller-side frescas en cloud,
- las persiste,
- las deduplica,
- genera sellers y las hace visibles en observabilidad sin intervención manual.

### Dependencias

- `ANCLORA-SCUI-001`
- `ANCLORA-STFX-002`
- `ANCLORA-STFX-LC-001`

### Criterio de salida

- una ejecución programada completa importa señales live y deja trazabilidad visible en observatorio y command center.

### Cierre ejecutado `2026-03-10`

- seller-side source runner añadido con prioridad `Firecrawl -> StateFox live capture -> snapshot fallback`
- cron territorial migrado a resolución live-first en vez de depender directamente del snapshot seller-side
- `fsbo_scraper` reconectado a unified ingestion con trazabilidad por `connector_name`, `trace_id` y `snapshot_id`
- skill operativa `seller_signal_source_run` expuesta en `/api/skills/run`
- tests backend y validación frontend en verde

---

## BL-next-02 - Refresh territorial reproducible sin manualidad frágil

### Objetivo

Reducir la dependencia operativa de NotebookLM a un proceso reproducible, con ventana de frescura y fallback definidos.

### Alcance

- runbook final,
- ownership operativo,
- estado de frescura,
- política de fallback,
- evidencia de última sincronización.

### Resultado esperado

- el control-plane territorial deja de depender de conocimiento tácito del operador,
- la inteligencia territorial puede auditarse y recuperarse de forma repetible.

### Dependencias

- `ANCLORA-TSCP-001`

### Criterio de salida

- cualquier operador puede ejecutar o recuperar el refresh territorial siguiendo runbook, sin inspección manual del repo.

---

## BL-next-03 - Email nativo trazable

### Objetivo

Convertir el supervised send actual en canal real de email con trazabilidad operativa.

### Alcance

- integración con proveedor o cliente nativo,
- estado draft/open/send/confirm,
- persistencia de resultado,
- feedback visible en seller workbench.

### Resultado esperado

- el outreach por email deja de ser solo preparación HITL y pasa a operación comercial trazable.

### Dependencias

- `ANCLORA-SEWS-001`
- `ANCLORA-GCWW-001`

### Criterio de salida

- Toni puede lanzar y confirmar emails reales desde el flujo supervisado y ver el resultado asociado al seller.

---

## BL-next-04 - Memoria vectorial real para sellers

### Objetivo

Extender la memoria seller-side actual a retrieval semántico real.

### Alcance

- `pgvector` o equivalente,
- embeddings,
- política de redacción PII,
- retrieval explicable,
- rebuild y health checks.

### Resultado esperado

- el workbench recupera contexto histórico útil de forma semántica, no solo por memoria estructurada v1.

### Dependencias

- `ANCLORA-SMSR-001`

### Criterio de salida

- el seller drawer y los flujos de dossier/outreach pueden recuperar memoria relevante por similitud semántica de forma verificable.

---

## BL-next-05 - Observabilidad cloud end-to-end

### Objetivo

Cerrar salud operacional real en cloud para cron, conectores, sync territorial y runtime.

### Alcance

- cron heartbeat,
- latencia,
- errores,
- reintentos,
- cobertura,
- degradación por fuente,
- estado runtime providers.

### Resultado esperado

- command center y alertado operativo muestran estado cloud real y no solo señales parciales de aplicación.

### Dependencias

- `ANCLORA-SPO-001`
- `ANCLORA-GAA-001`
- `ANCLORA-FCCC-001`

### Criterio de salida

- una incidencia operativa real de cron o conector genera alerta, contexto y visibilidad ejecutiva sin inspección manual.

---

## BL-next-06 - Hardening de tenant/config legacy

### Objetivo

Eliminar assumptions peligrosas de `single-tenant v0` y `org_id` por defecto en skills y seeds legacy.

### Alcance

- inventario de defaults fijos,
- sustitución por resolución segura de contexto,
- validaciones explícitas,
- documentación de qué sigue siendo single-tenant por decisión y qué no.

### Resultado esperado

- el sistema deja de depender de `DEFAULT_ORG_ID` en rutas o skills críticas donde eso pueda generar deriva futura.

### Dependencias

- revisión transversal backend / skills / seeds

### Criterio de salida

- no quedan rutas o skills críticas productivas dependiendo de `org_id` hardcoded cuando el contexto autenticado ya existe.

---

## BL-next-07 - Release gate recurrente y QA operacional

### Objetivo

Convertir el smoke y la validación RC en un gate repetible de release.

### Alcance

- suite mínima recurrente,
- smoke express,
- acta,
- responsables,
- criterio `GO / CONDITIONAL GO / NO-GO` reutilizable por release.

### Resultado esperado

- cada release importante pasa por el mismo gate técnico-operativo, no por una validación puntual y artesanal.

### Dependencias

- cierre suficiente de `BL-next-01` a `BL-next-06`

### Criterio de salida

- el proyecto tiene pipeline de validación técnica y operativa repetible antes de promoción a producción.

---

## 4. Secuencia recomendada

### Ola 1 - Autonomía de datos

1. `BL-next-01`
2. `BL-next-02`

### Ola 2 - Captura de valor comercial

3. `BL-next-03`
4. `BL-next-04`

### Ola 3 - Hardening de operación

5. `BL-next-05`
6. `BL-next-06`
7. `BL-next-07`

---

## 5. Decisiones explícitas

### Lo que sí entra en esta etapa

- autonomía operacional real,
- conectores live,
- runtime y outreach productivo,
- memoria vectorial,
- observabilidad cloud,
- hardening de configuración,
- gate de release recurrente.

### Lo que no entra en esta etapa

- manual de usuario,
- trabajo cosmético sin impacto operacional,
- un programa grande de multitenancy SaaS si no existe necesidad comercial inmediata.

---

## 6. Próximo movimiento recomendado

Abrir `BL-next-01` como primer bloque de ejecución real con su paquete completo:

- spec,
- rule,
- skill,
- prompt,
- test plan,
- QA report,
- gate final.
