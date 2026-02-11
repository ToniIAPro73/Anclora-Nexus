---
trigger: always_on
---

```markdown
---
name: supabase-setup
description: "Inicializar y configurar el proyecto Supabase para OpenClaw: schema completo, RLS policies, Edge Functions, triggers y cron jobs. Usar cuando se pida configurar base de datos, migrations, o setup de Supabase."
---

# Supabase Setup Skill

## Contexto
Lee spec.md Seccion 8 (Modelo de Datos) completa antes de ejecutar cualquier accion.

## Instrucciones

### Paso 1: Inicializar Supabase
```bash
npx supabase init
npx supabase link --project-ref $SUPABASE_PROJECT_REF
```

### Paso 2: Crear migraciones en orden
Crear archivos en `supabase/migrations/` con nomenclatura timestamp:
1. `001_extensions.sql` — uuid-ossp, vector, pgcrypto, pg_cron
2. `002_organizations.sql` — Tabla organizations
3. `003_user_profiles.sql` — Tabla user_profiles con FK a auth.users
4. `004_agents.sql` — Tabla agents
5. `005_skills.sql` — Tabla skills (org_id nullable = global)
6. `006_tasks.sql` — Tabla tasks con indices
7. `007_approval_tickets.sql` — Tabla approval_tickets con 9 estados
8. `008_audit_log.sql` — Tabla audit_log INMUTABLE (REVOKE UPDATE, DELETE)
9. `009_agent_memory.sql` — Tabla agent_memory con VECTOR(1536) + indice HNSW
10. `010_payment_transactions.sql` — Tabla payment_transactions
11. `011_incident_logs.sql` — Tabla incident_logs con kill_switch_level
12. `012_constitutional_limits.sql` — Tabla constitutional_limits
13. `013_rls_policies.sql` — TODAS las RLS policies con get_user_org_id()
14. `014_functions.sql` — search_agent_memory(), deduct_budget()
15. `015_cron_jobs.sql` — expire-approval-tickets, delete-expired-memories
16. `016_seed.sql` — Datos de desarrollo (org demo, usuario test, skills basicos)

### Paso 3: Edge Functions
Crear en `supabase/functions/`:
- `execute-approved-transaction/index.ts` — Procesador de pagos post-HITL
- `verify-mfa/index.ts` — Verificacion MFA
- `audit-logger/index.ts` — Escritura inmutable con HMAC-SHA256

### Paso 4: Verificar
```bash
npx supabase db push --linked
npx supabase test db  # pgTAP tests
```

## Criterios de Aceptacion
- TODAS las tablas de spec.md Seccion 8 creadas con tipos exactos
- RLS habilitado y testeado en TODAS las tablas
- audit_log bloquea UPDATE y DELETE
- search_agent_memory() retorna resultados con similarity > 0.7
- Cron jobs programados y activos
```
