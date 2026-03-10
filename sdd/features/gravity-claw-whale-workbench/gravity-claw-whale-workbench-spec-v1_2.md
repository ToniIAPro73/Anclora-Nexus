# SPEC: GRAVITY CLAW WHALE WORKBENCH V1.2

**Feature ID**: ANCLORA-GCWW-001  
**Status**: Extension  
**Owner**: Product + CTO

## Contexto

Tras BL-009 ya existe memoria semántica seller-side, pero la workbench seguía exponiendo memoria, artefactos e historial como bloques paralelos. Faltaba convertir ese contexto en decisión comercial operativa.

## Objetivo v1.2

Transformar la workbench en una consola comercial real que indique:

- canal recomendado
- siguiente paso
- readiness operativa
- highlights de memoria recuperada

## Requisitos funcionales

### RF-01 Consola comercial
- `GET /api/sellers/{seller_id}/workbench` debe devolver un bloque `console`.
- `console` debe incluir:
  - `readiness`
  - `recommended_channel`
  - `next_action`
  - `reasons`
  - `last_touch_at`
  - `memory_focus_terms`
  - `memory_highlights`

### RF-02 Decision explicable
- La recomendación debe derivarse de:
  - estado comercial actual del seller
  - artefactos disponibles
  - canales de contacto persistidos
  - highlights de memoria recuperada

### RF-03 Surface operativa
- El `SellerDrawer` debe mostrar la consola antes que los artefactos.
- La vista debe seguir siendo útil si no hay memoria o si la migración `043` no está aplicada.

## No funcionales

- Sin migración nueva adicional en esta feature.
- Sin nuevo panel separado.
- Sin automatización outbound no supervisada.

## Criterios de aceptación

1. La workbench expone un `console` backend-driven.
2. El drawer presenta siguiente paso y canal recomendado.
3. La recomendación se mantiene explicable y degradable.
