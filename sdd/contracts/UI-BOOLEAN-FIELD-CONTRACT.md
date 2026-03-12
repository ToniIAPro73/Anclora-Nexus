# UI Boolean Field Contract

Fecha: `2026-03-12`
Estado: `ACTIVE`
Ámbito: `frontend/src/app`, `frontend/src/components`

## Objetivo

Unificar todos los campos booleanos visibles de la aplicación para que `checkbox`, `radio` y toggles compartan la misma gramática visual y no aparezcan mezclados estilos nativos.

Relacionado:
- `sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md`
- `sdd/contracts/UI-SELECT-FIELD-CONTRACT.md`
- `sdd/contracts/UI-TEXT-FIELD-CONTRACT.md`

## Primitivas

- `ui-checkbox`
  - control booleano base
  - check premium con foco oro y contraste uniforme
- `ui-checkbox-row`
  - fila o wrapper estándar para checkbox con label
  - misma densidad y mismo borde en toda la app

## Reglas

1. Todo `input[type=checkbox]` nuevo debe usar `ui-checkbox`.
2. Si el checkbox tiene label visible, el contenedor debe usar `ui-checkbox-row`.
3. No se permiten checkboxes nativos sin clase ni `accent-*` sueltos como patrón final.
4. Si aparece un `radio` o `toggle` nuevo, debe derivar de este mismo contrato y documentarse antes de introducir una tercera gramática.

## Gate de aceptación

Un formulario nuevo no está terminado si:

- mezcla checkboxes nativos con `ui-checkbox`
- usa wrappers distintos para el mismo patrón booleano
- deja focos o estados `checked` con colores diferentes al contrato
