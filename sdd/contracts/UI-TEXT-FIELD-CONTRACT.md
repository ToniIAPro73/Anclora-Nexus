# UI Text Field Contract

Fecha: `2026-05-05`
Estado: `ACTIVE`
Ámbito: `anclora-nexus`, `frontend/src/app`, `frontend/src/components`
Tipo de app: `INTERNAL`

## Objetivo

Unificar todos los campos de texto de Anclora Nexus para que `input` y `textarea` compartan la misma gramática visual, foco, contraste y jerarquía dentro de una aplicación INTERNAL.

Este contrato actúa como contrato subordinado de:

```text
sdd/contracts/ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md
```

## Autoridad

Leer y aplicar en este orden:

```text
1. ToniIAPro73/boveda-anclora/docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md
2. ToniIAPro73/boveda-anclora/docs/standards/ANCLORA_BRANDING_MASTER_CONTRACT.md
3. ToniIAPro73/boveda-anclora/docs/standards/ANCLORA_INTERNAL_APP_CONTRACT.md
4. ToniIAPro73/anclora-design-system/docs/design-system-audit-and-target-architecture.md
5. docs/standards/ANCLORA_INTERNAL_APP_CONTRACT.md
6. sdd/contracts/ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md
7. sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md
8. sdd/contracts/UI-SELECT-FIELD-CONTRACT.md
9. sdd/contracts/UI-BOOLEAN-FIELD-CONTRACT.md
```

Si este contrato entra en conflicto con la bóveda o con `anclora-design-system`, prevalecen la bóveda y el design system.

## Criterio INTERNAL

Los campos de Nexus deben priorizar:

```text
legibilidad > rapidez de edición > consistencia > decoración
```

Por tanto:

- no crear campos con tratamiento editorial o luxury.
- no usar estilos inline estructurales de borde, radio, foco o color.
- el foco dorado debe funcionar como acento operativo de Nexus.
- los textos largos, emails, IDs y notas deben permanecer dentro del contenedor.

## Primitivas

- `ui-input`: input estándar de formulario para altas, filtros y edición.
- `ui-input-ghost`: input embebido en wrappers de búsqueda o shells compactos.
- `ui-textarea`: textarea estándar con el mismo borde, radio y foco que `ui-input`.

## Reglas

1. Todo `input[type=text|email|number|url|tel|search]` nuevo debe usar `ui-input` o `ui-input-ghost`.
2. Todo `textarea` nuevo debe usar `ui-textarea`.
3. No introducir estilos inline ni nuevas variantes ad hoc de borde, radio, fondo o foco.
4. Si el campo vive dentro de un wrapper con icono, el wrapper puede cambiar; el campo no.
5. El contrato no aplica a `checkbox`, `radio`, `file` ni toggles.
6. Todo campo debe tener label visible o label accesible, según patrón existente.
7. El placeholder no sustituye al label.
8. Los errores deben mostrarse cerca del campo afectado o en un resumen claro de formulario.
9. Los campos deshabilitados deben mantener contraste suficiente.
10. El autofill no debe romper dark mode ni legibilidad.

## Estados

- `default`
- `hover`
- `focus`
- `disabled`
- `error`, si el patrón existe o se implementa en la feature

## Gate de aceptación

Un formulario nuevo no está terminado si:

- mezcla más de un patrón visual de `input`.
- usa `textarea` con radio, foco o fondo distintos sin excepción documentada.
- deja campos sin label visible/accesible.
- usa placeholder como única explicación del campo.
- deja placeholder, valor, error o ayuda con contraste insuficiente.
- usa estilos inline estructurales para controles cubiertos por el contrato.
- ignora `ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md`.
