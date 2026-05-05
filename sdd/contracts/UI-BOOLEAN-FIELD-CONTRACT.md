# UI Boolean Field Contract

Fecha: `2026-05-05`
Estado: `ACTIVE`
Ámbito: `anclora-nexus`, `frontend/src/app`, `frontend/src/components`
Tipo de app: `INTERNAL`

## Objetivo

Unificar todos los campos booleanos visibles de Anclora Nexus para que `checkbox`, `radio` y toggles compartan una gramática operativa, accesible y alineada con la bóveda y con `anclora-design-system`.

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
9. sdd/contracts/UI-TEXT-FIELD-CONTRACT.md
```

Si este contrato entra en conflicto con la bóveda o con `anclora-design-system`, prevalecen la bóveda y el design system.

## Criterio INTERNAL

Los booleanos de Nexus deben priorizar:

```text
claridad de consentimiento/estado > accesibilidad > consistencia > decoración
```

Por tanto:

- no se permiten checkboxes nativos sin clase como patrón final.
- no se permiten estilos `accent-*` sueltos como solución final.
- el foco/acento debe seguir la gramática INTERNAL de Nexus.
- el label debe explicar con claridad la decisión o estado.

## Relacionado

- `sdd/contracts/ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md`
- `sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md`
- `sdd/contracts/UI-SELECT-FIELD-CONTRACT.md`
- `sdd/contracts/UI-TEXT-FIELD-CONTRACT.md`

## Primitivas

- `ui-checkbox`
  - control booleano base.
  - check operativo con foco dorado y contraste uniforme.
- `ui-checkbox-row`
  - fila o wrapper estándar para checkbox con label.
  - misma densidad y mismo borde en toda la app.

## Reglas

1. Todo `input[type=checkbox]` nuevo debe usar `ui-checkbox`.
2. Si el checkbox tiene label visible, el contenedor debe usar `ui-checkbox-row`.
3. No se permiten checkboxes nativos sin clase ni `accent-*` sueltos como patrón final.
4. Si aparece un `radio` o `toggle` nuevo, debe derivar de este mismo contrato y documentarse antes de introducir una tercera gramática.
5. Todo booleano debe tener label visible o accesible.
6. Los consentimientos deben ser explícitos y no depender solo del placeholder o de texto contextual lejano.
7. El estado `checked`, `focus`, `disabled` y `error` debe ser legible en dark mode.
8. En listas densas, la separación entre booleanos debe permitir lectura rápida sin errores de selección.

## Gate de aceptación

Un formulario nuevo no está terminado si:

- mezcla checkboxes nativos con `ui-checkbox`.
- usa wrappers distintos para el mismo patrón booleano.
- deja focos o estados `checked` con colores diferentes al contrato.
- usa `accent-*` suelto como patrón final.
- deja booleanos sin label visible/accesible.
- mezcla gramática Premium/Ultra Premium en una vista INTERNAL.
- ignora `ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md`.
