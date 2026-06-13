# DMS Complete Document Flow

This document captures the production workflow implemented for Nexus DMS.

## Flow

1. Create a deal folder with a required primary CRM client (`client_lead_id` or `seller_id`).
2. Add folder parties linked to CRM records when available.
3. Select a published template from `GET /api/dms/folders/{folder_id}/available-templates`.
4. Generate a document through `POST /api/dms/folders/{folder_id}/generate-document`.
5. Resolve variables from folder, parties, property, organization and agent context.
6. Download generated DOCX/PDF through private DMS download endpoints.
7. Edit creates a new `document_versions` row and resets legal status to `review_required`.
8. Advisor AI validation writes a `legal_review_decisions` row and updates the current version.
9. Signature can start only when the current generated version is legally approved.
10. Signed versions are immutable.

## Key Endpoints

- `POST /api/dms/folders`
- `GET /api/dms/party-candidates`
- `POST /api/dms/folders/{folder_id}/parties`
- `GET /api/dms/folders/{folder_id}/available-templates`
- `POST /api/dms/folders/{folder_id}/generate-document`
- `POST /api/dms/generated-documents/{document_id}/validate`
- `POST /api/dms/generated-documents/{document_id}/review-decisions`
- `POST /api/dms/generated-documents/{document_id}/versions`
- `GET /api/dms/generated-documents/{document_id}/download?format=docx|pdf`
- `POST /api/dms/generated-documents/{document_id}/signature-flows`

## Environment

- `NEXUS_DMS_BUCKET`: Supabase private bucket used for DMS storage. Defaults to `dms`.
- `NEXUS_DMS_MAX_UPLOAD_BYTES`: maximum external upload size.
- `NEXUS_DOCUMENT_ENCRYPTION_KEY`: 32-byte hex encryption key for uploaded external documents.
- `ADVISOR_AI_BASE_URL`: Advisor AI base URL.
- `ADVISOR_AI_INTERNAL_API_KEY`: internal Advisor AI API key. Sent as bearer, legacy `X-Anclora-Internal-Key`, and `x-advisor-internal-api-key`.
- `ADVISOR_AI_TIMEOUT_SECONDS`: Advisor AI request timeout.
- `DOCUSEAL_API_KEY`: required to create production signature flows.
- `DOCUSEAL_WEBHOOK_SECRET`: required to verify DocuSeal webhooks.

## Schema

Run `supabase/migrations/064_dms_complete_flow.sql` after `063_dms_tables.sql`.

The migration is self-contained for Supabase SQL Editor: it creates the missing template, party, generated document, version, review and generated-signature tables if they do not already exist, then applies the additive hardening columns and indexes.

## Notes

- Advisor AI technical failures never approve a document. The document remains blocked or review-required until manual review.
- Legacy uploaded documents still use `deal_documents`; generated documents use `generated_documents` and `document_versions`.
- Generated document signature flows use `generated_document_signature_flows` to avoid violating the `document_signature_flows.document_id` foreign key to `deal_documents`.
