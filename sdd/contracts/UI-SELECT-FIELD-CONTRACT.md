# UI Select Field Contract

Objetivo:
- Unificar todos los campos de listas de valores en la app.

Primitivas:
- `ui-select`
  - select standalone estándar
  - borde, radio, color y foco únicos
- `ui-select-ghost`
  - select embebido dentro de shells o wrappers con icono
  - mantiene el mismo dropdown y el mismo comportamiento de foco

Reglas:
- no crear estilos inline de `option`
- no mezclar más de un patrón visual de select en la misma pantalla
- todo select nuevo debe usar una de estas dos primitivas
- si el select está dentro de un frame secundario, el frame puede variar; el select no

Estados:
- `default`
- `hover`
- `focus`
- `disabled`

Notas:
- el dropdown nativo debe mantener fondo azul profundo y texto claro
- el chevron visual es parte del contrato
