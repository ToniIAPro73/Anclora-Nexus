-- Idempotent: safe to re-run on an already-migrated database.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS real_estate_deal_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    client_lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    seller_id UUID REFERENCES nexus_sellers(id) ON DELETE SET NULL,
    operation_type TEXT NOT NULL CHECK (operation_type IN ('compraventa','alquiler_temporada','alquiler_turistico')),
    folder_status TEXT NOT NULL DEFAULT 'active' CHECK (folder_status IN ('active','completed','archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_organization FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS deal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES real_estate_deal_folders(id) ON DELETE CASCADE,
    org_id UUID NOT NULL,
    title TEXT NOT NULL,
    document_category TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_mime_type TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    sha256_hash TEXT NOT NULL,
    encryption_iv TEXT NOT NULL,
    encryption_auth_tag TEXT NOT NULL,
    compliance_status TEXT NOT NULL DEFAULT 'pending' CHECK (compliance_status IN ('pending','approved','rejected','expired')),
    legal_metadata JSONB DEFAULT '{}'::jsonb,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_signature_flows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES deal_documents(id) ON DELETE CASCADE,
    org_id UUID NOT NULL,
    external_provider TEXT NOT NULL DEFAULT 'docuseal',
    external_envelope_id TEXT NOT NULL,
    signer_email TEXT NOT NULL,
    signer_name TEXT NOT NULL,
    signer_role TEXT NOT NULL CHECK (signer_role IN ('buyer','seller','agent','witness')),
    flow_status TEXT NOT NULL DEFAULT 'pending' CHECK (flow_status IN ('pending','sent','opened','signed','declined')),
    ip_address TEXT,
    signing_timestamp TIMESTAMPTZ,
    signed_document_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE real_estate_deal_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signature_flows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS deal_folders_isolation ON real_estate_deal_folders;
CREATE POLICY deal_folders_isolation ON real_estate_deal_folders
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

DROP POLICY IF EXISTS documents_isolation ON deal_documents;
CREATE POLICY documents_isolation ON deal_documents
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

DROP POLICY IF EXISTS signature_flows_isolation ON document_signature_flows;
CREATE POLICY signature_flows_isolation ON document_signature_flows
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));
