# Spec - ANCLORA-DLAB-001 v1

## Objetivo

Convertir `Data Lab` en una superficie real del ecosistema Anclora apoyada en:

- `ANCLORA-MTIP-001`
- `ANCLORA-SPO-001`
- `ANCLORA-PAA-001`

## Alcance v1

### En Nexus

- pagina `/private-area/data-lab` con:
  - bloques de perimetro
  - catalogo live por tenant cuando hay sesion
  - lectura rapida de estado operativo
  - enlaces hacia `Intelligence` y `Source Observatory`

### En Private Estates

- descripcion de acceso a `Data Lab` alineada con:
  - inteligencia territorial
  - assets reutilizables
  - acceso controlado

## Seguridad

- sin sesion: solo experiencia publica controlada
- con sesion: solo datos del tenant autenticado

## Contrato visual

- `page-title`, `page-subtitle`
- `surface-primary`, `surface-secondary`, `surface-copy-safe`
- contratos de `select`, `text fields` y `boolean fields`

## Dependencias futuras

- acceso granular por `partner` o `client`
- activos descargables y datasets selectivos
- monetizacion o distribucion comercial de `Data Lab`
