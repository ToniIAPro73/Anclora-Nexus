# DMS/CLM Architecture

**Módulo:** Gestión Documental y Contractual  
**Stack:** FastAPI + Supabase + Next.js App Router  
**Última actualización:** 2026-06-14

---

## Visión general

El módulo DMS/CLM de Anclora Nexus gestiona el ciclo completo de los documentos asociados a un expediente inmobiliario: desde la generación a partir de plantillas hasta la firma electrónica y el archivo con retención.

```
┌────────────────────────────────────────────────────────────────────┐
│  Frontend (Next.js App Router)                                     │
│  /dms              — Dashboard DMS con expedientes y documentos     │
│  /dms/templates    — Biblioteca de plantillas (18 familias, 11 idiomas) │
│  /dms/documents/[id]  — Visor + revisión jurídica + firma          │
│  /dms/documents/[id]/edit — Editor incremental con diff            │
│  /dms/legal-review — Cola de revisión jurídica                     │
└────────────────────────────────────┬───────────────────────────────┘
                                     │ HTTP (raw fetch)
┌────────────────────────────────────▼───────────────────────────────┐
│  Backend (FastAPI)                                                  │
│  /api/dms/templates/*         — CRUD plantillas + versiones        │
│  /api/dms/folders/*           — Expedientes, partes, generación    │
│  /api/dms/generated-documents/* — Documentos generados, versiones  │
│  /api/dms/legal-review/*      — Revisión jurídica (auto + manual)  │
│  /api/dms/webhooks/docuseal   — Webhook firma electrónica          │
│  /api/internal/webhooks/*     — Cron + sweeps internos             │
└────────────────────────────────────┬───────────────────────────────┘
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        ▼                            ▼                            ▼
  ┌──────────────┐        ┌──────────────────┐        ┌─────────────────┐
  │  Supabase DB │        │ Supabase Storage  │        │  Servicios ext. │
  │  (PostgreSQL)│        │  dms-templates    │        │  DocuSeal       │
  └──────────────┘        │  dms-documents    │        │  Advisor AI     │
                          │  dms-signed       │        │  Vercel Cron    │
                          └──────────────────┘        └─────────────────┘
```

---

## Separación DMS vs CLM

| Capa | Responsabilidad |
|---|---|
| **DMS** (Document Management System) | Almacenamiento, versionado, retención, exportación, auditoría |
| **CLM** (Contract Lifecycle Management) | Generación desde plantilla, revisión jurídica, aprobación, firma electrónica |

El DMS gestiona el **qué existe**; el CLM gestiona el **ciclo de vida contractual**.

---

## Modelo de datos

### Tablas principales

```sql
document_templates
  ├── id, template_key, name, template_document_type
  ├── language, jurisdiction, ape_codes[]
  └── status: draft | published | deprecated

document_template_versions
  ├── id, template_id (FK), version_number, language
  ├── content_md5 (SHA-256), content_storage_path
  ├── placeholders[], is_canonical
  └── validation_status: pending | approved | rejected

generated_documents
  ├── id, org_id, folder_id, template_version_id (FK)
  ├── title, language, status
  │   └── status: draft | review_required | approved | signed | archived
  ├── generation_payload (JSONB), variable_snapshot (JSONB)
  └── current_version_id (FK → document_versions)

document_versions
  ├── id, generated_document_id (FK), version_number
  ├── edited_text, content_md5
  ├── validation_status, signature_status
  └── immutable (bool) — true tras firma electrónica

legal_review_decisions
  ├── id, generated_document_id (FK), org_id
  ├── review_type: auto | manual
  ├── decision: approved | approved_with_conditions | review_required
  │            | changes_required | rejected
  ├── risk_level: low | medium | high | critical
  ├── block_signing (bool)
  └── advisor_ai_response (JSONB)

document_signature_flows
  ├── id, generated_document_id (FK), document_version_id (FK)
  ├── external_provider: docuseal
  ├── external_envelope_id, signing_level: simple | advanced | qualified
  ├── signers (JSONB array)
  ├── flow_status: sent | signed | declined | expired
  └── audit_trail (JSONB array)

document_retention_policies
  ├── id, org_id, document_type
  ├── retention_years, legal_hold (bool)
  └── jurisdiction

dossier_exports
  ├── id, org_id, folder_id
  ├── export_status: pending | processing | ready | failed
  ├── download_url, manifest (JSONB)
  └── encrypted (bool)
```

---

## Flujo de generación

```
Expediente CRM
    │
    ▼
dms_context_builder.py
    │ Resuelve: partes, propiedad, idioma, jurisdicción
    ▼
Template Markdown (backend/seeds/templates/{lang}/tpl-*.md)
    │
    ▼
dms_template_rendering.py (Jinja2)
    │ Sustituye placeholders {{buyer.name}}, {{property.address}}, etc.
    ▼
generated_documents + document_versions (v1)
    │
    ▼
Storage: dms-documents/{org_id}/{doc_id}/v1.md
```

---

## Flujo CLM (post-generación)

```
generated_documents (status: draft)
    │
    ├─ [Editor] → document_versions (v2, v3...)
    │
    ├─ [Auto-review] → Advisor AI validate_legal_document()
    │      │ Gates: timeout, JSON inválido, placeholder pendiente,
    │      │        riesgo crítico, traducción divergente, RAG insuficiente
    │      ▼
    │   legal_review_decisions (auto)
    │
    ├─ [Manual review] → legal_review_decisions (manual)
    │      │ decision: approved | approved_with_conditions | ...
    │      ▼
    │   generated_documents.status = approved | review_required
    │
    └─ [Firma] → document_signature_flows
           │ DocuSeal envelope → signers[]
           │
           ├─ Webhook: submission.completed
           │      → flow_status = signed
           │      → document_versions.immutable = True
           │      └─ generated_documents.status = signed
           │
           └─ Webhook: submission.declined | expired
                  → flow_status = declined | expired
```

---

## Retención y archivo

- Policies en `document_retention_policies` por tipo × jurisdicción
- Cron diario 03:00 UTC → `/api/cron/dms-retention` (Vercel) → `/api/internal/webhooks/dms-retention-sweep` (backend)
- `enforce_retention_for_org()` evalúa cada documento y aplica archivado o flagging
- Legal hold: `legal_hold=True` en la política bloquea el archivado automático

---

## Seguridad

- Supabase RLS por `org_id` en todas las tablas DMS
- Storage privado (no acceso público); URLs firmadas temporales
- Webhook DocuSeal verificado con HMAC-SHA256
- API interna protegida con `NEXUS_INTERNAL_API_KEY`
- Cifrado AES-256 opcional en exportaciones ZIP

Ver `docs/DMS_CLM_THREAT_MODEL.md` para análisis de amenazas completo.
