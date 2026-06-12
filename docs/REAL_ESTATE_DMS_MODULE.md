# Real Estate DMS Module

## Proposito

El DMS inmobiliario de Anclora Nexus centraliza expedientes, documentos, validacion pre-firma y flujos de firma para operaciones inmobiliarias. Su objetivo es que el equipo pueda localizar documentos, verificar completitud, pedir validacion a Advisor AI y bloquear firmas cuando existan riesgos.

## Decision arquitectonica

- Nexus es el repositorio operativo: expedientes, documentos cifrados, permisos, auditoria y estados de firma.
- Advisor AI es la capa de validacion e inteligencia: analiza contratos y devuelve riesgos, bloqueos, acciones requeridas y fuentes.
- DocuSeal u otro proveedor gestiona la firma electronica y devuelve eventos via webhook.

## Entidades principales

- `real_estate_deal_folders`: expediente por operacion inmobiliaria y organizacion.
- `deal_documents`: documentos cifrados asociados a un expediente.
- `document_signature_flows`: estado de envio/firma por documento y firmante.

## Flujos

### Crear expediente

`POST /api/dms/folders` crea un expediente con `operation_type`. Si se informan `property_id`, `client_lead_id` o `seller_id`, deben pertenecer a la misma organizacion.

### Subir documento

`POST /api/dms/documents/upload` valida folder/org, MIME permitido, tamano maximo y cifra el contenido antes de subirlo al bucket `NEXUS_DMS_BUCKET`. Guarda SHA-256, IV, auth tag y metadata.

### Clasificar documento

La categoria llega en `document_category`. La lista inicial cubre nota simple, escritura, contratos, arras, KYC y documentos firmados.

### Validar documento con Advisor AI

`POST /api/dms/documents/{document_id}/validate` descifra el documento, extrae texto si procede y llama a Advisor AI `/api/validate-contract` mediante `backend/services/advisor_contract_validator_service.py`.

### Aprobar/rechazar compliance

- `approved`: Advisor responde sin bloqueo.
- `rejected`: Advisor devuelve `block_signing=true`.
- `pending`: Advisor no responde o devuelve revision requerida sin bloqueo.

El resultado se guarda en `legal_metadata.advisor_validation`.

### Enviar a firma

`POST /api/dms/documents/{document_id}/signature-flows` crea un flujo en estado `sent`. No permite enviar documentos con `compliance_status=rejected` ni documentos ya inmutables.

### Recibir webhook

`POST /api/dms/webhooks/docuseal` verifica HMAC con `DOCUSEAL_WEBHOOK_SECRET`. Si el estado es `completed`, marca el flujo como `signed` y el documento como inmutable.

### Descargar documento firmado

La descarga se hace via `GET /api/dms/documents/{document_id}/download`, con membership activo, filtrado por `org_id` y sin exponer `storage_path` en el workspace.

## Reglas de inmutabilidad

- Draft editable: documento sin flujo de firma y `legal_metadata.immutable=false`.
- Documento enviado a firma: bloqueado; `flow_status in sent/opened/signed`.
- Documento firmado: inmutable permanentemente; metadata `immutable=true`.

## Seguridad

- Cifrado: AES-GCM mediante `DocumentEncryptionService` y `NEXUS_DOCUMENT_ENCRYPTION_KEY`.
- RLS: tablas DMS tienen RLS en la migracion base.
- Org membership: endpoints DMS usan `get_org_id`, `get_current_user` y `verify_org_membership`.
- Logs: operaciones relevantes intentan insertar `audit_log` con firma HMAC via `SupabaseService`.
- Caducidad de enlaces: el endpoint no expone rutas internas de storage. Si Supabase signed URLs se habilita, debe reemplazar el stream directo por URL temporal.

## Variables de entorno

```env
NEXUS_DOCUMENT_ENCRYPTION_KEY=
NEXUS_DMS_BUCKET=dms
NEXUS_DMS_MAX_UPLOAD_BYTES=26214400
DOCUSEAL_WEBHOOK_SECRET=
DOCUSEAL_API_KEY=
DOCUSEAL_API_URL=https://api.docuseal.com
ADVISOR_AI_BASE_URL=http://localhost:3000
ADVISOR_AI_INTERNAL_API_KEY=
ADVISOR_AI_TIMEOUT_SECONDS=12
NEXT_PUBLIC_DMS_ENABLED=true
```

## Checklist de pruebas manuales

- Crear expediente de compraventa.
- Subir PDF permitido y confirmar que se guarda cifrado.
- Intentar subir MIME no permitido y verificar rechazo.
- Validar documento con Advisor AI activo.
- Simular Advisor AI caido y verificar `compliance_status=pending`.
- Forzar `block_signing=true` y verificar `compliance_status=rejected`.
- Intentar enviar a firma documento rechazado y verificar `409`.
- Simular webhook DocuSeal con HMAC invalido y verificar `401`.
- Simular webhook valido y verificar `flow_status=signed` e inmutabilidad.

## Limitaciones actuales

- La integracion DocuSeal crea un envelope placeholder; falta llamada real al proveedor.
- La extraccion avanzada depende de MinerU y puede estar desactivada.
- La descarga usa stream autenticado; no usa signed URLs de Supabase todavia.
- Las reglas de documentos obligatorios criticos estan documentadas pero no materializadas en una tabla de checklist.

## Roadmap recomendado

- Persistir checklist obligatorio por `operation_type`.
- Generar plantillas DocuSeal por categoria documental.
- Implementar signed URLs con expiracion corta.
- Crear panel de auditoria documental.
- Sincronizar estados y documentos firmados desde DocuSeal de forma idempotente.
