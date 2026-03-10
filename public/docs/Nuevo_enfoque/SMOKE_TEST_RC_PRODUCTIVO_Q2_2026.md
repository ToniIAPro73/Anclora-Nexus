# Smoke Test RC Productivo Q2 2026

Fecha objetivo: `2026-03-10`

Objetivo: validar en entorno real o sandbox controlado que el perímetro `BL-001` a `BL-011` funciona end-to-end con datos frescos, sin depender de logs técnicos.

## Regla de ejecución

- Ejecutar en este orden.
- No avanzar al siguiente bloque si el anterior falla.
- Registrar evidencia mínima: timestamp, actor, resultado, enlace/captura o payload.
- Si un bloque falla, marcar `FAIL`, abrir incidencia y mantener el RC en `CONDITIONAL GO`.

## Precheck

- [ ] Supabase Cloud correcto y migraciones `040-043` aplicadas
- [ ] Frontend desplegado con build actual
- [ ] Backend desplegado con commit actual
- [ ] Variables runtime activas para AI runtime y Supabase
- [ ] Usuario owner operativo con acceso a `/sellers`, `/command-center`, `/source-observatory`, `/automation-alerting`

## Bloque 1. Territorial control plane

- [ ] Ejecutar `GET /api/intelligence/territorial-summary`
- [ ] Confirmar que devuelve `zones_with_data` no vacío
- [ ] Confirmar que `/sellers` renderiza oportunidades territoriales reales
- [ ] Confirmar que el estado territorial en `/command-center` no aparece como `unknown`

Criterio PASS:
- respuesta 200
- datos territoriales visibles en UI
- sin degradación inesperada

## Bloque 2. Ingestión seller-side

- [ ] Inyectar o capturar un `seller_signal` real/controlado
- [ ] Confirmar persistencia en `ingestion_events`
- [ ] Confirmar derivación a `nexus_sellers`
- [ ] Verificar que el seller aparece en `/sellers`

Criterio PASS:
- evento procesado
- seller creado o actualizado
- trazabilidad visible en observatorio/flujo seller-side

## Bloque 3. StateFox bridge y live capture

- [ ] Validar pantalla `/intelligence/statefox-bridge`
- [ ] Confirmar readiness operativo del bridge
- [ ] Si se usa live capture, importar una captura válida y verificar `import_ready = true`
- [ ] Verificar que no se genera alerta crítica inesperada tras el flujo controlado

Criterio PASS:
- bridge usable
- capture importable o bridge listo
- sin degradación oculta

## Bloque 4. Gravity Claw workbench

- [ ] Abrir un seller P4/P5 en `/sellers`
- [ ] Generar dossier desde el drawer
- [ ] Confirmar persistencia de `dossier`, `email_draft`, `whatsapp_draft`, `call_brief`, `context_brief`
- [ ] Confirmar que la consola contextual muestra `recommended_channel` y `next_action`

Criterio PASS:
- workbench genera artefactos
- consola contextual no queda vacía
- drawer sigue usable tras recarga

## Bloque 5. Supervised send HITL

- [ ] Persistir `email_contacto` y/o `whatsapp_contacto`
- [ ] Lanzar `send-supervised/email` o `send-supervised/whatsapp`
- [ ] Confirmar apertura de `mailto:` o `wa.me`
- [ ] Ejecutar confirmación humana y verificar interacción `sent_confirmed_human`

Criterio PASS:
- payload HITL válido
- confirmación registrada
- estado del seller y workbench coherentes

## Bloque 6. Seller memory semantic recall

- [ ] Ejecutar rebuild o refresco de memoria en el drawer
- [ ] Confirmar `memory.status = ready`
- [ ] Confirmar que aparecen matches con `reasons` y `matched_keywords`
- [ ] Confirmar que el siguiente paso del workbench refleja contexto recuperado

Criterio PASS:
- memoria usable
- retrieval explicable
- impacto visible en consola contextual

## Bloque 7. Observabilidad y alertado

- [ ] Revisar `/source-observatory`
- [ ] Confirmar que las fuentes activas reflejan actividad reciente
- [ ] Revisar `/automation-alerting`
- [ ] Confirmar que no hay alertas críticas no explicadas

Criterio PASS:
- observabilidad consistente con el flujo ejecutado
- alertas solo si son esperables

## Bloque 8. Command center ejecutivo

- [ ] Abrir `/command-center`
- [ ] Confirmar métricas de coste, señales seller-side, sellers creados y envíos confirmados
- [ ] Confirmar que trends mensuales incluyen pipeline seller-side
- [ ] Confirmar que dirección puede leer estado sin revisar logs

Criterio PASS:
- command center refleja el flujo recién ejecutado
- visibilidad ejecutiva suficiente

## Resultado final

- `GO`:
  - todos los bloques en PASS
  - sin riesgo crítico de compliance abierto

- `CONDITIONAL GO`:
  - flujos principales en PASS
  - incidencias menores con workaround documentado

- `NO-GO`:
  - falla cualquier bloque 2, 4, 5, 6, 7 u 8
  - o aparece riesgo crítico de compliance

## Evidencia mínima a registrar

- fecha/hora
- entorno
- actor que ejecuta
- seller/test fixture usado
- resultado por bloque (`PASS/FAIL`)
- incidencia asociada si existe
