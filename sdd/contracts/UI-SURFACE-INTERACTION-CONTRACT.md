# UI Surface Interaction Contract

Fecha: `2026-03-10`
Estado: `ACTIVE`
Ámbito: `frontend/src/app`, `frontend/src/components`

## Objetivo

Todas las features nuevas deben reutilizar un patrón único de interacción para frames, panels y cards. El objetivo es que la aplicación responda al hover de forma consistente, sutil y elegante, y que ningún contenido textual se desborde fuera de su contenedor.

## Contrato obligatorio

1. Todo card o frame principal debe usar `surface-primary`.
2. Todo card o frame secundario anidado dentro de un card/frame principal debe usar `surface-secondary`.
3. Todo contenedor que pueda renderizar rutas, ids, slugs, nombres técnicos, payloads o texto largo debe usar `surface-copy-safe`.
4. No se permite usar `truncate` en contenidos operativos críticos si eso oculta información importante. En esos casos debe romper línea dentro del contenedor.
5. El hover de `surface-primary` debe elevar el frame, remarcar el borde con tono oro y añadir sombra oro sutil.
6. El hover de `surface-secondary` debe elevar el frame, remarcar el borde con tono azul claro y añadir sombra azul sutil.
7. Si un frame contiene otros frames internos, el frame padre mantiene `surface-primary` y los hijos pasan a `surface-secondary`.
8. Pills, badges, chips, inputs, botones e icon containers no cuentan como frames; no deben usar este contrato salvo que actúen realmente como card autónoma.

## Tokens y clases

- `surface-primary`
- `surface-secondary`
- `surface-copy-safe`
- `dashboard-shell`

## Reglas de implementación

- En dashboard, los contenedores principales deben vivir dentro de `dashboard-shell`.
- Los componentes reutilizables de card deben incluir el contrato por defecto.
- Los panels con contenido dinámico deben definir `min-width: 0` y permitir `overflow-wrap: anywhere`.
- Cuando exista conflicto entre diseño local y contrato global, el contrato prevalece salvo excepción explícita documentada.

## Ejemplos

### Card principal

```tsx
<section className="surface-primary rounded-2xl border border-soft-subtle bg-navy-surface/35 p-5">
  ...
</section>
```

### Card secundaria anidada

```tsx
<div className="surface-secondary surface-copy-safe rounded-xl border border-soft-subtle/50 bg-navy-deep/30 p-4">
  ...
</div>
```

### Contenido técnico largo

```tsx
<p className="surface-copy-safe text-sm text-soft-white">
  live_notebook_sync_pack
</p>
```

## Gate para nuevas features

Una feature frontend no se considera terminada si:

- tiene cards sin feedback visual consistente al hover
- mezcla colores de hover arbitrarios entre frames equivalentes
- deja que ids, paths o nombres técnicos se salgan del contenedor
- introduce cards anidadas sin diferenciar nivel principal y secundario
