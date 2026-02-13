-- FIX: Storage RLS (Permissive for Local Dev)
DO $$
BEGIN
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    
    -- Drop all restrictive policies
    EXECUTE 'DROP POLICY IF EXISTS "Public Read Avatars" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "Auth Upload Avatars" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "Auth Update Avatars" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "Public Read Logos" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "Auth Upload Logos" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "Auth Update Logos" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "local_avatars_access" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "local_logos_access" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "avatars_insert" ON storage.objects';
    EXECUTE 'DROP POLICY IF EXISTS "logos_insert" ON storage.objects';

    -- Create new permissive policies
    -- Only create if buckets exist
    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
        EXECUTE 'CREATE POLICY "local_avatars_access" ON storage.objects FOR ALL TO public USING (bucket_id = ''avatars'') WITH CHECK (bucket_id = ''avatars'')';
    END IF;

    IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'logos') THEN
        EXECUTE 'CREATE POLICY "local_logos_access" ON storage.objects FOR ALL TO public USING (bucket_id = ''logos'') WITH CHECK (bucket_id = ''logos'')';
    END IF;

    UPDATE storage.buckets SET public = true WHERE id IN ('avatars', 'logos');
END $$;

-- SEED DATA (from 008_realistic_seed.sql)
DO $$
DECLARE
    v_org_id UUID;
    v_agent_intake_id UUID;
    v_agent_prospection_id UUID;
    v_agent_recap_id UUID;
    v_lead_1 UUID;
    v_lead_2 UUID;
    v_lead_3 UUID;
    v_lead_4 UUID;
    v_lead_5 UUID;
    v_prop_1 UUID;
    v_prop_2 UUID;
    v_prop_3 UUID;
    v_prop_4 UUID;
    v_prop_5 UUID;
BEGIN
    -- Get organization ID
    SELECT id INTO v_org_id FROM organizations WHERE slug = 'anclora-private-estates';
    
    -- Get agent IDs (if they exist from 005_seed)
    SELECT id INTO v_agent_intake_id FROM agents WHERE org_id = v_org_id AND skill_name = 'lead_intake';
    SELECT id INTO v_agent_prospection_id FROM agents WHERE org_id = v_org_id AND skill_name = 'prospection_weekly';
    SELECT id INTO v_agent_recap_id FROM agents WHERE org_id = v_org_id AND skill_name = 'recap_weekly';

    -- If agents don't exist (because 005 might have failed partially), try to create them or fallback
    -- Assuming 005 ran successfully because org exists
    
    -- LEADS
    INSERT INTO leads (org_id, name, email, phone, source, property_interest, budget_range, urgency, ai_summary, ai_priority, priority_score, status, created_at)
    VALUES 
        (v_org_id, 'Klaus Müller', 'klaus.mueller@luxuryestate.de', '+49 170 1234567', 'web', 'Villa con vistas al mar en Port Andratx', '€3.5M - €5M', 'high', 'Cliente alemán de alto poder adquisitivo buscando villa de lujo.', 5, 0.95, 'qualified', NOW() - INTERVAL '2 days')
    RETURNING id INTO v_lead_1;

    INSERT INTO leads (org_id, name, email, phone, source, property_interest, budget_range, urgency, ai_summary, ai_priority, priority_score, status, created_at)
    VALUES 
        (v_org_id, 'James Richardson', 'j.richardson@londoninvest.co.uk', '+44 7700 900123', 'exp', 'Apartamento primera línea en Calvià', '€1.2M - €1.8M', 'medium', 'Inversor británico experimentado.', 4, 0.82, 'contacted', NOW() - INTERVAL '5 days')
    RETURNING id INTO v_lead_2;

    INSERT INTO leads (org_id, name, email, phone, source, property_interest, budget_range, urgency, ai_summary, ai_priority, priority_score, status, created_at)
    VALUES 
        (v_org_id, 'Sophie Dubois', 'sophie.dubois@gmail.com', '+41 79 123 45 67', 'referral', 'Finca rústica con terreno en zona Andratx', '€2M - €3M', 'low', 'Familia suiza buscando finca tradicional.', 3, 0.68, 'new', NOW() - INTERVAL '1 day')
    RETURNING id INTO v_lead_3;

    INSERT INTO leads (org_id, name, email, phone, source, property_interest, budget_range, urgency, ai_summary, ai_priority, priority_score, status, created_at)
    VALUES 
        (v_org_id, 'Carlos Fernández', 'cfernandez@techcorp.es', '+34 600 123 456', 'linkedin', 'Penthouse moderno en Puerto Portals', '€2.5M - €3.5M', 'immediate', 'Empresario tecnológico español.', 5, 0.92, 'negotiating', NOW() - INTERVAL '3 hours')
    RETURNING id INTO v_lead_4;

    INSERT INTO leads (org_id, name, email, phone, source, property_interest, budget_range, urgency, ai_summary, ai_priority, priority_score, status, created_at)
    VALUES 
        (v_org_id, 'Marie & Pierre Laurent', 'laurent.family@orange.fr', '+33 6 12 34 56 78', 'web', 'Apartamento 2-3 hab en Santa Ponsa', '€800K - €1.2M', 'medium', 'Pareja francesa jubilada.', 3, 0.71, 'contacted', NOW() - INTERVAL '4 days')
    RETURNING id INTO v_lead_5;

    -- PROPERTIES
    INSERT INTO properties (org_id, address, city, postal_code, property_type, price, surface_m2, bedrooms, bathrooms, status, ai_valuation, ai_valuation_confidence, prospection_score, features, created_at)
    VALUES 
        (v_org_id, 'Carrer de la Mar, 15, Port Andratx', 'Andratx', '07157', 'villa', 4500000, 450, 5, 4, 'listed', 4650000, 0.89, 0.92, '{"sea_view": true, "pool": true}', NOW() - INTERVAL '15 days')
    RETURNING id INTO v_prop_1;

    INSERT INTO properties (org_id, address, city, postal_code, property_type, price, surface_m2, bedrooms, bathrooms, status, ai_valuation, ai_valuation_confidence, prospection_score, features, created_at)
    VALUES 
        (v_org_id, 'Paseo Marítimo, 42, Calvià', 'Calvià', '07184', 'apartment', 1650000, 180, 3, 2, 'under_offer', 1700000, 0.85, 0.88, '{"sea_view": true, "beach_front": true}', NOW() - INTERVAL '8 days')
    RETURNING id INTO v_prop_2;
    
    INSERT INTO properties (org_id, address, city, postal_code, property_type, price, surface_m2, bedrooms, bathrooms, status, ai_valuation, ai_valuation_confidence, prospection_score, features, created_at)
    VALUES 
        (v_org_id, 'Camí de S''Arracó, Km 3, Andratx', 'Andratx', '07150', 'finca', 2800000, 600, 6, 5, 'prospect', 2950000, 0.76, 0.81, '{"rustic_style": true, "land": true}', NOW() - INTERVAL '3 days')
    RETURNING id INTO v_prop_3;

    INSERT INTO properties (org_id, address, city, postal_code, property_type, price, surface_m2, bedrooms, bathrooms, status, ai_valuation, ai_valuation_confidence, prospection_score, features, created_at)
    VALUES 
        (v_org_id, 'Avenida Portals Nous, 8, Puerto Portals', 'Calvià', '07181', 'penthouse', 3200000, 250, 4, 3, 'listed', 3350000, 0.91, 0.95, '{"sea_view": true, "modern_design": true}', NOW() - INTERVAL '5 days')
    RETURNING id INTO v_prop_4;

    INSERT INTO properties (org_id, address, city, postal_code, property_type, price, surface_m2, bedrooms, bathrooms, status, ai_valuation, ai_valuation_confidence, prospection_score, features, created_at)
    VALUES 
        (v_org_id, 'Calle Puig de Galatzó, 22, Santa Ponsa', 'Calvià', '07180', 'villa', 1950000, 320, 4, 3, 'contacted', 2050000, 0.82, 0.78, '{"pool": true, "garden": true}', NOW() - INTERVAL '12 days')
    RETURNING id INTO v_prop_5;

    -- TASKS
    INSERT INTO tasks (org_id, title, description, type, status, due_date, related_lead_id, related_property_id, agent_id, created_at)
    VALUES 
        (v_org_id, 'Llamada de seguimiento Klaus Müller', 'Contactar para agendar visita', 'follow_up', 'pending', NOW() + INTERVAL '1 day', v_lead_1, NULL, v_agent_intake_id, NOW()),
        (v_org_id, 'Actualizar fotos villa Port Andratx', 'Contratar fotógrafo', 'admin', 'pending', NOW() + INTERVAL '3 days', NULL, v_prop_1, NULL, NOW());

END $$;
