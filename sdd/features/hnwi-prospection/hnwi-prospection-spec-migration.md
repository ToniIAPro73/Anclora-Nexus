# HNWI Prospection – Migración de Base de Datos (ANCLORA-HNWI-001)

## 1. Resumen de Cambios

Esta migración añade soporte para el tracking de leads HNWI, scoring automático y trazabilidad de fuentes de prospección.

## 2. Migración Principal

**Archivos reales:**
- `supabase/migrations/058_hnwi_prospection.sql`
- `supabase/migrations/059_lead_outreach_interactions.sql`

```sql
-- ANCLORA-HNWI-001: Soporte para Prospección HNWI

-- Añadir campos a la tabla leads
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS zone_interest TEXT,
ADD COLUMN IF NOT EXISTS qualification_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS qualification_tier TEXT DEFAULT 'cold' CHECK (qualification_tier IN ('hot', 'warm', 'cold')),
ADD COLUMN IF NOT EXISTS hnwi_source_channel TEXT,
ADD COLUMN IF NOT EXISTS hnwi_intent_signal TEXT;

-- Crear tabla de eventos de prospección (para auditoría y métricas)
CREATE TABLE IF NOT EXISTS hnwi_prospection_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orgid UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('detected', 'enriched', 'scored', 'ingested', 'contacted', 'qualified')),
    channel TEXT,
    nationality TEXT,
    score INTEGER,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_leads_qualification_tier ON leads(qualification_tier);
CREATE INDEX IF NOT EXISTS idx_leads_nationality ON leads(nationality);
CREATE INDEX IF NOT EXISTS idx_hnwi_events_orgid ON hnwi_prospection_events(orgid);
CREATE INDEX IF NOT EXISTS idx_hnwi_events_lead ON hnwi_prospection_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_hnwi_events_created ON hnwi_prospection_events(created_at);

-- Vista materializada para métricas rápidas (opcional)
CREATE OR REPLACE VIEW hnwi_prospection_metrics AS
SELECT 
    orgid,
    DATE_TRUNC('week', created_at) as week,
    COUNT(*) as total_leads,
    COUNT(*) FILTER (WHERE qualification_tier = 'hot') as hot_leads,
    AVG(qualification_score) as avg_score,
    COUNT(DISTINCT nationality) as unique_nationalities
FROM hnwi_prospection_events
GROUP BY orgid, DATE_TRUNC('week', created_at);
```

## 3. Rollback

```sql
-- Rollback de la migración
DROP VIEW IF EXISTS hnwi_prospection_metrics;
DROP TABLE IF EXISTS hnwi_prospection_events;
ALTER TABLE leads 
DROP COLUMN IF EXISTS nationality,
DROP COLUMN IF EXISTS zone_interest,
DROP COLUMN IF EXISTS qualification_score,
DROP COLUMN IF EXISTS qualification_tier,
DROP COLUMN IF EXISTS hnwi_source_channel,
DROP COLUMN IF EXISTS hnwi_intent_signal;
```

## 4. Verificación Post-Migración

```sql
-- Verificar columnas añadidas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leads' 
AND column_name IN ('nationality', 'qualification_score', 'qualification_tier');

-- Verificar tabla de eventos
SELECT COUNT(*) FROM hnwi_prospection_events;
```

---

**Nota**: Esta migración es **additive** y no rompe la compatibilidad con leads existentes.
