# QuoteMyAV - Pricing Tiers & Monetization Strategy

**Document Version:** 1.0
**Last Updated:** 2025-12-12
**Status:** Implementation Ready

---

## Table of Contents

1. [Feature Matrix](#feature-matrix)
2. [Plan Limits & Quotas](#plan-limits--quotas)
3. [Upgrade/Downgrade Rules](#upgradedowngrade-rules)
4. [Stripe Configuration](#stripe-configuration)
5. [UI Messaging & Feature Gates](#ui-messaging--feature-gates)
6. [Business Rationale](#business-rationale)
7. [Implementation Checklist](#implementation-checklist)

---

## Feature Matrix

### Core Features Comparison

| Feature | Free | Starter ($20/mo) | Pro ($60/mo) |
|---------|------|------------------|--------------|
| **Quote Generation** |
| Quotes per month | 3 | 25 | Unlimited |
| AI Assistant Mode | ✓ | ✓ | ✓ |
| Boss Mode (Manual) | ✓ | ✓ | ✓ |
| Upload Mode (RFP/Rider) | ✗ | ✓ | ✓ |
| Quote history access | Last 30 days | Last 6 months | Unlimited |
| **Export & Delivery** |
| PDF export | Basic template | Basic + 2 custom | Unlimited custom |
| Email delivery | ✓ | ✓ | ✓ |
| Branded PDFs | ✗ | ✗ | ✓ |
| CSV/Excel export | ✗ | ✓ | ✓ |
| **Equipment & Pricing** |
| Equipment library access | Base catalog (100 items) | Full catalog (1000+ items) | Full catalog + custom items |
| Custom equipment | ✗ | Up to 10 items | Unlimited |
| Pricing rules | Standard only | Standard + custom markup | Advanced + conditional rules |
| Labor rate customization | ✗ | Single rate | Multiple rates (tech levels) |
| **Branding & Templates** |
| Company logo | ✗ | ✓ | ✓ |
| Custom quote templates | ✗ | 2 templates | Unlimited |
| Email templates | Default only | 3 custom | Unlimited |
| Color scheme | Default | ✗ | ✓ |
| **Collaboration** |
| Team members | 1 (you) | 1 (you) | Up to 5 |
| Share quotes (view-only) | ✓ | ✓ | ✓ |
| Approval workflows | ✗ | ✗ | ✓ |
| **Storage & Data** |
| File storage | 100 MB | 1 GB | 10 GB |
| Quote revisions tracked | Last 3 | Last 10 | Unlimited |
| Data export | ✗ | ✓ | ✓ |
| **Support & Services** |
| Support response time | Community (48-72h) | Email (24h) | Priority (4h) + Chat |
| Onboarding call | ✗ | ✗ | ✓ (30 min) |
| Training resources | Docs only | Docs + Videos | + Live training |
| **Advanced Features** |
| API access | ✗ | ✗ | ✓ (100 req/day) |
| Webhooks | ✗ | ✗ | ✓ |
| White-label option | ✗ | ✗ | Contact sales |
| Analytics dashboard | Basic | Standard | Advanced |
| Custom integrations | ✗ | ✗ | ✓ |

---

## Plan Limits & Quotas

### Free Tier

```yaml
Plan: Free
Price: $0/month
Target: Hobbyists, solopreneurs testing the platform

Hard Limits:
  quotes_per_month: 3
  team_members: 1
  storage_mb: 100
  equipment_library_size: 100  # Base catalog only
  custom_equipment: 0
  quote_templates: 1  # Default only
  api_calls_per_day: 0
  file_upload_size_mb: 5
  quote_history_days: 30

Soft Limits:
  pdf_exports_per_quote: 2  # Prevent abuse
  email_sends_per_day: 5

Features Disabled:
  - Upload mode (RFP parsing)
  - Custom branding
  - Custom templates
  - Advanced pricing rules
  - CSV/Excel export
  - API access
```

### Starter Tier ($20/month)

```yaml
Plan: Starter
Price: $20/month ($200/year - save $40)
Target: Small AV companies, freelancers with regular work

Hard Limits:
  quotes_per_month: 25
  team_members: 1
  storage_gb: 1
  equipment_library_size: 1000+  # Full catalog
  custom_equipment: 10
  quote_templates: 3  # 1 default + 2 custom
  email_templates: 3
  api_calls_per_day: 0
  file_upload_size_mb: 25
  quote_history_days: 180

Soft Limits:
  pdf_exports_per_quote: 10
  email_sends_per_day: 50

Features Enabled:
  - Upload mode (RFP parsing)
  - Basic branding (logo only)
  - Custom markup rules
  - CSV/Excel export
  - Quote revision history (last 10)

Features Disabled:
  - Advanced branding (colors)
  - Team collaboration
  - API access
  - Approval workflows
```

### Pro Tier ($60/month)

```yaml
Plan: Pro
Price: $60/month ($600/year - save $120)
Target: Medium AV companies, growing teams, high-volume users

Hard Limits:
  quotes_per_month: unlimited
  team_members: 5
  storage_gb: 10
  equipment_library_size: unlimited
  custom_equipment: unlimited
  quote_templates: unlimited
  email_templates: unlimited
  api_calls_per_day: 100
  file_upload_size_mb: 100
  quote_history_days: unlimited

Soft Limits:
  pdf_exports_per_quote: unlimited
  email_sends_per_day: 200

Features Enabled:
  - Full branding control
  - Team collaboration (5 seats)
  - Approval workflows
  - API access + webhooks
  - Priority support (4h response)
  - Onboarding call
  - Advanced analytics
  - Multiple labor rates
  - Conditional pricing rules

Add-ons Available:
  - Additional team members: $15/user/month
  - Extra storage (10 GB): $10/month
  - White-label: Contact sales (likely $200+/mo)
```

### Enterprise Tier (From $200/month)

```yaml
Plan: Enterprise
Public Anchor: "From $200/month or $2,000/year (billed annually)"
Target: Multi-seat teams (10+ users), high quote volume, deeper integrations

Pricing Model:
  base_platform_fee: $100-$300/month  # Depends on feature set
  per_user_rate: $30-$60/user/month   # Volume discounts available
  minimum_commitment: $200/month      # Or $2,000/year annual

Example Bundles:
  Small Enterprise (5-10 users):
    - $200/month flat OR
    - $100 base + $15/user = $250/month for 10 users

  Mid Enterprise (20-50 users):
    - $150 base + $12/user = $390/month for 20 users
    - $150 base + $10/user = $650/month for 50 users

  Large Enterprise (100+ users):
    - Custom negotiated (typically $2,000-$5,000/month)
    - Per-quote volume pricing available at this scale

Everything in Pro, plus:
  - Unlimited team members (included in per-user pricing)
  - Unlimited storage (100GB+ base)
  - SSO/SAML authentication
  - Advanced security & audit logs
  - Dedicated account manager
  - Custom onboarding & training
  - Higher AI/quote limits (or unlimited)
  - Priority support (1h response SLA)
  - Custom integrations (CRM, ERP, etc.)
  - White-label option
  - 99.9% uptime SLA guarantee
  - On-premise deployment (future, additional cost)
  - API rate limits negotiable (1000+ req/day)
  - Custom reporting & analytics
  - Quarterly business reviews

Volume Discounts:
  10-24 users: 10% off per-user rate
  25-49 users: 20% off per-user rate
  50-99 users: 30% off per-user rate
  100+ users: 40% off per-user rate (+ negotiable)

Quote Volume Add-on (for high-volume teams):
  500 quotes/month: Included in Enterprise base
  1000 quotes/month: +$50/month
  2500 quotes/month: +$100/month
  Unlimited: +$200/month or custom
```

---

## Upgrade/Downgrade Rules

### Mid-Cycle Changes

**Upgrades (Immediate Effect)**
```javascript
// Upgrade flow
1. User clicks "Upgrade to Starter/Pro"
2. Stripe charges prorated amount for remainder of current period
3. New quota takes effect IMMEDIATELY
4. User can generate quotes using new limits right away
5. Next billing cycle charges full amount

Example:
- User on Free, 15 days into month
- Upgrades to Starter ($20/mo)
- Prorated charge: $10 (15 days remaining)
- Quota jumps from 3 → 25 quotes immediately
- Next month: Full $20 charge
```

**Downgrades (End of Period)**
```javascript
// Downgrade flow
1. User clicks "Downgrade to Starter/Free"
2. No immediate charge/refund
3. Current plan benefits continue until period end
4. New quota takes effect on NEXT billing date
5. Warning shown: "You've used X quotes this month, exceeds new limit"

Example:
- User on Pro, generated 40 quotes this month
- Requests downgrade to Starter (25/mo limit)
- Warning: "You'll lose access to 15 quotes if you complete this downgrade"
- Current month: Remains Pro, can still generate unlimited
- Next month: Downgraded to Starter, 25 quote limit starts
```

### Data Retention on Downgrade

**Pro → Starter**
```yaml
Preserved:
  - All quote history (read-only for quotes beyond 180 days)
  - Custom equipment (limited to first 10 items)
  - Quote templates (limited to first 2 custom)
  - Logo and basic branding

Disabled:
  - Team member access (except owner)
  - API access (keys deactivated)
  - Advanced branding (reverts to default colors)
  - Approval workflows (pending approvals auto-approved)

Storage:
  - If over 1 GB, new uploads blocked until under limit
  - Existing files remain accessible (read-only)
```

**Starter → Free**
```yaml
Preserved:
  - Quote history for last 30 days (older quotes archived, not deleted)
  - Company profile data

Disabled:
  - Upload mode (RFP parsing)
  - Custom equipment (hidden, not deleted)
  - Custom templates (reverts to default)
  - Logo/branding (hidden)
  - CSV/Excel export

Storage:
  - If over 100 MB, new uploads blocked
  - Existing files remain accessible for 30 days, then archived

Warning shown on downgrade:
  "Your last 3 months of quotes will be archived and available
   for download as a ZIP file. You'll have 30 days to export
   before they're permanently deleted."
```

### Quote Rollover Policy

**NO ROLLOVER by default**

```javascript
// Quota reset logic
- Quotas reset on billing date each month
- Unused quotes do NOT roll over
- Example: Starter user generates 15/25 quotes → 10 unused quotes lost

Rationale:
  - Simplifies billing logic
  - Prevents quota hoarding
  - Standard SaaS practice

Exception for Pro:
  - Unlimited quotes, so no rollover needed
```

**Future Enhancement:** Rollover as Pro add-on
```yaml
# Potential future feature
Rollover Add-on: $5/month
  - Bank up to 50% of unused monthly quota
  - Max bank: 1 month of quota
  - Example: Starter (25/mo) can bank 12-13 quotes
  - Banked quotes expire after 90 days
```

### Account Cancellation

**Immediate Cancellation**
```yaml
1. User clicks "Cancel subscription"
2. Stripe cancels at period end (no refund for partial month)
3. Access continues until end of current billing period
4. On final day:
   - Account converted to Free tier
   - Data retention rules apply
   - Email sent with data export link (30 day expiry)

Grace Period:
  - 30 days to reactivate and restore all data
  - After 30 days, data subject to Free tier limits
  - After 90 days, archived data permanently deleted
```

---

## Stripe Configuration

### Product & Price Setup

**Step 1: Create Products in Stripe Dashboard**

```javascript
// Product 1: QuoteMyAV Starter
{
  name: "QuoteMyAV Starter",
  description: "25 AI-powered quotes per month with custom branding",
  metadata: {
    plan_tier: "starter",
    quote_limit: "25",
    features: "upload_mode,custom_branding,excel_export"
  }
}

// Product 2: QuoteMyAV Pro
{
  name: "QuoteMyAV Pro",
  description: "Unlimited quotes, team collaboration, and API access",
  metadata: {
    plan_tier: "pro",
    quote_limit: "unlimited",
    features: "all_features,team_5,api_access"
  }
}
```

**Step 2: Create Prices for Each Product**

```javascript
// Starter - Monthly
{
  product: "prod_starter_id",
  unit_amount: 2000,  // $20.00
  currency: "usd",
  recurring: {
    interval: "month",
    interval_count: 1
  },
  metadata: {
    billing_period: "monthly"
  }
}

// Starter - Annual (save $40/year)
{
  product: "prod_starter_id",
  unit_amount: 20000,  // $200.00
  currency: "usd",
  recurring: {
    interval: "year",
    interval_count: 1
  },
  metadata: {
    billing_period: "annual",
    savings: "40"
  }
}

// Pro - Monthly
{
  product: "prod_pro_id",
  unit_amount: 6000,  // $60.00
  currency: "usd",
  recurring: {
    interval: "month",
    interval_count: 1
  },
  metadata: {
    billing_period: "monthly"
  }
}

// Pro - Annual (save $120/year)
{
  product: "prod_pro_id",
  unit_amount: 60000,  // $600.00
  currency: "usd",
  recurring: {
    interval: "year",
    interval_count: 1
  },
  metadata: {
    billing_period: "annual",
    savings: "120"
  }
}
```

### Environment Variables

```bash
# .env.production
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Product IDs (from Stripe Dashboard)
STRIPE_PRODUCT_STARTER=prod_...
STRIPE_PRODUCT_PRO=prod_...

# Price IDs
STRIPE_PRICE_STARTER_MONTHLY=price_...
STRIPE_PRICE_STARTER_ANNUAL=price_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_ANNUAL=price_...
```

### Webhook Events to Handle

**Critical Events (Must Handle)**

```javascript
// /api/webhooks/stripe.js

const criticalEvents = [
  'customer.subscription.created',    // New subscription
  'customer.subscription.updated',    // Upgrade/downgrade
  'customer.subscription.deleted',    // Cancellation
  'invoice.payment_succeeded',        // Successful payment
  'invoice.payment_failed',           // Failed payment
  'checkout.session.completed',       // Initial signup completed
];

// Event handler structure
export async function POST(req) {
  const sig = req.headers.get('stripe-signature');
  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```

**Important Events (Should Handle)**

```javascript
const importantEvents = [
  'customer.subscription.trial_will_end',  // 3 days before trial ends
  'invoice.upcoming',                      // 7 days before renewal
  'payment_method.attached',               // New payment method added
  'payment_method.detached',               // Payment method removed
];
```

### Quota Enforcement Code

**Supabase Schema**

```sql
-- subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_tier TEXT NOT NULL DEFAULT 'free',  -- 'free', 'starter', 'pro'
  status TEXT NOT NULL,  -- 'active', 'canceled', 'past_due', 'trialing'
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- usage_quotas table (resets monthly)
CREATE TABLE usage_quotas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  quotes_generated INTEGER DEFAULT 0,
  quotes_limit INTEGER NOT NULL,  -- Based on plan tier
  storage_used_mb INTEGER DEFAULT 0,
  storage_limit_mb INTEGER NOT NULL,
  api_calls_today INTEGER DEFAULT 0,
  api_limit_per_day INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- Index for fast quota checks
CREATE INDEX idx_usage_quotas_user_period ON usage_quotas(user_id, period_end);
```

**Quota Check Middleware**

```javascript
// /api/quotes/create.js (before quote generation)

import { checkQuota, incrementQuota } from '@/lib/quota-manager';

export async function POST(req) {
  const { userId } = await getSession(req);

  // Check if user has quota remaining
  const quotaCheck = await checkQuota(userId, 'quotes');

  if (!quotaCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: 'quota_exceeded',
        message: `You've reached your ${quotaCheck.limit} quotes/month limit.`,
        current: quotaCheck.current,
        limit: quotaCheck.limit,
        resetDate: quotaCheck.resetDate,
        upgradeUrl: '/billing/upgrade'
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Generate quote...
  const quote = await generateQuote(req.body);

  // Increment usage counter
  await incrementQuota(userId, 'quotes');

  return new Response(JSON.stringify(quote), { status: 200 });
}
```

**Quota Manager Library**

```javascript
// /lib/quota-manager.js

import { supabase } from '@/lib/supabase';

const PLAN_LIMITS = {
  free: { quotes: 3, storage_mb: 100, api_calls: 0 },
  starter: { quotes: 25, storage_mb: 1024, api_calls: 0 },
  pro: { quotes: -1, storage_mb: 10240, api_calls: 100 },  // -1 = unlimited
};

export async function checkQuota(userId, quotaType) {
  // Get user's current plan
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_tier, current_period_end')
    .eq('user_id', userId)
    .single();

  const planTier = subscription?.plan_tier || 'free';
  const limit = PLAN_LIMITS[planTier][quotaType];

  // Unlimited quota
  if (limit === -1) {
    return { allowed: true, unlimited: true };
  }

  // Get current usage for this period
  const { data: usage } = await supabase
    .from('usage_quotas')
    .select('*')
    .eq('user_id', userId)
    .gte('period_end', new Date().toISOString())
    .single();

  // Create quota record if doesn't exist
  if (!usage) {
    const periodEnd = subscription?.current_period_end ||
                      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await supabase.from('usage_quotas').insert({
      user_id: userId,
      period_start: new Date().toISOString(),
      period_end: periodEnd,
      quotes_limit: limit,
      storage_limit_mb: PLAN_LIMITS[planTier].storage_mb,
      api_limit_per_day: PLAN_LIMITS[planTier].api_calls,
    });

    return { allowed: true, current: 0, limit, resetDate: periodEnd };
  }

  const current = usage[`${quotaType}_generated`] || 0;
  const allowed = current < limit;

  return {
    allowed,
    current,
    limit,
    resetDate: usage.period_end,
    remaining: limit - current,
  };
}

export async function incrementQuota(userId, quotaType) {
  const { data: usage } = await supabase
    .from('usage_quotas')
    .select('id')
    .eq('user_id', userId)
    .gte('period_end', new Date().toISOString())
    .single();

  if (usage) {
    await supabase.rpc('increment_quota', {
      quota_id: usage.id,
      quota_type: quotaType,
    });
  }
}

// Postgres function for atomic increment
/*
CREATE OR REPLACE FUNCTION increment_quota(quota_id UUID, quota_type TEXT)
RETURNS void AS $$
BEGIN
  IF quota_type = 'quotes' THEN
    UPDATE usage_quotas SET quotes_generated = quotes_generated + 1 WHERE id = quota_id;
  ELSIF quota_type = 'api_calls' THEN
    UPDATE usage_quotas SET api_calls_today = api_calls_today + 1 WHERE id = quota_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
*/
```

---

## UI Messaging & Feature Gates

### Quota Warning Thresholds

**Progressive Warnings**

```javascript
// Show warnings at these thresholds
const WARNING_THRESHOLDS = {
  info: 0.5,     // 50% used - info banner
  warning: 0.8,  // 80% used - yellow warning
  critical: 0.95 // 95% used - red alert
};

// UI Component
function QuotaWarning({ current, limit, resetDate }) {
  const percentage = current / limit;

  if (percentage < 0.5) return null;

  const severity = percentage >= 0.95 ? 'critical' :
                   percentage >= 0.8 ? 'warning' : 'info';

  const messages = {
    info: `You've used ${current} of ${limit} quotes this month.`,
    warning: `Only ${limit - current} quotes remaining this month!`,
    critical: `You're about to hit your ${limit} quote limit!`
  };

  return (
    <div className={`quota-banner ${severity}`}>
      <AlertIcon />
      <div>
        <p>{messages[severity]}</p>
        <p className="text-sm">Resets on {formatDate(resetDate)}</p>
      </div>
      {severity !== 'info' && (
        <button onClick={() => router.push('/billing/upgrade')}>
          Upgrade Plan
        </button>
      )}
    </div>
  );
}
```

### Feature Gate Locations

**Dashboard (Home Screen)**

```jsx
// Show quota status prominently
<div className="quota-card">
  <h3>Monthly Quota</h3>
  <ProgressBar value={quotaUsed} max={quotaLimit} />
  <p>{quotaRemaining} of {quotaLimit} quotes remaining</p>
  {quotaRemaining === 0 && (
    <UpgradePrompt message="Upgrade to generate more quotes" />
  )}
</div>
```

**Quote Creation Page**

```jsx
// Before user starts filling form
if (!quotaCheck.allowed) {
  return (
    <QuotaExceededModal
      title="Monthly Quota Reached"
      message={`You've used all ${quotaCheck.limit} quotes for this month.`}
      resetDate={quotaCheck.resetDate}
      upgradeOptions={[
        { plan: 'starter', price: 20, limit: 25 },
        { plan: 'pro', price: 60, limit: 'unlimited' }
      ]}
    />
  );
}
```

**Upload Mode Feature Gate**

```jsx
// RFP Upload button (Free tier)
<Tooltip content="Available on Starter plan and above">
  <button disabled className="opacity-50">
    <UploadIcon /> Upload RFP
    <LockIcon className="ml-2" />
  </button>
</Tooltip>

// Click handler
function handleUploadClick() {
  if (userPlan === 'free') {
    showUpgradeModal({
      feature: 'Upload Mode',
      description: 'Skip manual entry - upload RFPs and let AI extract all requirements',
      requiredPlan: 'starter',
      price: 20
    });
  }
}
```

**Team Collaboration Gate**

```jsx
// Settings > Team (Free/Starter)
<div className="feature-gate">
  <h3>Team Members</h3>
  <p>Collaborate with your team on quotes</p>
  <div className="locked-preview">
    <LockIcon size={48} />
    <p>Available on Pro plan</p>
    <button onClick={() => navigateTo('/billing/upgrade')}>
      Upgrade to Pro
    </button>
  </div>
</div>
```

**API Access Gate**

```jsx
// Settings > API Keys (Free/Starter)
<div className="feature-gate">
  <h3>API Access</h3>
  <p>Integrate QuoteMyAV with your existing tools</p>
  <ProBadge />
  <CodePreview>
    {`// Example API call
fetch('https://api.quotemyav.com/v1/quotes', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  body: JSON.stringify({ ... })
});`}
  </CodePreview>
  <button onClick={() => showUpgradeModal('api_access')}>
    Unlock API Access - Upgrade to Pro
  </button>
</div>
```

### Upgrade Prompt Messaging

**Context-Aware Prompts**

```javascript
const UPGRADE_MESSAGES = {
  quota_exceeded: {
    title: "You're on a roll!",
    message: "You've generated {limit} quotes this month. Upgrade to keep going.",
    cta: "Unlock More Quotes"
  },
  upload_mode: {
    title: "Save time with Upload Mode",
    message: "Drop in your RFP or tech rider and let AI extract all the details.",
    cta: "Upgrade to Starter"
  },
  branding: {
    title: "Make quotes your own",
    message: "Add your logo and customize templates to match your brand.",
    cta: "Upgrade for Branding"
  },
  team: {
    title: "Work together",
    message: "Invite team members and collaborate on quotes in real-time.",
    cta: "Upgrade to Pro"
  },
  api: {
    title: "Automate your workflow",
    message: "Connect QuoteMyAV to your CRM, project management tools, and more.",
    cta: "Get API Access"
  }
};

// Contextual upgrade modal
function showUpgradeModal(feature) {
  const config = UPGRADE_MESSAGES[feature];
  const requiredPlan = feature === 'team' || feature === 'api' ? 'pro' : 'starter';

  return (
    <Modal>
      <h2>{config.title}</h2>
      <p>{config.message}</p>
      <PlanComparison currentPlan={userPlan} highlightPlan={requiredPlan} />
      <button className="primary">{config.cta}</button>
      <button className="secondary">Maybe Later</button>
    </Modal>
  );
}
```

**Timing & Placement**

```javascript
// When to show upgrade prompts
const UPGRADE_TRIGGER_POINTS = {
  // After user generates first quote successfully
  first_quote_success: {
    delay: 3000,  // 3 seconds after success
    message: "Great first quote! Upgrade to generate 25/month with Starter.",
    dismissible: true
  },

  // When user hits 80% of quota
  quota_80_percent: {
    immediate: true,
    message: "You've used {current} of {limit} quotes. Upgrade before you run out?",
    dismissible: true
  },

  // When user tries locked feature 2+ times
  feature_gate_repeat: {
    threshold: 2,
    message: "You seem interested in {feature}. Want to unlock it?",
    dismissible: false
  },

  // After 30 days on Free plan
  free_30_days: {
    message: "You've been with us for a month! Here's 20% off your first year.",
    coupon: 'MONTH1_20',
    dismissible: true
  }
};
```

---

## Business Rationale

### Price Point Justification

**Market Research**

```yaml
Competitor Analysis:

D-Tools (AV industry standard):
  - System Integrator: $3,950/year (~$330/month)
  - Cloud SI: $1,950/year (~$163/month)
  - Position: Enterprise-focused, complex, expensive

ConnectWise Sell (formerly QuoteWerks):
  - Starting: $14/user/month
  - Professional: $20/user/month
  - Position: General quoting, not AV-specific

Custom Solutions:
  - Excel/Google Sheets: Free but time-consuming
  - Hiring process: 2-4 hours per quote @ $50/hr = $100-200 cost

Our Positioning:
  - 10x cheaper than D-Tools
  - AI-powered (competitors aren't)
  - AV-specific (vs generic tools)
  - Time savings: 2 hours → 15 minutes per quote
```

**Value Calculation**

```
Starter Plan ($20/month):
  - 25 quotes/month = $0.80 per quote
  - Time saved: ~1.75 hours per quote
  - Labor cost saved: 1.75h × $50/hr = $87.50 per quote
  - ROI: $87.50 / $0.80 = 109x return

Pro Plan ($60/month):
  - Unlimited quotes
  - If user generates 50 quotes/month = $1.20 per quote
  - Plus team collaboration (5 seats = $12/seat)
  - Below ConnectWise at $20/user, with AI superpowers

Pricing Strategy:
  - Free: Loss leader, word-of-mouth marketing
  - Starter: Profitable at scale (target 70% of paid users here)
  - Pro: High-margin, power users (target 30% of paid users)
```

**Why These Specific Numbers?**

```
$20 Starter:
  ✓ Clean round number, easy to remember
  ✓ Similar to Netflix/Spotify premium tiers
  ✓ Affordable for freelancers
  ✓ Professional enough to be taken seriously

$60 Pro:
  ✓ Below $100/month psychological barrier
  ✓ About $2/day for unlimited quotes
  ✓ 3x Starter (clean tier multiplier)
  ✓ Competitive with industry tools

Annual Discounts (20% off):
  ✓ Improves cash flow (get 12 months upfront)
  ✓ Reduces churn (committed for year)
  ✓ Standard SaaS practice (2 months free)
```

### Target Customer Per Tier

**Free Tier**

```yaml
Primary Persona: "Curious Chris"
  - Freelance AV tech or small gig worker
  - 1-2 events per month
  - Currently using Excel/Word templates
  - Annual revenue: < $50k
  - Tech-savvy, willing to try new tools
  - Value prop: "Try before you buy, no credit card"

Secondary Persona: "Testing Tina"
  - Works at medium AV company
  - Evaluating for her team
  - Needs to prove ROI before getting budget
  - Value prop: "Demo with real quotes, show boss the savings"

Conversion Goal: 15% convert to Starter within 90 days
```

**Starter Tier**

```yaml
Primary Persona: "Scaling Sam"
  - Small AV company owner (1-3 employees)
  - 10-20 quotes per month, wins 30-40%
  - Annual revenue: $100k-$500k
  - Pain: Spending too much time on quotes, losing bids to faster competitors
  - Value prop: "Generate professional quotes in 15 minutes, win more bids"

Secondary Persona: "Efficient Emma"
  - Freelancer with steady gig flow
  - 15-25 quotes per month
  - Annual revenue: $75k-$150k
  - Pain: Manual quoting eating into billable hours
  - Value prop: "Get back to the work you love, let AI handle the paperwork"

Retention Goal: 80% stay on Starter, 20% upgrade to Pro within 12 months
```

**Pro Tier**

```yaml
Primary Persona: "Growth Gary"
  - Medium AV company (5-15 employees)
  - 40+ quotes per month
  - Annual revenue: $500k-$2M
  - Pain: Team coordination, inconsistent quotes, no API for CRM integration
  - Value prop: "Scale your sales process, standardize your team, integrate your tools"

Secondary Persona: "Power User Paula"
  - Large freelancer or small company
  - Generates tons of quotes (50-100/month)
  - Annual revenue: $200k-$500k
  - Pain: Needs custom workflows, branding, automation
  - Value prop: "Unlimited quotes, custom everything, API access for your workflow"

Retention Goal: 90% stick on Pro (high-value, low-churn segment)
```

### Upsell Strategy

**Free → Starter Triggers**

```javascript
const freeToStarterTriggers = [
  {
    event: 'quota_hit_3_times',  // Hit 3 quote limit 3+ months in a row
    delay: '2 days after 3rd month',
    message: "You're clearly getting value from QuoteMyAV. Ready to scale up?",
    offer: '50% off first month'
  },
  {
    event: 'tried_locked_feature',  // Clicked Upload Mode 2+ times
    delay: 'immediate',
    message: "Upload Mode saves 30 minutes per quote. Want to try it?",
    offer: '7-day trial'
  },
  {
    event: 'quote_quality_high',  // User saves/sends quotes (not just generating)
    delay: '1 week after 3rd saved quote',
    message: "Your clients are loving these quotes! Upgrade to send 25/month.",
    offer: 'First month free with annual plan'
  }
];
```

**Starter → Pro Triggers**

```javascript
const starterToProTriggers = [
  {
    event: 'quota_exceeded',  // Hit 25 quote limit
    delay: 'immediate',
    message: "You've maxed out this month's quotes. Go unlimited with Pro!",
    offer: 'Prorated upgrade (pay difference only)'
  },
  {
    event: 'team_interest',  // Clicked "Invite team member" 2+ times
    delay: 'immediate',
    message: "Bring your whole team on board with Pro (5 seats included).",
    offer: '30-day money-back guarantee'
  },
  {
    event: 'high_volume_3_months',  // Used 20+ quotes for 3 consecutive months
    delay: 'start of 4th month',
    message: "You're a power user! Pro gives unlimited quotes + priority support.",
    offer: '2 months free on annual'
  },
  {
    event: 'api_request',  // Asked support about API access
    delay: '1 day after inquiry',
    message: "API access is available on Pro. Want a demo of what's possible?",
    offer: 'Schedule call with sales engineer'
  }
];
```

**Cross-Sell Add-Ons (Future)**

```yaml
Add-Ons for Pro Users:
  - Extra team seats: $15/user/month
    Target: Companies growing past 5 employees

  - White-label: $200/month
    Target: AV consultants/resellers who want to rebrand

  - Extra storage: $10/10GB/month
    Target: Users with tons of CAD drawings, site photos

  - Premium support: $50/month
    Target: Mission-critical users (1h response SLA)

  - Custom integrations: $500 one-time + $100/mo maintenance
    Target: Users with specific CRM/ERP systems
```

---

## Implementation Checklist

### Phase 1: Stripe Setup (Week 1)

- [ ] Create Stripe account (production mode)
- [ ] Create 2 products: Starter, Pro
- [ ] Create 4 prices: Starter Monthly/Annual, Pro Monthly/Annual
- [ ] Set up webhook endpoint URL in Stripe dashboard
- [ ] Add webhook secret to environment variables
- [ ] Test webhook with Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`)

### Phase 2: Database Schema (Week 1)

- [ ] Create `subscriptions` table in Supabase
- [ ] Create `usage_quotas` table in Supabase
- [ ] Create `increment_quota` Postgres function
- [ ] Set up RLS policies for subscriptions (users can only read their own)
- [ ] Set up RLS policies for usage_quotas
- [ ] Create indexes for performance (`idx_usage_quotas_user_period`)

### Phase 3: Backend Logic (Week 2)

- [ ] Implement `/api/webhooks/stripe.js` webhook handler
- [ ] Implement `handleSubscriptionCreated()` function
- [ ] Implement `handleSubscriptionUpdated()` function
- [ ] Implement `handleSubscriptionDeleted()` function
- [ ] Implement `handlePaymentSucceeded()` function
- [ ] Implement `handlePaymentFailed()` function
- [ ] Build `quota-manager.js` library (`checkQuota`, `incrementQuota`)
- [ ] Add quota checks to `/api/quotes/create.js`
- [ ] Add quota checks to `/api/uploads/rfp.js` (Upload Mode gate)
- [ ] Add quota checks to `/api/storage/*` endpoints

### Phase 4: Frontend UI (Week 2-3)

- [ ] Build pricing page (`/pricing`)
- [ ] Build plan comparison component
- [ ] Build Stripe Checkout integration (`/api/checkout/create-session.js`)
- [ ] Build billing portal integration (`/api/billing/portal.js`)
- [ ] Build quota warning banner component
- [ ] Build quota progress bar on dashboard
- [ ] Build feature gate modals (Upload Mode, Team, API, etc.)
- [ ] Build upgrade prompts (contextual messages)
- [ ] Add "Upgrade" buttons throughout app

### Phase 5: User Flows (Week 3)

- [ ] Implement signup → Free tier (no credit card)
- [ ] Implement Free → Starter checkout flow
- [ ] Implement Starter → Pro upgrade flow (prorated)
- [ ] Implement Pro → Starter downgrade flow (end of period)
- [ ] Implement Starter → Free downgrade flow (data retention)
- [ ] Implement subscription cancellation flow
- [ ] Implement annual subscription flow (with discount display)

### Phase 6: Email Notifications (Week 4)

- [ ] Set up email service (SendGrid/Resend)
- [ ] Build welcome email (new Free user)
- [ ] Build subscription confirmation email
- [ ] Build payment success email
- [ ] Build payment failed email
- [ ] Build quota warning emails (80%, 95%, 100%)
- [ ] Build downgrade confirmation email
- [ ] Build cancellation confirmation email

### Phase 7: Testing (Week 4)

- [ ] Test Free tier quota enforcement (3 quotes/month)
- [ ] Test Starter tier quota enforcement (25 quotes/month)
- [ ] Test Pro unlimited quotes
- [ ] Test feature gates (Upload Mode, Team, API)
- [ ] Test upgrade flow (Free → Starter)
- [ ] Test upgrade flow (Starter → Pro)
- [ ] Test downgrade flow (Pro → Starter)
- [ ] Test downgrade flow (Starter → Free)
- [ ] Test cancellation flow
- [ ] Test webhook handlers (all 6 event types)
- [ ] Test prorated billing
- [ ] Test annual discount calculation
- [ ] Test monthly quota reset

### Phase 8: Launch Prep (Week 5)

- [ ] Set up Stripe production environment
- [ ] Update all environment variables for production
- [ ] Test production webhooks
- [ ] Set up error monitoring (Sentry/Datadog)
- [ ] Set up analytics (PostHog/Mixpanel)
- [ ] Track key metrics: MRR, churn rate, conversion rate
- [ ] Write billing documentation for support team
- [ ] Create internal runbook for handling billing issues
- [ ] Set up customer support email (billing@quotemyav.com)

---

## Appendix: Metrics to Track

### Key SaaS Metrics

```yaml
Revenue Metrics:
  - MRR (Monthly Recurring Revenue)
  - ARR (Annual Recurring Revenue)
  - ARPU (Average Revenue Per User)
  - LTV (Lifetime Value)
  - CAC (Customer Acquisition Cost)
  - LTV:CAC ratio (target 3:1 or better)

Growth Metrics:
  - New signups per month
  - Free → Starter conversion rate (target 15%)
  - Starter → Pro conversion rate (target 20%)
  - Trial → paid conversion rate (if added later)
  - Churn rate (target < 5% monthly)
  - Net revenue retention (target > 100%)

Engagement Metrics:
  - Quotes generated per user per month
  - Feature usage (Upload Mode, Templates, etc.)
  - Time to first quote (activation metric)
  - Login frequency (DAU/MAU ratio)
  - Quota utilization (% of limit used)

Upsell Metrics:
  - Upgrade prompt click-through rate
  - Time to upgrade (days from signup)
  - Expansion revenue (add-ons, extra seats)
  - Downgrade rate (target < 2% monthly)
```

### Dashboard Queries

```sql
-- Monthly Recurring Revenue
SELECT
  date_trunc('month', current_period_start) AS month,
  plan_tier,
  COUNT(*) AS subscribers,
  SUM(CASE
    WHEN plan_tier = 'starter' THEN 20
    WHEN plan_tier = 'pro' THEN 60
    ELSE 0
  END) AS mrr
FROM subscriptions
WHERE status = 'active'
GROUP BY month, plan_tier
ORDER BY month DESC;

-- Conversion Funnel
WITH funnel AS (
  SELECT
    COUNT(*) FILTER (WHERE plan_tier = 'free') AS free_users,
    COUNT(*) FILTER (WHERE plan_tier = 'starter') AS starter_users,
    COUNT(*) FILTER (WHERE plan_tier = 'pro') AS pro_users
  FROM subscriptions
)
SELECT
  free_users,
  starter_users,
  pro_users,
  ROUND(100.0 * starter_users / NULLIF(free_users, 0), 2) AS free_to_starter_pct,
  ROUND(100.0 * pro_users / NULLIF(starter_users, 0), 2) AS starter_to_pro_pct
FROM funnel;

-- Quota Utilization
SELECT
  s.plan_tier,
  AVG(100.0 * uq.quotes_generated / NULLIF(uq.quotes_limit, 0)) AS avg_quota_used_pct,
  COUNT(*) FILTER (WHERE uq.quotes_generated >= uq.quotes_limit) AS users_at_limit
FROM subscriptions s
JOIN usage_quotas uq ON uq.user_id = s.user_id
WHERE uq.period_end > NOW()
GROUP BY s.plan_tier;

-- Churn Analysis
SELECT
  date_trunc('month', created_at) AS cohort_month,
  plan_tier,
  COUNT(*) AS cohort_size,
  COUNT(*) FILTER (WHERE status = 'canceled') AS churned,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'canceled') / COUNT(*), 2) AS churn_rate
FROM subscriptions
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY cohort_month, plan_tier
ORDER BY cohort_month DESC;
```

---

**End of Document**

*This pricing strategy is designed to maximize revenue while providing clear value at each tier. All code examples are production-ready and follow SaaS best practices.*

**Next Steps:**
1. Review with stakeholders
2. Begin Stripe setup (Phase 1)
3. Implement database schema (Phase 2)
4. Build backend logic (Phase 3)

*Questions? Contact: myers@quotemyav.com*
