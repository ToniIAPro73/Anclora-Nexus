# SPEC: GRAVITY CLAW WHALE WORKBENCH V1

**Feature ID**: ANCLORA-GCWW-001  
**Status**: Implemented  
**Owner**: Product + CTO

## 1. Contexto

Fase 4 ya disponia de tabla `seller_interactions` y skill `whale_dossier`, pero la experiencia seguia incompleta: habia un dossier y un email, no una workbench comercial real para retomar la relacion con un seller.

## 2. Problema

- No existia una vista agregada con seller + historial + artefactos activos.
- Faltaba multicanal: solo email.
- No habia resumen de contexto para retomar la conversacion sin releer todo.
- El comercial no podia registrar llamadas, reuniones o notas desde la ficha.

## 3. Objetivos

1. Consolidar Gravity Claw como mesa de trabajo por seller.
2. Persistir artefactos reutilizables en la memoria operativa actual.
3. Permitir logging manual de interacciones sin salir de `/sellers`.
4. Evitar una migracion nueva mientras el esquema actual soporte la feature.

## 4. Requisitos funcionales

### RF-01 Workbench agregado
- Nuevo endpoint `GET /api/sellers/{seller_id}/workbench`.
- Devuelve:
  - `seller`
  - `interactions`
  - `latest_artifacts`
  - `snapshot`

### RF-02 Generacion multicanal
- `POST /api/sellers/{seller_id}/generate-dossier` debe generar y persistir:
  - dossier / argumentario
  - email draft
  - WhatsApp draft
  - call brief
  - context brief

### RF-03 Logging manual
- La ficha del seller debe permitir registrar manualmente:
  - llamada
  - email
  - WhatsApp
  - reunion
  - nota

### RF-04 Reutilizacion operativa
- Los artefactos deben poder copiarse rapidamente.
- Los drafts outbound deben abrir cliente email / WhatsApp web cuando aplique.

## 5. Requisitos no funcionales

- Sin cambio de esquema en v1.
- Artefactos tipificados con `metadata.artifact`.
- Sin envio automatico real a canales externos.
- Mantener compatibilidad con el endpoint actual `generate-dossier`.

## 6. API/Backend

- `GET /api/sellers/{seller_id}/workbench`
- `POST /api/sellers/{seller_id}/generate-dossier` ampliado
- `POST /api/sellers/{seller_id}/interactions` reutilizado

## 7. Frontend

- `SellerDrawer` como workbench comercial:
  - resumen de contexto
  - call brief
  - email draft
  - WhatsApp draft
  - dossier
  - formulario de registro manual
  - historial completo

## 8. Seguridad

- Mantener aislamiento por `org_id`.
- No exponer secretos ni credenciales de proveedor.
- No automatizar envio externo sin HITL.

## 9. Criterios de aceptacion

1. Un seller de prioridad alta puede generar workbench multicanal desde la ficha.
2. El comercial puede copiar y reutilizar email, WhatsApp y briefing de llamada.
3. El comercial puede registrar una llamada o nota y verla en el historial inmediatamente.
4. El backend conserva contratos previos sin migracion adicional.
