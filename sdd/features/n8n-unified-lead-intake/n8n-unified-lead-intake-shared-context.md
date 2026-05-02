# n8n Unified Lead Intake — Shared Context v1.1

## Contexto compartido

Esta feature forma parte del pipeline de captación y prospección de Anclora Nexus.

Su misión es unificar la entrada de leads desde múltiples fuentes externas, pero **sin saltarse el backend de Nexus**.

## Repositorios involucrados

```txt
anclora-nexus
anclora-private-estates-landing
n8n workspace
```

## Features relacionadas

### Ya implementadas / prerequisitos

```txt
landing-hero-optimization
lead-ingestion-webhook
```

### Posteriores / dependientes

```txt
nexus-matching-engine
n8n-nurturing-sequences
synergi-partner-onboarding
```

## Arquitectura actual

```txt
External lead source
   ↓
n8n Unified Lead Intake
   ↓
POST /api/ingestion/leads
   ↓
Anclora Nexus backend
   ↓
leads + ingestion_events
```

## Decisión técnica principal

La versión anterior planteaba:

```txt
n8n → Supabase directo
```

La versión v1.1 corrige el enfoque:

```txt
n8n → Nexus API
```

Motivo:

- Centralizar validación Pydantic.
- Evitar duplicar lógica de negocio.
- Mantener deduplicación e idempotencia en un único sitio.
- Conservar `ingestion_events`.
- Evitar exponer claves Supabase en n8n.
- Preparar Matching y Nurturing sobre datos limpios.

## Dependencias técnicas

### Backend

Endpoint:

```txt
POST /api/ingestion/leads
```

Campos críticos:

```txt
org_id
external_id
connector_name
source_system
source_channel
source_detail
gdpr_consent
name
email
phone
budget
property_interest
qualification_score
qualification_tier
metadata
```

### n8n

Variables recomendadas:

```txt
NEXUS_API_BASE_URL=https://anclora-nexus.onrender.com
NEXUS_DEFAULT_ORG_ID=<uuid-org>
TONI_EMAIL=<email-interno>
NEXUS_INGESTION_API_KEY=<solo-si-aplica>
```

Variables no permitidas para escritura directa:

```txt
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_KEY
```

## Clasificación

La clasificación puede empezar con reglas simples y sin coste:

```txt
Seller
Buyer
HNWI
Unknown
```

Ejemplos:

- `sell`, `selling`, `valuation`, `property owner`, `mandate`, `villa owner` → Seller
- `buy`, `investment`, `looking for`, `budget`, `searching` → Buyer
- `family office`, `HNWI`, `private investor`, `off-market`, `luxury buyer` → HNWI

## Scoring operativo

Score 0-100.

Ponderación inicial sugerida:

```txt
Budget / asset value: 40%
Location fit: 30%
Intent / urgency: 20%
Source quality: 10%
```

Umbrales:

```txt
Hot: 70-100
Warm: 40-69
Cold: 0-39
```

## Human Approval Gate

En esta feature, Human Approval Gate significa:

```txt
Hot lead
   ↓
guardar en Nexus
   ↓
notificar internamente a Toni
   ↓
esperar revisión humana antes de cualquier contacto externo
```

No significa enviar contacto automático.

## Fuentes iniciales

| Fuente | Estado |
|---|---|
| Landing Private Estates | Debe conectarse por webhook o payload directo |
| HNWI Prospection v2 | Debe adaptarse explícitamente |
| Dux-Soup | Preparado como fuente LinkedIn |
| PhantomBuster | Preparado como fuente LinkedIn |
| Partner referrals | Preparado para Synergi |
| Alta manual | Preparado como fallback |

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Duplicar leads por varias fuentes | Usar `external_id` estable + dedupe backend |
| Enviar contactos sin consentimiento | Esta feature no envía mensajes externos |
| Exponer Supabase keys en n8n | No usar escritura directa Supabase |
| Workflow HNWI queda desconectado | Añadir integración obligatoria en test plan |
| Payload incompatible con backend | Validar contrato antes de crear JSON definitivo |

## Estado actual

```txt
READY_FOR_N8N_IMPORT
```

Pendiente:

- Crear/importar JSON n8n v1.1.
- Conectar o documentar HNWI Prospection v2.
- Ejecutar smoke test real.
- Subir gate a `PRODUCTION_READY` solo si el test pasa.

---

**Fin del Shared Context v1.1**
