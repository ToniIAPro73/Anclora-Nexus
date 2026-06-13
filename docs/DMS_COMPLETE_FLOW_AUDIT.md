# DMS Complete Flow Audit

## Scope

Audit of the current Anclora Nexus real-estate document management workflow before
closing the complete user flow from deal folder creation to immutable signed
version.

## Operational Today

- Backend DMS router exists in `backend/api/routes/dms.py`.
- Encrypted upload/download for external deal documents is implemented with
  private Supabase Storage and AES-GCM metadata.
- Deal folders exist with `org_id`, operation type, optional property, optional
  lead and optional seller references.
- Template-library tables, generated document tables, document versions,
  legal-review decisions and retention policy tables exist in DMS migration
  scripts.
- Frontend `/dms` page lists folders, uploads encrypted documents, validates
  uploaded documents and can initiate a signature flow placeholder.
- `frontend/src/lib/dms-api.ts` already wraps DMS endpoints.
- Advisor AI integration exists through
  `backend/services/advisor_contract_validator_service.py`.
- Existing backend tests cover DMS routes, Advisor fallback, encryption and
  DocuSeal webhook basics.

## Stubbed Or Incomplete

- Folder creation does not require a primary CRM-linked client.
- `deal_folder_parties` captures manual identity data but does not fully bind
  `lead_id`, `seller_id`, `company_id` or `contact_id`.
- Party PATCH/DELETE and candidate lookup are incomplete.
- Template publication does not enforce production metadata quality such as
  source DOCX path, preview path, canonical text, validity and legal review.
- Generated document flow still accepts manual payloads and does not fully resolve
  variables from CRM/deal/property/organization/agent data.
- Folder-specific template catalog is not exposed as a dedicated endpoint.
- Frontend DMS is an upload workspace, not yet a guided folder-party-template-
  generate-preview-sign workflow.
- Document viewer/editor routes are missing for generated documents.
- Legal review UI and human decision workflow are incomplete.
- Signature flow uses pending envelope identifiers when no provider is configured;
  production provider integration and signed-version immutability need hardening.
- Storage/download rules need explicit generated DOCX/PDF paths, temporary URLs
  and official signed-copy metadata.

## Risks

- Documents can be generated or signed without a primary party unless backend
  guards are added.
- Manual party data can drift from CRM source records.
- Published templates without canonical text or legal review metadata could be
  selected by users.
- Technical validation failures must not result in signature approval.
- Signed versions must be immutable across upload, edit, validation and signature
  paths.
- Tests must mock Advisor AI, storage and signature provider; no real external
  services should be used.

## Dependencies

- Supabase tables and RLS policies under `supabase/migrations`.
- FastAPI DMS router and services in `backend/api/routes/dms.py` and
  `backend/services`.
- Frontend Next.js dashboard route under `frontend/src/app/(dashboard)/dms`.
- Advisor AI internal endpoint configuration.
- DocuSeal API/webhook configuration.
- Private Supabase Storage buckets for generated, template and signed artifacts.

## Migration Plan

1. Add additive migration columns for CRM party links, template metadata,
   generated document storage paths and signature evidence.
2. Harden backend guards before expanding UI actions.
3. Add automatic variable resolution service from folder, parties, CRM records and
   overrides.
4. Expose folder-specific catalog and complete generation endpoint.
5. Add guided frontend flow and template library pages.
6. Add viewer/editor/legal review/signature pages.
7. Add contract tests and mocked integration tests.
8. Update operator documentation and environment examples.
