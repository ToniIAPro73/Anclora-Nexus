# Spec v1 - Supervised Email & WhatsApp Send

Feature ID: `ANCLORA-SEWS-001`

## Problema
Gravity Claw generaba drafts y export/share, pero no existía un flujo supervisado real para lanzar email o WhatsApp y dejar auditoría consistente.

## Objetivo
Cerrar el outreach HITL de Fase 4 con:
- canales de contacto persistidos
- payload backend estable por canal
- apertura de cliente real desde UI
- confirmación humana de envío
- auditoría de interacción programada -> realizada

## Entregables
- migración 040 para `email_contacto`, `telefono_contacto`, `whatsapp_contacto`
- `PATCH /api/sellers/{id}` para guardar canales
- `POST /api/sellers/{id}/send-supervised/{channel}`
- `POST /api/sellers/{id}/interactions/{interaction_id}/confirm-send`
- UI en SellerDrawer para guardar canales, lanzar y confirmar

## Regla HITL
El sistema no envía automáticamente. El humano abre el cliente real y confirma que el envío se ha realizado.
