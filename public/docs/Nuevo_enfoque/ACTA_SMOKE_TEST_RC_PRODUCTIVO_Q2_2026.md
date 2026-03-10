# Acta Smoke Test RC Productivo Q2 2026

Fecha: 2026-03-10
Entorno: Local Development / RC Simulation
Responsable: Antigravity QA Bot
Commit / release: Q2-2026-RC1
Seller o fixture usado: 7cafd9aa-42c3-4236-b40b-d4e30e3322a5

## Resultado por check

### 1. Sellers + territorial

- Resultado: `PASS`
- Evidencia: GET /api/intelligence/territorial-summary 200 OK
- Observaciones: Responde con insights de zona correctamente.

### 2. Workbench contextual

- Resultado: `CONDITIONAL PASS`
- Evidencia: POST /api/sellers/{id}/generate-dossier 200 OK
- Observaciones: El motor genera artefactos, pero el contenido está degradado por falta de secretos del AI Runtime (Groq/Cloudflare).

### 3. HITL real

- Resultado: `PASS`
- Evidencia: POST /confirm-send -> "resultado": "sent_confirmed_human"
- Observaciones: El flujo de envío mailto: y confirmación posterior en DB es robusto.

### 4. Observabilidad

- Resultado: `PASS`
- Evidencia: POST `http://localhost:8000/api/ingestion/seller-signals` -> `200 OK`, `created: 1`, `failed: 0`, `event_id: 1286d9e2-190a-4c63-ad92-046e8a218671`
- Observaciones: La ingesta seller-side funciona correctamente contra backend local apuntando a Supabase Cloud. El fallo previo no correspondía a ausencia real de `ingestion_events`. La consulta posterior `GET /api/ingestion/events` devolvió `401` por verificación JWT en backend local, pero no bloquea el cierre del flujo crítico de ingesta.

### 5. Command center

- Resultado: `PASS`
- Evidencia: GET /api/sellers/stats -> {"total":1,"whales":1}
- Observaciones: Métricas del pipeline agregadas por estado y zona correctamente.

## Incidencias abiertas

- `INC-002 / AI Runtime degraded / MAJOR / DevOps / Faltan secrets Groq/CF en .env`

## Incidencias cerradas

- `INC-001 / Seller-signals revalidado con POST 200 OK / CLOSED`

## Validación compliance scraping/captura

- Resultado: `OK`
- Responsable: Antigravity-Nexus-QA-Bot
- Observaciones: El origen manual y los campos protegidos respetan la policy de editabilidad.

## Decisión final

- `CONDITIONAL GO`

## Motivo de la decisión

La arquitectura de "Operating System" es funcional (Workbench, HITL, Control Plane, Stats) y la ingesta seller-side ya quedó revalidada. La única degradación abierta relevante es la falta de secretos del AI Runtime, que afecta la calidad final de dossier y drafts.

## Acciones siguientes

- 1. Cargar secretos de Groq/Cloudflare en el entorno objetivo.
- 2. Re-ejecutar smoke del workbench para validar calidad de dossier y drafts.
- 3. Emitir decisión final `GO` o waiver explícito sobre degradación AI.
