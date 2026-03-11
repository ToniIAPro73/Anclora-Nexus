# Spec - ANCLORA-PAA-001 v1

## Objetivo

Crear una capa de acceso privado comun para el ecosistema Anclora, separando con claridad:

- puerta publica de marca (`Private Estates`)
- operacion interna (`Nexus`)
- colaboracion externa (`Synergi`)
- inteligencia analitica (`Data Lab`)

## Alcance v1

### En `Anclora Nexus`

- helper centralizado de portales y normalizacion de `next`
- gateway publico `/private-area`
- paginas publicas:
  - `/private-area/partner`
  - `/private-area/data-lab`
- redireccion de `/private-area/agent` al login de Nexus
- login con semantica `portal` + `next`
- `proxy` y `auth/callback` con saneamiento de redirecciones

### En `Anclora Private Estates`

- `Area Privada` deja de usar modal unico para `Partner` y `Data Lab`
- cada acceso navega a su destino canonico
- urls configurables por entorno para:
  - Nexus login
  - private area base
  - partner portal
  - data lab portal

## Contrato de rutas

- `agent`
  - publico: `/private-area/agent`
  - autenticado: `/dashboard`
  - login: `/login?portal=agent&next=%2Fdashboard`
- `partner`
  - publico: `/private-area/partner`
  - estado: `admission_review`
- `data_lab`
  - publico: `/private-area/data-lab`
  - estado: `controlled_access`

## Seguridad

- `normalizeNextPath` solo acepta rutas internas absolutas.
- Se rechazan:
  - urls externas
  - rutas relativas sin `/`
  - patrones `//host`

## Contrato visual

- cabeceras: `page-title`, `page-subtitle`
- cards/frames: `surface-primary`, `surface-secondary`, `surface-copy-safe`
- toda copy nueva en i18n

## Dependencias futuras

- `ANCLORA-SPA-001` Synergi Partner Admission
- `ANCLORA-SPW-001` Synergi Partner Workspace
- `ANCLORA-DLAB-001` Data Lab Portal
