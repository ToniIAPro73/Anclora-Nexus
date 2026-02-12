```markdown
---
name: supabase-anclora
description: "Inicializar Supabase para Anclora Nexus v0: schema core (orgs, users, agents, tasks, audit_log, agent_logs, constitutional_limits) + tablas Anclora (leads, properties, weekly_recaps). Usar cuando se pida configurar base de datos o migrations."
---

# Supabase Anclora Setup

## Contexto
Lee product-spec-v0.md Sección 3.4 (Modelo de Datos v0) completa.

## Instrucciones

### Paso 1: Inicializar
```bash
npx supabase init
npx supabase link --project-ref $SUPABASE_PROJECT_REF
```

### Paso 2: Crear migraciones en orden
Directorio: `database/migrations/`

1. `001_extensions.sql` — uuid-ossp, pgcrypto
2. `002_organizations.sql` — Tabla organizations
3. `003_user_profiles.sql` — Tabla user_profiles (FK auth.users)
4. `004_agents.sql` — Tabla agents
5. `005_tasks.sql` — Tabla tasks
6. `006_audit_log.sql` — Tabla audit_log INMUTABLE (REVOKE UPDATE, DELETE)
7. `007_agent_logs.sql` — Tabla agent_logs
8. `008_constitutional_limits.sql` — Tabla constitutional_limits
9. `010_leads.sql` — Tabla leads (Anclora específica)
10. `011_properties.sql` — Tabla properties (Anclora específica)
11. `012_weekly_recaps.sql` — Tabla weekly_recaps
12. `020_seed.sql` — Seed data: org "Anclora Private Estates", usuario Toni, agentes (lead_intake, prospection, recap), constitutional_limits (max_daily_leads=50, max_llm_tokens_per_day=100000)

### Paso 3: Copiar DDL exacto de product-spec-v0.md Sección 3.4. NO inventar columnas.

### Paso 4: Verificar
```bash
npx supabase db push --linked
```

## Criterios de Aceptación
- Todas las tablas creadas con tipos exactos de product-spec-v0.md
- audit_log bloquea UPDATE y DELETE
- Seed data insertado correctamente
- Supabase Auth configurado (magic link provider habilitado)
```
