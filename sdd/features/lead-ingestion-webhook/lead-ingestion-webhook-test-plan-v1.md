# Lead Ingestion Webhook - Test Plan v1

## Casos de Prueba

### Test 1: Lead Válido de Landing
- Payload completo → 200 OK → Lead guardado en Supabase

### Test 2: Lead Sin GDPR Consent
- Payload sin gdpr_consent → 400 Bad Request

### Test 3: Lead Inválido (Email Malformado)
- Email inválido → 422 Unprocessable Entity

### Test 4: Conexión con n8n
- Formulario de Landing → Webhook n8n → Lead guardado

---

**Fin del Test Plan**