# RUNBOOK — n8n Unified Lead Intake v1.1

Este runbook detalla los pasos para poner en producción el workflow unificado de ingesta de leads.

## 1. Requisitos Previos

- Instancia de n8n operativa.
- Backend de Anclora Nexus accesible (local o producción).
- `NEXUS_DEFAULT_ORG_ID`: `9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf` (o el que corresponda).
- `NEXUS_API_BASE_URL`: URL base del API de Nexus.

## 2. Importación del Workflow

1. En n8n, cree un nuevo workflow.
2. Haga clic en el menú (tres puntos) y seleccione **Import from File**.
3. Seleccione el archivo `artifacts/n8n_unified_lead_intake_workflow_v1_1.json`.
4. Configure las variables de entorno en n8n:
   - `NEXUS_DEFAULT_ORG_ID`
   - `NEXUS_API_BASE_URL`

## 3. Configuración de Fuentes

### 3.1 Landing Anclora Private Estates
Configure el formulario de la landing para que envíe el payload al webhook generado por el nodo **Webhook Trigger**.

### 3.2 HNWI Prospection v2 (Improved)
En el workflow de HNWI Prospection, añada un nodo final de **Execute Workflow** apuntando a este workflow unificado, o envíe un **HTTP Request** al webhook de ingesta.

### 3.3 Otras Fuentes (LinkedIn, FB, etc.)
Cualquier automatización externa debe enviar un POST al webhook de n8n con el contrato definido en el `LeadIngestionPayload`.

## 4. Validación (Smoke Test)

Ejecute el siguiente comando para validar que el sistema está listo para recibir leads desde n8n:

```bash
curl -i -X POST "http://localhost:8000/api/ingestion/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "org_id": "9d6cb56d-3f21-4f7b-80ea-797a7c2c62cf",
    "external_id": "smoke-test-n8n-001",
    "connector_name": "n8n-unified-intake:smoke-test",
    "source_system": "social",
    "source_channel": "linkedin",
    "source_detail": "Smoke Test Runbook",
    "gdpr_consent": true,
    "name": "Smoke Test Lead",
    "email": "smoke.test@example.com",
    "phone": "+34600000000",
    "budget": 1500000,
    "property_interest": "Villa en Calvià",
    "qualification_score": 85,
    "qualification_tier": "hot"
  }'
```

## 5. Verificación en Nexus

1. Compruebe los logs del backend.
2. Verifique en la base de datos:
   ```sql
   SELECT * FROM leads WHERE external_id = 'smoke-test-n8n-001';
   SELECT * FROM ingestion_events WHERE external_id = 'smoke-test-n8n-001';
   ```

## 6. Notificaciones (Human Approval Gate)

El nodo **Notify Toni** es un No-Op por defecto. Debe ser sustituido por un nodo de:
- **Email (SMTP/Gmail)**
- **Slack**
- **WhatsApp (Evolution API)**

Para enviar la alerta a Toni cuando se detecta un Lead Hot.
