---
name: multi-tenant-intelligence-packs
description: Implementa catalogo de packs de inteligencia por tenant, resolucion de pack activo y UI asociada siguiendo contratos de superficie, tipografia e i18n.
---

## Leer primero

1. `sdd/contracts/UI-SURFACE-INTERACTION-CONTRACT.md`
2. `sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md`
3. `sdd/features/multi-tenant-intelligence-packs/multi-tenant-intelligence-packs-spec-v1.md`
4. `.agent/rules/feature-multi-tenant-intelligence-packs.md`

## Metodo

1. Crear o actualizar migracion para catalogo `intelligence_packs`.
2. Resolver pack activo por `org_id`, con fallback legacy seguro.
3. Hacer que las consultas territoriales acepten `pack_id` opcional.
4. Exponer catalogo y activacion por API.
5. Reflejarlo en `Intelligence` usando `surface-primary` y `surface-secondary`.
6. Añadir textos a i18n antes de cerrar build.
7. Cerrar con tests backend y validacion frontend.
