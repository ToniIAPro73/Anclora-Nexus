# UI Select Field Contract

Fecha: `2026-05-05`
Estado: `ACTIVE`
Ámbito: `anclora-nexus`, `frontend/src/app`, `frontend/src/components`
Tipo de app: `INTERNAL`

## Objetivo

Unificar todos los campos de listas de valores en Anclora Nexus, manteniendo una gramática operativa, accesible y alineada con la bóveda y con `anclora-design-system`.

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
8. sdd/contracts/UI-TEXT-FIELD-CONTRACT.md
9. sdd/contracts/UI-BOOLEAN-FIELD-CONTRACT.md
```

Si este contrato entra en conflicto con la bóveda o con `anclora-design-system`, prevalecen la bóveda y el design system.

## Criterio INTERNAL

Los selects de Nexus deben priorizar:

```text
claridad de decisión > rapidez de filtrado > consistencia > decoración
```

Por tanto:

- no crear selects con tratamiento editorial o luxury.
- no mezclar selects nativos sin clase con selects estilizados.
- no crear estilos inline de `option`.
- el foco/acento debe seguir la gramática INTERNAL de Nexus.

## Primitivas

- `ui-select`
  - select standalone estándar.
  - borde, radio, color y foco únicos.
- `ui-select-ghost`
  - select embebido dentro de shells o wrappers con icono.
  - mantiene el mismo dropdown y el mismo comportamiento de foco.

## Reglas

1. Todo select nuevo debe usar `ui-select` o `ui-select-ghost`.
2. No crear estilos inline de `option`.
3. No mezclar más de un patrón visual de select en la misma pantalla.
4. Si el select está dentro de un frame secundario, el frame puede variar; el select no.
5. El dropdown nativo debe mantener fondo oscuro operativo y texto claro.
6. El chevron visual es parte del contrato.
7. Todo select debe tener label visible o accesible.
8. El estado disabled debe mantener contraste suficiente.
9. El valor seleccionado no debe truncar información crítica salvo que exista alternativa visible.

## Estados

- `default`
- `hover`
- `focus`
- `disabled`
- `error`, si el patrón existe o se implementa en la feature

## Gate de aceptación

Un formulario o filtro nuevo no está terminado si:

- usa un select sin `ui-select` o `ui-select-ghost`.
- mezcla selects con estilos distintos sin excepción documentada.
- introduce estilos inline de `option`.
- deja el valor seleccionado ilegible.
- usa una gramática Premium/Ultra Premium en una vista INTERNAL.
- ignora `ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md`.
