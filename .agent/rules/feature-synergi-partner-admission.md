# Rule - ANCLORA-SPA-001

## Objetivo

Crear la admision curada de `Synergi` con formulario publico, persistencia trazable y cola interna de revision dentro de Nexus.

## Reglas obligatorias

1. La admision debe entrar por una ruta publica, no por el dashboard autenticado.
2. Toda solicitud debe persistirse con `org_id` y estado inicial `submitted`.
3. La cola interna debe permitir:
   - listar
   - resumir
   - marcar `under_review`
   - aceptar
   - rechazar
4. Toda UI nueva debe respetar:
   - `page-title`
   - `page-subtitle`
   - `surface-primary`
   - `surface-secondary`
   - `surface-copy-safe`
5. Toda copy nueva debe entrar en `frontend/src/lib/i18n/translations.ts`.
6. El formulario debe contemplar partners `eco` como categoria valida desde v1.
7. La comunicacion al applicant debe degradar con seguridad a `mailto` si SMTP no esta configurado.

## No hacer

- No convertir `Synergi` en un directorio abierto.
- No exponer datos de solicitudes entre tenants.
- No depender de SQL manual para revisar solicitudes si ya existe cola interna.
