# Access Requests Final Hardening Runbook

**Scope:** `public.access_requests` in the single Nexus Supabase Cloud database.
**Migration:** `supabase/migrations/20260620234119_remove_access_requests_defaults.sql`
**SHA-256:** `d4c9a8b68ba9fa52c01b9ae3b33a9dfc832db3a8012d08fe4c21628b2e4dd475`
**Execution mode:** Manual, once, through Supabase Dashboard SQL Editor.

Do not run `071`, `072_dms_signature_blocking`, `073`, or `074`. Do not modify or
rename historical migrations. Do not deploy, push, or apply SQL remotely from CLI for
this release step.

## A. Pre-DDL Backup Gate

Use Supabase Dashboard first. Do not assume Supabase CLI, `psql`, or `pg_dump` is
configured locally.

Recommended artifact location outside the repository:

```text
/home/toni/backups/nexus/supabase/access_requests/2026-06-20T23-41-19Z/
```

Acceptable local ignored fallback inside this checkout:

```text
artifacts/supabase-backups/access_requests/2026-06-20T23-41-19Z/
```

Before any DDL, create these six files:

```text
access_requests_schema.csv
access_requests_data.csv
access_requests_constraints_indexes.csv
SHA256SUMS.txt
BACKUP_METADATA.md
dashboard_project_screenshot_or_note.txt
```

### 1. Export Schema

In Supabase Dashboard, open the Nexus project, then open **SQL Editor** and run:

```sql
SELECT
  c.ordinal_position,
  c.table_schema,
  c.table_name,
  c.column_name,
  c.data_type,
  c.udt_name,
  c.is_nullable,
  c.column_default,
  c.character_maximum_length,
  c.numeric_precision,
  c.numeric_scale,
  c.datetime_precision
FROM information_schema.columns AS c
WHERE c.table_schema = 'public'
  AND c.table_name = 'access_requests'
ORDER BY c.ordinal_position;
```

Download the result from the Dashboard result grid as
`access_requests_schema.csv`.

### 2. Export Data

In **SQL Editor**, run:

```sql
SELECT *
FROM public.access_requests
ORDER BY created_at, id;
```

Download the result from the Dashboard result grid as `access_requests_data.csv`.
Verify that the export contains 8 rows before continuing.

### 3. Export Constraints And Indexes

In **SQL Editor**, run:

```sql
SELECT
  'constraint' AS artifact_type,
  con.conname AS name,
  con.contype::text AS kind,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint AS con
WHERE con.conrelid = 'public.access_requests'::regclass

UNION ALL

SELECT
  'index' AS artifact_type,
  idx.indexname AS name,
  NULL AS kind,
  idx.indexdef AS definition
FROM pg_indexes AS idx
WHERE idx.schemaname = 'public'
  AND idx.tablename = 'access_requests'

ORDER BY artifact_type, name;
```

Download the result as `access_requests_constraints_indexes.csv`.

### 4. Calculate SHA-256

From the artifact directory, run:

```bash
sha256sum access_requests_schema.csv \
  access_requests_data.csv \
  access_requests_constraints_indexes.csv > SHA256SUMS.txt
cat SHA256SUMS.txt
```

If using a platform without `sha256sum`, record the Dashboard downloads and use an
equivalent SHA-256 tool. Do not paste secrets or connection strings into notes.

### 5. Store Artifacts Outside Git

Keep backup artifacts outside the repository whenever possible. If they must be local
to this checkout, use the ignored `artifacts/` path above and confirm:

```bash
git check-ignore artifacts/supabase-backups/access_requests/2026-06-20T23-41-19Z/
```

### 6. Document Metadata

Create `BACKUP_METADATA.md` with:

```markdown
# Nexus Supabase access_requests Backup Metadata

- Backup UTC date:
- Supabase project name:
- Supabase project ref:
- Operator:
- Dashboard URL used: Supabase Dashboard only; no connection string recorded.
- Files:
  - access_requests_schema.csv
  - access_requests_data.csv
  - access_requests_constraints_indexes.csv
  - SHA256SUMS.txt
- Row count observed for public.access_requests:
- Notes:
```

Do not record database passwords, service-role keys, JWT secrets, connection strings,
or private API keys.

## B. Read-Only Preflight SQL

Run this in Supabase SQL Editor before applying the migration:

```sql
SELECT
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (WHERE product IS NULL) AS product_nulls,
  COUNT(*) FILTER (WHERE source IS NULL) AS source_nulls,
  COUNT(*) FILTER (WHERE request_type IS NULL) AS request_type_nulls,
  COUNT(*) FILTER (WHERE routing_target_domain IS NULL) AS routing_target_domain_nulls
FROM public.access_requests;

SELECT
  product,
  source,
  request_type,
  intake_domain,
  routing_target_domain,
  COUNT(*) AS row_count
FROM public.access_requests
GROUP BY product, source, request_type, intake_domain, routing_target_domain
ORDER BY product, source, request_type, intake_domain, routing_target_domain;

SELECT COUNT(*) AS invalid_rows
FROM public.access_requests
WHERE source NOT IN ('syncxml_landing', 'synergi_app', 'data_lab_app', 'nexus_manual', 'external_api')
   OR product NOT IN ('syncxml', 'synergi', 'data_lab')
   OR intake_domain IS DISTINCT FROM 'access_request'
   OR request_type NOT IN (
        'pilot_request',
        'access_request',
        'partner_admission',
        'workspace_access_request'
      )
   OR routing_target_domain IS DISTINCT FROM 'access_requests';

SELECT
  column_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'access_requests'
  AND column_name IN ('product', 'source', 'request_type', 'routing_target_domain')
ORDER BY column_name;
```

Expected gate:

- `total_rows = 8`.
- All four NULL counts are `0`.
- `invalid_rows = 0`.
- Existing rows are the 8 valid SyncXML pilot requests.

## C. Migration Path

```text
supabase/migrations/20260620234119_remove_access_requests_defaults.sql
```

## D. Migration SHA-256

```text
d4c9a8b68ba9fa52c01b9ae3b33a9dfc832db3a8012d08fe4c21628b2e4dd475
```

Recalculate before manual application:

```bash
sha256sum supabase/migrations/20260620234119_remove_access_requests_defaults.sql
```

## E. Manual Application

After the backup gate and read-only preflight both pass:

1. Open Supabase Dashboard for the single Nexus Supabase Cloud project.
2. Open **SQL Editor**.
3. Paste the complete contents of:
   `supabase/migrations/20260620234119_remove_access_requests_defaults.sql`.
4. Run the statement once.
5. Save the SQL Editor result or screenshot in the backup artifact directory.

Do not run this through local CLI for this release gate. Do not run any other pending
migration in the same operation.

## F. Post-Migration Verification SQL

Run immediately after the migration:

```sql
SELECT
  column_name,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'access_requests'
  AND column_name IN ('product', 'source', 'request_type', 'routing_target_domain')
ORDER BY column_name;
```

Expected:

- `product.column_default IS NULL`.
- `source.column_default IS NULL`.
- `request_type.is_nullable = 'NO'`.
- `routing_target_domain.is_nullable = 'NO'`.

Verify rows and validity:

```sql
SELECT COUNT(*) AS total_rows
FROM public.access_requests;

SELECT
  product,
  source,
  request_type,
  intake_domain,
  routing_target_domain,
  COUNT(*) AS row_count
FROM public.access_requests
GROUP BY product, source, request_type, intake_domain, routing_target_domain
ORDER BY product, source, request_type, intake_domain, routing_target_domain;

SELECT COUNT(*) AS invalid_rows
FROM public.access_requests
WHERE product IS NULL
   OR source IS NULL
   OR request_type IS NULL
   OR routing_target_domain IS NULL
   OR source NOT IN ('syncxml_landing', 'synergi_app', 'data_lab_app', 'nexus_manual', 'external_api')
   OR product NOT IN ('syncxml', 'synergi', 'data_lab')
   OR intake_domain IS DISTINCT FROM 'access_request'
   OR request_type NOT IN (
        'pilot_request',
        'access_request',
        'partner_admission',
        'workspace_access_request'
      )
   OR routing_target_domain IS DISTINCT FROM 'access_requests';
```

Expected:

- `total_rows = 8`.
- The 8 existing records remain intact.
- `invalid_rows = 0`.

## G. Forward-Only Rollback Plan

Do not restore the SyncXML database defaults for `product` or `source`.

If a writer breaks after this hardening:

1. Stop the defective writer path or disable that intake source at the edge.
2. Hotfix the writer so it explicitly sends `product`, `source`, `request_type`,
   `intake_domain`, and `routing_target_domain`.
3. Create a new explicit forward migration only if the schema needs another
   deliberate change.
4. Use restore from the pre-DDL backup only as a last-resort human recovery action,
   after confirming business impact and preserving forensic evidence.
