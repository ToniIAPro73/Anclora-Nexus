# Lead Ingestion Webhook - Especificación Técnica v1

## 1. Descripción

Endpoint de ingesta de leads con validación y conexión a n8n.

## 2. Endpoint Nexus

Ver `PROMPT_DIA3_N8N_WEBHOOK.md`

## 3. Workflow n8n

4 nodos:
1. Webhook Trigger
2. Parse & Normalize
3. Save to Supabase
4. Respond to Webhook

## 4. Conexión con Landing

Ver código en `PROMPT_DIA3_N8N_WEBHOOK.md`

---

**Fin de la Especificación**