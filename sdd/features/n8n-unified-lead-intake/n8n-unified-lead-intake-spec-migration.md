# n8n Unified Lead Intake — Spec Migration v1.1

## Resumen

Esta feature **no requiere migración de base de datos** si la feature `lead-ingestion-webhook` ya está implementada correctamente.

La persistencia final se delega al backend de Anclora Nexus mediante:

```txt
POST /api/ingestion/leads
```

## Cambio respecto a v1

La versión anterior decía:

```txt
El workflow usa la tabla existente nexus_leads.
```

Eso queda obsoleto.

La versión v1.1 establece:

```txt
El workflow no escribe directamente en Supabase.
El workflow llama al endpoint backend de ingesta.
El backend decide cómo persistir en leads e ingestion_events.
```

## Base de datos

No crear:

```txt
nexus_leads
```

No modificar directamente:

```txt
leads
ingestion_events
```

salvo que el backend `lead-ingestion-webhook` demuestre necesitar un ajuste real.

## Variables de entorno en n8n

Añadir:

```txt
NEXUS_API_BASE_URL=https://anclora-nexus.onrender.com
NEXUS_DEFAULT_ORG_ID=<uuid-org>
TONI_EMAIL=<email-interno>
NEXUS_INGESTION_API_KEY=<solo-si-el-backend-lo-exige>
```

No añadir para esta feature:

```txt
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_KEY
SUPABASE_URL como destino de escritura
```

## Secretos

Si el endpoint exige API key:

```txt
Header: x-api-key
Value: {{$env.NEXUS_INGESTION_API_KEY}}
```

Si no exige API key, no inventar seguridad en n8n sin modificar backend.

## Impacto sobre n8n

Crear o actualizar artefacto:

```txt
sdd/features/n8n-unified-lead-intake/artifacts/n8n_unified_lead_intake_workflow_v1_1.json
```

El nodo de persistencia debe ser:

```txt
HTTP Request
Method: POST
URL: {{$env.NEXUS_API_BASE_URL}}/api/ingestion/leads
Content-Type: application/json
```

## Impacto sobre HNWI Prospection v2

El workflow existente debe ser integrado por una de estas vías:

```txt
1. Añadir HTTP Request final a POST /api/ingestion/leads.
2. Llamar al workflow unificado mediante Execute Workflow.
```

## Rollback

Rollback funcional:

```txt
1. Desactivar workflow n8n-unified-lead-intake.
2. Desactivar nodo HTTP Request añadido a HNWI Prospection v2.
3. Mantener endpoint backend intacto.
4. Revisar ingestion_events para detectar leads parciales o duplicados.
```

No se requiere rollback SQL salvo que otro cambio haya modificado schema.

## Validación post-migración

```txt
[ ] n8n no contiene credenciales Supabase de escritura.
[ ] n8n llama a POST /api/ingestion/leads.
[ ] Un lead de prueba queda registrado.
[ ] La respuesta duplicate/idempotente se gestiona sin error crítico.
[ ] Hot lead notifica a Toni.
[ ] GDPR false se rechaza o queda marcado como revisión según origen.
```

---

**Fin de Spec Migration v1.1**
