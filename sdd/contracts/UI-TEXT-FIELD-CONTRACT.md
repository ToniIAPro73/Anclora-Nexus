# UI Text Field Contract

Fecha: `2026-03-12`
Estado: `ACTIVE`
Ámbito: `frontend/src/app`, `frontend/src/components`

## Objetivo

Unificar todos los campos de texto de la aplicación para que `input` y `textarea` compartan la misma gramática visual, foco y jerarquía.

Relacionado:
- `sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md`
- `sdd/contracts/UI-SELECT-FIELD-CONTRACT.md`

## Primitivas

- `ui-input`
  - input estándar de formulario
  - uso por defecto en altas, filtros y edición
- `ui-input-ghost`
  - input embebido en wrappers de búsqueda o shells compactos
  - mantiene el mismo foco y contraste
- `ui-textarea`
  - textarea estándar
  - mismo borde, radio y foco que `ui-input`

## Reglas

1. Todo `input[type=text|email|number|url|tel]` nuevo debe usar `ui-input` o `ui-input-ghost`.
2. Todo `textarea` nuevo debe usar `ui-textarea`.
3. No introducir estilos inline ni nuevas variantes ad hoc de borde, radio o foco.
4. Si el campo vive dentro de un wrapper con icono, el wrapper puede cambiar; el campo no.
5. El contrato no aplica a `checkbox`, `radio`, `file` ni toggles.

## Estados

- `default`
- `hover`
- `focus`
- `disabled`

## Gate de aceptación

Un formulario nuevo no está terminado si:

- mezcla más de un patrón visual de `input`
- usa `textarea` con radio, foco o fondo distintos sin excepción documentada
- deja campos sin placeholder legible o con contraste insuficiente
