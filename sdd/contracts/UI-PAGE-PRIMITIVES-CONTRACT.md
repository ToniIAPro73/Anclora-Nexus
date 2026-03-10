# UI Page Primitives Contract

Fecha: `2026-03-10`
Estado: `ACTIVE`
Ámbito: `frontend/src/app/(dashboard)`, `frontend/src/components`

## Objetivo

Toda pantalla nueva debe construirse con una jerarquía visual consistente. Esto incluye títulos, subtítulos, botones, spacing y el uso de surfaces/cards definido en el contrato de interacción.

Relacionado:
- `sdd/contracts/UI-SURFACE-INTERACTION-CONTRACT.md`

## Contrato obligatorio

1. El título principal de pantalla debe usar `page-title`.
2. El subtítulo o texto de contexto de cabecera debe usar `page-subtitle`.
3. La escala de `page-title` toma como referencia la pantalla `Prospección`; ninguna pantalla nueva debe usar un título principal mayor sin excepción documentada.
4. La acción principal de la pantalla debe usar `btn-action`.
5. Las acciones secundarias o de creación deben usar `btn-create`.
6. Los cards y frames deben respetar `surface-primary`, `surface-secondary` y `surface-copy-safe`.
7. Todo texto técnico o de backend visible en UI debe poder romper línea dentro de su contenedor.
8. Las métricas KPI pueden usar escalas mayores que `page-title`, pero nunca los títulos de pantalla.

## Primitivas aprobadas

### Títulos

```tsx
<h1 className="page-title">Título de pantalla</h1>
<p className="page-subtitle">Contexto operativo de la pantalla.</p>
```

### Acciones

```tsx
<button className="btn-action">Actualizar</button>
<button className="btn-create">Nueva regla</button>
```

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

- el diseño responde a una necesidad de marca explícita
- la excepción está documentada en la feature
- no rompe la consistencia de navegación del dashboard

## Gate de aceptación

Una pantalla nueva no está terminada si:

- usa un `h1` fuera de `page-title`
- introduce botones primarios fuera de `btn-action`
- usa cards sin contrato de surface
- deja títulos, ids, labels o metadata saliéndose del contenedor
