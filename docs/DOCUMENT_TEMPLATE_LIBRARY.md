# Document Template Library — Architecture & API Reference

## Overview

The Document Template Library adds master-template management, variable rendering,
generated document versioning, legal review, and retention policy enforcement to
the existing Anclora Nexus DMS. It is additive — existing upload/sign flows are
untouched.

---

## Conceptual Model

```text
DocumentTemplate (master) 1──* DocumentTemplateVersion (immutable binary + canonical text)
                                    └──* DocumentTemplateField (variable definitions)

DealFolder ──* DealFolderParty (KYC-tracked counterparts)
DealFolder ──* GeneratedDocument (rendered from a template version)
               └──* DocumentVersion (versioned edits)
                    └──* DocumentChangeSet (diff between versions)
               └──* LegalReviewDecision (auto or manual)

Organization ──* DocumentRetentionPolicy (per type or org-level)
```

### Key separations

| Old concept | New concept |
|-------------|------------|
| `documento_firmado` category | `DocumentStatus.signed` + `immutable=true` on `document_versions` |
| External uploaded document | `DocumentOrigin.external` on `deal_documents` |
| Master template | `document_templates` + `document_template_versions` |
| Filled document | `generated_documents` |

---

## Backend — New Routes

### Template Library `/api/dms/templates/`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | List templates (own + global) |
| `POST` | `/` | Create template (status: draft) |
| `GET` | `/{id}` | Get template by ID |
| `PATCH` | `/{id}/publish` | Publish template |
| `PATCH` | `/{id}/deprecate` | Deprecate template |
| `GET` | `/{id}/versions` | List versions |
| `POST` | `/{id}/versions` | Upload new version (encrypted binary) |
| `GET` | `/{id}/versions/{vid}/fields` | List variable fields |
| `POST` | `/{id}/versions/{vid}/fields` | Define a variable field |

### Parties `/api/dms/folders/{folder_id}/parties`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | List parties for folder |
| `POST` | `/` | Add party |
| `PATCH` | `/{party_id}/kyc` | Mark KYC verified |

### Generated Documents `/api/dms/`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/folders/{folder_id}/generate` | Render template → generated document |
| `GET` | `/folders/{folder_id}/generated` | List generated documents |
| `GET` | `/{generated_id}` | Get generated document |
| `PATCH` | `/{generated_id}/status` | Update lifecycle status |

### Versioning `/api/dms/`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/generated/{id}/versions` | List versions |
| `POST` | `/generated/{id}/versions` | Upload new version |
| `GET` | `/generated/{id}/versions/diff` | Unified diff between two versions |

### Legal Review `/api/dms/`

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/generated/{id}/review/auto` | Trigger Advisor AI validation |
| `POST` | `/generated/{id}/review/manual` | Record human decision |
| `GET` | `/generated/{id}/review` | List review history |

### Retention `/api/dms/retention/`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | List policies |
| `POST` | `/` | Create policy |
| `GET` | `/effective` | Resolve effective policy for document type |
| `POST` | `/enforce` | Run retention enforcement for org |

---

## Template Rendering Engine

Templates use `{{ field_key }}` syntax (case-insensitive whitespace).

```text
Comprador: {{buyer_name}}, DNI: {{buyer_dni}}
Precio: {{ sale_price }}
```

Rendering rules:

- Known fields are substituted from `generation_payload`
- Unknown tokens are left in place
- Defaults from `document_template_fields.default_value` applied automatically
- Generation is **blocked** if any unfilled placeholder pattern remains

### Detected placeholder patterns

| Pattern | Example |
|---------|---------|
| `{{field_key}}` | `{{buyer_name}}` (unfilled token) |
| `[text]` | `[NOMBRE COMPLETO]` |
| `{UPPERCASE}` | `{NIF}` |
| `___+` | `___________` |
| `<<<text>>>` | `<<<PENDING>>>` |
| `XXXX` | `XXXXXX` |
| `PENDIENTE` | `PENDIENTE DE CONFIRMACIÓN` |
| `TBD` | `TBD` |

---

## Advisor AI Integration

Two endpoints are called on Advisor AI (`ADVISOR_AI_BASE_URL`):

| Endpoint | When |
|----------|------|
| `POST /api/validate-contract` | Legacy validation on uploaded documents |
| `POST /api/legal-documents/validate` | Diff-aware validation on generated documents, with `canonicalTemplate` |

The `validate_legal_document()` method on `AdvisorContractValidatorService` sends
`documentText` + optional `canonicalTemplate` for structural diff analysis.
Safe failure is preserved: returns `review_required`, `block_signing: false`,
`advisor_available: false` on any network or parsing error.

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `document_templates` | Master template catalogue |
| `document_template_versions` | Binary snapshots (immutable after publish) |
| `document_template_fields` | Variable field definitions |
| `deal_folder_parties` | KYC-tracked deal counterparts |
| `generated_documents` | Documents rendered from templates |
| `document_versions` | Version history of a generated document |
| `document_change_sets` | Persisted diffs between versions |
| `legal_review_decisions` | Auto + manual review audit trail |
| `document_retention_policies` | Org / type-level retention rules |

All tables have RLS via `app.current_org_id`. Global templates (`is_global=true`)
are readable by all orgs but can only be modified by their owning org.

---

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `NEXUS_DOCUMENT_ENCRYPTION_KEY` | — | AES-256-GCM key (32 bytes hex) |
| `ADVISOR_AI_BASE_URL` | — | Advisor AI backend URL |
| `ADVISOR_AI_INTERNAL_API_KEY` | — | Bearer token for Advisor AI |
| `ADVISOR_AI_TIMEOUT_SECONDS` | `30` | HTTP timeout for AI calls |

---

## Security

- All document binaries encrypted at rest with AES-256-GCM
- Signed documents and published template versions are immutable
- RLS enforces org isolation on all 9 new tables
- `auto_delete` is permanently disabled at API level
- Privacy-safe: document text hash (SHA-256) stored, never raw text
- Advisor AI responses stored in `advisor_ai_response` JSONB, not re-exposed to callers
