---
name: private-area-access-architecture
description: Implementa la capa de acceso privado comun entre Private Estates y Nexus con contratos de auth, rutas sanitizadas, portales publicos y i18n.
---

## Leer primero

1. `sdd/contracts/UI-SURFACE-INTERACTION-CONTRACT.md`
2. `sdd/contracts/UI-PAGE-PRIMITIVES-CONTRACT.md`
3. `sdd/features/private-area-access-architecture/private-area-access-architecture-spec-v1.md`
4. `.agent/rules/feature-private-area-access-architecture.md`

## Metodo

1. Centralizar definiciones de portales y reglas de entrada.
2. Sanitizar `next` tanto en `proxy` como en `auth/callback` y `login`.
3. Exponer gateway publico y paginas de destino para `partner` y `data_lab`.
4. Alinear `Private Estates` para que apunte a la nueva arquitectura en lugar de usar modales legacy.
5. Añadir i18n y respetar contratos de superficies y cabeceras.
6. Validar con test unitario de helpers, lint y build en ambos repositorios.
