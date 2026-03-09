# SPEC: GRAVITY CLAW DOSSIER EXPORT & SHARE V1

**Feature ID**: ANCLORA-GCDES-001  
**Status**: Implemented  
**Owner**: Product + CTO

## 1. Contexto

La workbench de Fase 4 ya genera dossier y drafts multicanal, pero faltaba convertir ese contenido en un artefacto exportable y compartible sin copiar manualmente desde la interfaz.

## 2. Objetivos

1. Exponer un payload estable de export desde backend.
2. Permitir export PDF desde frontend.
3. Permitir share rápido mediante Web Share API o fallback de copia.

## 3. Requisitos funcionales

- Nuevo endpoint `GET /api/sellers/{seller_id}/dossier-export`.
- El payload incluye seller, secciones del dossier, nombre de archivo y resumen compartible.
- La ficha debe permitir:
  - exportar PDF
  - compartir

## 4. Requisitos no funcionales

- Sin nueva tabla ni migracion.
- El export se compone a partir del workbench existente.
- La exportacion PDF puede ser client-side en v1.

## 5. Criterios de aceptacion

1. El usuario puede descargar un PDF del dossier desde la ficha.
2. El usuario puede compartir el contenido por Web Share o copiar fallback.
3. El backend responde un contrato estable para export.
