-- audit_log: inmutable (REVOKE UPDATE, DELETE)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  actor_type TEXT NOT NULL, -- 'user', 'agent', 'system'
  actor_id TEXT NOT NULL, -- UUID string
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  signature TEXT -- HMAC-SHA256
);

-- Enforce immutability
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_log' AND policyname = 'audit_no_update'
  ) THEN
    CREATE POLICY "audit_no_update" ON audit_log FOR UPDATE USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_log' AND policyname = 'audit_no_delete'
  ) THEN
    CREATE POLICY "audit_no_delete" ON audit_log FOR DELETE USING (false);
  END IF;
END
$$;

-- Note: Revoking from authenticated and anon roles should be handled carefully.
-- Supabase RLS is the primary mechanism.
REVOKE UPDATE, DELETE ON audit_log FROM authenticated, anon;

-- agent_logs: trazabilidad de ejecuciones IA
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  agent_name TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  input JSONB,
  output JSONB,
  llm_model TEXT,
  tokens_used INTEGER,
  duration_ms INTEGER,
  status TEXT DEFAULT 'success' -- success, error, timeout
);

-- constitutional_limits: límites operativos (no financieros)
CREATE TABLE IF NOT EXISTS constitutional_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  limit_type TEXT NOT NULL,
  limit_value NUMERIC NOT NULL,
  description TEXT,
  UNIQUE(org_id, limit_type)
);
