# QuoteMyAV - Go-to-Market Strategy & Metrics

## Document Overview

This document defines the complete go-to-market strategy, target customer profiles, launch channels, key metrics to track, and success criteria for QuoteMyAV's MVP launch.

**Target:** Solo founder MVP launch with realistic, achievable goals.

---

## 1. Target Customer Profiles

### Primary Persona: Small AV Rental Company

**Demographics:**
- Company size: 2-10 employees
- Revenue: $250K-$2M/year
- Market: Regional (single metro area or state)
- Equipment inventory: $100K-$500K value

**Pain Points:**
- **Time-intensive quoting:** Owner/manager spends 5-10 hours/week manually creating quotes in Excel or Word
- **Inconsistent pricing:** No standardized process leads to leaving money on the table
- **Lost opportunities:** Slow turnaround time means losing quotes to faster competitors
- **Labor estimation errors:** Underestimating crew needs leads to scrambling or cost overruns
- **Unprofessional appearance:** Generic Word docs vs. polished competitor proposals

**Goals:**
- Quote simple events (weddings, corporate) in 15-30 minutes instead of 2-3 hours
- Standardize pricing across team members
- Look more professional to corporate clients
- Win more quotes by responding faster

**Budget Sensitivity:**
- Will trial Free plan, convert to Starter ($20/mo) if it saves 2+ hours/month
- Upgrade to Pro ($60/mo) if doing 30+ quotes/month (break-even at $2/quote)
- Not price-sensitive if tool demonstrably saves time and wins more business

**Tech Savvy:**
- Comfortable with web apps, Stripe, email
- Uses Google Workspace or Microsoft 365
- May use inventory management software
- Not developers, needs it to "just work"

**Quote Volume:**
- 10-40 quotes/month (seasonal variability)
- Close rate: 20-40%
- Avg quote value: $3K-$25K

---

### Secondary Persona: Freelance AV Technician

**Demographics:**
- Solo operator or 1099 contractor
- Revenue: $40K-$120K/year
- Works as A1, LD, or multi-role tech
- Own gear: $10K-$50K value

**Pain Points:**
- **No time for quoting:** Balances site work with business admin
- **Perceived as "small-time":** Hand-written quotes vs. established companies
- **Pricing uncertainty:** Doesn't know what to charge for unfamiliar events
- **No business systems:** Everything ad-hoc, relies on memory and notes

**Goals:**
- Create professional-looking quotes quickly between gigs
- Get pricing guidance for new event types
- Appear more established to win better clients
- Spend less time on admin, more time on billable work

**Budget Sensitivity:**
- Free plan perfect for starting out (3 quotes covers most months)
- Upgrade to Starter during busy season or when landing corporate clients
- $20/mo is 1-2 hours of labor - easy ROI if it saves time

**Tech Savvy:**
- Uses phone/tablet more than desktop
- Comfortable with apps and cloud tools
- Needs mobile-friendly interface
- Values simplicity over features

**Quote Volume:**
- 2-8 quotes/month (highly variable)
- Close rate: 30-50% (smaller pool, more qualified)
- Avg quote value: $800-$5K

---

### Tertiary Persona: Event Production House

**Demographics:**
- Company size: 10-50 employees
- Revenue: $2M-$10M/year
- Multi-market or national presence
- Full production services (AV, staging, scenic, labor)

**Pain Points:**
- **Junior staff can't quote accurately:** Only senior PMs trusted to price complex events
- **No institutional knowledge capture:** Pricing expertise locked in a few key people's heads
- **Inconsistent margins:** Different PMs price differently, hard to track profitability
- **Client expectation management:** Clients want instant ballpark, but complex quotes take days

**Goals:**
- Train junior staff to create accurate preliminary quotes
- Standardize pricing across PM team
- Respond to RFPs faster with AI-assisted intake
- Track quote-to-close metrics across team

**Budget Sensitivity:**
- Pro plan ($60/mo) is trivial expense
- Enterprise plan (from $200/mo) for multi-seat teams
- Would pay $200-500/mo for team features (Phase 2)
- Needs ROI justification: "saves 10 hours/month" or "increases close rate 5%"

**Tech Savvy:**
- IT department or tech-forward management
- Uses CRM, project management, inventory systems
- May want API integrations (future feature)

**Quote Volume:**
- 50-200 quotes/month across team
- Close rate: 15-30% (higher volume, more competitive)
- Avg quote value: $15K-$150K

**MVP Fit:**
- Not ideal for MVP (needs team features, integrations)
- Good beta tester for feedback
- Target for Phase 2 launch

---

## 2. Go-to-Market Strategy (Phased Approach)

### Phase 1: Friends & Family Beta (Weeks 1-2)

**Goal:** Validate core functionality, gather feedback, fix critical bugs

**Participants:**
- 5-10 trusted users from Myers' network at Markey's
- Mix of roles: project managers, audio techs, lighting designers
- Mostly Primary persona (small rental companies)

**Activities:**
1. Personal email invitations with Free plan access
2. 1-on-1 onboarding calls (15 minutes each)
3. Daily Slack/text check-ins for feedback
4. Watch session recordings (if user permits)
5. Quick iteration on critical issues

**Success Criteria:**
- 3+ users create at least 1 complete quote
- 80%+ report "this is useful" or better
- No blocking bugs preventing quote generation
- Average quote creation time under 30 minutes

**Metrics to Track:**
- Quotes created per user
- Time to first quote (onboarding friction)
- Drop-off points in form (where do they quit?)
- Qualitative feedback themes

**Iteration Plan:**
- Fix critical bugs within 24 hours
- Weekly feature updates based on feedback
- Document common questions for FAQ

---

### Phase 2: AV Community Launch (Weeks 3-6)

**Goal:** Reach 100 signups, validate product-market fit, gather testimonials

**Target Channels:**
1. **Reddit:**
   - r/livesound (205K members) - Mix engineers, A1s, freelancers
   - r/CommercialAV (18K members) - Integrators, rental companies
   - r/lightingdesign (12K members) - LDs, lighting companies
   - r/LocationSound (35K members) - Freelancers, owner-operators

2. **Facebook Groups:**
   - "Live Sound Engineers and Techs" (58K members)
   - "Professional Lighting Designers" (22K members)
   - "AV Professionals Network" (15K members)
   - Regional groups: "LA Production Community", "NYC Live Events", etc.

3. **LinkedIn:**
   - Post to Myers' network (start with personal profile)
   - Join groups: "Audio Visual Professionals", "Event Production Network"
   - Target hashtags: #LiveSound, #AVRental, #EventProduction

4. **Industry Forums:**
   - GeekNight.com (lighting-focused)
   - PSW Forums (ProSoundWeb - audio)
   - AVSForum.com (integration, commercial)

**Launch Post Template:**

```
Subject: [BETA] Free AI tool for AV quotes - built by a fellow tech

Hey everyone,

I'm Myers, A1/PM at [company]. Got tired of spending hours in Excel quoting
the same corporate events over and over, so I built QuoteMyAV.

It's a web app that asks smart questions about your event and generates
professional quotes using AI. Takes 15-30 minutes instead of 2-3 hours.

Looking for beta testers - Free plan is 3 quotes/month forever. If you're
quoting weddings, corporate events, small concerts, etc., this might save
you a ton of time.

Link: https://quotemyav.com
Feedback welcome - still early but it works!
```

**Outreach Strategy:**
- Post once per community (no spam)
- Engage genuinely in threads (provide value first)
- Share before/after examples (with permission)
- Respond to every comment within 24 hours

**Success Criteria:**
- 100 signups in 4 weeks (25/week average)
- 30% activation rate (create at least 1 quote)
- 5+ written testimonials or positive comments
- 10%+ conversion to Starter plan ($20/mo)

**Metrics to Track:**
- Signups by source (Reddit, Facebook, LinkedIn, forum)
- Activation rate by source (which channels bring engaged users?)
- Time to first quote
- Quotes per user (engagement)
- Upgrade rate (free → paid)

---

### Phase 3: Content Marketing & SEO (Months 2-4)

**Goal:** Organic inbound traffic, establish authority, reduce dependency on manual outreach

**Content Strategy:**

1. **Blog Posts (SEO-focused):**
   - "How to Quote an AV Event in 2025: Complete Guide" (beginner)
   - "AV Labor Cost Calculator: How to Estimate Crew for Any Event" (practical)
   - "PA System Sizing Guide: Coverage, SPL, and Equipment Selection" (technical)
   - "Good-Better-Best AV Quotes: How to Present Options to Clients" (sales)
   - "Wedding AV Checklist: Everything You Need to Quote" (vertical-specific)

2. **YouTube (if comfortable on camera):**
   - Screen recordings: "How I Quote a Corporate Event in 15 Minutes"
   - Tutorial: "Using QuoteMyAV for [Event Type]"
   - Tips: "5 Mistakes AV Companies Make When Quoting"

3. **LinkedIn Articles:**
   - Industry thought leadership
   - Case studies (anonymized): "How This LA Rental Company Cut Quote Time 70%"
   - Behind-the-scenes: "Building QuoteMyAV: Why I Used AI"

**SEO Keywords to Target:**
- "AV quote template" (390 searches/mo)
- "how to quote audio visual" (210 searches/mo)
- "PA system calculator" (140 searches/mo)
- "event production quote" (320 searches/mo)
- "AV rental pricing" (170 searches/mo)

**Success Criteria:**
- 500 organic visitors/month by Month 4
- 3-5% conversion rate (visitor → signup)
- Ranking on page 1 for 2+ target keywords
- Email list growth (blog CTA)

**Metrics to Track:**
- Organic traffic (Google Search Console)
- Top landing pages
- Keyword rankings (Ahrefs or free tools)
- Bounce rate by page
- Blog post → signup conversion

---

### Phase 4: Paid Acquisition (Month 4+, if metrics justify)

**Goal:** Scale growth with paid channels once organic CAC and LTV are understood

**Channels to Test (in priority order):**

1. **LinkedIn Ads:**
   - Target: "Audio Engineer", "Lighting Designer", "Event Production Manager"
   - Ad format: Sponsored content (native posts)
   - Budget: $10/day test ($300/mo)
   - Expected CPC: $3-5
   - Expected CTR: 0.5-1%
   - Target CPA: <$30 (less than 1x monthly subscription)

2. **Google Ads (Search):**
   - Exact match keywords: "av quote software", "event production quote tool"
   - Budget: $5/day test ($150/mo)
   - Expected CPC: $2-4
   - Target CPA: <$20

3. **Facebook/Instagram Ads:**
   - Custom audience: lookalike from email list
   - Interest targeting: "Audio Engineering", "Event Production", "Concert Lighting"
   - Budget: $5/day test ($150/mo)
   - Expected CPC: $0.50-1.50
   - Target CPA: <$15

**Decision Criteria to Start Paid Ads:**
- LTV:CAC ratio > 3:1 (organic)
- Monthly churn < 10%
- Product NPS > 40
- Have $1,000+ to test without risk

**Success Criteria:**
- CPA under $25 (1x MRR Starter, 0.3x MRR Pro)
- 30-day retention > 70%
- Positive ROI within 3 months

**Metrics to Track:**
- CPC, CTR, CPA by channel
- Landing page conversion rate
- Signup → paid conversion by source
- LTV by acquisition channel

---

## 3. Launch Channels Deep Dive

### Reddit Strategy

**Best Practices:**
- Participate authentically for 1-2 weeks before posting
- Contribute valuable comments in threads (build karma)
- Disclose affiliation: "I built this"
- Avoid sales language: "looking for feedback" not "check out my product"
- Post during peak hours: 9-11am ET, 6-8pm ET

**Sample Posts:**

**r/livesound:**
```
Anyone else spend way too long quoting corporate events?

Been A1 for 8 years, still hate quoting. Spent 3 hours yesterday pricing
a basic general session that I've done 100 times. Excel templates help but
they're still a slog.

Built a tool to speed this up - AI asks questions about the event and
generates the quote. Not perfect but cuts my time from 3 hours to 20 minutes.

Free for 3 quotes/month if anyone wants to try: [link]

What do you use? Still doing everything in Excel/Word?
```

**r/CommercialAV:**
```
[Tool] AV Quote Generator - Looking for Beta Testers

Background: PM at a mid-size rental company, got tired of recreating the
same quotes in Excel. Built a web app that uses AI to standardize our
quoting process.

How it works:
- Answer questions about event (venue, dates, audience size, etc.)
- AI generates equipment list, labor calc, and formatted quote
- Export to PDF or keep tweaking

Looking for feedback from other rental companies. Free tier (3 quotes/mo)
available for beta testers.

Link: [link]
Feedback appreciated!
```

**Engagement Strategy:**
- Respond to every comment within 2 hours (if possible)
- Answer technical questions in detail
- Take criticism gracefully, ask for specific feedback
- Update post with "Edit: thanks for feedback, working on X"

---

### Facebook Group Strategy

**Best Practices:**
- Read group rules (many prohibit self-promotion)
- Build reputation first: answer questions, be helpful
- Post in "Feedback Friday" or similar allowed threads
- Use screenshots/demos, not just text
- Offer exclusive discount code for group members (if applicable)

**Sample Posts:**

```
Has anyone tried AI tools for quoting yet?

I've been experimenting with using Claude API to generate AV quotes and
it's honestly a game-changer. Built a simple web form that asks about the
event and outputs a full quote with equipment, labor, and pricing.

Cuts my quote time from 2-3 hours to about 20 minutes for standard
corporate events.

Made it available for others to try (free tier for up to 3 quotes/month):
https://quotemyav.com

Curious if anyone else is using AI in their workflow yet? What for?
```

**Engagement Strategy:**
- Post during business hours (not weekends)
- Use video demo if group allows
- Share results: "Here's a before/after example"
- Join discussions, don't just post and ghost

---

### Direct Outreach (Markey's Network)

**Myers' Unique Advantage:**
- Established relationships in AV community
- Credibility as working technician
- Access to industry contacts

**Outreach Template (Email):**

```
Subject: Built something for quoting - want your feedback?

Hey [Name],

Hope you've been well! I've been working on a side project and thought
of you.

You know how much time we all waste quoting events in Excel? I got fed up
and built a web app that uses AI to speed it up. You answer questions
about the event and it generates the full quote - equipment, labor, pricing.

Would love your feedback if you have 15 minutes to try it out. Free tier
is 3 quotes/month.

Link: https://quotemyav.com

Let me know what you think - brutal honesty appreciated!

Best,
Myers
```

**Follow-Up Strategy:**
- Send personal emails (not mass BCC)
- Offer 1-on-1 walkthrough via Zoom/call
- Ask for referrals if they like it
- Feature testimonials (with permission)

---

## 4. Key Metrics to Track

### Acquisition Metrics

| Metric | Definition | Target (Month 1) | Target (Month 3) |
|--------|------------|------------------|------------------|
| **Signups** | New user registrations | 20 | 100 |
| **Source Attribution** | Where signups came from | Track all sources | Identify top 2 channels |
| **Landing Page CVR** | Visitors → signups | 5% | 8% |
| **Organic Traffic** | Non-paid visitors | 50/mo | 500/mo |
| **CAC (Organic)** | Cost per customer (time only) | $0 (manual) | Track time spent |

**Tracking Implementation:**
- Vercel Analytics (free tier)
- UTM parameters in all links (`?utm_source=reddit&utm_medium=post&utm_campaign=beta_launch`)
- Google Analytics 4 (optional, privacy-friendly setup)
- Supabase custom events

---

### Activation Metrics

| Metric | Definition | Target (Month 1) | Target (Month 3) |
|--------|------------|------------------|------------------|
| **Activation Rate** | % of signups who create 1+ quote | 30% | 50% |
| **Time to First Quote** | Hours from signup to first quote | <24 hours | <6 hours |
| **Onboarding Completion** | % who finish setup steps | 60% | 80% |
| **Form Completion Rate** | % of started quotes that submit | 40% | 60% |
| **Quote Export Rate** | % of quotes exported to PDF | 70% | 80% |

**Tracking Implementation:**
- Supabase: Track events (`user_signed_up`, `quote_started`, `quote_completed`, `quote_exported`)
- Funnel analysis: Signup → First quote → Export

**Drop-off Analysis:**
```sql
-- Where do users abandon the quote form?
SELECT
  CASE
    WHEN jsonb_array_length(request_data->'client_overview') > 0 THEN 'Section 1: Client Overview'
    WHEN jsonb_array_length(request_data->'dates_schedule') > 0 THEN 'Section 2: Dates'
    WHEN jsonb_array_length(request_data->'venue_rigging') > 0 THEN 'Section 3: Venue'
    -- etc
  END as last_completed_section,
  COUNT(*) as drop_offs
FROM quotes
WHERE status = 'draft' AND updated_at < NOW() - INTERVAL '7 days'
GROUP BY last_completed_section;
```

---

### Engagement Metrics

| Metric | Definition | Target (Month 1) | Target (Month 3) |
|--------|------------|------------------|------------------|
| **Quotes per User (Active)** | Avg quotes created by active users | 2 | 4 |
| **Weekly Active Users** | Users who create quote in past 7 days | 5 | 25 |
| **Monthly Active Users** | Users who create quote in past 30 days | 10 | 60 |
| **Return Visit Rate** | % of users who come back after first quote | 30% | 50% |
| **Session Duration** | Time spent in app per session | 20 min | 15 min (faster = better) |

**Tracking Implementation:**
- Supabase: Query `quotes` table for user activity
- Segment users: 1 quote (trial), 2-5 quotes (engaged), 6+ quotes (power user)

---

### Revenue Metrics

| Metric | Definition | Target (Month 1) | Target (Month 3) |
|--------|------------|------------------|------------------|
| **MRR** | Monthly Recurring Revenue | $100 | $500 |
| **Paying Customers** | Users on Starter or Pro plan | 3 | 10 |
| **Free → Paid CVR** | % of free users who upgrade | 15% | 20% |
| **ARPU** | Average Revenue Per User (all) | $5 | $8 |
| **ARPU (Paid)** | Average Revenue Per Paying User | $35 | $50 |
| **Churn Rate** | % of paid users who cancel/month | <15% | <10% |

**Tracking Implementation:**
- Stripe Dashboard (automatic)
- Supabase: Join `subscriptions` table with Stripe data
- Cohort analysis: Track retention by signup month

**Revenue Projections:**

```
Month 1:
- 20 signups, 15% convert = 3 paid
- 2 Starter ($20) + 1 Pro ($60) = $100 MRR

Month 2:
- 40 signups, 18% convert = 7 paid (10 total)
- 6 Starter + 4 Pro = $360 MRR

Month 3:
- 60 signups, 20% convert = 12 paid (22 total, -2 churn)
- 14 Starter + 8 Pro = $760 MRR
```

**Break-Even Analysis:**
- Fixed costs: $50/mo (Supabase, Claude API, domain)
- Break-even: 2 Starter subscribers or 1 Pro subscriber
- Target: 10x costs = $500 MRR by Month 3

---

### Retention Metrics

| Metric | Definition | Target (Month 1) | Target (Month 3) |
|--------|------------|------------------|------------------|
| **30-Day Retention** | % of users active after 30 days | 40% | 60% |
| **Churn Rate** | % of paid users who cancel | <20% | <10% |
| **NPS** | Net Promoter Score | N/A (too early) | 40+ |
| **Upgrade Rate** | Free → Starter or Starter → Pro | 15% | 25% |
| **Reactivation Rate** | Churned users who return | N/A | 10% |

**Tracking Implementation:**
- Email surveys: NPS after 2nd quote, 30 days, 90 days
- Exit surveys: Why did you cancel?
- Cohort retention table:

```
        Week 1  Week 2  Week 3  Week 4
Jan     100%    60%     45%     40%
Feb     100%    65%     50%     45%
Mar     100%    70%     55%     50%
```

---

## 5. Month 1-3 Success Criteria

### Month 1: Validation

**Primary Goals:**
- Prove the product works end-to-end
- Get first paying customers
- Identify critical bugs and UX issues

**Targets:**
- 20 signups (mostly friends & family)
- 6 active users (create 2+ quotes)
- 3 paying customers ($100+ MRR)
- 0 critical bugs blocking quote generation
- 80%+ user satisfaction (informal feedback)

**Signals of Success:**
- "This saved me so much time" feedback
- Users referring colleagues without prompting
- Repeat usage (users come back for 2nd, 3rd quote)
- Feature requests (engagement signal)

**Signals of Failure:**
- No one creates a second quote
- "Easier to just use Excel" feedback
- High support burden (constant hand-holding needed)
- No one willing to pay

**Decision Point:**
- If success → proceed to Phase 2 launch
- If failure → pivot form experience, simplify, or validate different persona

---

### Month 2: Growth

**Primary Goals:**
- Scale signups through community launch
- Improve activation and retention
- Gather testimonials and case studies

**Targets:**
- 100 total signups (80 new in Month 2)
- 30% activation rate
- 10 paying customers ($400+ MRR)
- 5 written testimonials
- 50% of users create 2+ quotes

**Signals of Success:**
- Organic referrals ("my colleague signed up because of me")
- Reduced onboarding friction (faster time to first quote)
- Community engagement (Reddit/Facebook upvotes, comments)
- Users hitting Free tier limit and upgrading

**Signals of Failure:**
- High signup, low activation (form too complex?)
- Users complete 1 quote and never return
- No one upgrading from Free tier
- Negative community feedback

**Decision Point:**
- If success → continue community launch, start content marketing
- If mixed → iterate on activation flow, pricing, or features
- If failure → re-evaluate product-market fit, consider pivot

---

### Month 3: Product-Market Fit

**Primary Goals:**
- Achieve consistent week-over-week growth
- Establish repeatable acquisition channels
- Demonstrate retention and engagement

**Targets:**
- 250 total signups (150 new in Month 3)
- 50% activation rate
- 20 paying customers ($800+ MRR)
- 60% 30-day retention
- NPS > 40
- 2+ acquisition channels working (Reddit + LinkedIn, or SEO + referrals)

**Signals of Product-Market Fit:**
- Users exhibit "pull" behavior (ask for features, check for updates)
- Organic growth (word-of-mouth, referrals)
- Low churn (<10% monthly)
- Willingness to pay increases (Pro plan adoption)
- Testimonials mention "can't live without it" or "game-changer"

**Signals of Lack of PMF:**
- Growth stalls without manual outreach
- High churn (>15% monthly)
- Users describe product as "nice to have" not "must have"
- Feature requests are scattered (no clear pattern)

**Decision Point:**
- If PMF achieved → scale acquisition (consider paid ads)
- If trending toward PMF → continue iterating, expand content
- If not achieving PMF → major pivot or feature overhaul needed

---

## 6. Analytics Setup

### 6.1 Events to Track (Vercel + Custom)

**User Lifecycle Events:**
```javascript
// Acquisition
trackEvent('user_visited_landing', { source, medium, campaign });
trackEvent('user_signed_up', { source, medium, plan: 'free' });
trackEvent('user_completed_onboarding', { time_to_complete_minutes });

// Activation
trackEvent('quote_started', { quote_type });
trackEvent('quote_section_completed', { section_name, completion_percentage });
trackEvent('quote_completed', { quote_type, time_to_complete_minutes });
trackEvent('quote_exported', { format: 'pdf' });

// Engagement
trackEvent('user_returned', { days_since_signup, quotes_created });
trackEvent('dashboard_viewed', { quotes_count, usage_percentage });

// Revenue
trackEvent('upgrade_clicked', { from_plan, to_plan });
trackEvent('checkout_started', { plan, price });
trackEvent('subscription_created', { plan, price, source });
trackEvent('subscription_cancelled', { plan, reason, tenure_days });

// Feature Usage
trackEvent('form_mode_selected', { mode: 'manual|ai|upload' });  // Phase 2
trackEvent('ai_suggestion_accepted', { field });  // Phase 2
trackEvent('quote_edited_after_generation', { sections_changed });
```

**Implementation:**
```javascript
// Frontend (React)
import { track } from '@vercel/analytics';

function handleQuoteComplete(quote) {
  track('quote_completed', {
    quote_type: quote.type,
    time_to_complete_minutes: (Date.now() - quote.started_at) / 60000,
    sections_filled: quote.completion_percentage
  });
}

// Backend (n8n webhook)
await supabase.from('analytics_events').insert({
  user_id: userId,
  event_name: 'subscription_created',
  properties: { plan: 'starter', price: 29, source: 'reddit' },
  timestamp: new Date()
});
```

---

### 6.2 Funnel Definitions

**Acquisition Funnel:**
```
Landing Page Visit
  ↓ (5-8% CVR target)
Signup
  ↓ (80% target)
Email Verified
  ↓ (50% target)
First Quote Started
  ↓ (60% target)
First Quote Completed
```

**Activation Funnel:**
```
Signup
  ↓ (60% target)
Dashboard Viewed
  ↓ (70% target)
Quote Form Opened
  ↓ (40% target)
Section 1 Completed
  ↓ (70% target)
Section 2 Completed
  ↓ (80% target)
Sections 3-N Completed
  ↓ (90% target)
Quote Generated
  ↓ (80% target)
Quote Exported
```

**Monetization Funnel:**
```
Free User (3 quotes used)
  ↓ (20% CVR target)
Clicked "Upgrade"
  ↓ (70% target)
Viewed Pricing Page
  ↓ (40% target)
Started Checkout
  ↓ (85% target)
Completed Payment
```

---

### 6.3 Dashboard Metrics (Supabase + Metabase/Retool)

**Daily Dashboard:**
- Signups today, this week, this month
- Quotes created today, this week, this month
- Active users (DAU, WAU, MAU)
- MRR and new subscriptions
- Top acquisition sources

**Weekly Dashboard:**
- Week-over-week growth (signups, quotes, revenue)
- Activation rate by cohort
- Churn count and reasons
- Feature usage trends
- Top landing pages

**Monthly Dashboard:**
- Monthly growth metrics
- Cohort retention table
- LTV:CAC ratio
- NPS results
- Financial summary (revenue, costs, profit)

**SQL Queries for Key Metrics:**

```sql
-- Activation rate by signup week
SELECT
  DATE_TRUNC('week', created_at) as signup_week,
  COUNT(*) as signups,
  COUNT(CASE WHEN quotes_created > 0 THEN 1 END) as activated,
  ROUND(100.0 * COUNT(CASE WHEN quotes_created > 0 THEN 1 END) / COUNT(*), 1) as activation_rate
FROM (
  SELECT
    u.created_at,
    COUNT(q.id) as quotes_created
  FROM auth.users u
  LEFT JOIN quotes q ON u.id = q.user_id
  GROUP BY u.id, u.created_at
) user_activity
GROUP BY signup_week
ORDER BY signup_week DESC;

-- MRR by plan
SELECT
  plan,
  COUNT(*) as subscribers,
  SUM(CASE
    WHEN plan = 'starter' THEN 29
    WHEN plan = 'pro' THEN 79
    ELSE 0
  END) as mrr
FROM subscriptions
WHERE status = 'active'
GROUP BY plan;

-- Cohort retention
WITH cohorts AS (
  SELECT
    user_id,
    DATE_TRUNC('month', created_at) as cohort_month
  FROM auth.users
),
activity AS (
  SELECT
    user_id,
    DATE_TRUNC('month', created_at) as activity_month
  FROM quotes
)
SELECT
  c.cohort_month,
  a.activity_month,
  EXTRACT(MONTH FROM AGE(a.activity_month, c.cohort_month)) as month_number,
  COUNT(DISTINCT c.user_id) as cohort_size,
  COUNT(DISTINCT a.user_id) as active_users,
  ROUND(100.0 * COUNT(DISTINCT a.user_id) / COUNT(DISTINCT c.user_id), 1) as retention_rate
FROM cohorts c
LEFT JOIN activity a ON c.user_id = a.user_id
GROUP BY c.cohort_month, a.activity_month
ORDER BY c.cohort_month, month_number;
```

---

### 6.4 Cohort Analysis Plan

**Cohort Definitions:**
- By signup date (month)
- By acquisition source (Reddit, LinkedIn, referral, organic)
- By first quote type (rental, installation, production)
- By plan (free, starter, pro)

**Analysis Questions:**
- Which acquisition sources have highest retention?
- Do users who export their first quote retain better?
- Does time-to-first-quote correlate with retention?
- Which cohorts upgrade to paid plans fastest?

**Retention Cohort Table Example:**

```
              Month 0  Month 1  Month 2  Month 3
Jan Signups   100%     45%      30%      25%
Feb Signups   100%     50%      35%      --
Mar Signups   100%     55%      --       --
```

Target: Month 1 retention > 50%, Month 3 retention > 30%

---

## 7. Pricing Experiments

### 7.1 A/B Test Ideas (Post-Launch)

**Test 1: Free Tier Limit**
- Control: 3 quotes/month
- Variant A: 5 quotes/month
- Variant B: 1 quote/month
- **Hypothesis:** Lower free tier drives faster upgrades, but may reduce signups
- **Metric:** Free → Paid conversion rate

**Test 2: Starter Plan Price**
- Control: $20/mo (25 quotes)
- Variant A: $15/mo (15 quotes)
- Variant B: $30/mo (50 quotes)
- **Hypothesis:** $19 increases volume, $39 increases revenue per user
- **Metric:** Total revenue, subscriber count

**Test 3: Pricing Page Messaging**
- Control: "Most Popular" badge on Starter
- Variant A: "Best Value" badge on Pro
- Variant B: No badges, neutral presentation
- **Hypothesis:** Social proof increases conversions to highlighted plan
- **Metric:** Plan selection distribution

**Test 4: Good-Better-Best**
- Control: 3 tiers (Free, Starter, Pro)
- Variant A: 2 tiers (Free, Pro only)
- Variant B: 4 tiers (Free, Starter, Pro, Enterprise placeholder)
- **Hypothesis:** Anchoring effect from 4 tiers increases Pro adoption
- **Metric:** Paid plan mix, total ARPU

---

### 7.2 Price Sensitivity Research

**Methods:**

1. **Van Westendorp Price Sensitivity Meter:**
   - Survey question: "At what price would QuoteMyAV be..."
     - Too cheap (suspicious of quality)?
     - A bargain?
     - Getting expensive?
     - Too expensive (would not consider)?
   - Plot responses to find optimal price range

2. **Willingness-to-Pay Survey:**
   - After 2nd quote, ask: "If this saved you 2 hours, what's that worth to you?"
   - Segment by user type (freelancer vs. company)

3. **Exit Survey (Churned Users):**
   - "Why did you cancel?" → "Too expensive" vs. other reasons
   - "What price would have kept you?" (free text)

**Expected Findings:**
- Freelancers: $15-30/mo sweet spot
- Small companies: $30-60/mo acceptable
- Larger companies: Price less important than features/integrations

---

### 7.3 Feature Bundling Options

**Current MVP Bundling:**
- Free: 3 quotes/mo, all features
- Starter: 25 quotes/mo, all features
- Pro: Unlimited quotes, all features

**Future Bundling Ideas (Phase 2):**

**Option A: Feature-Gated Tiers**
```
Free: 3 quotes, form mode only, basic templates
Starter: 25 quotes, AI chat mode, custom branding
Pro: Unlimited, upload mode, API access, team features
```

**Option B: Add-On Model**
```
Base: $20/mo (25 quotes, form mode)
Add-ons:
  - AI Chat Mode: +$10/mo
  - Upload/RFP Extraction: +$15/mo
  - Custom Branding: +$5/mo
  - API Access: +$20/mo
  - Team Seats: +$15/seat/mo
```

**Option C: Vertical-Specific Pricing**
```
Freelancer: $19/mo (10 quotes, basic)
Rental Company: $49/mo (50 quotes, integrations)
Production House: $99/mo (unlimited, team, API)
```

**Decision Framework:**
- Keep MVP simple (usage-based only)
- Introduce feature gating in Phase 2 based on user feedback
- Avoid complexity until product-market fit is clear

---

## 8. Competitive Positioning

### 8.1 Current Alternatives

**Alternative 1: Excel/Word Templates**
- **Pros:** Free, customizable, offline
- **Cons:** Time-consuming, error-prone, inconsistent, unprofessional
- **User quote:** "I have an Excel template but still takes 2-3 hours per quote"

**Alternative 2: General CRM/Quoting Tools (HubSpot, Quotient, PandaDoc)**
- **Pros:** Feature-rich, integrations, team workflows
- **Cons:** Not AV-specific, expensive ($50-200/mo), steep learning curve
- **User quote:** "Tried HubSpot but it doesn't know PA sizing or labor calc"

**Alternative 3: Hire Admin Staff**
- **Pros:** Frees up PM time, handles other tasks
- **Cons:** $3K-5K/mo salary, training burden, turnover risk
- **User quote:** "Can't afford a dedicated estimator yet"

**Alternative 4: Custom Internal Tools**
- **Pros:** Perfectly tailored to business
- **Cons:** Expensive to build ($10K-50K), maintenance burden
- **User quote:** "Looked into building this, couldn't justify the cost"

---

### 8.2 QuoteMyAV Differentiation

**Key Differentiators:**

1. **AV-Specific Intelligence**
   - Knows PA coverage calculations (inverse square law, SPL targets)
   - Understands lighting fixture counts (lux, beam angles)
   - Built-in labor rules (union vs. non-union, load-in/strike timing)
   - Equipment compatibility checks (power, rigging, cabling)

2. **Speed Without Sacrifice**
   - 15-30 minutes vs. 2-3 hours (80-90% time savings)
   - Professional output matches custom quotes
   - AI handles logic, user handles judgment

3. **Accessible Pricing**
   - $20/mo vs. $50-200/mo for generic tools
   - Free tier for freelancers and trials
   - No implementation fees or training costs

4. **Built by a Tech, for Techs**
   - Credibility: "I use this for my own quotes"
   - Industry language and workflows
   - Understands "real-world" vs. "textbook" scenarios

5. **Instant Setup**
   - No onboarding calls, no sales process
   - Self-serve signup, working in 5 minutes
   - No lock-in, cancel anytime

**Positioning Statement:**

> "QuoteMyAV is the AI-powered quoting tool built specifically for AV professionals. Generate accurate, professional quotes in 15-30 minutes instead of hours - without sacrificing quality or customization. From $20/mo."

---

### 8.3 Pricing Comparison

| Solution | Monthly Cost | Setup Time | AV-Specific | Target User |
|----------|-------------|------------|-------------|-------------|
| **Excel Templates** | $0 | 2-3 hours/quote | No | DIY small shops |
| **HubSpot/PandaDoc** | $50-200/mo | 1-2 weeks setup | No | Enterprise sales teams |
| **Custom Build** | $10K-50K upfront | 3-6 months | Yes | Large companies |
| **QuoteMyAV Free** | $0 | 5 min signup | Yes | Freelancers, trials |
| **QuoteMyAV Starter** | $20/mo | 5 min signup | Yes | Small AV companies |
| **QuoteMyAV Pro** | $60/mo | 5 min signup | Yes | Active rental companies |
| **QuoteMyAV Enterprise** | From $200/mo | Custom | Yes | Multi-seat teams |

**Value Proposition Math:**

For a PM earning $30/hour:
- Manual quote: 2.5 hours = $75 in labor
- QuoteMyAV quote: 0.5 hours = $15 in labor
- **Savings per quote: $60**

Break-even:
- Starter plan ($20/mo): 1 quote per month
- Pro plan ($60/mo): 1 quote per month

---

## 9. Risk Mitigation & Contingencies

### 9.1 Key Risks

**Risk 1: Low Activation Rate**
- **Symptom:** Signups don't create quotes
- **Mitigation:** Improve onboarding flow, add sample quote template, send activation emails
- **Contingency:** Offer 1-on-1 walkthroughs, create video tutorial

**Risk 2: High Churn**
- **Symptom:** Paid users cancel after 1-2 months
- **Mitigation:** Exit surveys, identify common pain points, improve retention features
- **Contingency:** Offer annual plans with discount, add essential features

**Risk 3: AI Output Quality Issues**
- **Symptom:** Users complain quotes are inaccurate or generic
- **Mitigation:** Improve prompts, add rules engine, allow manual overrides
- **Contingency:** Pivot to "AI-assisted" instead of "AI-generated" positioning

**Risk 4: Price Resistance**
- **Symptom:** Users love product but won't pay
- **Mitigation:** A/B test pricing, offer annual discount, create cheaper tier
- **Contingency:** Ad-supported free tier, freemium with limited features

**Risk 5: Competitive Response**
- **Symptom:** Larger competitor launches similar feature
- **Mitigation:** Move fast, build community moat, focus on niche (AV-specific)
- **Contingency:** Pivot to vertical specialization or white-label licensing

---

### 9.2 Decision Trees

**If activation rate < 30% after 100 signups:**
- [ ] Analyze drop-off points in form
- [ ] Simplify form (reduce fields, add "skip" options)
- [ ] Add guided mode (wizard vs. all-at-once)
- [ ] Create onboarding video
- [ ] Offer sample quote to start from

**If no one converts to paid after 50 signups:**
- [ ] Survey users: "Why haven't you upgraded?"
- [ ] Test lower price point ($19/mo)
- [ ] Add "pay per quote" option ($10/quote)
- [ ] Reconsider free tier limit (too generous?)
- [ ] Validate if problem is big enough to pay for

**If MRR growth stalls at $500/mo:**
- [ ] Identify churned users, interview them
- [ ] Add features from top requests
- [ ] Expand to adjacent markets (integrators, venues)
- [ ] Test paid acquisition (LinkedIn ads)
- [ ] Consider annual plans or enterprise tier

---

## 10. Summary & Next Steps

### Launch Readiness Checklist

**Pre-Launch (Before Phase 1):**
- [ ] MVP deployed and tested (end-to-end quote generation works)
- [ ] Supabase auth working (signup, login, password reset)
- [ ] Stripe integration live (can subscribe and cancel)
- [ ] Analytics tracking installed (Vercel Analytics + custom events)
- [ ] Landing page complete (hero, features, pricing, CTA)
- [ ] Email templates ready (welcome, activation, upgrade prompts)
- [ ] Support channel set up (email or Intercom)

**Phase 1 Launch (Friends & Family):**
- [ ] Personal invitations sent to 10 beta testers
- [ ] 1-on-1 onboarding calls scheduled
- [ ] Feedback loop established (daily check-ins)
- [ ] Bug tracker ready (Linear, GitHub Issues, or Notion)

**Phase 2 Launch (Community):**
- [ ] Reddit/Facebook posts drafted and scheduled
- [ ] LinkedIn profile updated with project mention
- [ ] Demo video or screenshots ready
- [ ] Community engagement plan (reply SLA: 24 hours)
- [ ] Testimonials collected from Phase 1

**Phase 3 Launch (Content):**
- [ ] 3 blog posts written and published
- [ ] SEO keywords researched and prioritized
- [ ] Email newsletter sequence created
- [ ] Social media content calendar (LinkedIn, Twitter)

---

### Success Mantra

**Month 1:** Prove it works, get first paying customers
**Month 2:** Scale signups, improve retention, gather testimonials
**Month 3:** Achieve product-market fit, establish repeatable growth

**Focus:** Ruthlessly prioritize activation and retention over new features. A smaller number of engaged, paying users is better than a large number of inactive free users.

---

**Last Updated:** 2025-12-12
**Owner:** Myers (solo founder)
**Next Review:** After Month 1 results
