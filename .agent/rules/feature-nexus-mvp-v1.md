---
trigger: always_on
---

# Feature Rules: Nexus MVP v1

## Jerarquia normativa
1) `sdd/core/constitution-canonical.md`
2) `.agent/rules/workspace-governance.md`
3) `.agent/rules/anclora-nexus.md`
4) `sdd/features/nexus-mvp-v1/nexus-mvp-v1-spec-v1.md`

## Reglas inmutables

- El MVP reduce superficie visible, no autoriza borrar capacidades existentes.
- Toda simplificacion de navegacion debe respetar i18n, temas y continuidad visual.
- `sellers`, `leads`, `properties` y `tasks` son el nucleo funcional del MVP.
- `prospection-unified` solo se mantiene si sirve a priorizacion operativa y matching ligero.
- `command-center`, `partner-network`, `automation`, `data-quality`, `ingestion` y derivados quedan fuera de la sidebar principal mientras dure `MVP v1`.

## Reglas de implementacion

- Priorizar cambios reversibles.
- Ocultar o despriorizar antes que eliminar.
- Si una feature no-MVP necesita seguir accesible, mantener su ruta intacta.
- No introducir nombres fijos en UI que rompan traducciones existentes.
- No usar el MVP para abrir un rediseño global del shell.

## Stop rules

- No eliminar tablas, endpoints o paginas solo para “limpiar” alcance.
- No romper contratos de features existentes sin una migracion explicita.
- No ampliar la navegacion principal mas alla del flujo MVP sin decision expresa.
