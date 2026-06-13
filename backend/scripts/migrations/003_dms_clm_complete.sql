-- Migration 003: DMS/CLM Complete
-- Additive only — extends existing tables, no rows are modified.
-- Applies on top of 001_dms_tables.sql and 002_document_template_library.sql.
-- Idempotent: safe to re-run on an already-migrated database.
-- Rollback: see rollback block at bottom of file.

-- ── 1. Extend document_templates ──────────────────────────────────────────────
-- Add missing columns to support 18 families, system templates, full lifecycle.

ALTER TABLE document_templates
    ADD COLUMN IF NOT EXISTS template_key TEXT,
    ADD COLUMN IF NOT EXISTS ape_code TEXT,
    ADD COLUMN IF NOT EXISTS template_family TEXT,
    ADD COLUMN IF NOT EXISTS operation_types TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS phase TEXT DEFAULT 'general',
    ADD COLUMN IF NOT EXISTS system_template BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS cloned_from_id UUID REFERENCES document_templates(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS signable BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS requires_legal_review BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS requires_advisor_validation BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS effective_from DATE,
    ADD COLUMN IF NOT EXISTS effective_until DATE;

-- Widen template_document_type to accept all 18 families
-- (remove old CHECK and add new one)
ALTER TABLE document_templates DROP CONSTRAINT IF EXISTS document_templates_template_document_type_check;
ALTER TABLE document_templates ADD CONSTRAINT document_templates_template_document_type_check
    CHECK (template_document_type IN (
        'arras_penitenciales','contrato_compraventa','oferta_compra',
        'contrato_reserva_senal','nota_encargo','contrato_temporada',
        'contrato_arrendamiento','contrato_alquiler_turistico','recibo_fianza',
        'acta_entrega_llaves','mandato_exclusiva','kyc_identificacion_cliente',
        'acuerdo_confidencialidad','generico','hoja_visita',
        'inventario_estado_inmueble','informacion_privacidad_cliente',
        'declaracion_origen_fondos'
    ));

-- Unique constraint: one ape_code per system template
CREATE UNIQUE INDEX IF NOT EXISTS idx_document_templates_ape_code
    ON document_templates(ape_code) WHERE ape_code IS NOT NULL AND system_template = TRUE;

-- ── 2. Extend document_template_versions ─────────────────────────────────────

ALTER TABLE document_template_versions
    ADD COLUMN IF NOT EXISTS template_key TEXT,
    ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'es',
    ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'es-ES',
    ADD COLUMN IF NOT EXISTS translation_status TEXT NOT NULL DEFAULT 'draft'
        CHECK (translation_status IN (
            'draft','machine_translated','human_review_required',
            'legal_review_required','approved','published','retired'
        )),
    ADD COLUMN IF NOT EXISTS legal_review_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (legal_review_status IN (
            'pending','in_review','approved','rejected','expired'
        )),
    ADD COLUMN IF NOT EXISTS source_language TEXT DEFAULT 'es',
    ADD COLUMN IF NOT EXISTS source_version TEXT,
    ADD COLUMN IF NOT EXISTS version_semver TEXT DEFAULT '0.1.0',
    ADD COLUMN IF NOT EXISTS docx_storage_path TEXT,
    ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT,
    ADD COLUMN IF NOT EXISTS preview_storage_path TEXT,
    ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS legal_reviewer_notes TEXT;

-- Unique constraint for multilingual versions
CREATE UNIQUE INDEX IF NOT EXISTS idx_template_versions_key_lang_version
    ON document_template_versions(template_id, language, version_number);

-- ── 3. Extend deal_folder_parties — more roles ────────────────────────────────

ALTER TABLE deal_folder_parties DROP CONSTRAINT IF EXISTS deal_folder_parties_party_role_check;
ALTER TABLE deal_folder_parties ADD CONSTRAINT deal_folder_parties_party_role_check
    CHECK (party_role IN (
        'buyer','seller','co_buyer','co_seller','landlord','tenant','guest',
        'representative','attorney','company','beneficial_owner','lawyer',
        'witness','agent','guarantor','notary'
    ));

ALTER TABLE deal_folder_parties
    ADD COLUMN IF NOT EXISTS company_id UUID,
    ADD COLUMN IF NOT EXISTS contact_id UUID,
    ADD COLUMN IF NOT EXISTS nationality TEXT,
    ADD COLUMN IF NOT EXISTS is_company BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS company_name TEXT,
    ADD COLUMN IF NOT EXISTS company_cif TEXT,
    ADD COLUMN IF NOT EXISTS kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS variable_snapshot JSONB DEFAULT '{}'::jsonb;

-- ── 4. Extend real_estate_deal_folders ───────────────────────────────────────

ALTER TABLE real_estate_deal_folders
    ADD COLUMN IF NOT EXISTS folder_reference TEXT,
    ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'es',
    ADD COLUMN IF NOT EXISTS jurisdiction TEXT NOT NULL DEFAULT 'ES-IB',
    ADD COLUMN IF NOT EXISTS phase TEXT DEFAULT 'onboarding'
        CHECK (phase IN (
            'onboarding','captacion','due_diligence','comercializacion',
            'visita','negociacion','reserva','precontractual','contrato',
            'firma','entrega','postfirma','archivo'
        ));

-- Auto-generate folder reference if not set
CREATE OR REPLACE FUNCTION generate_folder_reference()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.folder_reference IS NULL THEN
        NEW.folder_reference := 'APE-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(NEXTVAL('folder_reference_seq')::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$;

CREATE SEQUENCE IF NOT EXISTS folder_reference_seq START 1;

DROP TRIGGER IF EXISTS set_folder_reference ON real_estate_deal_folders;
CREATE TRIGGER set_folder_reference
    BEFORE INSERT ON real_estate_deal_folders
    FOR EACH ROW EXECUTE FUNCTION generate_folder_reference();

-- ── 5. Extend generated_documents ────────────────────────────────────────────

ALTER TABLE generated_documents
    ADD COLUMN IF NOT EXISTS docx_storage_path TEXT,
    ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT,
    ADD COLUMN IF NOT EXISTS preview_storage_path TEXT,
    ADD COLUMN IF NOT EXISTS variable_snapshot JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS missing_fields JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS current_version_id UUID REFERENCES document_versions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'es',
    ADD COLUMN IF NOT EXISTS signing_level TEXT DEFAULT 'unknown'
        CHECK (signing_level IN ('simple','advanced','qualified','unknown'));

-- ── 6. Signature flows and events ────────────────────────────────────────────
-- document_signature_flows was created in migration 001 referencing deal_documents.
-- CLM extends it with generated_document_id and richer signing metadata.
-- All new columns are nullable so existing rows are unaffected.

ALTER TABLE document_signature_flows
    ADD COLUMN IF NOT EXISTS generated_document_id UUID REFERENCES generated_documents(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS document_version_id UUID REFERENCES document_versions(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'docuseal',
    ADD COLUMN IF NOT EXISTS external_submission_id TEXT,
    ADD COLUMN IF NOT EXISTS signing_level TEXT DEFAULT 'simple',
    ADD COLUMN IF NOT EXISTS signers JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS signed_document_storage_path TEXT,
    ADD COLUMN IF NOT EXISTS signed_document_sha256 TEXT,
    ADD COLUMN IF NOT EXISTS certificate_storage_path TEXT,
    ADD COLUMN IF NOT EXISTS audit_trail JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS timestamp_token TEXT,
    ADD COLUMN IF NOT EXISTS initiated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Widen flow_status to full CLM lifecycle (migration 001 had 5 values)
ALTER TABLE document_signature_flows DROP CONSTRAINT IF EXISTS document_signature_flows_flow_status_check;
ALTER TABLE document_signature_flows ADD CONSTRAINT document_signature_flows_flow_status_check
    CHECK (flow_status IN ('pending','sent','opened','partially_signed','signed','declined','expired','cancelled'));

-- Add signing_level constraint (new column)
ALTER TABLE document_signature_flows DROP CONSTRAINT IF EXISTS document_signature_flows_signing_level_check;
ALTER TABLE document_signature_flows ADD CONSTRAINT document_signature_flows_signing_level_check
    CHECK (signing_level IS NULL OR signing_level IN ('simple','advanced','qualified','unknown'));

CREATE TABLE IF NOT EXISTS document_signature_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flow_id UUID NOT NULL REFERENCES document_signature_flows(id) ON DELETE CASCADE,
    org_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    signer_email TEXT,
    signer_name TEXT,
    ip_address INET,
    user_agent TEXT,
    provider_event_id TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 7. Document validation runs ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS document_validation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    generated_document_id UUID NOT NULL REFERENCES generated_documents(id) ON DELETE CASCADE,
    document_version_id UUID REFERENCES document_versions(id) ON DELETE SET NULL,
    org_id UUID NOT NULL,
    validator TEXT NOT NULL DEFAULT 'advisor_ai',
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','running','completed','failed','timed_out')),
    risk_level TEXT NOT NULL DEFAULT 'unknown'
        CHECK (risk_level IN ('low','medium','high','critical','unknown')),
    block_signing BOOLEAN NOT NULL DEFAULT FALSE,
    findings JSONB DEFAULT '[]'::jsonb,
    sources JSONB DEFAULT '[]'::jsonb,
    summary TEXT,
    model_id TEXT,
    prompt_version TEXT,
    input_hash TEXT,
    output_hash TEXT,
    request_id TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 8. Legal holds ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS document_legal_holds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    generated_document_id UUID REFERENCES generated_documents(id) ON DELETE RESTRICT,
    folder_id UUID REFERENCES real_estate_deal_folders(id) ON DELETE RESTRICT,
    reason TEXT NOT NULL,
    legal_basis TEXT,
    imposed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    imposed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    lifted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    lifted_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 9. Dossier exports ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dossier_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES real_estate_deal_folders(id) ON DELETE RESTRICT,
    org_id UUID NOT NULL,
    export_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (export_status IN ('pending','building','ready','expired','failed','cancelled')),
    storage_path TEXT,
    sha256_hash TEXT,
    file_size_bytes BIGINT,
    is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
    manifest JSONB DEFAULT '{}'::jsonb,
    options JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ready_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    downloaded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dossier_export_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    export_id UUID NOT NULL REFERENCES dossier_exports(id) ON DELETE CASCADE,
    org_id UUID NOT NULL,
    item_type TEXT NOT NULL,
    source_id UUID,
    zip_path TEXT NOT NULL,
    sha256_hash TEXT,
    included BOOLEAN NOT NULL DEFAULT TRUE,
    omission_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 10. Audit log ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dms_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    resource_hash TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 11. Operation-document checklist ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS operation_document_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operation_type TEXT NOT NULL,
    phase TEXT NOT NULL,
    template_key TEXT,
    document_category TEXT,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('generable','external_required','evidence','optional','recommended')),
    is_blocking BOOLEAN NOT NULL DEFAULT FALSE,
    applies_to_roles TEXT[] DEFAULT '{}',
    jurisdiction TEXT NOT NULL DEFAULT 'ES-IB',
    effective_from DATE,
    effective_until DATE,
    legal_source TEXT,
    reviewed_at DATE,
    reviewed_by TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','deprecated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 12. RLS for new tables ────────────────────────────────────────────────────

ALTER TABLE document_signature_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_signature_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_validation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_legal_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossier_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossier_export_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE dms_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_document_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sig_flows_isolation ON document_signature_flows;
CREATE POLICY sig_flows_isolation ON document_signature_flows
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

DROP POLICY IF EXISTS sig_events_isolation ON document_signature_events;
CREATE POLICY sig_events_isolation ON document_signature_events
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

DROP POLICY IF EXISTS val_runs_isolation ON document_validation_runs;
CREATE POLICY val_runs_isolation ON document_validation_runs
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

DROP POLICY IF EXISTS legal_holds_isolation ON document_legal_holds;
CREATE POLICY legal_holds_isolation ON document_legal_holds
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

DROP POLICY IF EXISTS dossier_exports_isolation ON dossier_exports;
CREATE POLICY dossier_exports_isolation ON dossier_exports
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

DROP POLICY IF EXISTS dossier_items_isolation ON dossier_export_items;
CREATE POLICY dossier_items_isolation ON dossier_export_items
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

DROP POLICY IF EXISTS audit_log_isolation ON dms_audit_log;
CREATE POLICY audit_log_isolation ON dms_audit_log
    FOR ALL USING (org_id = (SELECT current_setting('app.current_org_id', true)::uuid))
    WITH CHECK (org_id = (SELECT current_setting('app.current_org_id', true)::uuid));

DROP POLICY IF EXISTS op_rules_read ON operation_document_rules;
CREATE POLICY op_rules_read ON operation_document_rules
    FOR SELECT USING (TRUE);

-- ── 13. Indexes ───────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_sig_flows_generated ON document_signature_flows(generated_document_id);
CREATE INDEX IF NOT EXISTS idx_sig_flows_status ON document_signature_flows(flow_status);
CREATE INDEX IF NOT EXISTS idx_sig_events_flow ON document_signature_events(flow_id);
CREATE INDEX IF NOT EXISTS idx_val_runs_generated ON document_validation_runs(generated_document_id);
CREATE INDEX IF NOT EXISTS idx_val_runs_status ON document_validation_runs(status);
CREATE INDEX IF NOT EXISTS idx_legal_holds_folder ON document_legal_holds(folder_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_dossier_exports_folder ON dossier_exports(folder_id);
CREATE INDEX IF NOT EXISTS idx_dossier_exports_status ON dossier_exports(export_status);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON dms_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_org_occurred ON dms_audit_log(org_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_template_versions_lang ON document_template_versions(template_id, language);
CREATE INDEX IF NOT EXISTS idx_op_rules_operation ON operation_document_rules(operation_type, phase);

-- ── ROLLBACK (do not apply unless reverting) ──────────────────────────────────
-- DROP TABLE IF EXISTS dossier_export_items CASCADE;
-- DROP TABLE IF EXISTS dossier_exports CASCADE;
-- DROP TABLE IF EXISTS document_legal_holds CASCADE;
-- DROP TABLE IF EXISTS document_validation_runs CASCADE;
-- DROP TABLE IF EXISTS document_signature_events CASCADE;
-- DROP TABLE IF EXISTS document_signature_flows CASCADE;
-- DROP TABLE IF EXISTS dms_audit_log CASCADE;
-- DROP TABLE IF EXISTS operation_document_rules CASCADE;
-- DROP TRIGGER IF EXISTS set_folder_reference ON real_estate_deal_folders;
-- DROP FUNCTION IF EXISTS generate_folder_reference();
-- DROP SEQUENCE IF EXISTS folder_reference_seq;
