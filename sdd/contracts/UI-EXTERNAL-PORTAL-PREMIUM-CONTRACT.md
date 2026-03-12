# UI External Portal Premium Contract

## Objetivo
Fijar la gramática visual de superficies externas del ecosistema que no deben sentirse como pantallas del dashboard interno de Nexus.

## Ámbito
- `/private-area/partner`
- `/private-area/partner/workspace`
- `/private-area/data-lab`
- `/private-area/data-lab/workspace`

## Reglas
- Estas superficies deben usar `PrivateAreaShell` con `theme="premium"`.
- Deben diferenciarse visualmente de Nexus con una paleta `Private Estates`.
- Cada portal premium puede tener una acentuación propia:
  - `partner`: más cálido y relacional
  - `data-lab`: más frío y analítico
- Mantener contratos globales de:
  - `surfaces`
  - `page-title/page-subtitle`
  - `selects`
  - `inputs/textareas`
  - `boolean fields`
- Los CTA principales deben usar `btn-private-estates`.
- La experiencia externa no debe reutilizar semántica visual de dashboard interno salvo cuando sea estrictamente funcional.
