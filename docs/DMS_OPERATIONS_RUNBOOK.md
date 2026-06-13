# DMS Operations Runbook

**Módulo:** Operaciones y mantenimiento del módulo DMS/CLM  
**Audiencia:** SRE / DevOps / On-call  
**Última actualización:** 2026-06-14

---

## Monitorización

### Health checks

| Endpoint | Método | Respuesta esperada |
|---|---|---|
| `/api/health` | GET | `200 {"status": "ok"}` |
| `/api/dms/templates` | GET | `200 [...]` (requiere auth) |
| `/api/internal/webhooks/dms-retention-sweep` | POST | `200` (requiere `NEXUS_INTERNAL_API_KEY`) |

### Cron jobs

| Cron | Horario | Endpoint | Alerta si falla |
|---|---|---|---|
| `dms-retention` | 03:00 UTC diario | `/api/cron/dms-retention` | Documentos no archivados a tiempo |
| `territorial-pipeline` | 07:00 UTC diario | `/api/cron/territorial-pipeline` | No aplica a DMS |

Verificar en Vercel Dashboard → Cron Jobs → Logs.

---

## Operaciones habituales

### Forzar retention sweep manualmente

```bash
curl -X POST https://api.tudominio.com/api/internal/webhooks/dms-retention-sweep \
  -H "Authorization: Bearer $NEXUS_INTERNAL_API_KEY" \
  -H "Content-Type: application/json"
```

Respuesta esperada:
```json
{ "orgs_processed": 12, "errors": [], "summary": [...] }
```

### Verificar documentos pendientes de retención

```sql
SELECT id, title, status, created_at
FROM generated_documents
WHERE status != 'archived'
AND created_at < NOW() - INTERVAL '5 years'
ORDER BY created_at ASC
LIMIT 50;
```

### Verificar firmas en estado pendiente (>48h)

```sql
SELECT sf.id, sf.generated_document_id, sf.flow_status, sf.created_at,
       gd.title
FROM document_signature_flows sf
JOIN generated_documents gd ON gd.id = sf.generated_document_id
WHERE sf.flow_status = 'sent'
AND sf.created_at < NOW() - INTERVAL '48 hours'
ORDER BY sf.created_at ASC;
```

---

## Gestión de webhooks DocuSeal

### Verificar que el webhook está registrado en DocuSeal

Acceder al panel de DocuSeal → Settings → Webhooks. Debe haber un webhook apuntando a:
```
https://api.tudominio.com/api/dms/webhooks/docuseal
```

### Replay de un webhook fallido

Si un webhook falló (red, timeout), buscar el submission ID en DocuSeal y reenviar manualmente desde el panel de DocuSeal.

### Webhook recibido pero documento no actualizado

1. Verificar logs del backend para el endpoint `/api/dms/webhooks/docuseal`
2. Verificar que `DOCUSEAL_WEBHOOK_SECRET` coincide entre DocuSeal y el backend
3. Si la firma HMAC es incorrecta, recibirá `401` — actualizar el secreto en ambos lados

---

## Backup y recuperación

### Backup de documentos

Supabase realiza backups automáticos de la base de datos. Para el Storage:

```bash
# Listar documentos recientes (Supabase CLI)
supabase storage ls dms-documents --project-ref <ref>

# Descargar un fichero específico
supabase storage download dms-documents/{org_id}/{doc_id}/v1.md --project-ref <ref>
```

### Recuperar un documento archivado incorrectamente

```sql
UPDATE generated_documents
SET status = 'approved'  -- o el status que corresponda
WHERE id = 'doc-uuid'
AND org_id = 'org-uuid';
```

---

## Variables de entorno críticas

| Variable | Descripción | Efecto si falta |
|---|---|---|
| `SUPABASE_URL` | URL del proyecto Supabase | Backend no arranca |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (backend) | No puede leer/escribir DB |
| `DOCUSEAL_API_KEY` | API key DocuSeal | No se pueden crear envelopes |
| `DOCUSEAL_WEBHOOK_SECRET` | Secreto webhook | Webhooks sin verificar (riesgo) |
| `NEXUS_INTERNAL_API_KEY` | API key interna para crons | Cron de retención falla |
| `ADVISOR_AI_BASE_URL` | URL del servicio Advisor AI | Auto-review → SAFE_FAILURE (block) |
| `NEXUS_DOCUMENT_ENCRYPTION_KEY` | Clave AES para exportaciones | Dossier export cifrado no disponible |

---

## Rollback de migración

Las migraciones DMS son idempotentes con `CREATE TABLE IF NOT EXISTS`. No hay rollback automático.

Para rollback manual:
```sql
-- Eliminar SOLO si no hay datos de producción
DROP TABLE IF EXISTS document_signature_flows CASCADE;
DROP TABLE IF EXISTS legal_review_decisions CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;
DROP TABLE IF EXISTS generated_documents CASCADE;
DROP TABLE IF EXISTS document_retention_policies CASCADE;
DROP TABLE IF EXISTS dossier_exports CASCADE;
DROP TABLE IF EXISTS document_template_versions CASCADE;
DROP TABLE IF EXISTS document_templates CASCADE;
```

⚠️ **Nunca ejecutar en producción con datos reales.**

---

## Runbook de incidentes

### INC-DMS-001: Cron de retención no ejecuta

1. Verificar Vercel Dashboard → Cron Jobs
2. Comprobar que `/api/cron/dms-retention` responde con `200`
3. Verificar `CRON_SECRET` y `NEXUS_INTERNAL_API_KEY` en Vercel env
4. Ejecutar manualmente: ver sección "Forzar retention sweep"
5. Si sigue sin funcionar, revisar logs de Vercel Functions

### INC-DMS-002: Webhook DocuSeal no procesa

1. Verificar en DocuSeal → Webhook logs si la entrega falló
2. Verificar en backend logs (Vercel Functions) el error exacto
3. Si `401`: secreto HMAC desincronizado → actualizar `DOCUSEAL_WEBHOOK_SECRET`
4. Si `500`: error interno → revisar `audit_trail` del flow afectado
5. Replay manual desde DocuSeal

### INC-DMS-003: Documento bloqueado en review_required

1. Verificar `legal_review_decisions` para el documento
2. Si hay decisión `rejected` con `block_signing=True`, el usuario debe editar y crear nueva versión
3. Proceso correcto: editar en `/dms/documents/{id}/edit` → nueva revisión → aprobar → firmar

### INC-DMS-004: Storage lleno

1. Verificar uso en Supabase Dashboard → Storage
2. Ejecutar retention sweep para archivar documentos antiguos
3. Revisar exportaciones ZIP almacenadas (>7 días) y eliminar manualmente
4. Si el problema persiste, escalar plan de Supabase
