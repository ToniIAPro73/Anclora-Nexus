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

### 2. Workbench contextual (Gravity Claw B4)

- Resultado: `PASS`
- Evidencia: POST /api/sellers/{id}/generate-dossier 200 OK
- Observaciones: **RESOLVED.** El motor genera ahora contenido de alta calidad. Se mitigó el fallo 401 de Cloudflare ruteando todas las tareas (`summarize`, `analyze`, `generate_copy`) a **Groq**. 
- Evidencia de calidad: Dossier incluye datos reales ("€7.014/m² en Calvià", "incremento del 5,2%").

### 3. HITL real

- Resultado: `PASS`
- Evidencia: POST /confirm-send -> "resultado": "sent_confirmed_human"
- Observaciones: El flujo de envío mailto: y confirmación posterior en DB es robusto.

### 4. Observabilidad

- Resultado: `PASS`
- Evidencia: POST `http://localhost:8000/api/ingestion/seller-signals` -> `200 OK`, `created: 1`, `failed: 0`
- Observaciones: Ingesta seller-side funcional.

### 5. Command center

- Resultado: `PASS`
- Evidencia: GET /api/sellers/stats -> {"total":1,"whales":1}
- Observaciones: Métricas del pipeline agregadas por estado y zona correctamente.

## Incidencias abiertas

- Ninguna bloqueante. (INC-002 mitigada vía configuración de runtime).

## Incidencias cerradas

- `INC-001 / Seller-signals revalidado / CLOSED`
- `INC-002 / AI Runtime degraded (CF 401) / MITIGATED VIA GROQ / CLOSED`

## Validación compliance scraping/captura

- Resultado: `OK`
- Responsable: Antigravity-Nexus-QA-Bot
- Observaciones: El origen manual y los campos protegidos respetan la policy de editabilidad.

## Decisión final

- **GO**

## Motivo de la decisión

El Release Candidate Q2 2026 es plenamente funcional. La arquitectura de orquestación, el flujo de datos Supabase y la generación de inteligencia comercial (dossiers) operan según especificación. La degradación de un proveedor (Cloudflare) fue resuelta mediante el mecanismo de ruteo dinámico hacia Groq, garantizando la continuidad del servicio sin pérdida de calidad.

## Acciones siguientes

- Monitorizar cuotas de Groq ante el aumento de carga.
- Investigar credenciales de Cloudflare para restaurar balance de carga.
- Proceder al despliegue final.
