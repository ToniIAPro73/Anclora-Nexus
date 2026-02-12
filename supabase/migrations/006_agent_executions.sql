-- agent_executions: trazabilidad detallada de ejecuciones de skills
CREATE TABLE IF NOT EXISTS agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id),
  skill_id UUID REFERENCES agents(id), -- Usando la tabla agents como catálogo de skills
  agent_id UUID REFERENCES agents(id),
  status TEXT DEFAULT 'PENDING', -- PENDING, RUNNING, COMPLETED, FAILED, INTERRUPTED
  input JSONB,
  output JSONB,
  reasoning TEXT,
  tool_calls JSONB,
  iteration_count INT DEFAULT 0,
  tokens_used INT DEFAULT 0,
  execution_time_ms INT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indices para rendimiento
CREATE INDEX IF NOT EXISTS idx_agent_executions_org_id ON agent_executions(org_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_skill_id ON agent_executions(skill_id);
CREATE INDEX IF NOT EXISTS idx_agent_executions_created_at ON agent_executions(created_at DESC);

-- RLS
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation_agent_executions" ON agent_executions
  FOR ALL USING (
    org_id IN (
      SELECT id FROM organizations -- Simplificado para v0 single-tenant
    )
  );
