# Document Template Library — Audit Report

## 1. Scope

Pre-implementation audit for `feat/nexus-document-template-library`.
Maps reusable pieces, gaps, compatibility risks, and migration plan.

---

## 2. Existing DMS Baseline

### 2.1 Migration: `001_dms_tables.sql`

Three tables already in production:

| Table | Purpose |
|-------|---------|
| `real_estate_deal_folders` | Expedition folders linked to property, lead, seller |
| `deal_documents` | Uploaded documents with AES-GCM encryption metadata |
| `document_signature_flows` | DocuSeal envelope tracking per document |

RLS policies present on all three tables via `app.current_org_id` setting.

**Gap**: No template concept, no versioning, no generated documents, no parties,
no legal review, no retention policies.

### 2.2 Model: `backend/models/dms.py` (108 lines)

Pydantic models for `DealFolder`, `DealDocument`, `SignatureFlow`.

`DocumentCategory` enum mixes **external documents** and **contracts**:

```python
arras_penitenciales = "arras_penitenciales"     # should be template type
contrato_temporada = "contrato_temporada"        # should be template type
documento_firmado = "documento_firmado"          # should be a status, not category
kyc_cliente = "kyc_cliente"                     # should be template type
```

**Adaptation**: Add new enums without removing existing ones. Mark
`documento_firmado` as deprecated category; represent as `immutable=true`
on `document_versions` going forward.

### 2.3 Routes: `backend/api/routes/dms.py` (434 lines)

Existing endpoints:

```text
POST   /api/dms/folders
GET    /api/dms/folders
GET    /api/dms/folders/{folder_id}
POST   /api/dms/folders/{folder_id}/documents
GET    /api/dms/folders/{folder_id}/documents
POST   /api/dms/documents/{document_id}/validate
POST   /api/dms/documents/{document_id}/sign
GET    /api/dms/documents/{document_id}/download
GET    /api/dms/documents/{document_id}/workspace
```

All endpoints validate `org_id` from JWT. Storage via Supabase client.

**Reuse**: All existing endpoints remain untouched. New routes are additive.

### 2.4 Encryption: `document_encryption_service.py` (26 lines)

AES-256-GCM via `NEXUS_DOCUMENT_ENCRYPTION_KEY` env var.
`encrypt_file()` → `(payload, iv, auth_tag)`.
`decrypt_file()` and `sha256()` helpers.

**Reuse**: All generated and signed documents use the same service.

### 2.5 Advisor AI: `advisor_contract_validator_service.py` (96 lines)

Calls `POST /api/validate-contract` on Advisor AI.
Safe failure: returns `review_required` + `block_signing: False` when unavailable.
Normalizes response to stable schema.

**Gap**: Does not yet call `POST /api/legal-documents/validate` (new Advisor
endpoint). Needs extension to send canonical template + generated document text
for diff-aware validation.

### 2.6 Frontend: `dms-api.ts` (140 lines)

Exports: `listDealFolders`, `createDealFolder`, `listDocuments`,
`uploadDocument`, `validateDocument`, `createSignatureFlow`,
`getDocumentWorkspace`.

**Gap**: No template functions, no generated-document functions, no party
management, no legal review, no diff or versioning calls.

### 2.7 Frontend: `/dms` page + `DocumentWorkspace.tsx`

Single-page DMS with folder list and document upload. No template library,
no generation flow, no editor.

### 2.8 Tests

| File | Coverage |
|------|---------|
| `test_dms_routes.py` | Folder CRUD, document upload, download |
| `test_dms_document_lifecycle.py` | Validate + sign flow |
| `test_dms_encryption.py` | AES-GCM encrypt/decrypt, sha256 |
| `test_dms_advisor_validator.py` | Safe failure, response normalization |

**Reuse**: All existing tests kept. New test files added alongside.

### 2.9 Documentation

`docs/REAL_ESTATE_DMS_MODULE.md` and `docs/QA_REAL_ESTATE_DMS_MODULE.md`
cover current upload/sign flow. Will be supplemented, not replaced.

---

## 3. Gaps

| Gap | Severity | Resolution |
|-----|----------|------------|
| No `document_templates` table | Critical | Migration 002 |
| No `document_template_versions` | Critical | Migration 002 |
| No `document_template_fields` | High | Migration 002 |
| No `deal_folder_parties` | High | Migration 002 |
| No `generated_documents` | Critical | Migration 002 |
| No `document_versions` (generated) | Critical | Migration 002 |
| No `document_change_sets` | High | Migration 002 |
| No `legal_review_decisions` | High | Migration 002 |
| No `document_retention_policies` | Medium | Migration 002 |
| `documento_firmado` is category not state | High | Phase 1 enum refactor |
| Templates mixed with external docs | High | Phase 1 conceptual separation |
| Advisor AI calls old endpoint only | Medium | Phase 8 extension |
| No variable rendering engine | Critical | Phase 5 |
| No template library API | Critical | Phase 4 |
| No parties API | High | Phase 3 |
| No generated document API | Critical | Phase 6 |
| No versioning/diff API | High | Phase 7 |
| No legal review API | High | Phase 9 |
| No retention policy engine | Medium | Phase 11 |
| Frontend: no template library UI | High | Phase 12 |
| Frontend: no editor UI | High | Phase 12 |
| `dms-api.ts`: missing 14 functions | High | Phase 13 |

---

## 4. Risks

| Risk | Mitigation |
|------|------------|
| Existing `deal_documents` rows lose category meaning | Keep all existing enum values; add new types additively |
| `documento_firmado` category breaks queries | Deprecate gracefully; do not delete |
| Migration 002 fails on tables with existing RLS | Test on staging before production |
| Rendering engine produces incomplete docs | Placeholder detection blocks generation |
| Advisor AI unavailable during validation | Safe failure already implemented; extend pattern |
| Signed document mutated | `immutable=true` enforced at API level |
| Binary stored in PostgreSQL | Encrypted blob in Object Storage only |
| Multitenancy bypass | RLS on all new tables; `org_id` validated on every endpoint |

---

## 5. Reuse Decisions

1. **`DocumentEncryptionService`** — used for all template, generated and signed binaries.
2. **`AdvisorContractValidatorService`** — extended (not replaced) in Phase 8.
3. **Existing RLS pattern** — replicated on all 9 new tables.
4. **Existing folder/document endpoints** — untouched; new endpoints additive.
5. **`dms-api.ts`** — extended with 14 new functions; no existing function modified.
6. **`/dms` page** — enhanced; existing upload flow preserved.
7. **All 4 existing test files** — kept; 6 new test files added.

---

## 6. Migration Plan

| Step | Action |
|------|--------|
| 1 | Apply `002_document_template_library.sql` (additive only) |
| 2 | Deploy Phase 1 enum update (no data migration needed) |
| 3 | Deploy Phases 2-11 backend (feature-flagged via `NEXT_PUBLIC_DMS_TEMPLATE_LIBRARY_ENABLED`) |
| 4 | Deploy Phases 12-14 frontend |
| 5 | Run seed (Phase 15) — all templates in `draft` status |
| 6 | Human legal review of seed templates before `published` |

**Rollback**: Migration 002 uses `CREATE TABLE IF NOT EXISTS`. Rollback drops
only new tables (no existing data affected). Backend flag disables UI.
