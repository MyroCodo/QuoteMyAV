# Migrating Data from Supabase to RDS

This guide covers the process of migrating QuoteMyAV data from Supabase PostgreSQL to AWS RDS PostgreSQL.

## Prerequisites

1. AWS RDS PostgreSQL instance running (via CDK deployment)
2. Supabase project with data to migrate
3. `pg_dump` and `psql` installed locally
4. AWS credentials configured

## Step 1: Export Schema from Supabase

```bash
# Get your Supabase connection string from the dashboard
# Settings > Database > Connection string (URI)

SUPABASE_URI="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"

# Export schema only (no data)
pg_dump "$SUPABASE_URI" \
  --schema-only \
  --no-owner \
  --no-privileges \
  --exclude-schema=auth \
  --exclude-schema=storage \
  --exclude-schema=supabase_functions \
  > supabase_schema.sql
```

## Step 2: Export Data from Supabase

```bash
# Export data only for app tables
pg_dump "$SUPABASE_URI" \
  --data-only \
  --no-owner \
  --table=subscriptions \
  --table=quotes \
  --table=api_keys \
  --table=ai_jobs \
  --table=api_usage \
  > supabase_data.sql
```

## Step 3: Apply RDS Schema

```bash
# Get RDS connection details from Secrets Manager
RDS_HOST=$(aws secretsmanager get-secret-value \
  --secret-id quotemyav/database \
  --query 'SecretString' \
  --output text | jq -r '.host')

RDS_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id quotemyav/database \
  --query 'SecretString' \
  --output text | jq -r '.password')

# Apply our clean schema
PGPASSWORD="$RDS_PASSWORD" psql \
  -h "$RDS_HOST" \
  -U quotemyav_admin \
  -d quotemyav \
  -f migrations/001_initial_schema.sql
```

## Step 4: Import Data to RDS

```bash
# Import the data
PGPASSWORD="$RDS_PASSWORD" psql \
  -h "$RDS_HOST" \
  -U quotemyav_admin \
  -d quotemyav \
  -f supabase_data.sql
```

## Step 5: Verify Migration

```bash
# Connect to RDS and verify row counts
PGPASSWORD="$RDS_PASSWORD" psql \
  -h "$RDS_HOST" \
  -U quotemyav_admin \
  -d quotemyav \
  -c "SELECT 'subscriptions' as table_name, COUNT(*) FROM subscriptions
      UNION ALL
      SELECT 'quotes', COUNT(*) FROM quotes
      UNION ALL
      SELECT 'api_keys', COUNT(*) FROM api_keys
      UNION ALL
      SELECT 'ai_jobs', COUNT(*) FROM ai_jobs
      UNION ALL
      SELECT 'api_usage', COUNT(*) FROM api_usage;"
```

## Step 6: Update Sequences (if needed)

If your tables use sequences for IDs, update them after import:

```sql
-- Example for any serial/sequence columns
SELECT setval('quotes_id_seq', (SELECT MAX(id) FROM quotes) + 1);
```

## User Migration Notes

### Supabase Auth to Cognito

Users are NOT migrated via SQL - they need to be re-registered in Cognito:

1. **Option A: Force Password Reset**
   - Export user emails from Supabase
   - Import to Cognito with `FORCE_CHANGE_PASSWORD` status
   - Users set new password on first login

2. **Option B: Self-Service Migration**
   - Keep both auth systems running (Supabase fallback)
   - Users naturally migrate as they log in
   - New sign-ups go to Cognito only

### User ID Mapping

Supabase uses `auth.users.id` which is a UUID. Cognito uses `sub` from the JWT which is also a UUID.

For seamless migration:
1. Export mapping: `supabase_user_id -> email`
2. When user signs up in Cognito, their new `sub` replaces the old ID
3. Update foreign keys in `quotes`, `subscriptions`, etc.

```sql
-- Example: Update user_id after Cognito migration
UPDATE quotes
SET user_id = 'new-cognito-uuid'
WHERE user_id = 'old-supabase-uuid';
```

## Rollback Plan

Keep Supabase running for 7 days after migration:

1. DNS points to AWS (primary)
2. If issues arise, flip DNS back to Vercel/Supabase
3. Any new data in RDS needs to be synced back to Supabase

## Data Validation Queries

Run these after migration to verify data integrity:

```sql
-- Check for orphaned quotes (user_id not in subscriptions)
SELECT COUNT(*) as orphaned_quotes
FROM quotes q
WHERE NOT EXISTS (
  SELECT 1 FROM subscriptions s WHERE s.user_id = q.user_id
);

-- Check for quotes with invalid status
SELECT status, COUNT(*)
FROM quotes
GROUP BY status
ORDER BY COUNT(*) DESC;

-- Check line_items JSON structure
SELECT id, quote_number
FROM quotes
WHERE line_items IS NULL
   OR jsonb_typeof(line_items) != 'array';

-- Check API keys expiration
SELECT id, name, expires_at
FROM api_keys
WHERE is_active = true
  AND expires_at IS NOT NULL
  AND expires_at < NOW();
```

## Post-Migration Tasks

1. Update environment variables to use RDS
2. Remove Supabase fallback code (after validation period)
3. Set up RDS automated backups
4. Configure CloudWatch alarms for RDS
5. Test API endpoints with production data
