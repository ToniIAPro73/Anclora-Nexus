# Progress — AntiGravity Execution Log

## 2026-03-10

### BL-001 a BL-011 cerrados

- `BL-001` Territorial Sync Control Plane endurecido y visible.
- `BL-002` `/sellers` conectado a inteligencia territorial real.
- `BL-003` Unified ingestion seller-side operativo.
- `BL-004` Supervised send HITL operativo.
- `BL-005` StateFox bridge productivo.
- `BL-006` Live capture StateFox operativo.
- `BL-007` Source observatory operativo.
- `BL-008` Alertado operativo real.
- `BL-009` Seller memory semantic recall implementado.
- `BL-010` Whale workbench contextual con siguiente paso y canal recomendado.
- `BL-011` Command center productivo con coste, throughput y conversión seller-side.

### Validación ejecutada

- `pytest` backend verde en los bloques entregados.
- `npm run frontend:lint` verde.
- `npm run frontend:build` verde.
- Warning de Next por `middleware` resuelto al migrar a `proxy`.

### Migraciones nuevas del tramo productivo

- `040_seller_contact_channels_and_supervised_send.sql`
- `041_ingestion_entity_type_seller_signal.sql`
- `042_operational_automation_alerts.sql`
- `043_seller_memory_semantic_recall.sql`

### Estado release candidate

- Código y documentación del perímetro productivo: listos.
- Gate `BL-012`: `GO`.
- Riesgos abiertos:
  - monitorizar cuotas de Groq
  - restaurar Cloudflare como proveedor balanceado cuando se disponga de credenciales válidas

### Próximo hito

- proceder al despliegue final y monitorización post-release
- abrir backlog post-GO para cerrar autonomía live, canales reales, memoria vectorial y hardening cloud

### Backlog post-GO

- `BL-next-01` cerrado: conector live seller-side autónomo con prioridad `Firecrawl -> StateFox live capture -> snapshot fallback`
- cron territorial seller-side ya no depende directamente del snapshot local
- `ANCLORA-SCUI-001` ampliada a `v1.2` con source runner live-first y fallback trazable
- validación:
  - `14 passed` en backend sobre source runner, FSBO, unified ingestion y StateFox live capture
  - `npm run frontend:lint` OK
  - `npm run frontend:build` OK
- `BL-next-02` cerrado: refresh territorial reproducible con owner, cadencia, runbooks y fallback visibles
- `ANCLORA-TSCP-001` ampliada a `v1.2` con `freshness_state`, `next_refresh_due_at`, `runbook_status` y `next_action`
- validación:
  - `npm run ops:notebooklm:build-sync-pack` OK
  - `npm run ops:notebooklm:validate-sync-pack` OK
  - `npm run ops:notebooklm:ops-summary` OK
  - `3 passed` en backend sobre servicio y rutas territoriales
  - `npm run frontend:lint` OK
  - `npm run frontend:build` OK
- `BL-next-03` cerrado: email nativo trazable con SMTP opcional y fallback `mailto`
- `ANCLORA-SEWS-001` ampliada a `v1.2` con `transport=native_email`, metadata de delivery y feedback visible en workbench
- validación:
  - `21 passed` en backend sobre sellers y command center
  - `npm run frontend:lint` OK
  - `npm run frontend:build` OK
- `BL-next-04` cerrado: memoria vectorial real para sellers con fallback léxico
- `ANCLORA-SMSR-001` ampliada a `v1.1` con embeddings persistidos, `retrieval_mode` y vector retrieval híbrido
- `whale_dossier` consume memoria recuperada para contexto comercial
- validación:
  - `22 passed` en backend sobre memoria seller-side y rutas sellers
  - `npm run frontend:lint` OK
  - `npm run frontend:build` OK
- `BL-next-05` cerrado: observabilidad cloud end-to-end con contrato único de heartbeats y runtime
- `ANCLORA-SPO-001`, `ANCLORA-GAA-001` y `ANCLORA-FCCC-001` ampliadas a `v1.2`
- `cloud_ops_service` sintetiza checks de sync territorial, pipeline, seller-side source y AI runtime
- validación:
  - `33 passed` en backend sobre observatorio, alertado, command center y cloud ops
  - `npm run frontend:lint` OK
  - `npm run frontend:build` OK

### Próximo hito operativo

- `BL-next-06` cerrado: hardening de tenant/config legacy
- rutas críticas seller-side e inteligencia territorial ya no usan `DEFAULT_ORG_ID` hardcoded
- helper centralizado `org_context_service` para compatibilidad single-tenant legacy
- `get_org_id` ya no hace fallback silencioso salvo config explícita
- `prospection_weekly` scopeado por `org_id`

### Próximo hito operativo

- `BL-next-07` cerrado: release gate recurrente y QA operacional
- runner automatizado `ops:release-gate` añadido
- acta genérica y criterio reutilizable documentados
- backlog post-GO ejecutado hasta `BL-next-07`

## 2026-03-11

### ANCLORA-MTIP-001 cerrada

- catálogo `intelligence_packs` por tenant añadido
- fallback legacy del pack Suroeste preservado para tenants sin catálogo persistido
- endpoints territoriales aceptan `pack_id` opcional y resuelven pack activo por `org_id`
- nueva card en `/intelligence` para visualizar, crear y activar packs
- textos añadidos a i18n y UI alineada con contratos `page-title` + `surface-*`

### Validación ejecutada

- `7 passed` en backend sobre servicio y rutas de intelligence packs
- `npm run frontend:lint` OK
- `npm run frontend:build` OK

### ANCLORA-NBUY-001 cerrada

- buyer intake v1 sobre `prospection` con `partner_referral`, `crm_reactivation` y `web_inbound`
- `buyer_profiles` extendido con fuente, partner network, scores e `intelligence_pack_id`
- panel `Nexus Buyers` añadido a `/prospection-unified`
- resumen por fuente buyer-side añadido al workspace operativo

### Validación ejecutada

- `31 passed` en backend sobre rutas de prospection y servicio buyer-side
- `npm run frontend:lint` OK
- `npm run frontend:build` OK
