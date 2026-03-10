# Spec v1.2 - Supervised Email & WhatsApp Send

Feature ID: `ANCLORA-SEWS-001`

## Objetivo v1.2
Pasar de un flujo HITL basado solo en `mailto` a un email nativo trazable cuando exista transporte SMTP configurado, manteniendo `mailto` y `wa.me` como fallback.

## Alcance
- transporte `native_email` por SMTP
- persistencia de `transport` en metadata
- feedback de delivery visible en seller workbench
- recuento de envíos nativos en command center
- compatibilidad con el flujo previo `mailto` + `confirm-send`

## Contrato
- `POST /api/sellers/{id}/send-supervised/email` acepta `transport=auto|mailto|native_email`
- `native_email` devuelve:
  - `status=sent_natively`
  - `transport=native_email`
  - `delivery.provider`
  - `delivery.message_id`
- `mailto` mantiene:
  - `status=ready_for_human_send`
  - `launch_url`
  - confirmación posterior por `confirm-send`

## Reglas
- `native_email` solo se dispara por acción explícita de una persona.
- Si SMTP no está configurado, `auto` resuelve a `mailto`.
- `whatsapp` sigue en `wa_me`.
- Todo envío debe quedar trazado en `seller_interactions`.

## Criterios de aceptación
1. Con SMTP configurado, el endpoint envía email real y devuelve trazabilidad.
2. Sin SMTP, el endpoint sigue funcionando por `mailto`.
3. El workbench expone disponibilidad de email nativo y último delivery email.
4. Command center cuenta `sent_native_supervised` además de `sent_confirmed_human`.
