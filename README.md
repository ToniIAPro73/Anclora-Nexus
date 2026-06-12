# Anclora Nexus, capa de inteligencia

Workspace operativo interno de Nexus sobre Next.js con frontend en `frontend/` y gobierno SDD en `sdd/`.

## Entrada rápida

- app principal: `frontend/`
- contratos SDD existentes: `sdd/contracts/`
- reglas y gobernanza de agentes: `.agent/rules/`

## Scripts raíz

- `npm run dev`
- `npm run build`
- `npm run frontend:lint`

## Contratos UX/UI

Lectura mínima antes de tocar interfaz:

1. `docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md`
2. `docs/standards/ANCLORA_INTERNAL_APP_CONTRACT.md`
3. `docs/standards/UI_MOTION_CONTRACT.md`
4. `docs/standards/MODAL_CONTRACT.md`
5. `docs/standards/LOCALIZATION_CONTRACT.md`

## Contrato operativo actual

- familia contractual: `Internal`
- branding: `Interna`
- tema operativo: `dark`
- idiomas objetivo Internal: `es/ca/en/de`
- idiomas activos con copy completa: `es/en/de`
- `ca`: pendiente de localización; no se activa hasta pasar Locale Copy Guardian
- `light`: posible futuro, no requisito actual

## Branding y activos

- tipografía principal: `Inter`
- accent Nexus: oro `#D4AF37`
- base dark Nexus: `#0F1629`, `#141C3A`, `#192350`
- el favicon package final y el logo definitivo se integrarán con los assets canónicos del usuario cuando estén listos

## Nota

`anclora-nexus` mantiene además contratos específicos en `sdd/contracts/`. Esos documentos siguen vigentes y concretan la implementación interna del grupo `Internal`.

## Global Preferences Toggle

Esta app sigue el contrato global de preferencias de Anclora Group.

Incluye:

- idioma
- moneda, porque muestra importes
- unidades, porque muestra superficies/medidas

El Theme Toggle se gestiona por separado y solo aparece en grupos Premium, Internal y Portfolio.
