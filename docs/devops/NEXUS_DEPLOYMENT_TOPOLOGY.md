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
SYNCXML_ENV=staging
ALLOW_REAL_SUPABASE_WRITE=false
USE_SYNTHETIC_DATA_ONLY=true
SYNCXML_PILOT_AUTO_APPROVE=false
```

En este modo, el backend no debe crear usuarios piloto reales, no debe autoaprobar solicitudes, no debe escribir datos reales peligrosos en Supabase y no debe invocar acciones internas destructivas de SyncXML.

## Operational note

El guard crítico debe vivir en el servicio real de Nexus (`backend/services/syncxml_pilot_service.py`), no solo en scripts de smoke.
