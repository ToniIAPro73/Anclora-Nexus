-- Migration 002: Document Template Library
-- Additive only — no existing tables or rows are modified.
-- Rollback: DROP TABLE ... CASCADE for the 9 tables below.

-- ── 1. Master templates ────────────────────────────────────────────────────────

CREATE TABLE document_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    template_document_type TEXT NOT NULL CHECK (template_document_type IN (
        'arras_penitenciales','contrato_compraventa','contrato_temporada',
        'contrato_alquiler_turistico','kyc_cliente','mandato_exclusiva',
        'oferta_compra','generico'
    )),
    description TEXT,
    jurisdiction TEXT NOT NULL DEFAULT 'España',
    language TEXT NOT NULL DEFAULT 'es',
    is_global BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','deprecated')),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    deprecated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. Template versions (immutable once published) ───────────────────────────

CREATE TABLE document_template_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES document_templates(id) ON DELETE CASCADE,
    org_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    sha256_hash TEXT NOT NULL,
    encryption_iv TEXT NOT NULL,
    encryption_auth_tag TEXT NOT NULL,
    canonical_text TEXT,                   -- plain-text snapshot for diff/RAG
    change_summary TEXT,
    published_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    published_at TIMESTAMPTZ,
    immutable BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (template_id, version_number)
);

-- ── 3. Template variable fields ───────────────────────────────────────────────

CREATE TABLE document_template_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_version_id UUID NOT NULL REFERENCES document_template_versions(id) ON DELETE CASCADE,
    org_id UUID NOT NULL,
    field_key TEXT NOT NULL,               -- e.g. "buyer_name", "sale_price"
    label TEXT NOT NULL,
    field_type TEXT NOT NULL DEFAULT 'text' CHECK (field_type IN (
        'text','number','date','amount','boolean','select'
    )),
    required BOOLEAN NOT NULL DEFAULT TRUE,
    default_value TEXT,
    validation_rule TEXT,                  -- JSON-encoded regex or range
    source_path TEXT,                      -- dotted path to pull from deal/party data
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (template_version_id, field_key)
);

-- ── 4. Deal folder parties ────────────────────────────────────────────────────

CREATE TABLE deal_folder_parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES real_estate_deal_folders(id) ON DELETE CASCADE,
    org_id UUID NOT NULL,
    party_role TEXT NOT NULL CHECK (party_role IN (
        'buyer','seller','agent','guarantor','co_buyer','co_seller','notary'
    )),
    full_name TEXT NOT NULL,
    dni_nie_passport TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    nationality TEXT,
    is_company BOOLEAN NOT NULL DEFAULT FALSE,
    company_name TEXT,
    company_cif TEXT,
    kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    kyc_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 5. Generated documents ────────────────────────────────────────────────────

CREATE TABLE generated_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES real_estate_deal_folders(id) ON DELETE CASCADE,
    org_id UUID NOT NULL,
    template_version_id UUID NOT NULL REFERENCES document_template_versions(id),
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft','review_required','approved','signed','archived'
    )),
    generation_payload JSONB NOT NULL DEFAULT '{}'::jsonb,   -- field values used
    storage_path TEXT,
    sha256_hash TEXT,
    encryption_iv TEXT,
    encryption_auth_tag TEXT,
    generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    generated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 6. Generated document versions (tracks edits after generation) ─────────────

CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_document_id UUID NOT NULL REFERENCES generated_documents(id) ON DELETE CASCADE,
    org_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    sha256_hash TEXT NOT NULL,
    encryption_iv TEXT NOT NULL,
    encryption_auth_tag TEXT NOT NULL,
    change_summary TEXT,
    immutable BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (generated_document_id, version_number)
);

-- ── 7. Change sets (diff between versions) ───────────────────────────────────

CREATE TABLE document_change_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    from_version_id UUID REFERENCES document_versions(id) ON DELETE SET NULL,
    to_version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
    diff_payload JSONB NOT NULL DEFAULT '[]'::jsonb,    -- array of LegalDifference
    risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low','medium','high','critical')),
    computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 8. Legal review decisions ─────────────────────────────────────────────────

CREATE TABLE legal_review_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_document_id UUID NOT NULL REFERENCES generated_documents(id) ON DELETE CASCADE,
    org_id UUID NOT NULL,
    review_type TEXT NOT NULL CHECK (review_type IN ('auto','manual')),
    status TEXT NOT NULL CHECK (status IN ('pending','approved','rejected','escalated')),
    risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low','medium','high','critical')),
    block_signing BOOLEAN NOT NULL DEFAULT FALSE,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    advisor_ai_request_id TEXT,
    advisor_ai_response JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    decided_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 9. Retention policies ─────────────────────────────────────────────────────

CREATE TABLE document_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    template_document_type TEXT,           -- NULL means applies to all types in org
    retention_days INTEGER NOT NULL DEFAULT 2555,   -- 7 years
    auto_archive BOOLEAN NOT NULL DEFAULT TRUE,
    auto_delete BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Row-Level Security ────────────────────────────────────────────────────────

ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_template_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_folder_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_change_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_review_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY templates_isolation ON document_templates
    FOR ALL USING (
        is_global = TRUE OR
        org_id = (SELECT current_setting('app.current_org_id', true)::uuid)
    )
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

CREATE POLICY template_versions_isolation ON document_template_versions
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

CREATE POLICY template_fields_isolation ON document_template_fields
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

CREATE POLICY parties_isolation ON deal_folder_parties
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

CREATE POLICY generated_docs_isolation ON generated_documents
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

CREATE POLICY doc_versions_isolation ON document_versions
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

CREATE POLICY change_sets_isolation ON document_change_sets
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

CREATE POLICY legal_review_isolation ON legal_review_decisions
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

CREATE POLICY retention_policies_isolation ON document_retention_policies
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX idx_document_templates_org ON document_templates(org_id);
CREATE INDEX idx_document_templates_type ON document_templates(template_document_type);
CREATE INDEX idx_template_versions_template ON document_template_versions(template_id);
CREATE INDEX idx_template_fields_version ON document_template_fields(template_version_id);
CREATE INDEX idx_folder_parties_folder ON deal_folder_parties(folder_id);
CREATE INDEX idx_generated_docs_folder ON generated_documents(folder_id);
CREATE INDEX idx_generated_docs_status ON generated_documents(status);
CREATE INDEX idx_doc_versions_generated ON document_versions(generated_document_id);
CREATE INDEX idx_change_sets_to_version ON document_change_sets(to_version_id);
CREATE INDEX idx_legal_review_generated ON legal_review_decisions(generated_document_id);
CREATE INDEX idx_retention_policies_org ON document_retention_policies(org_id);
