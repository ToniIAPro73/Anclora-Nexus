# UI External Portal Premium Contract

Estado: `DEPRECATED`
Fecha de deprecación: `2026-05-05`

## Motivo de deprecación

La arquitectura vigente separa Nexus como aplicación **INTERNAL** y Synergi/Data Lab como aplicaciones **PREMIUM** independientes.

Este contrato describía portales premium embebidos en Nexus, especialmente rutas tipo:

```text
/private-area/partner
/private-area/partner/workspace
/private-area/data-lab
/private-area/data-lab/workspace
```

No debe usarse para nuevas features.

Contratos vigentes:

```text
Nexus:
sdd/contracts/ANCLORA-NEXUS-INTERNAL-APP-CONTRACT.md

Synergi:
sdd/contracts/ANCLORA-SYNERGI-PREMIUM-APP-CONTRACT.md en repo anclora-synergi

Data Lab:
sdd/contracts/ANCLORA-DATA-LAB-PREMIUM-APP-CONTRACT.md en repo anclora-data-lab
```

---

## Contenido histórico

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
