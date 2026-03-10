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

- Resultado: `FAIL`
- Evidencia: POST /api/ingestion/seller-signals -> Error PGRST205 (missing ingestion_events)
- Observaciones: La tabla `ingestion_events` sí existe en Supabase Cloud y acepta `seller_signal`. El fallo observado apunta a caché de esquema de PostgREST o desalineación de entorno durante el smoke. Sigue bloqueando la ingesta automatizada hasta revalidación.

### 5. Command center

- Resultado: `PASS`
- Evidencia: GET /api/sellers/stats -> {"total":1,"whales":1}
- Observaciones: Métricas del pipeline agregadas por estado y zona correctamente.

## Incidencias abiertas

- `INC-001 / PGRST205 en seller-signals por caché de esquema PostgREST o env mismatch / CRITICAL / Backend-DevOps / Requiere reload schema y re-smoke`
- `INC-002 / AI Runtime degraded / MAJOR / DevOps / Faltan secrets Groq/CF en .env`

## Validación compliance scraping/captura

- Resultado: `OK`
- Responsable: Antigravity-Nexus-QA-Bot
- Observaciones: El origen manual y los campos protegidos respetan la policy de editabilidad.

## Decisión final

- `CONDITIONAL GO`

## Motivo de la decisión

La arquitectura de "Operating System" es funcional (Workbench, HITL, Control Plane, Stats) pero requiere remediar el acceso operativo al endpoint `seller-signals` y completar la configuración de las APIs de IA para ser 100% productivo.

## Acciones siguientes

- 1. Ejecutar `notify pgrst, 'reload schema';` en Supabase Cloud.
- 2. Repetir `POST /api/ingestion/seller-signals` en el mismo entorno del smoke.
- 3. Validar que frontend/backend apuntan al proyecto Supabase correcto si el error persiste.
- 4. Cargar secretos de Groq/Cloudflare.
- 5. Re-ejecutar Smoke Test completo.
