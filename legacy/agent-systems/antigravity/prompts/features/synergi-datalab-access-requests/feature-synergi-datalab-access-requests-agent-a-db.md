# Agent A — DB & Domain Contract Prompt

Feature: `synergi-datalab-access-requests`

## Role

You are Agent A. Your responsibility is the database, domain model and validation contract for centralized Synergi/Data Lab access requests in Nexus.

## Read first

```text
sdd/features/synergi-datalab-access-requests/README.md
sdd/features/synergi-datalab-access-requests/spec-v1.md
sdd/features/synergi-datalab-access-requests/implementation-plan-nexus.md
.agent/rules/feature-synergi-datalab-access-requests.md
.agent/skills/features/synergi-datalab-access-requests/SKILL.md
.antigravity/prompts/features/synergi-datalab-access-requests/feature-synergi-datalab-access-requests-shared-context.md
```

## Objective

Create the persistent contract for `AccessRequest` so backend and frontend agents can build on a stable schema.

## Required tasks

1. Create `backend/models/access_requests.py`.
2. Create Supabase migration `supabase/migrations/XXX_access_requests.sql` using the next available numeric prefix.
3. Define product/source/status values:

```text
product = synergi | data_lab
source = landing | synergi_app | data_lab_app
status = pending | approved | rejected | revoked
```

4. Do not add `private_estates_web`.
5. Add validation for:
   - `privacy_accepted=true`
   - `gdpr_consent=true`
   - `source=synergi_app` only with `product=synergi`
   - `source=data_lab_app` only with `product=data_lab`
   - `source=landing` with either product
   - `product=data_lab` requires `intended_use` or `message`
   - `product=synergi` requires `service_category` and `service_summary`

## Migration minimum columns

Use the schema defined in `spec-v1.md` unless the existing project conventions require minor naming adjustments.

Mandatory columns:

```sql
id uuid primary key default gen_random_uuid(),
org_id uuid not null,
product text not null,
source text not null,
status text not null default 'pending',
full_name text not null,
email text not null,
phone text,
company text,
profile_type text,
service_category text,
service_summary text,
intended_use text,
requested_scope text,
message text,
privacy_accepted boolean not null default false,
gdpr_consent boolean not null default false,
submission_language text not null default 'es',
external_id text,
captcha_provider text,
captcha_verified boolean not null default false,
captcha_hostname text,
reviewed_at timestamptz,
reviewed_by text,
admin_notes text,
rejection_reason text,
invite_token text,
invite_expires_at timestamptz,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
```

Add useful checks and indexes:

```sql
check (product in ('synergi', 'data_lab'))
check (source in ('landing', 'synergi_app', 'data_lab_app'))
check (status in ('pending', 'approved', 'rejected', 'revoked'))
create index on access_requests(status, created_at desc)
create index on access_requests(product, status)
create index on access_requests(lower(email))
create unique index on access_requests(external_id) where external_id is not null
```

## Boundaries

- Do not implement public routes.
- Do not implement service persistence logic beyond what is needed for model tests.
- Do not modify frontend.
- Do not touch lead intake, valuation requests, n8n workflows or unrelated migrations.

## Tests

Add model/validation tests if the repository has a suitable existing pattern. Otherwise document validation coverage in the execution report for Agent B to test through API route tests.

## Output

Create or update:

```text
sdd/features/synergi-datalab-access-requests/executions/feature-synergi-datalab-access-requests-01-agent-a-db.md
```

Include:

- files created
- migration number
- validations implemented
- known assumptions
- handoff notes for Agent B
