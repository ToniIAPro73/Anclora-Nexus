# Spec v1.1 - Supervised Email & WhatsApp Send

Feature ID: `ANCLORA-SEWS-001`

## Objetivo v1.1
Endurecer el flujo HITL ya existente para uso diario:
- guardado de canales
- payload de lanzamiento estable
- encoding seguro de URLs
- confirmación de envío auditable

## Alcance
- `PATCH /api/sellers/{id}` cubierto como parte explícita del flujo
- `POST /api/sellers/{id}/send-supervised/{channel}`
- `POST /api/sellers/{id}/interactions/{interaction_id}/confirm-send`
- tests de contratos de update y confirmación

## Criterios de aceptación
1. Los canales de contacto pueden persistirse por API.
2. `mailto:` y `wa.me` salen del backend con encoding seguro.
3. La interacción pasa de `programado` a `realizado` tras confirmación humana.
