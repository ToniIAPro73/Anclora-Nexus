# UI Page Primitives Contract

Fecha: `2026-05-05`
Estado: `ACTIVE`
Ámbito: `anclora-nexus`, `frontend/src/app/(dashboard)`, `frontend/src/components`
Tipo de app: `INTERNAL`

## Objetivo

Toda pantalla nueva de Anclora Nexus debe construirse con una jerarquía visual consistente, operativa y alineada con la bóveda y con `anclora-design-system`.

Este contrato regula títulos, subtítulos, botones, spacing, KPIs y uso de surfaces/cards. Actúa como contrato subordinado de:

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
7. sdd/contracts/UI-SURFACE-INTERACTION-CONTRACT.md
8. sdd/contracts/UI-SELECT-FIELD-CONTRACT.md
9. sdd/contracts/UI-TEXT-FIELD-CONTRACT.md
10. sdd/contracts/UI-BOOLEAN-FIELD-CONTRACT.md
```

Si este contrato entra en conflicto con la bóveda o con `anclora-design-system`, prevalecen la bóveda y el design system.

## Criterio INTERNAL

Nexus debe priorizar:

```text
claridad operativa > densidad útil > consistencia > estética editorial
```

Por tanto:

- no usar gramática ultra premium/landing en vistas de dashboard.
- no tratar el oro `#D4AF37` como lenguaje luxury; en Nexus es acento operativo.
- no introducir escalas editoriales de títulos salvo excepción documentada.
- no usar tipografías reservadas para Premium/Ultra Premium como base de dashboard.

## Relacionado

- `sdd/contracts/ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md`
- `sdd/contracts/UI-SURFACE-INTERACTION-CONTRACT.md`
- `sdd/contracts/UI-SELECT-FIELD-CONTRACT.md`
- `sdd/contracts/UI-TEXT-FIELD-CONTRACT.md`
- `sdd/contracts/UI-BOOLEAN-FIELD-CONTRACT.md`

## Contrato obligatorio

1. El título principal de pantalla debe usar `page-title`.
2. El subtítulo o texto de contexto de cabecera debe usar `page-subtitle`.
3. La escala de `page-title` toma como referencia la pantalla `Prospección`; ninguna pantalla nueva debe usar un título principal mayor sin excepción documentada.
4. Los títulos de bloque internos deben usar `section-title`.
5. Los subtítulos o texto de apoyo de bloque deben usar `section-subtitle`.
6. Las etiquetas KPI deben usar `kpi-label`, los valores `kpi-value` y el contexto `kpi-meta`.
7. La acción principal de la pantalla debe usar `btn-action`.
8. Las acciones secundarias o de creación deben usar `btn-create`.
9. Los cards y frames deben respetar `surface-primary`, `surface-secondary` y `surface-copy-safe`.
10. Todo texto técnico o de backend visible en UI debe poder romper línea dentro de su contenedor.
11. Las métricas KPI pueden usar escalas mayores que `page-title`, pero nunca los títulos de pantalla.
12. Toda pantalla nueva debe tener estados `loading`, `empty` y `error`; si hay mutaciones, también `success/updated`.

## Primitivas aprobadas

### Títulos

```tsx
<h1 className="page-title">Título de pantalla</h1>
<p className="page-subtitle">Contexto operativo de la pantalla.</p>
<h2 className="section-title">Bloque operativo</h2>
<p className="section-subtitle">Lectura rápida del bloque.</p>
```

### Acciones

```tsx
<button className="btn-action">Actualizar</button>
<button className="btn-create">Nueva regla</button>
```

### KPI

```tsx
<p className="kpi-label">Alertas activas</p>
<p className="kpi-value text-gold">12</p>
<p className="kpi-meta">Visibilidad operativa activa</p>
```

`text-gold` solo debe usarse como acento operativo, estado o énfasis. No debe convertir la pantalla en una composición luxury.

### Surface principal

```tsx
<section className="surface-primary rounded-2xl border border-soft-subtle bg-navy-surface/35 p-5">
  ...
</section>
```

### Surface secundaria

```tsx
<div className="surface-secondary surface-copy-safe rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-4">
  ...
</div>
```

## Excepciones

Solo se admiten excepciones si:

- el diseño responde a una necesidad operativa explícita.
- la excepción está documentada en la feature.
- no contradice la bóveda.
- no contradice `anclora-design-system`.
- no rompe la consistencia de navegación del dashboard.

## Gate de aceptación

Una pantalla nueva no está terminada si:

- usa un `h1` fuera de `page-title`.
- usa títulos de bloque fuera de `section-title`.
- usa KPIs sin `kpi-label`, `kpi-value` y `kpi-meta`.
- introduce botones primarios fuera de `btn-action`.
- usa cards sin contrato de surface.
- deja títulos, ids, labels o metadata saliéndose del contenedor.
- omite estados `loading`, `empty` o `error`.
- usa gramática Premium/Ultra Premium en una vista INTERNAL.
- ignora `ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md`.
