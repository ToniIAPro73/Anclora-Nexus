# Rule - ANCLORA-PAA-001

## Objetivo

Definir una arquitectura de acceso privado coherente entre `Anclora Private Estates`, `Anclora Nexus`, `Synergi` y `Data Lab`, sin mezclar login interno, portales externos y acceso analitico.

## Reglas obligatorias

1. `Private Estates` debe seguir siendo la puerta publica del ecosistema.
2. `Nexus` solo debe reutilizar el login del portal de agente; no debe absorber visualmente `Synergi` ni `Data Lab`.
3. Toda redireccion basada en `next` debe sanitizarse para evitar open redirects.
4. Toda superficie nueva debe respetar:
   - `surface-primary`
   - `surface-secondary`
   - `surface-copy-safe`
   - `page-title`
   - `page-subtitle`
5. Toda copy nueva debe entrar en `frontend/src/lib/i18n/translations.ts`.
6. `Partner` y `Data Lab` deben quedar expuestos como portales publicos o de admision controlada, no como rutas privadas que exijan membership Nexus.
7. La capa de acceso debe preservar multilenguaje y semantica de portal:
   - `agent`
   - `partner`
   - `data_lab`

## No hacer

- No redirigir cualquier acceso privado automaticamente a `/dashboard`.
- No usar rutas externas sin contrato centralizado.
- No reintroducir modales ambiguos para `Partner` y `Data Lab` en `Private Estates`.
- No mezclar auth de Nexus con la futura admision de `Synergi` o `Data Lab`.
