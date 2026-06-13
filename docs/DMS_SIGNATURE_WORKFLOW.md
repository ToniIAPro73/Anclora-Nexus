# DMS Signature Workflow

**Módulo:** Flujo de firma electrónica (DocuSeal)  
**Última actualización:** 2026-06-14

---

## Visión general

La firma electrónica se integra vía **DocuSeal** (self-hosted o cloud). El flujo es:

```
Documento aprobado
    │
    ▼
Nexus → POST /api/dms/generated-documents/{id}/signature-flows
    │ Crea envelope en DocuSeal y registra flow en Supabase
    ▼
DocuSeal envía emails a firmantes
    │
    ▼
Firmante firma en DocuSeal
    │
    ▼
DocuSeal → POST /api/dms/webhooks/docuseal  (con HMAC SHA-256)
    │ Nexus verifica firma, actualiza estado, descarga PDF
    ▼
document_signature_flows.flow_status = "signed"
document_versions.immutable = True
generated_documents.status = "signed"
PDF almacenado en bucket dms-signed
```

---

## Prerrequisitos

| Variable de entorno | Descripción |
|---|---|
| `DOCUSEAL_API_KEY` | API key de DocuSeal |
| `DOCUSEAL_BASE_URL` | URL base de DocuSeal (ej: `https://docuseal.co`) |
| `DOCUSEAL_WEBHOOK_SECRET` | Secreto para verificar HMAC de webhooks |
| `DOCUSEAL_TEMPLATE_ID` | ID de la plantilla genérica en DocuSeal (opcional) |

---

## Payload de solicitud de firma

### Multi-signer (recomendado)

```http
POST /api/dms/generated-documents/{id}/signature-flows
Authorization: Bearer <token>
Content-Type: application/json

{
  "signing_level": "simple",
  "signers": [
    { "email": "comprador@email.com", "name": "Juan Comprador", "role": "buyer" },
    { "email": "vendedor@email.com", "name": "Ana Vendedora", "role": "seller" },
    { "email": "agente@inmobiliaria.com", "name": "Pedro Agente", "role": "agent" }
  ]
}
```

### Single-signer (backward compatible)

```http
POST /api/dms/generated-documents/{id}/signature-flows
{
  "signer_email": "comprador@email.com",
  "signer_name": "Juan Comprador",
  "signer_role": "buyer"
}
```

---

## Niveles de firma

| `signing_level` | Descripción | Validez legal España |
|---|---|---|
| `simple` | Firma electrónica básica (click-to-sign) | Válida para contratos privados |
| `advanced` | Firma electrónica avanzada (OTP, biometría) | Válida para mayoría de contratos |
| `qualified` | Firma electrónica cualificada (certificado digital) | Equiparada a firma manuscrita |

Para compraventas, se recomienda al menos `advanced`.

---

## Roles de firmante

| `role` | Descripción |
|---|---|
| `buyer` | Comprador/Arrendatario |
| `seller` | Vendedor/Arrendador |
| `agent` | Agente inmobiliario |
| `witness` | Testigo |
| `guarantor` | Avalista |

---

## Webhook DocuSeal

### Configuración en DocuSeal

URL del webhook: `https://api.tudominio.com/api/dms/webhooks/docuseal`  
Header de firma: `x-docuseal-signature` (HMAC-SHA256 del body)  
Eventos suscritos:
- `submission.completed`
- `submission.declined`
- `submission.expired`

### Verificación HMAC

```python
import hmac, hashlib

expected = hmac.new(
    DOCUSEAL_WEBHOOK_SECRET.encode(),
    body_bytes,
    hashlib.sha256
).hexdigest()

if not hmac.compare_digest(expected, received_sig):
    raise HTTPException(401, "Invalid webhook signature")
```

Si `DOCUSEAL_WEBHOOK_SECRET` no está configurado, la verificación se omite (solo en desarrollo).

### Eventos manejados

| Evento | Acción en Nexus |
|---|---|
| `submission.completed` | `flow_status = signed`, descarga PDF, marca versión inmutable, status doc = `signed` |
| `submission.declined` | `flow_status = declined`, status doc vuelve a `approved` |
| `submission.expired` | `flow_status = expired`, status doc vuelve a `approved` |

---

## Inmutabilidad post-firma

Tras `submission.completed`:

1. `document_versions.immutable = True` — el editor bloquea edición
2. `document_signature_flows.audit_trail` se actualiza con los datos de firma (firmante, IP, timestamp)
3. El PDF firmado se descarga de `document_url` en el webhook y se sube a `dms-signed/{org_id}/{doc_id}/signed.pdf`

### Verificación de inmutabilidad

```python
# En el editor:
if version.get("immutable") or version.get("is_signed_immutable"):
    raise HTTPException(409, "Version is immutable (signed). Create a new document.")
```

---

## Flujo de error y reintento

- Si el webhook falla (DocuSeal no recibe 2xx en <5s), reintenta hasta 3 veces con backoff
- Si la descarga del PDF falla, `flow_status` se mantiene en `pending_download` y se reintenta en el siguiente ciclo
- Los errores de webhook se logean en `audit_trail` con `event: "webhook_error"`

---

## Consultar estado de una firma

```http
GET /api/dms/generated-documents/{id}/signature-flows
```

```json
[{
  "id": "flow-uuid",
  "flow_status": "signed",
  "signing_level": "simple",
  "signers": [{ "email": "...", "name": "...", "role": "buyer" }],
  "initiated_by": "user-uuid",
  "initiated_at": "2026-06-14T...",
  "audit_trail": [...]
}]
```
