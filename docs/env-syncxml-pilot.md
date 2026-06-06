# Variables de Entorno - Anclora Nexus Pilot

Este documento detalla las variables de entorno necesarias para el flujo del piloto controlado en Nexus.

## anclora-nexus

| Variable | Obligatoria | Entorno | Ejemplo | Descripción |
|----------|-------------|---------|---------|-------------|
| `SUPABASE_URL` | Sí | Todos | `https://xyz.supabase.co` | URL del proyecto Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Todos | `ey...` | Role key para backend en Supabase. |
| `PUBLIC_CTA_ORG_ID` | Sí | Todos | `00000000-0000-0000-0000-000000000000` | ID org base. |
| `LEGACY_SINGLE_TENANT_ORG_ID` | No | Todos | `...` | Fallback. |
| `SYNCXML_WEBHOOK_SECRET` | Sí | Staging, Prod | `secret-webhook` | Secreto para validar webhook desde SyncXML. |
| `SYNCXML_INTERNAL_API_URL` | Sí | Staging, Prod | `https://anclora-syncxml.vercel.app/api/internal/pilot-users` | URL de la API de provisión de SyncXML. |
| `SYNCXML_INTERNAL_API_SECRET` | Sí | Staging, Prod | `super-secret-local` | Secreto para autenticar la API interna de SyncXML. |
| `SYNCXML_APP_URL` | Sí | Staging, Prod | `https://anclora-syncxml.vercel.app` | URL pública de SyncXML. |
| `SYNCXML_LOGIN_URL` | Sí | Staging, Prod | `https://anclora-syncxml.vercel.app/login` | URL de login de SyncXML. |
| `HERMES_WORKER_URL` | Sí | Staging, Prod | `https://hermes.test` | URL de Hermes Worker. |
| `HERMES_WORKER_API_KEY` | Sí | Staging, Prod | `hermes-key` | API Key de Hermes. |
| `RESEND_API_KEY` | Sí | Staging, Prod | `re_123...` | API Key de correos. |
| `RESEND_FROM_EMAIL` | Sí | Staging, Prod | `Piloto <piloto@anclora.com>` | Email remitente. |