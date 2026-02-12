-- ============================================================================
-- SEED REALISTA ANCLORA NEXUS v0
-- Base de datos sintética completa para testing
-- ============================================================================

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
    
    -- Get agent IDs
    SELECT id INTO v_agent_intake_id FROM agents WHERE org_id = v_org_id AND skill_name = 'lead_intake';
    SELECT id INTO v_agent_prospection_id FROM agents WHERE org_id = v_org_id AND skill_name = 'prospection_weekly';
    SELECT id INTO v_agent_recap_id FROM agents WHERE org_id = v_org_id AND skill_name = 'recap_weekly';

    -- ========================================================================
    -- LEADS (15 leads realistas de lujo en Mallorca SW)
    -- ========================================================================
    
    -- Lead 1: Cliente premium alemán buscando villa con vistas al mar
    INSERT INTO leads (org_id, name, email, phone, source, property_interest, budget_range, urgency, ai_summary, ai_priority, priority_score, status, created_at)
    VALUES (
        v_org_id,
        'Klaus Müller',
        'klaus.mueller@luxuryestate.de',
        '+49 170 1234567',
        'web',
        'Villa con vistas al mar en Port Andratx',
        '€3.5M - €5M',
        'high',
        'Cliente alemán de alto poder adquisitivo buscando villa de lujo con vistas panorámicas al mar. Interesado en zona exclusiva de Port Andratx. Presupuesto flexible, decisión rápida.',
        5,
        0.95,
        'qualified',
        NOW() - INTERVAL '2 days'
    ) RETURNING id INTO v_lead_1;

    -- Lead 2: Inversor británico buscando apartamento en primera línea
    INSERT INTO leads (org_id, name, email, phone, source, property_interest, budget_range, urgency, ai_summary, ai_priority, priority_score, status, created_at)
    VALUES (
        v_org_id,
        'James Richardson',
        'j.richardson@londoninvest.co.uk',
        '+44 7700 900123',
        'exp',
        'Apartamento primera línea en Calvià',
        '€1.2M - €1.8M',
        'medium',
        'Inversor británico experimentado buscando apartamento en primera línea de playa para alquiler vacacional de lujo. Interesado en ROI y gestión profesional.',
        4,
        0.82,
        'contacted',
        NOW() - INTERVAL '5 days'
    ) RETURNING id INTO v_lead_2;

    -- Lead 3: Familia suiza buscando finca rústica
    INSERT INTO leads (org_id, name, email, phone, source, property_interest, budget_range, urgency, ai_summary, ai_priority, priority_score, status, created_at)
    VALUES (
        v_org_id,
        'Sophie Dubois',
        'sophie.dubois@gmail.com',
        '+41 79 123 45 67',
        'referral',
        'Finca rústica con terreno en zona Andratx',
        '€2M - €3M',
        'low',
        'Familia suiza buscando finca tradicional mallorquina con carácter, terreno amplio y potencial de reforma. Buscan tranquilidad y autenticidad.',
        3,
        0.68,
        'new',
        NOW() - INTERVAL '1 day'
    ) RETURNING id INTO v_lead_3;

    -- Lead 4: Empresario español buscando penthouse
    INSERT INTO leads (org_id, name, email, phone, source, property_interest, budget_range, urgency, ai_summary, ai_priority, priority_score, status, created_at)
    VALUES (
        v_org_id,
        'Carlos Fernández',
        'cfernandez@techcorp.es',
        '+34 600 123 456',
        'linkedin',
        'Penthouse moderno en Puerto Portals',
        '€2.5M - €3.5M',
        'immediate',
        'Empresario tecnológico español buscando penthouse ultra-moderno en Puerto Portals. Prioriza diseño contemporáneo, domótica y vistas. Decisión inmediata si encuentra la propiedad ideal.',
        5,
        0.92,
        'negotiating',
        NOW() - INTERVAL '3 hours'
    ) RETURNING id INTO v_lead_4;

    -- Lead 5: Pareja francesa buscando apartamento
    INSERT INTO leads (org_id, name, email, phone, source, property_interest, budget_range, urgency, ai_summary, ai_priority, priority_score, status, created_at)
    VALUES (
        v_org_id,
        'Marie & Pierre Laurent',
        'laurent.family@orange.fr',
        '+33 6 12 34 56 78',
        'web',
        'Apartamento 2-3 hab en Santa Ponsa',
        '€800K - €1.2M',
        'medium',
        'Pareja francesa jubilada buscando apartamento como segunda residencia. Priorizan comunidad segura, cerca del mar y servicios. Presupuesto ajustado.',
        3,
        0.71,
        'contacted',
        NOW() - INTERVAL '4 days'
    ) RETURNING id INTO v_lead_5;

    -- Leads adicionales (10 más para tener variedad)
    INSERT INTO leads (org_id, name, email, phone, source, property_interest, budget_range, urgency, ai_summary, ai_priority, priority_score, status, created_at)
    VALUES 
        (v_org_id, 'Anna Kowalski', 'anna.k@warsaw.pl', '+48 501 234 567', 'web', 'Villa moderna en Son Ferrer', '€1.5M - €2M', 'medium', 'Empresaria polaca buscando villa moderna con piscina y jardín.', 4, 0.79, 'new', NOW() - INTERVAL '6 hours'),
        (v_org_id, 'Michael O''Brien', 'mobrien@dublin.ie', '+353 87 123 4567', 'cold', 'Terreno edificable en Calvià', '€500K - €800K', 'low', 'Inversor irlandés interesado en terreno para proyecto de villa personalizada.', 2, 0.45, 'new', NOW() - INTERVAL '8 days'),
        (v_org_id, 'Isabella Rossi', 'i.rossi@milano.it', '+39 340 123 4567', 'exp', 'Apartamento con vistas en Port Andratx', '€1.8M - €2.5M', 'high', 'Diseñadora italiana buscando apartamento con vistas espectaculares para uso personal.', 4, 0.85, 'qualified', NOW() - INTERVAL '1 day'),
        (v_org_id, 'Henrik Larsson', 'henrik@stockholm.se', '+46 70 123 4567', 'referral', 'Villa con piscina en zona tranquila', '€2M - €2.8M', 'medium', 'Ejecutivo sueco buscando villa familiar en zona residencial tranquila.', 3, 0.72, 'contacted', NOW() - INTERVAL '3 days'),
        (v_org_id, 'Sarah Thompson', 'sarah.t@nyc.com', '+1 917 555 0123', 'web', 'Propiedad de inversión en zona turística', '€1M - €1.5M', 'low', 'Inversora estadounidense buscando propiedad para alquiler vacacional.', 2, 0.58, 'new', NOW() - INTERVAL '7 days'),
        (v_org_id, 'Hans Schmidt', 'h.schmidt@berlin.de', '+49 151 234 5678', 'linkedin', 'Villa histórica con carácter', '€3M - €4M', 'medium', 'Coleccionista alemán interesado en villa histórica mallorquina para restaurar.', 4, 0.81, 'contacted', NOW() - INTERVAL '2 days'),
        (v_org_id, 'Natasha Ivanova', 'n.ivanova@moscow.ru', '+7 916 123 4567', 'exp', 'Penthouse de lujo en primera línea', '€4M - €6M', 'high', 'Cliente rusa de ultra-lujo buscando penthouse exclusivo en primera línea de mar.', 5, 0.94, 'qualified', NOW() - INTERVAL '12 hours'),
        (v_org_id, 'David Cohen', 'd.cohen@telaviv.il', '+972 50 123 4567', 'referral', 'Villa con seguridad en zona exclusiva', '€2.5M - €3.5M', 'high', 'Empresario israelí priorizando seguridad y privacidad en zona exclusiva.', 4, 0.88, 'negotiating', NOW() - INTERVAL '18 hours'),
        (v_org_id, 'Emma van der Berg', 'emma@amsterdam.nl', '+31 6 1234 5678', 'web', 'Apartamento moderno cerca del golf', '€900K - €1.3M', 'medium', 'Pareja holandesa aficionada al golf buscando apartamento cerca de campos.', 3, 0.69, 'new', NOW() - INTERVAL '5 days'),
        (v_org_id, 'Thomas Andersen', 't.andersen@copenhagen.dk', '+45 20 12 34 56', 'cold', 'Villa sostenible con energía renovable', '€1.8M - €2.5M', 'low', 'Arquitecto danés buscando villa con certificación sostenible y tecnología verde.', 3, 0.66, 'new', NOW() - INTERVAL '9 days');

    -- ========================================================================
    -- PROPERTIES (12 propiedades realistas en Mallorca SW)
    -- ========================================================================

    -- Property 1: Villa de lujo en Port Andratx
    INSERT INTO properties (org_id, address, city, postal_code, property_type, price, surface_m2, bedrooms, bathrooms, status, ai_valuation, ai_valuation_confidence, prospection_score, features, created_at)
    VALUES (
        v_org_id,
        'Carrer de la Mar, 15, Port Andratx',
        'Andratx',
        '07157',
        'villa',
        4500000,
        450,
        5,
        4,
        'listed',
        4650000,
        0.89,
        0.92,
        '{"sea_view": true, "pool": true, "garden": true, "garage": true, "modern_design": true, "smart_home": true}',
        NOW() - INTERVAL '15 days'
    ) RETURNING id INTO v_prop_1;

    -- Property 2: Apartamento primera línea en Calvià
    INSERT INTO properties (org_id, address, city, postal_code, property_type, price, surface_m2, bedrooms, bathrooms, status, ai_valuation, ai_valuation_confidence, prospection_score, features, created_at)
    VALUES (
        v_org_id,
        'Paseo Marítimo, 42, Calvià',
        'Calvià',
        '07184',
        'apartment',
        1650000,
        180,
        3,
        2,
        'under_offer',
        1700000,
        0.85,
        0.88,
        '{"sea_view": true, "beach_front": true, "pool": true, "terrace": true, "parking": true}',
        NOW() - INTERVAL '8 days'
    ) RETURNING id INTO v_prop_2;

    -- Property 3: Finca rústica en zona Andratx
    INSERT INTO properties (org_id, address, city, postal_code, property_type, price, surface_m2, bedrooms, bathrooms, status, ai_valuation, ai_valuation_confidence, prospection_score, features, created_at)
    VALUES (
        v_org_id,
        'Camí de S''Arracó, Km 3, Andratx',
        'Andratx',
        '07150',
        'finca',
        2800000,
        600,
        6,
        5,
        'prospect',
        2950000,
        0.76,
        0.81,
        '{"rustic_style": true, "land": true, "mountain_view": true, "renovation_potential": true, "privacy": true}',
        NOW() - INTERVAL '3 days'
    ) RETURNING id INTO v_prop_3;

    -- Property 4: Penthouse moderno en Puerto Portals
    INSERT INTO properties (org_id, address, city, postal_code, property_type, price, surface_m2, bedrooms, bathrooms, status, ai_valuation, ai_valuation_confidence, prospection_score, features, created_at)
    VALUES (
        v_org_id,
        'Avenida Portals Nous, 8, Puerto Portals',
        'Calvià',
        '07181',
        'penthouse',
        3200000,
        250,
        4,
        3,
        'listed',
        3350000,
        0.91,
        0.95,
        '{"sea_view": true, "modern_design": true, "smart_home": true, "pool": true, "gym": true, "concierge": true}',
        NOW() - INTERVAL '5 days'
    ) RETURNING id INTO v_prop_4;

    -- Property 5: Villa familiar en Santa Ponsa
    INSERT INTO properties (org_id, address, city, postal_code, property_type, price, surface_m2, bedrooms, bathrooms, status, ai_valuation, ai_valuation_confidence, prospection_score, features, created_at)
    VALUES (
        v_org_id,
        'Calle Puig de Galatzó, 22, Santa Ponsa',
        'Calvià',
        '07180',
        'villa',
        1950000,
        320,
        4,
        3,
        'contacted',
        2050000,
        0.82,
        0.78,
        '{"pool": true, "garden": true, "garage": true, "family_friendly": true, "near_schools": true}',
        NOW() - INTERVAL '12 days'
    ) RETURNING id INTO v_prop_5;

    -- Properties adicionales (7 más)
    INSERT INTO properties (org_id, address, city, postal_code, property_type, price, surface_m2, bedrooms, bathrooms, status, ai_valuation, ai_valuation_confidence, prospection_score, features, created_at)
    VALUES 
        (v_org_id, 'Urbanización Son Ferrer, Villa 12', 'Calvià', '07182', 'villa', 1750000, 280, 4, 3, 'listed', 1820000, 0.84, 0.79, '{"pool": true, "garden": true, "modern_design": true, "garage": true}', NOW() - INTERVAL '6 days'),
        (v_org_id, 'Camí de Cala Fornells, 5', 'Calvià', '07160', 'villa', 5200000, 550, 6, 5, 'prospect', 5400000, 0.88, 0.93, '{"sea_view": true, "pool": true, "luxury": true, "privacy": true, "gym": true}', NOW() - INTERVAL '2 days'),
        (v_org_id, 'Avenida del Golf, 18, Santa Ponsa', 'Calvià', '07180', 'apartment', 1100000, 150, 3, 2, 'listed', 1150000, 0.81, 0.74, '{"golf_view": true, "pool": true, "terrace": true, "parking": true}', NOW() - INTERVAL '10 days'),
        (v_org_id, 'Carrer de la Creu, 7, Port Andratx', 'Andratx', '07157', 'apartment', 2100000, 200, 3, 2, 'under_offer', 2180000, 0.87, 0.86, '{"sea_view": true, "luxury": true, "terrace": true, "parking": true}', NOW() - INTERVAL '4 days'),
        (v_org_id, 'Urbanización Camp de Mar, Chalet 5', 'Andratx', '07159', 'villa', 3800000, 420, 5, 4, 'listed', 3950000, 0.85, 0.89, '{"sea_view": true, "pool": true, "garden": true, "modern_design": true}', NOW() - INTERVAL '7 days'),
        (v_org_id, 'Paseo Illetas, 33', 'Calvià', '07184', 'penthouse', 2900000, 220, 3, 3, 'prospect', 3050000, 0.83, 0.82, '{"sea_view": true, "beach_front": true, "luxury": true, "terrace": true}', NOW() - INTERVAL '1 day'),
        (v_org_id, 'Camí de Son Ferrer, Parcela 8', 'Calvià', '07182', 'land', 650000, 1200, 0, 0, 'prospect', 720000, 0.68, 0.61, '{"buildable": true, "sea_view": true, "quiet_area": true}', NOW() - INTERVAL '14 days');

    -- ========================================================================
    -- TASKS (20 tareas realistas)
    -- ========================================================================

    -- Tareas relacionadas con leads
    INSERT INTO tasks (org_id, title, description, type, status, due_date, related_lead_id, ai_generated, agent_id, created_at)
    VALUES 
        (v_org_id, 'Llamada de seguimiento Klaus Müller', 'Contactar para agendar visita a villa en Port Andratx', 'follow_up', 'pending', NOW() + INTERVAL '1 day', v_lead_1, true, v_agent_intake_id, NOW()),
        (v_org_id, 'Enviar dossier propiedades a James Richardson', 'Preparar selección de apartamentos en Calvià primera línea', 'follow_up', 'pending', NOW() + INTERVAL '2 hours', v_lead_2, true, v_agent_intake_id, NOW()),
        (v_org_id, 'Responder consulta Sophie Dubois', 'Enviar información sobre fincas rústicas disponibles', 'follow_up', 'pending', NOW() + INTERVAL '3 hours', v_lead_3, true, v_agent_intake_id, NOW()),
        (v_org_id, 'Visita urgente Carlos Fernández', 'Agendar visita penthouse Puerto Portals para mañana', 'follow_up', 'pending', NOW() + INTERVAL '4 hours', v_lead_4, true, v_agent_intake_id, NOW()),
        (v_org_id, 'Follow-up Marie & Pierre Laurent', 'Enviar opciones apartamentos Santa Ponsa en su rango', 'follow_up', 'done', NOW() - INTERVAL '1 day', v_lead_5, true, v_agent_intake_id, NOW() - INTERVAL '2 days'),
        (v_org_id, 'Cualificar lead Natasha Ivanova', 'Verificar capacidad financiera y preparar propuestas ultra-lujo', 'follow_up', 'pending', NOW() + INTERVAL '6 hours', NULL, true, v_agent_intake_id, NOW());

    -- Tareas relacionadas con propiedades
    INSERT INTO tasks (org_id, title, description, type, status, due_date, related_property_id, ai_generated, agent_id, created_at)
    VALUES 
        (v_org_id, 'Actualizar fotos villa Port Andratx', 'Contratar fotógrafo profesional para nuevas imágenes', 'admin', 'pending', NOW() + INTERVAL '3 days', v_prop_1, false, NULL, NOW()),
        (v_org_id, 'Revisar oferta apartamento Calvià', 'Negociar condiciones con comprador interesado', 'prospection', 'pending', NOW() + INTERVAL '1 day', v_prop_2, false, NULL, NOW()),
        (v_org_id, 'Contactar propietario finca Andratx', 'Confirmar disponibilidad para visitas esta semana', 'prospection', 'pending', NOW() + INTERVAL '2 days', v_prop_3, true, v_agent_prospection_id, NOW()),
        (v_org_id, 'Preparar dossier penthouse Puerto Portals', 'Crear presentación premium para cliente VIP', 'dossier', 'pending', NOW() + INTERVAL '5 hours', v_prop_4, true, v_agent_prospection_id, NOW()),
        (v_org_id, 'Valoración actualizada villa Santa Ponsa', 'Solicitar tasación oficial para ajustar precio', 'admin', 'done', NOW() - INTERVAL '2 days', v_prop_5, false, NULL, NOW() - INTERVAL '5 days');

    -- Tareas generales de gestión
    INSERT INTO tasks (org_id, title, description, type, status, due_date, ai_generated, agent_id, created_at)
    VALUES 
        (v_org_id, 'Prospección semanal zona Andratx', 'Buscar nuevas propiedades en zona premium Andratx', 'prospection', 'pending', NOW() + INTERVAL '2 days', true, v_agent_prospection_id, NOW()),
        (v_org_id, 'Generar recap semanal', 'Preparar resumen ejecutivo de actividad semanal', 'admin', 'pending', NOW() + INTERVAL '4 days', true, v_agent_recap_id, NOW()),
        (v_org_id, 'Actualizar CRM con nuevos leads', 'Sincronizar leads de formulario web con sistema', 'admin', 'done', NOW() - INTERVAL '1 day', false, NULL, NOW() - INTERVAL '2 days'),
        (v_org_id, 'Preparar newsletter mensual', 'Seleccionar propiedades destacadas para newsletter', 'admin', 'pending', NOW() + INTERVAL '5 days', false, NULL, NOW()),
        (v_org_id, 'Revisar contratos en negociación', 'Verificar estado de 3 propiedades en fase de oferta', 'admin', 'pending', NOW() + INTERVAL '1 day', false, NULL, NOW()),
        (v_org_id, 'Contactar nuevos propietarios zona golf', 'Prospección activa en Santa Ponsa Golf', 'prospection', 'pending', NOW() + INTERVAL '3 days', true, v_agent_prospection_id, NOW()),
        (v_org_id, 'Actualizar precios mercado', 'Revisar precios competencia en zonas clave', 'admin', 'done', NOW() - INTERVAL '3 days', false, NULL, NOW() - INTERVAL '4 days'),
        (v_org_id, 'Preparar informe trimestral', 'Compilar métricas Q1 para análisis', 'admin', 'pending', NOW() + INTERVAL '7 days', false, NULL, NOW());

    -- ========================================================================
    -- AGENT LOGS (30 logs de actividad reciente)
    -- ========================================================================

    INSERT INTO agent_logs (org_id, agent_id, execution_id, skill_name, status, input_summary, output_summary, tokens_used, duration_ms, created_at)
    VALUES 
        -- Logs de lead_intake
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'success', 'Nuevo lead: Klaus Müller', 'Lead cualificado con prioridad 5. Budget €3.5M-€5M. Interés: Villa Port Andratx.', 1250, 2340, NOW() - INTERVAL '2 days'),
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'success', 'Nuevo lead: James Richardson', 'Lead cualificado con prioridad 4. Inversor británico. Interés: Apartamento Calvià.', 1180, 2120, NOW() - INTERVAL '5 days'),
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'success', 'Nuevo lead: Sophie Dubois', 'Lead cualificado con prioridad 3. Familia suiza. Interés: Finca rústica.', 1090, 1980, NOW() - INTERVAL '1 day'),
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'success', 'Nuevo lead: Carlos Fernández', 'Lead cualificado con prioridad 5. URGENTE. Interés: Penthouse Puerto Portals.', 1320, 2450, NOW() - INTERVAL '3 hours'),
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'success', 'Nuevo lead: Marie & Pierre Laurent', 'Lead cualificado con prioridad 3. Pareja francesa. Interés: Apartamento Santa Ponsa.', 1150, 2050, NOW() - INTERVAL '4 days'),
        
        -- Logs de prospection_weekly
        (v_org_id, v_agent_prospection_id, gen_random_uuid(), 'prospection_weekly', 'success', 'Prospección zona Andratx', 'Identificadas 8 propiedades potenciales. 3 con alta prioridad. Dossier generado.', 3450, 12500, NOW() - INTERVAL '6 days'),
        (v_org_id, v_agent_prospection_id, gen_random_uuid(), 'prospection_weekly', 'success', 'Prospección zona Calvià', 'Identificadas 12 propiedades. 5 primera línea. Match con 2 leads activos.', 3890, 14200, NOW() - INTERVAL '13 days'),
        (v_org_id, v_agent_prospection_id, gen_random_uuid(), 'prospection_weekly', 'running', 'Prospección zona Puerto Portals', 'En progreso: Analizando 15 propiedades de lujo...', 2100, 8500, NOW() - INTERVAL '2 hours'),
        
        -- Logs de recap_weekly
        (v_org_id, v_agent_recap_id, gen_random_uuid(), 'recap_weekly', 'success', 'Recap semanal 03-09 Feb', 'Resumen generado: 15 leads nuevos, 3 propiedades vendidas, €8.2M en pipeline.', 2890, 9800, NOW() - INTERVAL '3 days'),
        (v_org_id, v_agent_recap_id, gen_random_uuid(), 'recap_weekly', 'success', 'Recap semanal 27 Ene - 02 Feb', 'Resumen generado: 12 leads nuevos, 2 propiedades vendidas, €6.5M en pipeline.', 2750, 9200, NOW() - INTERVAL '10 days'),
        
        -- Logs adicionales variados
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'success', 'Nuevo lead: Anna Kowalski', 'Lead cualificado con prioridad 4. Empresaria polaca. Interés: Villa Son Ferrer.', 1210, 2180, NOW() - INTERVAL '6 hours'),
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'success', 'Nuevo lead: Isabella Rossi', 'Lead cualificado con prioridad 4. Diseñadora italiana. Interés: Apartamento Port Andratx.', 1190, 2090, NOW() - INTERVAL '1 day'),
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'error', 'Nuevo lead: Email inválido', 'Error: Formato de email incorrecto. Lead rechazado.', 450, 890, NOW() - INTERVAL '8 days'),
        (v_org_id, v_agent_prospection_id, gen_random_uuid(), 'prospection_weekly', 'success', 'Actualización propiedades activas', 'Actualizadas 24 propiedades. 6 cambios de precio detectados.', 1890, 6500, NOW() - INTERVAL '4 days'),
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'success', 'Nuevo lead: Natasha Ivanova', 'Lead cualificado con prioridad 5. Cliente ultra-lujo. Interés: Penthouse primera línea.', 1380, 2590, NOW() - INTERVAL '12 hours'),
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'success', 'Nuevo lead: David Cohen', 'Lead cualificado con prioridad 4. Prioriza seguridad. Interés: Villa zona exclusiva.', 1240, 2210, NOW() - INTERVAL '18 hours'),
        (v_org_id, v_agent_prospection_id, gen_random_uuid(), 'prospection_weekly', 'success', 'Prospección zona Santa Ponsa', 'Identificadas 10 propiedades. 4 cerca de campos de golf. Match con 1 lead.', 3120, 11200, NOW() - INTERVAL '7 days'),
        (v_org_id, v_agent_recap_id, gen_random_uuid(), 'recap_weekly', 'success', 'Recap mensual Enero', 'Resumen mensual: 48 leads, 7 ventas, €24.5M facturado. ROI +18%.', 4200, 15800, NOW() - INTERVAL '12 days'),
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'success', 'Nuevo lead: Henrik Larsson', 'Lead cualificado con prioridad 3. Ejecutivo sueco. Interés: Villa familiar.', 1170, 2040, NOW() - INTERVAL '3 days'),
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'success', 'Nuevo lead: Hans Schmidt', 'Lead cualificado con prioridad 4. Coleccionista. Interés: Villa histórica.', 1280, 2320, NOW() - INTERVAL '2 days');

    -- Logs adicionales para completar 30
    INSERT INTO agent_logs (org_id, agent_id, execution_id, skill_name, status, input_summary, output_summary, tokens_used, duration_ms, created_at)
    VALUES 
        (v_org_id, v_agent_prospection_id, gen_random_uuid(), 'prospection_weekly', 'success', 'Análisis mercado Andratx', 'Tendencia alcista: +12% en precios zona premium. 18 propiedades nuevas.', 2890, 10200, NOW() - INTERVAL '5 days'),
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'success', 'Nuevo lead: Emma van der Berg', 'Lead cualificado con prioridad 3. Aficionada golf. Interés: Apartamento cerca golf.', 1140, 1990, NOW() - INTERVAL '5 days'),
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'success', 'Nuevo lead: Thomas Andersen', 'Lead cualificado con prioridad 3. Arquitecto. Interés: Villa sostenible.', 1200, 2110, NOW() - INTERVAL '9 days'),
        (v_org_id, v_agent_prospection_id, gen_random_uuid(), 'prospection_weekly', 'success', 'Prospección zona Camp de Mar', 'Identificadas 6 propiedades. 2 villas de lujo con vistas excepcionales.', 2980, 10800, NOW() - INTERVAL '8 days'),
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'success', 'Nuevo lead: Michael O''Brien', 'Lead cualificado con prioridad 2. Inversor. Interés: Terreno edificable.', 1050, 1890, NOW() - INTERVAL '8 days'),
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'success', 'Nuevo lead: Sarah Thompson', 'Lead cualificado con prioridad 2. Inversora USA. Interés: Propiedad inversión.', 1080, 1920, NOW() - INTERVAL '7 days'),
        (v_org_id, v_agent_prospection_id, gen_random_uuid(), 'prospection_weekly', 'success', 'Actualización valoraciones IA', 'Recalculadas 42 propiedades. Ajustes de precio recomendados en 8.', 3450, 12900, NOW() - INTERVAL '11 days'),
        (v_org_id, v_agent_recap_id, gen_random_uuid(), 'recap_weekly', 'success', 'Recap semanal 20-26 Ene', 'Resumen generado: 14 leads nuevos, 1 propiedad vendida, €5.8M en pipeline.', 2680, 8900, NOW() - INTERVAL '17 days'),
        (v_org_id, v_agent_prospection_id, gen_random_uuid(), 'prospection_weekly', 'success', 'Prospección zona Illetas', 'Identificadas 9 propiedades primera línea. 3 penthouses de lujo.', 3210, 11500, NOW() - INTERVAL '14 days'),
        (v_org_id, v_agent_intake_id, gen_random_uuid(), 'lead_intake', 'error', 'Lead duplicado detectado', 'Error: Lead ya existe en sistema. Actualizado registro existente.', 520, 980, NOW() - INTERVAL '15 days');

END $$;
