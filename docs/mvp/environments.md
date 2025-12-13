# QuoteMyAV - Environments & Configuration

## Overview

QuoteMyAV is a full-stack SaaS application with the following architecture:
- **Frontend:** Vite + React deployed on Vercel
- **Backend:** n8n workflows (local with Cloudflare Tunnel)
- **Database:** Supabase (PostgreSQL)
- **Payments:** Stripe
- **AI:** Anthropic Claude API

---

## 1. Environment Tiers

### Development (Local)
- **Purpose:** Local development and testing
- **Frontend:** `localhost:5173` (Vite dev server)
- **Backend:** `localhost:5678` (n8n local instance)
- **Database:** Supabase development project
- **Payments:** Stripe test mode
- **AI:** Claude API (same key, usage tracking)

**Key Differences:**
- Hot module reloading enabled
- Detailed error messages visible
- Test mode for payments
- Local n8n instance (no tunnel required for testing)
- Separate Supabase project to avoid production data pollution

### Staging (Optional)
- **Purpose:** Pre-production testing with production-like setup
- **Frontend:** `staging.quotemyav.com` (Vercel preview deployment)
- **Backend:** n8n local with staging Cloudflare Tunnel
- **Database:** Supabase staging project (separate from prod)
- **Payments:** Stripe test mode
- **AI:** Claude API (same key)

**Key Differences:**
- Production build configuration
- Real webhook testing
- Separate database to test migrations
- Optional - can use Vercel preview deployments instead

### Production
- **Purpose:** Live application serving real customers
- **Frontend:** `quotemyav.com` (Vercel production deployment)
- **Backend:** n8n local with production Cloudflare Tunnel
- **Database:** Supabase production project
- **Payments:** Stripe live mode
- **AI:** Claude API (monitor usage/costs closely)

**Key Differences:**
- Minified/optimized builds
- Error reporting to Sentry
- Production API keys and secrets
- RLS policies strictly enforced
- Uptime monitoring enabled
- Analytics tracking enabled

---

## 2. Configuration Management

### Frontend Environment Variables (Vite)

All frontend environment variables must use the `VITE_` prefix to be exposed to the client.

**File:** `.env.local` (local), Vercel dashboard (production)

```bash
# API Endpoints
VITE_N8N_WEBHOOK_URL=https://your-tunnel.trycloudflare.com/webhook
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... # or pk_live_...

# App Configuration
VITE_APP_NAME=QuoteMyAV
VITE_APP_URL=https://quotemyav.com
VITE_ENVIRONMENT=development # or production

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_AI_CHAT=true
```

**Security Note:** Never put secret keys in VITE_ variables - they are exposed to the browser.

### n8n Credentials Storage

n8n stores credentials in its internal encrypted database (SQLite locally, PostgreSQL if using n8n Cloud).

**Credentials to configure in n8n UI:**
- **Supabase API** - Service role key (server-side only)
- **Anthropic API** - Claude API key
- **Stripe API** - Secret key (test or live)
- **Webhook Auth** - Optional HMAC secret for webhook validation

**Location:**
- Local: `~/.n8n/database.sqlite` (encrypted)
- Cloud: n8n Cloud dashboard

**Best Practice:** Use n8n's credential management - don't store secrets in workflow JSON.

### Supabase Project Settings

**Configuration managed in Supabase Dashboard:**
- **Project URL:** Auto-generated, use in `VITE_SUPABASE_URL`
- **Anon Key:** Public key for client-side auth, use in `VITE_SUPABASE_ANON_KEY`
- **Service Role Key:** Secret key for n8n workflows (never expose to client)
- **JWT Secret:** Auto-managed, used for auth token signing
- **Database Password:** Auto-generated, stored securely

**Access via:**
- Dashboard: `https://app.supabase.com/project/your-project-id`
- API Docs: `https://app.supabase.com/project/your-project-id/api`

### Required Environment Variables Summary

| Variable | Where Used | Secret? | Description |
|----------|------------|---------|-------------|
| `VITE_N8N_WEBHOOK_URL` | Frontend | No | Public webhook endpoint (via Cloudflare Tunnel) |
| `VITE_SUPABASE_URL` | Frontend | No | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | No | Supabase anonymous key (public) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Frontend | No | Stripe publishable key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | n8n | Yes | Supabase admin key (n8n credential) |
| `ANTHROPIC_API_KEY` | n8n | Yes | Claude API key (n8n credential) |
| `STRIPE_SECRET_KEY` | n8n | Yes | Stripe secret key (n8n credential) |
| `N8N_WEBHOOK_SECRET` | n8n + Frontend | Yes | Optional HMAC for webhook validation |

---

## 3. Secrets Management

### Storage Locations

**Development:**
- Frontend secrets: `.env.local` (gitignored)
- Backend secrets: n8n credentials UI → `~/.n8n/database.sqlite`
- Backup: `~/.env` for CLI tools (optional)

**Production:**
- Frontend secrets: Vercel dashboard → Environment Variables
- Backend secrets: n8n credentials UI (encrypted database)
- Backup: Password manager (1Password, Bitwarden, LastPass)

### Secret Types

| Secret | Storage | Access | Rotation |
|--------|---------|--------|----------|
| Supabase Service Role Key | n8n credentials + password manager | n8n workflows only | On compromise or annually |
| Anthropic API Key | n8n credentials + password manager | n8n workflows only | On compromise |
| Stripe Secret Key | n8n credentials + password manager | n8n workflows only | On compromise or annually |
| Supabase Database Password | Supabase dashboard + password manager | Direct DB access (rare) | On compromise |
| n8n Encryption Key | n8n config file | n8n instance | Never (re-encrypt on change) |

### Rotation Policy

**Scheduled Rotation:**
- Database passwords: Annually or on team member departure
- API keys: Annually or on compromise detection
- Webhook secrets: Quarterly

**Emergency Rotation:**
- Immediately on suspected compromise
- After security incident
- When team member with access leaves

**Rotation Process:**
1. Generate new secret in service dashboard
2. Update n8n credential (test in dev first)
3. Update Vercel environment variables (if applicable)
4. Test critical workflows
5. Revoke old secret
6. Update password manager
7. Document rotation in security log

### Access Control

**Who Has Access:**
- **Myers (Owner):** All secrets, all environments
- **Future Team Members:** Least privilege principle
  - Developers: Dev/staging secrets only
  - DevOps: Production secrets (rotated on departure)
  - Support: Read-only database access via Supabase dashboard

**Access Audit:**
- Review access quarterly
- Revoke unused credentials
- Log all production secret access

### Git Security

**NEVER commit to git:**
- `.env.local` (add to `.gitignore`)
- `.env.production` (add to `.gitignore`)
- `.env` with real secrets (use `.env.example` instead)
- n8n workflow JSON with hardcoded credentials
- API keys in code comments
- Database connection strings with passwords

**Always commit:**
- `.env.example` with placeholder values
- `environments.md` (this file)
- Configuration documentation

**.gitignore must include:**
```
.env
.env.local
.env.*.local
.env.production
.env.development
*.sqlite
database.sqlite
```

---

## 4. Vercel Configuration

### Project Setup

1. **Connect Repository:**
   - Link GitHub repo to Vercel
   - Auto-deploy on push to `main` branch
   - Preview deployments on pull requests

2. **Build Settings:**
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
   - **Node Version:** 18.x or 20.x

3. **Root Directory:**
   - If monorepo: Set to `frontend/` or `client/`
   - If single repo: Leave as root

### Environment Variables Setup

**Vercel Dashboard → Settings → Environment Variables**

Add all `VITE_*` variables for each environment:

**Production:**
```
VITE_N8N_WEBHOOK_URL=https://quotemyav-api.your-domain.com/webhook
VITE_SUPABASE_URL=https://abc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...production-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_ENVIRONMENT=production
```

**Preview (Optional):**
```
VITE_N8N_WEBHOOK_URL=https://staging-tunnel.trycloudflare.com/webhook
VITE_SUPABASE_URL=https://xyz789.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...staging-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_ENVIRONMENT=preview
```

**Development:**
- Use `.env.local` file locally
- Optionally set in Vercel for remote development builds

### Preview Deployments

**How it works:**
- Every pull request gets a unique preview URL
- Uses Preview environment variables (or Production if not set)
- Perfect for testing before merging

**Best practices:**
- Use staging/test Supabase project for previews
- Always use Stripe test mode
- Share preview URLs with team for QA

### Production Deployment

**Automatic:**
- Push to `main` branch triggers production build
- Vercel builds and deploys automatically
- Zero-downtime deployment with rollback support

**Manual:**
- Vercel dashboard → Deployments → Redeploy
- Useful for env var changes without code changes

**Custom Domain:**
- Add custom domain in Vercel dashboard
- Update DNS records (A/CNAME) to point to Vercel
- SSL certificate auto-provisioned

---

## 5. n8n Configuration

### Local vs Cloud Options

**Local n8n (Recommended for MVP):**
- ✅ Free (no monthly cost)
- ✅ Full control over workflows
- ✅ No execution limits
- ✅ Works with Cloudflare Tunnel for webhooks
- ❌ Requires always-on computer
- ❌ Manual backups needed
- ❌ Single point of failure

**n8n Cloud:**
- ✅ Managed hosting (no server maintenance)
- ✅ Built-in backups and version control
- ✅ Native webhook URLs (no tunnel needed)
- ✅ Team collaboration features
- ❌ $20/month minimum (Starter plan)
- ❌ Execution limits on cheaper plans

**Decision:** Start with local n8n + Cloudflare Tunnel for MVP. Migrate to n8n Cloud when:
- Revenue justifies $20/month cost
- Need team collaboration
- Want guaranteed uptime
- Local server becomes unreliable

### Cloudflare Tunnel Setup

Cloudflare Tunnel provides a secure public URL for your local n8n instance without port forwarding.

**Installation:**
```bash
# Install cloudflared
winget install Cloudflare.cloudflared

# Authenticate
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create quotemyav-n8n

# Start tunnel (run this whenever n8n is running)
cloudflared tunnel --url http://localhost:5678 run quotemyav-n8n
```

**Production Setup:**
1. Create named tunnel: `cloudflared tunnel create quotemyav-api`
2. Configure tunnel with custom domain (requires Cloudflare-managed domain)
3. Create config file at `~/.cloudflared/config.yml`:
```yaml
tunnel: quotemyav-api
credentials-file: C:\Users\myers\.cloudflared\<tunnel-id>.json

ingress:
  - hostname: api.quotemyav.com
    service: http://localhost:5678
  - service: http_status:404
```
4. Route DNS: `cloudflared tunnel route dns quotemyav-api api.quotemyav.com`
5. Run as service: `cloudflared service install`

**Quick Tunnel (Development):**
```bash
# One-liner for testing
cloudflared tunnel --url http://localhost:5678
```
Gives you a temporary `*.trycloudflare.com` URL (changes each run).

**Security:**
- Enable n8n basic auth or webhook authentication
- Consider IP allowlisting for production webhooks
- Use HMAC secrets for webhook validation

### Workflow Versioning

n8n workflows are JSON files that can be version controlled.

**Export Workflows:**
1. n8n UI → Workflows → Click workflow → Settings → Download
2. Save to `D:\Projects\QuoteMyAV\n8n-workflows\`
3. Commit to git

**File structure:**
```
n8n-workflows/
├── quote-generation.json
├── payment-processing.json
├── email-notifications.json
└── README.md (workflow descriptions)
```

**Best Practices:**
- Export workflows after major changes
- Use descriptive workflow names (no spaces, kebab-case)
- Document workflow purpose in README
- Test imported workflows in dev before production use
- Never commit credentials (n8n strips them on export)

**Import Workflows:**
1. n8n UI → Workflows → Import from File
2. Select JSON file
3. Re-configure credentials (not exported for security)
4. Test execution

### Credentials Encryption

n8n encrypts all credentials using an encryption key.

**Encryption Key Location:**
- Local: `~/.n8n/config` or environment variable `N8N_ENCRYPTION_KEY`
- Generated automatically on first run if not set

**CRITICAL:**
- **Back up encryption key** - without it, credentials are unrecoverable
- Store in password manager separately from credentials
- If key is lost, must re-enter all credentials manually

**Setting Custom Key (Optional):**
```bash
# In n8n startup script or environment
set N8N_ENCRYPTION_KEY=your-secure-random-key-here
n8n start
```

**Key Rotation:**
- Not supported easily - requires re-encryption of all credentials
- Only rotate on compromise
- Backup old key before rotation

---

## 6. Supabase Configuration

### Project Setup

**Development Project:**
1. Create new project: `quotemyav-dev`
2. Region: Choose closest to you (e.g., `us-east-1`)
3. Database password: Auto-generated (save to password manager)
4. Plan: Free tier (500MB database, 2GB bandwidth, 50MB file storage)

**Production Project:**
1. Create new project: `quotemyav-prod`
2. Same region as dev for consistency
3. Database password: Strong, unique (save to password manager)
4. Plan: Start with Free, upgrade to Pro when needed ($25/month):
   - 8GB database
   - 250GB bandwidth
   - 100GB file storage
   - Daily backups
   - Point-in-time recovery

**Project Settings:**
- **API URL:** Copy from Settings → API → URL
- **Anon Key:** Copy from Settings → API → anon public
- **Service Role Key:** Copy from Settings → API → service_role (secret)

### Connection Pooling

Supabase provides connection pooling for better performance with serverless functions.

**Connection Modes:**
- **Direct Connection:** `postgresql://postgres:password@db.abc123.supabase.co:5432/postgres`
  - Use for migrations, pg_dump, and local development
  - Limited to 60 concurrent connections (Free tier)

- **Pooled Connection:** `postgresql://postgres:password@db.abc123.supabase.co:6543/postgres`
  - Use for n8n workflows and serverless functions
  - Port 6543 (vs 5432 for direct)
  - Supports up to 200 concurrent connections

**When to use which:**
- n8n workflows: Pooled connection (port 6543)
- Database migrations: Direct connection (port 5432)
- Local development: Either (pooled preferred)

**Configuration in n8n:**
- Use Supabase REST API (recommended) - handles pooling automatically
- OR use PostgreSQL node with pooled connection string

### Row-Level Security (RLS) Policies

RLS ensures users can only access their own data.

**Enable RLS on all tables:**
```sql
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

**Example Policies:**
```sql
-- Users can read their own quotes
CREATE POLICY "Users can view own quotes"
ON quotes FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own quotes
CREATE POLICY "Users can create own quotes"
ON quotes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Service role bypasses RLS (for n8n)
-- No policy needed - service_role key has superuser access
```

**Testing RLS:**
1. Create test user in Supabase Auth
2. Use anon key to query as that user
3. Verify they can't access other users' data
4. Use service role key to verify n8n can access all data

**Best Practices:**
- Enable RLS on every table by default
- Create explicit policies for each operation (SELECT, INSERT, UPDATE, DELETE)
- Use `auth.uid()` to scope data to current user
- Test policies with real user tokens
- Service role key bypasses RLS (use carefully in n8n)

### Backups

**Free Tier:**
- No automatic backups
- Manual backups required

**Pro Tier ($25/month):**
- Daily automatic backups (retained for 7 days)
- Point-in-time recovery (up to 7 days)
- On-demand backups

**Manual Backup Strategy (Free Tier):**

1. **Database Schema Backup:**
```bash
# Export schema only
pg_dump -h db.abc123.supabase.co -U postgres -s postgres > schema.sql
```

2. **Full Database Backup:**
```bash
# Export schema + data
pg_dump -h db.abc123.supabase.co -U postgres postgres > backup.sql
```

3. **Automated Backup Script:**
Create a PowerShell script to run daily:
```powershell
# backup-supabase.ps1
$date = Get-Date -Format "yyyy-MM-dd"
$backupPath = "D:\Backups\QuoteMyAV\$date-backup.sql"

# Set PGPASSWORD environment variable
$env:PGPASSWORD = "your-database-password"

# Run pg_dump
pg_dump -h db.abc123.supabase.co -U postgres postgres > $backupPath

# Remove backups older than 30 days
Get-ChildItem "D:\Backups\QuoteMyAV\" -Filter "*.sql" |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } |
  Remove-Item
```

Schedule with Task Scheduler to run daily at 2 AM.

4. **Storage Backup:**
- If using Supabase Storage for file uploads, manually download buckets
- Or sync to cloud storage (Cloudflare R2, AWS S3)

**Restore Process:**
```bash
# Drop and recreate database (DANGEROUS - test first!)
psql -h db.abc123.supabase.co -U postgres -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Restore from backup
psql -h db.abc123.supabase.co -U postgres postgres < backup.sql
```

---

## 7. Monitoring & Observability

### Vercel Analytics (Free)

**Built-in Metrics:**
- Page views
- Visitor count
- Top pages
- Referrer sources
- Geographic distribution
- Core Web Vitals (LCP, FID, CLS)

**Enable:**
- Vercel dashboard → Analytics tab
- No code changes needed
- Available immediately

**Paid Upgrade ($10/month):**
- Real-time analytics
- Custom events
- Audience insights
- Conversion tracking

### Supabase Dashboard

**Database Monitoring:**
- Dashboard → Database → Overview
- **Metrics tracked:**
  - Database size (% of quota)
  - Active connections
  - RAM usage
  - CPU usage
  - API requests (hourly/daily)

**Query Performance:**
- Dashboard → Database → Query Performance
- Slow query log
- Identify N+1 queries
- Index recommendations

**Auth Monitoring:**
- Dashboard → Authentication → Users
- New signups
- Active sessions
- Failed login attempts

**API Usage:**
- Dashboard → Settings → API
- Request count (hourly/daily/monthly)
- Bandwidth usage
- Rate limit status

### n8n Execution Logs

**Built-in Logging:**
- n8n UI → Executions tab
- View all workflow runs
- See input/output of each node
- Error messages with stack traces
- Execution time per node

**Log Retention:**
- Local: Unlimited (stored in SQLite database)
- Cloud: Depends on plan (Starter: 7 days, Pro: 30 days)

**Best Practices:**
- Review failed executions daily
- Set up error workflows to notify you
- Use `Error Trigger` node to catch failures
- Log critical operations to external service (optional)

**Error Workflow Example:**
```
Error Trigger → Email Node (send alert) → Slack Node (notify team)
```

### Error Tracking (Recommendation: Sentry)

**Why Sentry:**
- Free tier: 5,000 events/month
- React integration
- Error grouping and deduplication
- Stack traces with source maps
- Release tracking
- User context (which user hit the error)

**Setup:**
```bash
npm install @sentry/react
```

```javascript
// src/main.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://your-dsn@sentry.io/project-id",
  environment: import.meta.env.VITE_ENVIRONMENT,
  enabled: import.meta.env.VITE_ENVIRONMENT === "production",
  tracesSampleRate: 0.1, // 10% performance monitoring
});
```

**What to track:**
- Unhandled exceptions
- API errors (Supabase, n8n webhooks)
- Payment failures
- Auth errors

**Alerts:**
- Configure Sentry alerts to email/Slack on critical errors
- Set thresholds (e.g., >10 errors in 1 hour)

**Alternatives:**
- Rollbar (similar to Sentry)
- LogRocket (session replay + errors, more expensive)
- Bugsnag (error tracking for mobile + web)

### Uptime Monitoring (Recommendation: UptimeRobot)

**Why UptimeRobot:**
- Free tier: 50 monitors, 5-minute checks
- HTTP(S) monitoring
- Keyword monitoring (check for specific text)
- Email/SMS/Slack alerts
- Public status page

**Setup:**
1. Create account at uptimerobot.com
2. Add monitor: `https://quotemyav.com`
3. Monitor type: HTTPS
4. Check interval: 5 minutes
5. Alert contacts: Your email + SMS (optional)

**What to Monitor:**
- Main website: `https://quotemyav.com`
- Health endpoint: `https://quotemyav.com/api/health` (create a simple health check)
- Supabase API: `https://abc123.supabase.co/rest/v1/` (check if reachable)
- n8n webhook: `https://api.quotemyav.com/webhook/health` (create a test endpoint)

**Keyword Monitoring:**
- Check for "QuoteMyAV" on homepage (detect if site is defaced/broken)
- Check for specific API response

**Alerts:**
- Email: Immediate (downtime detected)
- SMS: After 2 consecutive failures (avoid false alarms)
- Slack: Optional webhook integration

**Alternatives:**
- Better Uptime ($10/month, prettier status pages)
- Pingdom (paid, enterprise features)
- Checkly (API monitoring + E2E tests)

### Recommended Monitoring Stack (MVP)

**Free Tier:**
- ✅ Vercel Analytics (built-in)
- ✅ Supabase Dashboard (built-in)
- ✅ n8n Execution Logs (built-in)
- ✅ UptimeRobot (50 monitors free)
- ✅ Sentry (5k events/month free)

**Total Cost: $0/month**

**When to Upgrade:**
- Vercel Analytics Pro: When need custom events ($10/month)
- Sentry Team: When exceed 5k errors or need 30-day retention ($26/month)
- Better Uptime: When want branded status page ($10/month)

---

## 8. Backup Strategy

### Database Backups

**Supabase Automatic Backups:**
- **Free Tier:** No automatic backups
- **Pro Tier ($25/month):** Daily backups, 7-day retention, point-in-time recovery

**Manual Backup Script (Free Tier):**

See Section 6 (Supabase Configuration → Backups) for full script.

**Backup Schedule:**
- Daily at 2 AM (scheduled via Task Scheduler)
- Before any schema migrations
- Before major production deployments

**Backup Storage:**
- Local: `D:\Backups\QuoteMyAV\` (encrypted drive)
- Cloud: Sync to Cloudflare R2 or Google Drive (encrypted)
- Retention: 30 days local, 90 days cloud

**Test Restores:**
- Monthly: Restore to dev environment to verify backups work
- Document restore process

### n8n Workflow Backups

**Export workflows to JSON:**
```bash
# Manual export via UI
n8n UI → Workflows → [Workflow Name] → Settings → Download

# Or use n8n CLI (if using n8n locally)
n8n export:workflow --all --output=D:\Projects\QuoteMyAV\n8n-workflows\
```

**Version Control:**
- Store workflow JSON files in git repo
- Commit after any workflow changes
- Tag versions for production releases

**File Structure:**
```
D:\Projects\QuoteMyAV\n8n-workflows\
├── quote-generation.json
├── payment-processing.json
├── email-notifications.json
├── ai-chat-processing.json
└── README.md (changelog + descriptions)
```

**Backup Schedule:**
- After every workflow change (manual export + git commit)
- Weekly automated export (if using n8n CLI)

**Restore Process:**
1. n8n UI → Import from File
2. Select workflow JSON
3. Re-enter credentials (not stored in export)
4. Test workflow execution

### User-Uploaded Files (If Applicable)

**If using Supabase Storage for user uploads:**

**Backup Options:**
1. **Manual Download:**
   - Supabase Dashboard → Storage → Bucket → Download
   - Download entire bucket as zip

2. **Sync to Cloud Storage:**
   ```bash
   # Install rclone (cross-cloud sync tool)
   winget install Rclone.Rclone

   # Configure Supabase Storage as source
   rclone config

   # Sync to Cloudflare R2 / Google Drive / etc
   rclone sync supabase:bucket-name r2:quotemyav-backups/files
   ```

3. **Automated Backup Script:**
   ```powershell
   # backup-storage.ps1
   $date = Get-Date -Format "yyyy-MM-dd"

   # Use Supabase Storage API to list and download files
   # (Requires custom script using Supabase SDK)
   ```

**Backup Schedule:**
- Daily sync to cloud storage
- Weekly full download to local encrypted drive

**Retention:**
- 90 days in cloud storage
- 30 days local

**Note:** If files are small and infrequent, Supabase free tier (50MB) may be sufficient without separate backups.

### Configuration Backups

**What to backup:**
- `.env.example` (committed to git)
- Vercel environment variables (screenshot or export)
- n8n credentials list (names only, not values)
- Supabase RLS policies (export SQL)
- Stripe webhook endpoints (screenshot)

**Backup locations:**
- Git repo: `.env.example`, RLS policies, n8n workflows
- Password manager: API keys, credentials list
- Documentation: This file + architecture docs

### Disaster Recovery Plan

**Scenario 1: Database Lost/Corrupted**
1. Create new Supabase project
2. Restore from latest backup: `psql < backup.sql`
3. Update `VITE_SUPABASE_URL` and keys in Vercel
4. Test auth and data access
5. Verify RLS policies

**Scenario 2: n8n Instance Lost**
1. Install n8n on new machine
2. Import workflow JSON files from git
3. Re-enter credentials from password manager
4. Test workflow executions
5. Update Cloudflare Tunnel if needed

**Scenario 3: Vercel Account Lost**
1. Create new Vercel account
2. Re-link GitHub repo
3. Configure environment variables from backup
4. Deploy from `main` branch
5. Update DNS records to new deployment

**Scenario 4: Complete Data Loss**
1. Restore database from cloud backup (R2/Google Drive)
2. Restore n8n workflows from git
3. Recreate Vercel deployment
4. Re-enter all API keys from password manager
5. Test end-to-end user flow

**Recovery Time Objective (RTO):** 4 hours
**Recovery Point Objective (RPO):** 24 hours (daily backups)

---

## 9. Deployment Checklist

### Pre-Deploy Checks

**Code Quality:**
- [ ] All tests passing locally (`npm run test`)
- [ ] No console errors in dev tools
- [ ] Build completes without errors (`npm run build`)
- [ ] Bundle size reasonable (<500KB initial load)

**Environment Variables:**
- [ ] All `VITE_*` vars set in Vercel for target environment
- [ ] Production uses `pk_live_*` for Stripe (not test key)
- [ ] Correct Supabase project URL and keys
- [ ] n8n webhook URL points to production Cloudflare Tunnel

**Database:**
- [ ] All migrations applied to production Supabase
- [ ] RLS policies enabled on all tables
- [ ] Test policies with real user token
- [ ] Backup taken before migration (if schema changes)

**n8n Workflows:**
- [ ] All workflows tested in local/staging
- [ ] Credentials configured for production
- [ ] Error handling added (Error Trigger nodes)
- [ ] Workflows exported and committed to git

**External Services:**
- [ ] Stripe webhook endpoint configured (production URL)
- [ ] Cloudflare Tunnel running and stable
- [ ] Supabase project status: Healthy
- [ ] Claude API key has sufficient credits

**Monitoring:**
- [ ] Sentry DSN configured for production
- [ ] UptimeRobot monitoring enabled
- [ ] Vercel Analytics enabled
- [ ] Alert contacts configured (email/Slack)

**Security:**
- [ ] No secrets committed to git (`git log --all --full-history --source -- .env`)
- [ ] CORS configured correctly in Supabase
- [ ] n8n webhook auth enabled (if using public endpoint)
- [ ] Stripe webhook signature verification enabled

**User Experience:**
- [ ] Test full user flow (signup → quote → payment)
- [ ] Mobile responsive (test on real device)
- [ ] Loading states and error messages clear
- [ ] SEO meta tags set (title, description, OG image)

### Post-Deploy Verification

**Immediate (0-5 minutes):**
- [ ] Homepage loads without errors
- [ ] Login/signup works
- [ ] Supabase connection successful (check network tab)
- [ ] n8n webhook receives test request
- [ ] Check Vercel deployment logs for errors

**Functional Tests (5-15 minutes):**
- [ ] Create new account (test auth flow)
- [ ] Generate a quote (test AI integration)
- [ ] Submit quote for payment (test Stripe test mode)
- [ ] Verify email sent (check n8n execution logs)
- [ ] Test on mobile device (responsive design)

**Backend Tests:**
- [ ] n8n workflows executing successfully
- [ ] Supabase RLS policies enforced (try accessing other user's data)
- [ ] Database writes successful (check Supabase table editor)
- [ ] Stripe webhook received (check Stripe dashboard → Developers → Webhooks)

**Monitoring Check (15-30 minutes):**
- [ ] Sentry receiving events (test an error if needed)
- [ ] UptimeRobot shows site as UP
- [ ] Vercel Analytics tracking pageviews
- [ ] No critical errors in browser console

**Performance Check:**
- [ ] Lighthouse score >90 (Performance, Accessibility, SEO)
- [ ] Core Web Vitals in green (LCP <2.5s, FID <100ms, CLS <0.1)
- [ ] API response times <500ms (check Network tab)

**Security Check:**
- [ ] SSL certificate valid (HTTPS with green lock)
- [ ] CORS headers correct (test from different domain)
- [ ] Auth tokens stored in httpOnly cookies (not localStorage)
- [ ] RLS policies block unauthorized access

**24-Hour Follow-Up:**
- [ ] Review Sentry errors (any unexpected issues?)
- [ ] Check UptimeRobot uptime (any downtime?)
- [ ] Review Supabase API usage (any quota warnings?)
- [ ] Check Stripe dashboard (any failed payments?)

### Rollback Plan

**If critical issue found:**

1. **Vercel Instant Rollback:**
   - Vercel dashboard → Deployments → Find previous working deployment
   - Click "..." → "Promote to Production"
   - Takes ~30 seconds, zero downtime

2. **Database Rollback (if migration broke things):**
   - Restore from latest backup (see Section 8)
   - May lose data since last backup (up to 24 hours)

3. **n8n Workflow Rollback:**
   - Re-import previous workflow JSON from git
   - Delete broken workflow version

4. **Communication:**
   - Update status page (if using Better Uptime)
   - Email affected users (if data lost)
   - Post-mortem document lessons learned

### Deployment Cadence

**Recommended Schedule:**
- **Hotfixes:** As needed (critical bugs)
- **Minor updates:** Weekly (Friday afternoons)
- **Major releases:** Monthly (first Tuesday of month)
- **Database migrations:** During low-traffic hours (2-4 AM)

**Never deploy:**
- Late Friday (no time to fix issues over weekend)
- During high-traffic hours (if you have analytics showing peak times)
- Without testing in staging/preview first

---

## 10. Quick Reference

### Common Commands

```bash
# Frontend (Vite + React)
npm run dev              # Start dev server (localhost:5173)
npm run build            # Build for production (creates dist/)
npm run preview          # Preview production build locally

# n8n
n8n start                # Start n8n server (localhost:5678)
n8n export:workflow      # Export workflows to JSON
n8n import:workflow      # Import workflows from JSON

# Cloudflare Tunnel
cloudflared tunnel --url http://localhost:5678    # Quick tunnel (temporary URL)
cloudflared tunnel run quotemyav-api              # Named tunnel (persistent URL)

# Database (Supabase)
pg_dump -h db.abc123.supabase.co -U postgres postgres > backup.sql    # Backup
psql -h db.abc123.supabase.co -U postgres postgres < backup.sql       # Restore

# Vercel
vercel deploy            # Deploy to preview
vercel --prod            # Deploy to production
vercel env pull          # Pull environment variables to .env.local
```

### Key URLs (Replace with your actual values)

| Service | Development | Production |
|---------|-------------|------------|
| Frontend | http://localhost:5173 | https://quotemyav.com |
| n8n | http://localhost:5678 | https://api.quotemyav.com |
| Supabase | https://app.supabase.com/project/dev-project-id | https://app.supabase.com/project/prod-project-id |
| Stripe | https://dashboard.stripe.com/test | https://dashboard.stripe.com |
| Vercel | https://vercel.com/dashboard | https://vercel.com/dashboard |

### Emergency Contacts

- **Myers (Owner):** pmnicolasm@gmail.com
- **Sentry Alerts:** pmnicolasm@gmail.com
- **UptimeRobot Alerts:** pmnicolasm@gmail.com
- **Vercel Account:** myroproductions

### Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **n8n Docs:** https://docs.n8n.io
- **Stripe Docs:** https://stripe.com/docs
- **Anthropic Docs:** https://docs.anthropic.com

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-12-12 | Initial documentation created | Myers |

---

**Last Updated:** 2025-12-12
**Document Owner:** Myers
**Next Review:** 2026-01-12
