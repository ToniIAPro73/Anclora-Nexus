# Nexus Deployment Topology

## Current baseline

- Frontend: Vercel (`/frontend`)
- Backend: Render (`/backend`)
- Auth and database: Supabase
- No Supabase Pro
- No Supabase Branching
- No dedicated staging Supabase guaranteed

## Staging Safety Guards

Cuando Nexus staging comparte Supabase con producción, el backend debe operar en modo seguro.

Variables recomendadas para staging:

```env
APP_ENV=staging
GUESTHUB_ENV=staging
ALLOW_REAL_SUPABASE_WRITE=false
USE_SYNTHETIC_DATA_ONLY=true
GUESTHUB_PILOT_AUTO_APPROVE=false
```

(Los nombres legados `SYNCXML_ENV` y `SYNCXML_PILOT_AUTO_APPROVE` siguen aceptados como fallback tras el renombrado SyncXML → GuestHub de 2026-08.)

En este modo, el backend no debe crear usuarios piloto reales, no debe autoaprobar solicitudes, no debe escribir datos reales peligrosos en Supabase y no debe invocar acciones internas destructivas de GuestHub.

## Operational note

El guard crítico debe vivir en el servicio real de Nexus (`backend/services/syncxml_pilot_service.py`), no solo en scripts de smoke.
