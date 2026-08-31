# Variables de Entorno - Anclora Nexus Pilot (GuestHub)

Este documento detalla las variables de entorno necesarias para el flujo del piloto controlado en Nexus.

> Renombrado 2026-08: Anclora SyncXML → Anclora GuestHub. Los nombres canónicos son
> `GUESTHUB_*`; el backend acepta los nombres legados `SYNCXML_*` como fallback durante
> la transición. Las URLs de ejemplo siguen en el despliegue legado
> `anclora-syncxml.vercel.app` hasta que el owner decida el nuevo dominio.

## anclora-nexus

| Variable | Obligatoria | Entorno | Ejemplo | Descripción |
|----------|-------------|---------|---------|-------------|
| `SUPABASE_URL` | Sí | Todos | `https://xyz.supabase.co` | URL del proyecto Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Todos | `ey...` | Role key para backend en Supabase. |
| `PUBLIC_CTA_ORG_ID` | Sí | Todos | `00000000-0000-0000-0000-000000000000` | ID org base. |
| `LEGACY_SINGLE_TENANT_ORG_ID` | No | Todos | `...` | Fallback. |
| `GUESTHUB_WEBHOOK_SECRET` | Sí | Staging, Prod | `secret-webhook` | Secreto para validar webhook desde GuestHub (legado `SYNCXML_WEBHOOK_SECRET`). |
| `GUESTHUB_INTERNAL_API_URL` | Sí | Staging, Prod | `https://anclora-syncxml.vercel.app/api/internal/pilot-users` | URL de la API de provisión de GuestHub (legado `SYNCXML_INTERNAL_API_URL`). |
| `GUESTHUB_INTERNAL_API_SECRET` | Sí | Staging, Prod | `super-secret-local` | Secreto para autenticar la API interna de GuestHub (legado `SYNCXML_INTERNAL_API_SECRET`). |
| `GUESTHUB_APP_URL` | Sí | Staging, Prod | `https://anclora-syncxml.vercel.app` | URL pública de GuestHub (legado `SYNCXML_APP_URL`). |
| `GUESTHUB_LOGIN_URL` | Sí | Staging, Prod | `https://anclora-syncxml.vercel.app/login` | URL de login de GuestHub (legado `SYNCXML_LOGIN_URL`). |
| `HERMES_WORKER_URL` | Sí | Staging, Prod | `https://hermes.test` | URL de Hermes Worker. |
| `HERMES_WORKER_API_KEY` | Sí | Staging, Prod | `hermes-key` | API Key de Hermes. |
| `RESEND_API_KEY` | Sí | Staging, Prod | `re_123...` | API Key de correos. |
| `RESEND_FROM_EMAIL` | Sí | Staging, Prod | `Piloto <piloto@anclora.com>` | Email remitente. |
