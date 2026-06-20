# Migration Plan — Anclora Intake Contract v1

**Migration file:** `supabase/migrations/072_anclora_intake_contract_v1.sql`  
**Type:** Forward-only (additive). No destructive operations.

---

## Columns added to `access_requests`

| Column | Type | Default | Notes |
|---|---|---|---|
| `schema_version` | `text NOT NULL` | `'anclora-intake-v1'` | Identifies contract version |
| `intake_domain` | `text NOT NULL` | `'access_request'` | Routing domain |
| `request_type` | `text` | `NULL` | Backfilled from `product` |
| `service_interest` | `text` | `NULL` | For commercial leads |
| `idempotency_key` | `text` | `NULL` | Unique per submission |
| `routing_target_domain` | `text` | `NULL` | Backfilled to `'access_requests'` |

## Columns added to `lead_intake` (if exists)

Same 6 columns, wrapped in a `DO $$ IF EXISTS $$` block — safe if table does not exist yet.

---

## Backfills

### `source` — fix ambiguous 'landing' values

```sql
UPDATE access_requests
SET source = CASE product
  WHEN 'syncxml'   THEN 'syncxml_landing'
  WHEN 'synergi'   THEN 'synergi_app'
  WHEN 'data_lab'  THEN 'data_lab_app'
  ELSE source
END
WHERE source = 'landing' AND product IS NOT NULL;
```

Records with `source='landing'` and no matching product are left as `landing` (legacy).

### `request_type` — derive from product

```sql
UPDATE access_requests
SET request_type = CASE product
  WHEN 'syncxml'   THEN 'pilot_request'
  WHEN 'synergi'   THEN 'partner_admission'
  WHEN 'data_lab'  THEN 'access_request'
  ELSE NULL
END
WHERE request_type IS NULL AND product IS NOT NULL;
```

### `routing_target_domain` — set for access_request domain

```sql
UPDATE access_requests
SET routing_target_domain = 'access_requests'
WHERE intake_domain = 'access_request' AND routing_target_domain IS NULL;
```

---

## Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_access_requests_intake_domain ON access_requests(intake_domain);
CREATE INDEX IF NOT EXISTS idx_access_requests_request_type  ON access_requests(request_type);
```

Unique index on `idempotency_key` (nullable-safe, only applies to non-null values):

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_access_requests_idempotency_key
  ON access_requests(idempotency_key)
  WHERE idempotency_key IS NOT NULL;
```

---

## Application procedure

```bash
# 1. Verify staging environment
supabase db push --db-url "$STAGING_DB_URL" --include-seed

# 2. Inspect backfill results
psql "$STAGING_DB_URL" -c "
  SELECT source, request_type, COUNT(*)
  FROM access_requests
  GROUP BY source, request_type
  ORDER BY source;
"

# 3. Apply to production (requires explicit approval)
supabase db push --db-url "$PROD_DB_URL"
```

**Do not apply to production without explicit stakeholder approval and a pre-migration backup.**

---

## Rollback notes

This migration is forward-only and additive. There is no rollback script.

If columns must be removed after a production issue:
1. Create a new migration `073_rollback_intake_contract_v1_columns.sql`
2. Use `ALTER TABLE access_requests DROP COLUMN IF EXISTS <column>;` for each column
3. This must be reviewed and approved before applying
