# Anclora Nexus Internal App Contract

Fecha: `2026-05-05`
Estado: `ACTIVE`
Ámbito: `anclora-nexus`, `frontend/src/app/(dashboard)`, `frontend/src/components`, features operativas internas

## Objetivo

Alinear las pantallas internas de Anclora Nexus con la bóveda (`ToniIAPro73/boveda-anclora`) y con `anclora-design-system`, manteniendo Nexus como aplicación **INTERNAL**.

Nexus debe priorizar:

```text
claridad operativa > densidad útil > consistencia > estética editorial
```

Este contrato aplica a features como:

- solicitudes de acceso
- revisión de leads
- tareas internas
- dashboards operativos
- modales de aprobación/rechazo
- tablas, filtros y colas de backoffice

## Autoridad

La bóveda gobierna contratos, clasificación, branding por grupo, excepciones y trazabilidad.

`anclora-design-system` gobierna la implementación o referencia ejecutable de UI: taxonomía, tokens, themes, foundations, components, patterns y assets.

Nexus no debe crear una tercera fuente de verdad local para botones, cards, modales, shell, tipografía, iconografía, color o tokens si ya existe una pieza canónica o una regla contractual superior.

## Fuentes obligatorias

Leer en este orden cuando la feature toca UI, tablas, forms, modales, shell, navegación o branding:

```text
1. ToniIAPro73/boveda-anclora/docs/standards/ANCLORA_ECOSYSTEM_CONTRACT_GROUPS.md
2. ToniIAPro73/boveda-anclora/docs/standards/ANCLORA_BRANDING_MASTER_CONTRACT.md
3. ToniIAPro73/boveda-anclora/docs/standards/ANCLORA_INTERNAL_APP_CONTRACT.md
4. ToniIAPro73/anclora-design-system/docs/design-system-audit-and-target-architecture.md
5. docs/standards/ANCLORA_INTERNAL_APP_CONTRACT.md
6. docs/standards/MODAL_CONTRACT.md
7. docs/standards/LOCALIZATION_CONTRACT.md
8. docs/standards/UI_MOTION_CONTRACT.md
9. sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md
10. sdd/contracts/UI-SURFACE-INTERACTION-CONTRACT.md
11. sdd/contracts/UI-TEXT-FIELD-CONTRACT.md
12. sdd/contracts/UI-SELECT-FIELD-CONTRACT.md
13. sdd/contracts/UI-BOOLEAN-FIELD-CONTRACT.md
```

## Clasificación

`anclora-nexus` está clasificada como aplicación **INTERNAL**.

Contrato objetivo:

```text
Idiomas: es / en / de / ru
Tema: dark operativo principal
Uso: backoffice, operaciones, revisión, decisión, automatización supervisada
Branding group: Internal
```

## Branding INTERNAL aplicado a Nexus

La bóveda agrupa las reglas de branding por tipo de aplicación. Para Nexus aplica el grupo **Interna / INTERNAL**.

Reglas de branding para `anclora-nexus`:

```text
Grupo: Interna / INTERNAL
Tipografía: Inter
Borde de icono: plata cromada
Accent de app: #D4AF37
Hue: 45°
Símbolo fundacional: círculo + tres ondas horizontales
```

Implicaciones:

- El oro `#D4AF37` en Nexus es acento operativo, no lenguaje ultra premium.
- Nexus puede usar oro para acción, estado, énfasis o marca, pero no debe adoptar una estética luxury/landing.
- El tratamiento visual debe seguir la gramática INTERNAL: legibilidad, densidad, contraste y velocidad de revisión.
- No usar tipografías reservadas para Ultra Premium como lenguaje principal de pantallas internas.
- No modificar proporciones, geometría ni sistema del icono fundacional.
- No crear variantes locales de color si el token semántico existe o debe promoverse al design system.

Regla de separación:

```text
Nexus comparte accent gold con Anclora Private Estates, pero no comparte gramática visual.
Nexus = internal operational gold.
Private Estates = ultra premium editorial gold.
```

## Reglas de implementación

### 1. Usar capas del design system

Toda UI nueva debe buscar primero una equivalencia en estas capas del design system:

```text
taxonomy
tokens
themes
foundations
components
patterns
assets
```

El design system todavía puede estar en fase de consolidación. Si no existe un componente empaquetado consumible, la implementación en Nexus debe seguir la semántica contractual y no inventar variantes visuales arbitrarias.

### 2. Mantener la gramática interna

Nexus debe mantener una UX operativa:

- jerarquía clara
- lectura rápida
- densidad útil
- estados visibles
- acciones previsibles
- contraste suficiente
- wrapping seguro de texto técnico, IDs y emails

Evitar tratamientos propios de landing pública, hero editorial o ultra premium si reducen velocidad de revisión.

### 3. Primitivas obligatorias

Pantallas nuevas deben usar las primitivas actuales cuando existan:

```text
page-title
page-subtitle
section-title
section-subtitle
surface-primary
surface-secondary
surface-copy-safe
btn-action
btn-create
ui-input
ui-input-ghost
ui-textarea
```

No introducir clases ad hoc para resolver casos cubiertos por contratos.

## Shell interno

Toda pantalla de dashboard debe respetar:

- navegación persistente
- estado activo inequívoco
- cabecera operativa con contexto
- acciones principales limitadas
- preferencias de usuario en el área ya definida por el shell

No cambiar el patrón de navegación entre vistas equivalentes sin documentar una razón funcional.

## Tablas, listas y colas

Las vistas operativas deben mostrar siempre:

```text
estado
identidad principal
contexto operativo
fecha o prioridad
acción siguiente
```

Para `AccessRequest`, columnas recomendadas:

```text
Fecha
Producto
Fuente
Nombre
Email
Estado
Idioma
Acción
```

Filtros mínimos:

```text
status
product
source
search by name/email
```

## Formularios internos

Todo formulario nuevo debe cumplir:

- label visible siempre
- placeholder solo como ayuda
- errores debajo del campo o en resumen superior
- `input` con `ui-input` o `ui-input-ghost`
- `textarea` con `ui-textarea`
- select según `UI-SELECT-FIELD-CONTRACT`
- checkbox/toggle según `UI-BOOLEAN-FIELD-CONTRACT`
- sin estilos inline de borde, foco, radio o color salvo excepción documentada
- autofill no debe romper dark mode ni contraste

## Modales internos

Se aplica `docs/standards/MODAL_CONTRACT.md`.

Reglas específicas para Nexus:

- modal ancho, drawer o página dedicada antes que columna larga con scroll
- cierre superior derecho siempre visible
- footer con acciones claras
- aprobar/rechazar deben ser acciones diferenciadas
- acciones irreversibles deben ser confirmables o claramente explicadas
- si el contenido crece, el scroll debe vivir en un bloque concreto antes que en todo el modal

Para solicitudes de acceso, el modal debe separar:

```text
datos del solicitante
producto/fuente/estado
uso previsto o resumen del servicio
consentimientos
notas internas
decisión
```

## Estados obligatorios

Toda pantalla nueva debe implementar:

```text
loading
empty
error
success/updated si hay mutación
```

No se permite ausencia silenciosa de contenido.

## Localización

Se aplica `docs/standards/LOCALIZATION_CONTRACT.md`.

Reglas:

- no mezclar idiomas en una misma pantalla
- no hardcodear strings visibles si existe patrón i18n en el repo
- mapear estados técnicos a labels humanos
- diseñar para expansión de copy en `es/en/de/ru`

## Motion

Se aplica `docs/standards/UI_MOTION_CONTRACT.md`.

Para Nexus:

- motion corto y funcional
- no teatral
- sin rebotes o transiciones largas
- hover/focus consistente por familia de superficie
- respetar reduced motion si existe patrón

## Excepciones

Una excepción local solo es válida si:

- responde a necesidad operativa clara
- no contradice la bóveda
- no contradice el design system
- queda documentada en la feature o en `docs/standards/`

## Gate de aceptación

Una feature interna de Nexus no está lista si:

- introduce una variante local de botón, modal, card, tabla o shell sin justificar
- rompe contratos `sdd/contracts`
- ignora `ANCLORA_INTERNAL_APP_CONTRACT`
- ignora `ANCLORA_BRANDING_MASTER_CONTRACT` cuando toca marca, color, iconografía o tipografía
- usa una gramática ultra premium/landing en una vista operativa
- trata el oro de Nexus como lenguaje luxury en lugar de acento operativo
- deja textos técnicos fuera de contenedor
- omite loading/empty/error states
- añade modal con scroll evitable
- mezcla idiomas visibles
- introduce estilos inline estructurales para controles ya cubiertos por contratos
