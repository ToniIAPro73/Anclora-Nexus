# DMS Storage, Retention & Legal Hold

**Módulo:** Almacenamiento, retención y legal hold  
**Última actualización:** 2026-06-14

---

## Buckets de Supabase Storage

| Bucket | Contenido | Acceso |
|---|---|---|
| `dms-templates` | Ficheros Markdown de plantillas canónicas | Privado, read por backend |
| `dms-documents` | Versiones de documentos generados (Markdown, DOCX) | Privado, firmado temporal |
| `dms-signed` | PDFs firmados recibidos desde DocuSeal | Privado, firmado temporal |

**Todas las rutas siguen la estructura:** `{org_id}/{document_id}/{version_id}/{filename}`

### URLs firmadas

Para descargar un documento se genera una URL temporal de Supabase Storage:
```python
supabase_service.client.storage.from_("dms-documents").create_signed_url(path, 3600)
```
Las URLs expiran en 1 hora. Nunca se exponen rutas permanentes.

---

## Políticas de retención

Las políticas se definen en la tabla `document_retention_policies` por `document_type` × `jurisdiction`:

```sql
document_retention_policies (
  id, org_id, document_type, jurisdiction,
  retention_years INT,  -- años de conservación obligatoria
  legal_hold BOOL,      -- si TRUE, bloquea el archivado automático
  created_at, updated_at
)
```

### Plazos por defecto (España)

| Tipo de documento | Retención mínima | Base legal |
|---|---|---|
| Contrato de compraventa | 10 años | Art. 1964 CC |
| Contrato de arrendamiento | 6 años | LAU + CC |
| KYC / Identificación | 5 años (AML) | Ley 10/2010 |
| Declaración de origen de fondos | 10 años | Ley 10/2010 |
| Arras penitenciales | 5 años | Art. 1964 CC |
| Documentos firmados (general) | 5 años | Art. 1964 CC |

> Los plazos anteriores son orientativos. Consulta siempre con asesor legal para tu jurisdicción específica.

---

## Ciclo de retención automática

```
Vercel Cron (03:00 UTC diario)
    │
    ▼
GET /api/cron/dms-retention  (Next.js route)
    │
    ▼
POST /api/internal/webhooks/dms-retention-sweep  (backend, requiere NEXUS_INTERNAL_API_KEY)
    │
    ▼
enforce_retention_for_org(org_id) por cada org activa
    │
    ├─ Evalúa cada documento con status != 'archived'
    ├─ Calcula fecha de expiración: created_at + retention_years
    ├─ Si expirado Y sin legal hold → status = 'archived'
    └─ Si expirado Y con legal hold → flag para revisión
```

---

## Legal Hold

### ¿Qué es?

Un **legal hold** es una retención forzada que impide el archivado automático de un documento, incluso si ha superado el plazo de retención normal. Se usa cuando un documento puede ser relevante en un litigio, inspección o investigación.

### Cómo activarlo

```python
# Crear política con legal hold
_table("document_retention_policies").insert({
    "org_id": org_id,
    "document_type": "contrato_compraventa",
    "retention_years": 10,
    "legal_hold": True,
    "jurisdiction": "España"
}).execute()
```

O vía API backend (si existe endpoint dedicado):
```bash
POST /api/dms/retention-policies
{
  "document_type": "contrato_compraventa",
  "retention_years": 10,
  "legal_hold": true
}
```

### Efecto

- El sweep de retención lee `legal_hold` y salta el archivado
- La UI del visor muestra un badge "Legal Hold activo"
- El archivado manual también queda bloqueado mientras `legal_hold = True`

---

## Exportación de dossier (ZIP)

El dossier export crea un ZIP con todos los documentos de un expediente:

### Estructura del ZIP

```
DOSSIER_{folder_id}_{timestamp}/
  00_MANIFEST/
    manifest.json        — lista de ficheros con SHA-256
  01_CONTRATOS/
    contrato-compraventa-v3.md
    contrato-compraventa-v3.pdf
  02_ARRAS/
    arras-penitenciales-v1.md
  03_IDENTIFICACION/
    kyc-cliente-v1.md
  04_FIRMAS/
    contrato-compraventa-v3-signed.pdf
  05_REVISIONES/
    review-log.json
  06_AUDITORIA/
    audit-trail.json
  ...
```

### Manifiesto SHA-256

`manifest.json` contiene:
```json
{
  "export_id": "...",
  "folder_id": "...",
  "generated_at": "2026-06-14T...",
  "files": [
    { "path": "01_CONTRATOS/contrato-v3.md", "sha256": "abc123...", "size": 12345 }
  ]
}
```

### Cifrado (opcional)

Si `encrypted: true` en la solicitud, el ZIP se cifra con AES-256 antes de almacenarlo. La clave se comunica al solicitante por canal seguro fuera de banda.

---

## Gestión del storage en producción

```bash
# Listar objetos en bucket (Supabase CLI)
supabase storage ls dms-documents --project-ref <ref>

# Verificar URL firmada
curl -I "<signed_url>"
```

Monitorización:
- Tamaño del bucket en Supabase Dashboard → Storage → Usage
- Alertas si superan el 80% del límite de plan
