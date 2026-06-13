# DMS Dossier Export

**Módulo:** Exportación de expediente completo  
**Última actualización:** 2026-06-14

---

## ¿Qué es el dossier export?

El dossier export genera un paquete ZIP descargable con todos los documentos contractuales de un expediente inmobiliario. Se usa para:

- Entrega al cliente al cierre de la operación
- Archivo físico o digital en el sistema documental del asesor
- Evidencia en caso de litigio
- Cumplimiento de obligaciones de custodia documental

---

## Endpoints

### Solicitar exportación

```http
POST /api/dms/folders/{folder_id}/exports
Authorization: Bearer <token>
Content-Type: application/json

{
  "export_format": "zip",
  "encrypted": false,
  "include_audit_trail": true,
  "include_signed_pdfs": true
}
```

**Respuesta 201:**
```json
{
  "id": "export-uuid",
  "folder_id": "folder-uuid",
  "export_status": "pending",
  "created_at": "2026-06-14T10:00:00Z"
}
```

La exportación es **asíncrona**. El status pasa a `processing` y luego a `ready` cuando el ZIP está disponible.

### Consultar estado

```http
GET /api/dms/folders/{folder_id}/exports/{export_id}
```

```json
{
  "id": "export-uuid",
  "export_status": "ready",
  "download_url": "https://storage.supabase.co/...",
  "manifest": { ... },
  "created_at": "...",
  "ready_at": "..."
}
```

### Listar exportaciones

```http
GET /api/dms/folders/{folder_id}/exports
```

---

## Estructura del ZIP

```
DOSSIER_{folder_id}_{timestamp}/
  00_MANIFEST/
    manifest.json          — Índice con SHA-256 de cada fichero
  01_CONTRATOS/
    {nombre_doc}-v{n}.md
    {nombre_doc}-v{n}.pdf
  02_ARRAS/
  03_RESERVAS/
  04_IDENTIFICACION/        — KYC, declaración de fondos
  05_PRIVACIDAD/            — RGPD, información de cliente
  06_FIRMAS/                — PDFs firmados electrónicamente
  07_REVISIONES/
    review-log.json         — Decisiones de revisión jurídica
  08_INVENTARIO/
  09_CORRESPONDENCIA/
  10_AUDITORIA/
    audit-trail.json        — Registro completo de acciones
```

---

## Manifiesto

`00_MANIFEST/manifest.json`:

```json
{
  "export_id": "...",
  "folder_id": "...",
  "org_id": "...",
  "generated_at": "2026-06-14T12:00:00Z",
  "generated_by": "user-uuid",
  "encrypted": false,
  "files": [
    {
      "path": "01_CONTRATOS/contrato-compraventa-v3.md",
      "document_id": "doc-uuid",
      "version_id": "ver-uuid",
      "sha256": "abc123...",
      "size_bytes": 12500,
      "status": "approved",
      "signed": false
    },
    {
      "path": "06_FIRMAS/contrato-compraventa-v3-signed.pdf",
      "document_id": "doc-uuid",
      "version_id": "ver-uuid",
      "sha256": "def456...",
      "size_bytes": 245000,
      "status": "signed",
      "signed": true,
      "signed_at": "2026-06-12T09:30:00Z"
    }
  ],
  "total_files": 12,
  "total_size_bytes": 1250000
}
```

---

## Verificación de integridad

Para verificar que el ZIP no ha sido alterado:

```bash
# Verificar SHA-256 de un fichero individual
sha256sum "01_CONTRATOS/contrato-compraventa-v3.md"
# Comparar con manifest.json

# Script de verificación completa
python scripts/verify_dossier.py dossier.zip
```

---

## Cifrado opcional

Si `encrypted: true` en la solicitud:
1. El ZIP se cifra con AES-256-GCM
2. La clave derivada se genera aleatoriamente (32 bytes)
3. La clave nunca se almacena en servidor
4. Se comunica al solicitante por canal seguro fuera de banda (Slack, email cifrado, etc.)

```bash
# Descifrar (OpenSSL)
openssl enc -d -aes-256-gcm -in dossier_encrypted.zip -out dossier.zip -k <clave>
```

---

## Registro de auditoría

Cada solicitud de exportación queda en el audit log:

```json
{
  "event": "dms_dossier_export_requested",
  "user_id": "...",
  "export_id": "...",
  "folder_id": "...",
  "at": "2026-06-14T10:00:00Z"
}
```

Los registros de exportación se conservan durante la vida útil del expediente (no se eliminan con el archivado de documentos).

---

## Consideraciones de rendimiento

- Los ZIPs grandes (>100 documentos) se generan en background — no bloquean la request
- Timeout del worker: 5 minutos
- Tamaño máximo recomendado: 500 MB sin cifrar
- Los ZIPs generados se almacenan en Supabase Storage durante 7 días y luego se eliminan (el usuario debe descargarlo en ese plazo)
