-- Insert organization
INSERT INTO organizations (name, slug)
VALUES ('Anclora Private Estates', 'anclora-private-estates')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Note: user_profile depends on auth.users which is managed by Supabase Auth.
-- We can't insert a profile without a valid user ID. 
-- For seeding, we'll use a placeholder or assume the user will create it.
-- However, we can seed agents and limits for the organization.

DO $$
DECLARE
    v_org_id UUID;
BEGIN
    SELECT id INTO v_org_id FROM organizations WHERE slug = 'anclora-private-estates';

    -- Seed Agents
    INSERT INTO agents (org_id, name, description, skill_name, status)
    VALUES 
        (v_org_id, 'Lead Intake Agent', 'Cualifica y prioriza leads entrantes', 'lead_intake', 'active'),
        (v_org_id, 'Prospection Agent', 'Búsqueda semanal de propiedades', 'prospection_weekly', 'active'),
        (v_org_id, 'Weekly Recap Agent', 'Resumen ejecutivo semanal', 'recap_weekly', 'active')
    ON CONFLICT (org_id, skill_name) DO NOTHING;

    -- Seed Constitutional Limits
    INSERT INTO constitutional_limits (org_id, limit_type, limit_value, description)
    VALUES 
        (v_org_id, 'max_daily_leads', 50, 'Límite diario de leads procesados'),
        (v_org_id, 'max_llm_tokens_per_day', 100000, 'Límite diario de tokens LLM')
    ON CONFLICT (org_id, limit_type) DO UPDATE SET limit_value = EXCLUDED.limit_value;
END $$;
