# n8n Unified Lead Intake — Especificación Técnica v1.1

## 1. Descripción

Workflow n8n para recibir, normalizar, clasificar y enviar leads al backend de Anclora Nexus.

Esta versión sustituye el enfoque anterior de escritura directa en Supabase por un enfoque backend-first:

```txt
n8n → POST /api/ingestion/leads → Nexus backend
```

## 2. Objetivos técnicos

- Unificar payloads de varias fuentes.
- Validar mínimos antes de enviar al backend.
- Generar trazabilidad.
- Calcular score operativo.
- Enviar el lead al endpoint canónico.
- Notificar internamente leads Hot.
- No realizar contacto externo.

## 3. Endpoint destino

```txt
POST {{NEXUS_API_BASE_URL}}/api/ingestion/leads
```

Headers:

```txt
Content-Type: application/json
x-api-key: {{NEXUS_INGESTION_API_KEY}}   # solo si el backend lo exige
```

## 4. Variables de entorno

```txt
NEXUS_API_BASE_URL
NEXUS_DEFAULT_ORG_ID
TONI_EMAIL
NEXUS_INGESTION_API_KEY
```

No usar para escritura:

```txt
SUPABASE_URL
SUPABASE_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## 5. Nodos del workflow

### Nodo 1 — Webhook Trigger

Tipo:

```txt
Webhook
```

Configuración:

```txt
Path: /webhook/unified-lead-intake
Method: POST
Response Mode: Using Respond to Webhook node
```

Responsabilidad:

- Recibir payload de landing, HNWI, LinkedIn automation, Facebook, partners o alta manual.

### Nodo 2 — Parse & Normalize

Tipo:

```txt
Code / Function
```

Responsabilidad:

- Normalizar nombres de campos.
- Convertir budget/precio a número.
- Normalizar teléfono/email.
- Inferir fuente si el origen no viene informado.
- Preparar metadatos.

Salida mínima:

```json
{
  "name": "Lead Name",
  "email": "lead@example.com",
  "phone": "+34600000000",
  "budget": 1500000,
  "property_interest": "Villa premium",
  "source_system": "social",
  "source_channel": "linkedin",
  "source_detail": "HNWI Prospection v2 - Anclora Nexus (Improved)"
}
```

### Nodo 3 — Validate Required Fields

Tipo:

```txt
Code / IF
```

Reglas:

- Debe existir `name` o `email` o `phone`.
- Debe existir `source_system`.
- Debe existir `source_channel`.
- Para landing/formulario debe existir `gdpr_consent = true`.
- Si no hay consentimiento en fuentes de prospección, marcar `metadata.pending_review = true`.

Errores esperados:

```txt
missing_identity
missing_source
gdpr_consent_required
invalid_payload
```

### Nodo 4 — Classify Seller/Buyer/HNWI

Tipo:

```txt
Code / Function
```

Clasificaciones:

```txt
seller
buyer
hnwi
unknown
```

Método inicial:

- Keywords.
- Budget.
- Zona.
- Texto de interés.
- Fuente.
- Señales HNWI.

### Nodo 5 — Calculate Lead Score

Tipo:

```txt
Code / Function
```

Score:

```txt
0-100
```

Ponderación inicial:

```txt
Budget / asset value: 40%
Location fit: 30%
Intent / urgency: 20%
Source quality: 10%
```

Tiers:

```txt
hot: score >= 70
warm: score >= 40 and score < 70
cold: score < 40
```

### Nodo 6 — Build Nexus Payload

Tipo:

```txt
Code / Function
```

Responsabilidad:

- Crear payload compatible con `LeadIngestionPayload`.
- Generar `external_id` si falta.
- Generar `trace_id` si falta.
- Añadir `org_id`.

Payload objetivo:

```json
{
  "org_id": "00000000-0000-0000-0000-000000000000",
  "external_id": "hnwi-linkedin-test-001",
  "connector_name": "hnwi-prospection:linkedin",
  "trace_id": "n8n-12345-2026-05-02T10:00:00Z",
  "source_system": "social",
  "source_channel": "linkedin",
  "source_detail": "HNWI Prospection v2 - Anclora Nexus (Improved)",
  "source_url": "https://linkedin.com/in/example",
  "source_referrer": null,
  "gdpr_consent": true,
  "gdpr_consent_at": "2026-05-02T10:00:00.000Z",
  "gdpr_consent_text_version": "v1",
  "captured_at": "2026-05-02T10:00:00.000Z",
  "name": "Test HNWI Lead",
  "email": "test@example.com",
  "phone": "+34600000000",
  "budget": 1500000,
  "property_interest": "Villa premium en Calvià",
  "notes": "Lead normalizado desde n8n",
  "nationality": "DE",
  "zone_interest": "Calvià",
  "qualification_score": 78,
  "qualification_tier": "hot",
  "hnwi_intent_signal": "premium_property_interest",
  "email_verified": false,
  "email_verification_source": null,
  "hnwi_source_channel": "linkedin",
  "metadata": {
    "workflow": "n8n-unified-lead-intake",
    "origin_workflow": "HNWI Prospection v2 - Anclora Nexus (Improved)",
    "classification": "hnwi"
  }
}
```

### Nodo 7 — Save to Nexus API

Tipo:

```txt
HTTP Request
```

Configuración:

```txt
Method: POST
URL: {{$env.NEXUS_API_BASE_URL}}/api/ingestion/leads
Send Body: JSON
Content-Type: application/json
```

Responsabilidad:

- Enviar payload al backend.
- Recoger respuesta.
- No escribir directamente en Supabase.

### Nodo 8 — IF Hot Lead?

Tipo:

```txt
IF
```

Condición:

```txt
qualification_tier === "hot"
```

### Nodo 9 — Notify Toni

Tipo:

```txt
Email Send / Gmail / SMTP / Slack / Telegram interno
```

Responsabilidad:

- Notificar lead Hot.
- Incluir nombre, fuente, score, zona, presupuesto y link al origen.
- No contactar al lead.

### Nodo 10 — Respond to Webhook

Tipo:

```txt
Respond to Webhook
```

Respuestas:

#### Éxito

```json
{
  "status": "accepted",
  "trace_id": "n8n-...",
  "qualification_tier": "hot"
}
```

#### Duplicado / idempotente

```json
{
  "status": "duplicate",
  "trace_id": "n8n-..."
}
```

#### Error validación

```json
{
  "status": "rejected",
  "error": "gdpr_consent_required",
  "trace_id": "n8n-..."
}
```

### Nodo 11 — Error Handler

Tipo:

```txt
Error Trigger / Error Workflow / Code
```

Responsabilidad:

- Capturar errores de validación.
- Capturar errores HTTP 4xx/5xx.
- Devolver respuesta controlada.
- Notificar internamente si hay error crítico.
- No reintentar indefinidamente sin control.

## 6. Integración con HNWI Prospection v2

Workflow existente:

```txt
HNWI Prospection v2 - Anclora Nexus (Improved)
```

Debe terminar llamando a:

```txt
POST /api/ingestion/leads
```

O bien llamar al subworkflow `n8n-unified-lead-intake`.

Campos mínimos para HNWI:

```txt
source_system: social
source_channel: linkedin / facebook / other
connector_name: hnwi-prospection:<channel>
source_detail: HNWI Prospection v2 - Anclora Nexus (Improved)
hnwi_source_channel: linkedin / facebook / reddit / google-alert / other
```

## 7. Seguridad

- No incluir claves Supabase.
- No incluir secrets hardcoded en el JSON.
- Usar variables de entorno de n8n.
- No enviar contacto externo.
- No inventar consentimiento GDPR.

## 8. Artefacto esperado

```txt
sdd/features/n8n-unified-lead-intake/artifacts/n8n_unified_lead_intake_workflow_v1_1.json
```

## 9. Estado de implementación

Estado inicial tras actualizar SDD:

```txt
READY_FOR_N8N_IMPORT
```

Estado tras importar JSON:

```txt
READY_FOR_SMOKE_TEST
```

Estado tras test real:

```txt
PRODUCTION_READY
```

---

**Fin de la Especificación Técnica v1.1**
