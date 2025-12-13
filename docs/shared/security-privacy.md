# Security & Privacy Documentation

**Document Version:** 1.0
**Last Updated:** 2025-12-12
**Owner:** QuoteMyAV Engineering Team

---

## Table of Contents

1. [Data Classification](#data-classification)
2. [Data Handling](#data-handling)
3. [Retention Policy](#retention-policy)
4. [Access Control](#access-control)
5. [Audit Logging](#audit-logging)
6. [GDPR & Privacy Compliance](#gdpr--privacy-compliance)
7. [AI-Specific Security](#ai-specific-security)
8. [Incident Response](#incident-response)
9. [Third-Party Services](#third-party-services)

---

## Data Classification

### Personal Identifiable Information (PII)

**Customer Data:**
- Full name
- Email address
- Company name
- Phone number
- Business address
- Job title

**User Account Data:**
- Username
- Hashed password (managed by Supabase Auth)
- Email verification status
- Account creation date
- Last login timestamp

### Business Data

**Quote Information:**
- Quote ID and version
- Customer details (linked to PII)
- Equipment lists and specifications
- Pricing data
- Markup percentages
- Labor rates
- Project scope descriptions
- Generated PDF exports
- Quote status (draft, sent, accepted, rejected)

**Equipment Database:**
- Manufacturer names
- Model numbers
- MSRP pricing
- Technical specifications
- Category classifications

### Sensitive Data

**Payment Information:**
- Stripe Customer ID (stored in our DB)
- Subscription status
- Payment history metadata
- **NOTE:** Credit card data is NEVER stored in QuoteMyAV systems
- **NOTE:** All payment processing handled exclusively by Stripe (PCI DSS compliant)

**API Credentials:**
- Supabase service keys
- Stripe API keys
- Claude API keys
- Cloudflare Tunnel tokens

### Data We Do NOT Collect

- Social Security Numbers
- Tax IDs
- Credit card numbers
- Bank account information
- Biometric data
- Geolocation tracking (beyond country-level for tax purposes)

---

## Data Handling

### Data Storage

**Primary Database (Supabase):**
- All PII and business data stored in Supabase Postgres
- Encryption at rest: AES-256 (Supabase default)
- Database backups: Daily automated backups with 7-day retention
- Geographic region: US-East-1 (configurable)

**File Storage:**
- Generated PDFs stored in Supabase Storage buckets
- Temporary files deleted after 24 hours
- Long-term quote PDFs retained per retention policy

**Frontend (Vercel):**
- No PII stored in browser localStorage (session tokens only)
- Sensitive data never logged to browser console in production
- All static assets served over HTTPS

**Backend (n8n):**
- Workflow execution logs stored locally
- No persistent storage of PII in n8n database
- Temporary processing data cleared after workflow completion

### Encryption

**In Transit:**
- All connections use TLS 1.2+ (HTTPS)
- Frontend to Backend: Cloudflare Tunnel (encrypted)
- Backend to Supabase: SSL connections
- Backend to Claude API: HTTPS
- Backend to Stripe: HTTPS

**At Rest:**
- Supabase: AES-256 encryption (automatic)
- Passwords: bcrypt hashing (Supabase Auth default)
- API keys: Environment variables (never committed to git)

### Data Minimization

**Principles:**
1. Collect only data required for quote generation and billing
2. No unnecessary tracking or analytics on user behavior
3. No third-party advertising or tracking scripts
4. Equipment database contains only publicly available specs

**Implementation:**
- Forms have minimal required fields
- Optional fields clearly marked
- Users can skip non-essential information
- Anonymous usage metrics only (no PII in analytics)

---

## Retention Policy

### Active Data

**User Accounts:**
- Retained for lifetime of active account
- Includes profile data, preferences, quote history

**Active Quotes:**
- Retained indefinitely while account is active
- Users can delete individual quotes at any time

### Deleted Data

**Account Deletion:**
- User initiates deletion via account settings
- 30-day grace period before permanent deletion
- Email confirmation required
- After 30 days: All PII and business data permanently deleted
- Exception: Financial records retained for 7 years (legal requirement)

**Quote Deletion:**
- Soft delete: Marked as deleted, retained for 90 days
- Hard delete: Permanent removal after 90 days
- User can request immediate hard delete via support

**Inactive Accounts:**
- Accounts inactive for 3+ years receive deletion warning email
- 60-day notice before automatic deletion
- Users can reactivate to prevent deletion

### Audit Logs

**Retention Period:** 90 days

**Log Types:**
- Authentication events (login, logout, failed attempts)
- Quote operations (create, edit, export, delete)
- Admin actions
- API access logs
- Security events (rate limiting, suspicious activity)

**After Retention:**
- Logs aggregated into anonymized metrics
- Individual event details permanently deleted

### AI Conversation Logs

**Retention Period:** 30 days

**What's Logged:**
- User prompts sent to Claude API
- AI responses
- Timestamp and user ID
- Quote context (equipment list, pricing data)

**Purpose:** Debugging, quality improvement, abuse prevention

**After Retention:**
- Logs permanently deleted
- No long-term storage
- Anthropic retains per their data retention policy (0 days for non-abuse)

### Payment Data

**Stripe-Managed:**
- Payment methods: Retained by Stripe per their policy
- Transaction history: 7 years (legal requirement)

**Our Database:**
- Subscription status: Lifetime of account
- Invoice metadata: 7 years
- No raw payment data stored

---

## Access Control

### Row Level Security (RLS)

**Supabase Policies:**

```sql
-- Users can only access their own data
CREATE POLICY "Users can view own quotes"
  ON quotes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes"
  ON quotes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes"
  ON quotes FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can access all data
CREATE POLICY "Admins can view all quotes"
  ON quotes FOR SELECT
  USING (is_admin(auth.uid()));
```

**Key Principles:**
- Every table has RLS enabled
- Default deny: No access unless explicitly granted
- User-scoped access via `auth.uid()`
- Admin access via role-based policies

### API Key Management

**Storage:**
- All API keys stored in environment variables
- Never committed to git (`.env` in `.gitignore`)
- Separate keys for dev, staging, production

**Rotation Schedule:**
- Supabase: 90 days
- Stripe: 90 days
- Claude API: 90 days
- Cloudflare: 180 days

**Access:**
- API keys accessible only to authorized engineers
- Stored in secure password manager (1Password/Bitwarden)
- n8n credentials stored in encrypted credentials store

### Admin Access

**Admin Roles:**
- **Super Admin:** Full system access, user management
- **Support Admin:** Read-only access to user data for support tickets
- **Finance Admin:** Access to billing and subscription data

**Authentication:**
- Multi-factor authentication (MFA) required for all admins
- Admin sessions expire after 1 hour of inactivity
- Admin actions logged with user ID and timestamp

**Principle of Least Privilege:**
- Admins granted only permissions needed for their role
- Regular access audits (quarterly)
- Immediate revocation upon role change or departure

### Service-to-Service Auth

**n8n to Supabase:**
- Service role key (stored in n8n credentials)
- Key rotated every 90 days
- Limited to specific operations (no DDL access)

**Frontend to Backend:**
- User session token (Supabase Auth JWT)
- Token expiration: 1 hour
- Automatic refresh token rotation

**Backend to Claude API:**
- API key in environment variables
- Rate limiting enforced at application level

---

## Audit Logging

### Events Logged

**Authentication:**
- Successful login (user ID, timestamp, IP address)
- Failed login attempts (email, timestamp, IP address)
- Password reset requests
- Account creation
- Account deletion
- Session expiration

**Quote Operations:**
- Quote created (quote ID, user ID, timestamp)
- Quote updated (quote ID, user ID, fields changed, timestamp)
- Quote exported to PDF (quote ID, user ID, timestamp)
- Quote deleted (quote ID, user ID, timestamp)
- Quote sent to customer (quote ID, customer email, timestamp)

**Admin Actions:**
- User data accessed (admin ID, user ID, reason, timestamp)
- Support ticket resolved (admin ID, ticket ID, timestamp)
- System configuration changes (admin ID, setting changed, timestamp)

**Security Events:**
- Rate limit exceeded (user ID/IP, endpoint, timestamp)
- Suspicious activity detected (user ID, pattern, timestamp)
- API key rotation (service, rotated by, timestamp)
- Failed authorization attempts (user ID, resource, timestamp)

### Log Schema

```typescript
interface AuditLog {
  id: string;                  // UUID
  timestamp: Date;             // ISO 8601
  event_type: string;          // "auth.login", "quote.create", etc.
  user_id: string | null;      // UUID or null for anonymous
  admin_id: string | null;     // UUID if admin action
  ip_address: string;          // Client IP
  user_agent: string;          // Browser/client info
  resource_type: string;       // "quote", "user", "subscription"
  resource_id: string | null;  // UUID of affected resource
  action: string;              // "create", "read", "update", "delete"
  metadata: object;            // Additional context (JSON)
  success: boolean;            // Action outcome
  error_message: string | null;// Error if success=false
}
```

### Log Storage

**Location:** Supabase `audit_logs` table

**Retention:** 90 days (see [Retention Policy](#retention-policy))

**Access:**
- Admins can query logs via secure dashboard
- Automated alerts for security events
- Daily digest of unusual activity

**Privacy:**
- PII in logs encrypted at rest
- Logs never contain passwords or API keys
- IP addresses anonymized after 30 days (last octet zeroed)

---

## GDPR & Privacy Compliance

### Data Subject Rights

QuoteMyAV supports all GDPR data subject rights:

#### 1. Right to Access (Article 15)
**Request Method:** Email privacy@quotemyav.com or account settings dashboard

**Response Time:** 30 days

**Data Provided:**
- All PII we hold
- Business data (quotes, equipment lists)
- Audit logs (last 90 days)
- Subscription history
- Format: JSON export or PDF report

#### 2. Right to Rectification (Article 16)
**Implementation:**
- Users can update profile data in account settings
- Automated sync to all systems (Supabase, Stripe)
- Changes logged in audit trail

#### 3. Right to Erasure / "Right to be Forgotten" (Article 17)
**Request Method:** Account settings > Delete Account or email privacy@quotemyav.com

**Process:**
1. 30-day grace period (soft delete)
2. Email confirmation required
3. After 30 days: Permanent deletion of all PII and business data
4. Exception: Financial records retained 7 years (legal obligation)
5. Deletion confirmation email sent

**What's Deleted:**
- Profile data
- All quotes
- Audit logs
- AI conversation logs
- Supabase auth account

**What's Retained (Anonymized):**
- Aggregated usage metrics (no PII)
- Financial records (customer ID replaced with anonymized token)

#### 4. Right to Data Portability (Article 20)
**Implementation:**
- Export button in account settings
- Data provided in JSON format (machine-readable)
- Includes: Profile, quotes, equipment lists, pricing data
- No proprietary formats - standard JSON schema

#### 5. Right to Object (Article 21)
**Implementation:**
- Users can object to AI processing (disable AI features)
- Users can object to marketing emails (unsubscribe)
- No automated decision-making that significantly affects users

#### 6. Right to Restrict Processing (Article 18)
**Implementation:**
- Account suspension option (data retained but not processed)
- Quote archival (read-only mode)
- Temporary AI processing disable

### Cookie Policy

**Cookies Used:**
- `sb-auth-token`: Supabase authentication (essential, 1 hour)
- `sb-refresh-token`: Session refresh (essential, 7 days)
- `stripe-session`: Payment session (essential, session only)

**No Tracking Cookies:**
- No third-party analytics cookies
- No advertising cookies
- No social media tracking pixels

**Cookie Consent:**
- Essential cookies only (no consent banner required)
- Cookie policy page with full disclosure
- Users can clear cookies via browser settings

### Privacy Policy Requirements

**Location:** https://quotemyav.com/privacy

**Contents:**
- Identity and contact information of data controller
- Purpose of data processing (quote generation, billing, support)
- Legal basis for processing (contract, legitimate interest, consent)
- Data retention periods
- Third-party services (Supabase, Stripe, Anthropic, Vercel, Cloudflare)
- User rights and how to exercise them
- International data transfers (US-based services)
- Changes to privacy policy (notification process)

**Updates:**
- Users notified via email 30 days before material changes
- Continued use implies consent
- Option to delete account if user disagrees

### Data Processing Agreements (DPAs)

**Third-Party Processors:**
- Supabase: DPA signed (EU Standard Contractual Clauses)
- Stripe: DPA signed (PCI DSS Level 1 certified)
- Anthropic: DPA available (no training on user data)
- Vercel: DPA signed (SOC 2 Type II certified)
- Cloudflare: DPA signed (ISO 27001 certified)

**Customer DPAs:**
- Enterprise customers can request DPA
- Standard DPA template available
- Covers sub-processors, security measures, breach notification

### International Data Transfers

**Primary Location:** United States (Supabase US-East-1)

**EU Users:**
- Standard Contractual Clauses (SCCs) with all processors
- Adequate level of protection per GDPR Article 46
- Users informed of data location in privacy policy

**UK Users:**
- UK GDPR compliance via same mechanisms as EU
- International Data Transfer Addendum (IDTA) available

---

## AI-Specific Security

### Data Sent to Claude API

**User Inputs:**
- Equipment descriptions (free text)
- Quote scope descriptions
- Custom prompts for AI suggestions

**System Context:**
- Equipment list (manufacturer, model, quantity)
- Pricing data (MSRP, markup percentages)
- Customer name and project type (for context)

**NOT Sent:**
- Email addresses
- Phone numbers
- Payment information
- User passwords
- Full customer profiles

### Anthropic Data Retention Policy

**Training Data:**
- Anthropic does NOT train on QuoteMyAV user data
- Enterprise API agreement ensures zero data retention for training

**Abuse Monitoring:**
- Prompts retained by Anthropic for 30 days for Trust & Safety monitoring
- After 30 days: Permanently deleted from Anthropic servers
- QuoteMyAV retains logs for 30 days separately (see [Retention Policy](#retention-policy))

### Input Sanitization

**Before Sending to Claude API:**
1. Strip HTML tags and scripts (XSS prevention)
2. Limit input length (10,000 characters per prompt)
3. Remove personally identifiable information (PII redaction)
4. Validate data types (numbers, strings, arrays)

**Implementation:**
```typescript
function sanitizePrompt(input: string): string {
  // Remove HTML/scripts
  let clean = input.replace(/<[^>]*>/g, '');

  // Redact email addresses
  clean = clean.replace(/[\w\.-]+@[\w\.-]+\.\w+/g, '[EMAIL]');

  // Redact phone numbers
  clean = clean.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]');

  // Limit length
  return clean.substring(0, 10000);
}
```

### Rate Limiting

**Per User:**
- 100 AI requests per hour
- 1,000 AI requests per day
- HTTP 429 response when exceeded
- Quota resets at top of hour/day

**Per IP Address:**
- 200 AI requests per hour (prevents abuse via multiple accounts)
- Cloudflare rate limiting at edge

**Implementation:**
- Token bucket algorithm in n8n workflows
- Redis cache for counter storage (optional future enhancement)
- Current: In-memory counter with 1-hour sliding window

### Output Validation

**After Receiving from Claude API:**
1. Validate JSON structure (if expecting structured output)
2. Check for injection attempts in AI responses
3. Sanitize before inserting into database
4. Limit response length (20,000 characters)

### Prompt Injection Prevention

**System Prompts:**
- Clear boundaries between system instructions and user input
- Use delimiters (e.g., `---USER INPUT---`)
- Validate AI follows expected output format

**User Input:**
- Warn users not to include sensitive data in prompts
- Placeholder text in input fields with examples
- No direct SQL query generation (all queries parameterized)

### AI Feature Opt-Out

**User Control:**
- Users can disable AI suggestions in account settings
- Quotes can be created entirely manually
- AI features clearly labeled in UI
- No hidden AI processing

---

## Incident Response

### Incident Classification

**Level 1 - Critical:**
- Data breach with PII exposure
- Unauthorized access to production database
- Payment system compromise
- Complete service outage

**Level 2 - High:**
- Unauthorized access attempt (blocked)
- DDoS attack affecting availability
- API key leak
- Suspicious admin activity

**Level 3 - Medium:**
- Abnormal user activity patterns
- Rate limiting triggered repeatedly
- Failed authentication spike
- Third-party service degradation

**Level 4 - Low:**
- Individual user account issue
- Non-security bug in production
- Performance degradation

### Incident Response Steps

#### 1. Detection & Identification (0-15 minutes)
- Automated alerts via monitoring (Supabase Dashboard, Vercel logs)
- Manual report via support or security email
- Verify incident legitimacy
- Classify severity level

#### 2. Containment (15-60 minutes)
**Immediate Actions:**
- Isolate affected systems (disable compromised API keys)
- Block malicious IP addresses (Cloudflare firewall)
- Revoke suspicious user sessions
- Preserve evidence (copy logs before rotation)

**Short-Term Containment:**
- Apply emergency patches
- Enable additional monitoring
- Communicate internally to engineering team

#### 3. Investigation (1-24 hours)
- Review audit logs for timeline
- Identify root cause (vulnerability, misconfiguration, social engineering)
- Determine scope of impact (how many users affected)
- Collect evidence for potential law enforcement

#### 4. Eradication (1-72 hours)
- Remove malicious code or access
- Patch vulnerabilities
- Rotate all API keys and credentials
- Reset affected user passwords (force re-authentication)

#### 5. Recovery (1-7 days)
- Restore services from clean backups if needed
- Monitor for recurrence
- Verify all systems functioning normally
- Gradual return to normal operations

#### 6. Post-Incident Review (7-14 days)
- Document timeline and actions taken
- Identify lessons learned
- Update security policies and procedures
- Implement preventive measures

### Notification Requirements

#### GDPR Breach Notification (Article 33)
**Timeline:** 72 hours of becoming aware

**Notify:**
- Supervisory authority (ICO for UK users, CNIL for French users, etc.)

**Information Provided:**
- Nature of breach
- Categories and approximate number of data subjects affected
- Likely consequences
- Measures taken to address breach
- Contact information for Data Protection Officer

#### User Notification (Article 34)
**Trigger:** High risk to rights and freedoms of individuals

**Timeline:** Without undue delay

**Method:** Email to affected users

**Information Provided:**
- What data was breached
- What happened and when
- What we're doing about it
- What users should do (change passwords, monitor accounts)
- Contact information for questions

#### US State Laws (CCPA, etc.)
**Timeline:** Varies by state (typically 30-60 days)

**Notification:** Email and/or postal mail

### Incident Response Team

**Primary Contacts:**
- Security Lead: Myers (myrproductions@gmail.com)
- Engineering Lead: TBD
- Legal Counsel: TBD

**Escalation Path:**
1. On-call engineer detects incident
2. Notify Security Lead immediately
3. Security Lead escalates to Engineering Lead and Legal if needed
4. Legal determines regulatory notification requirements

### Communication Templates

**Internal Notification (Slack/Email):**
```
SECURITY INCIDENT - [LEVEL]
Time: [TIMESTAMP]
Summary: [ONE LINE DESCRIPTION]
Impact: [AFFECTED SYSTEMS/USERS]
Status: [INVESTIGATING/CONTAINED/RESOLVED]
Actions: [IMMEDIATE STEPS TAKEN]
Next Steps: [PLANNED ACTIONS]
Contact: [INCIDENT LEAD]
```

**User Notification (Email):**
```
Subject: Important Security Notice - Action Required

Dear [NAME],

We are writing to inform you of a security incident that may have affected your QuoteMyAV account.

What Happened:
[CLEAR DESCRIPTION]

What Data Was Affected:
[SPECIFIC DATA TYPES]

What We're Doing:
[ACTIONS TAKEN]

What You Should Do:
1. [ACTION 1]
2. [ACTION 2]

We take your security seriously and apologize for any concern this may cause. If you have questions, please contact security@quotemyav.com.

Sincerely,
QuoteMyAV Security Team
```

---

## Third-Party Services

### Service Inventory

| Service | Purpose | Data Shared | Security Certifications |
|---------|---------|-------------|------------------------|
| **Supabase** | Database & Auth | All user data | SOC 2 Type II, ISO 27001 |
| **Stripe** | Payment Processing | Email, customer ID | PCI DSS Level 1 |
| **Anthropic** | AI (Claude API) | Quote context, prompts | SOC 2 Type II |
| **Vercel** | Frontend Hosting | None (static assets) | SOC 2 Type II |
| **Cloudflare** | CDN & Tunnel | HTTP requests (no PII) | ISO 27001, SOC 2 |

### Vendor Security Assessment

**Criteria for Vendor Selection:**
1. SOC 2 Type II certification or equivalent
2. Data Processing Agreement (DPA) available
3. GDPR compliance
4. Encryption at rest and in transit
5. Regular security audits
6. Incident response procedures
7. Data retention and deletion policies

**Annual Review:**
- Review vendor security posture annually
- Check for new certifications or audits
- Verify DPAs are current
- Assess any security incidents at vendor

### Data Flow Diagram

```
┌─────────┐
│  User   │
│ Browser │
└────┬────┘
     │ HTTPS
     ▼
┌─────────────┐
│   Vercel    │
│  (Frontend) │
└────┬────────┘
     │ HTTPS (Cloudflare Tunnel)
     ▼
┌──────────────┐        ┌──────────┐
│     n8n      │───────▶│ Supabase │
│  (Backend)   │ HTTPS  │   (DB)   │
└──────┬───────┘        └──────────┘
       │
       │ HTTPS
       ├───────────────▶ Stripe (Payments)
       │
       └───────────────▶ Anthropic (AI)
```

### Service-Specific Policies

#### Supabase
- Row Level Security (RLS) enabled on all tables
- Service role key used only by n8n (restricted IP if possible)
- Database backups: Daily, 7-day retention
- Monitoring: Query performance, failed auth attempts

#### Stripe
- Webhook signature verification required
- Test mode for development
- Production keys rotated every 90 days
- Customer data synced to Supabase (Stripe as source of truth)

#### Anthropic (Claude API)
- API key in environment variables only
- Rate limiting enforced
- PII redacted before sending prompts
- No long-term data retention (30 days max)

#### Vercel
- Environment variables for API keys (encrypted at rest)
- Deploy previews isolated (no access to production data)
- Automatic HTTPS (Let's Encrypt certificates)

#### Cloudflare
- Tunnel token rotated every 180 days
- WAF rules enabled (block SQL injection, XSS)
- Rate limiting at edge (200 req/min per IP)
- DDoS protection (automatic)

---

## Security Best Practices for Development

### Code Security

**Static Analysis:**
- Run ESLint security plugin on every commit
- Dependabot alerts enabled on GitHub
- Regular dependency updates (npm audit)

**Code Review:**
- All changes reviewed before merge
- Security-sensitive code requires two reviewers
- No direct commits to main branch

**Secrets Management:**
- Never commit API keys or credentials
- Use `.env` files (in `.gitignore`)
- Rotate keys every 90 days
- Use different keys for dev/staging/production

### Deployment Security

**CI/CD:**
- Automated tests run before deploy
- Security scans in pipeline (npm audit, Snyk)
- Manual approval for production deploys

**Environment Separation:**
- Dev, staging, production environments isolated
- Separate databases and API keys per environment
- Production data never copied to dev/staging

### Developer Access

**Authentication:**
- GitHub accounts require 2FA
- SSH keys for git operations
- Personal access tokens expire after 90 days

**Least Privilege:**
- Developers have access only to resources they need
- Production database access restricted to senior engineers
- Audit trail of all production access

---

## Appendix

### Security Contact Information

**Security Issues:** security@quotemyav.com

**Privacy Requests:** privacy@quotemyav.com

**General Support:** support@quotemyav.com

### Related Documents

- [Architecture Overview](../shared/architecture-overview.md)
- [API Documentation](../backend/api-documentation.md)
- [Database Schema](../backend/database-schema.md)
- Privacy Policy (https://quotemyav.com/privacy)
- Terms of Service (https://quotemyav.com/terms)

### Compliance Certifications (Future)

**Target Certifications:**
- SOC 2 Type II (within 24 months)
- ISO 27001 (within 36 months)
- HIPAA compliance (if healthcare customers require)

### Glossary

- **PII:** Personally Identifiable Information
- **RLS:** Row Level Security
- **DPA:** Data Processing Agreement
- **GDPR:** General Data Protection Regulation
- **CCPA:** California Consumer Privacy Act
- **TLS:** Transport Layer Security
- **JWT:** JSON Web Token
- **MFA:** Multi-Factor Authentication
- **PCI DSS:** Payment Card Industry Data Security Standard

---

**Document Control:**
- Version: 1.0
- Created: 2025-12-12
- Next Review: 2026-06-12 (6 months)
- Classification: Internal - Engineering
