# QuoteMyAV - MVP Architecture

## Product Overview
**Domain:** quotemyav.com
**MVP Scope:** Form-based quote input only

A subscription web app that generates professional AV quotes using AI. Customers fill out a guided form, Claude generates detailed quotes.

**Target Market:** AV rental companies, event production houses, integrators

**MVP Pricing Model:**
- Free: 3 quotes/month
- Starter ($20/mo): 25 quotes/month
- Pro ($60/mo): Unlimited quotes
- Enterprise (from $200/mo): Multi-seat teams, custom limits

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Frontend │────▶│   n8n Webhooks  │────▶│   Claude API    │
│  (Vercel)       │     │   (localhost)   │     │   (Anthropic)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │
         │                      ▼
         │              ┌─────────────────┐
         └─────────────▶│    Supabase     │
                        │  (Auth + DB)    │
                        └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │     Stripe      │
                        │   (Payments)    │
                        └─────────────────┘
```

**Stack Rationale:**
- **n8n** = Visual workflow editing, easy to tweak AI prompts, you already know it
- **Supabase** = Free auth + Postgres, handles user management
- **Vercel** = Free hosting, auto-deploys from GitHub
- **Stripe** = Industry standard, n8n has native integration
- **Cloudflare Tunnel** = Expose localhost n8n to webhooks

---

## Database Schema (Supabase)

```sql
-- Users (handled by Supabase Auth)

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free', -- free, starter, pro
  quotes_used INT DEFAULT 0,
  quotes_limit INT DEFAULT 3,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  quote_type TEXT, -- rental, installation, full_production
  input_method TEXT DEFAULT 'form', -- form only in MVP
  request_data JSONB, -- original form input
  generated_quote JSONB, -- AI output
  status TEXT DEFAULT 'draft', -- draft, sent, accepted, rejected
  created_at TIMESTAMP DEFAULT now()
);
```

---

## n8n Workflows (MVP)

1. **Quote Generation**
   - Webhook receives form data
   - Rules engine calculates base equipment/labor
   - Claude refines and formats quote
   - Save to Supabase
   - Return quote JSON

2. **Stripe Webhook Handler**
   - Receive payment events
   - Update subscription in Supabase
   - Handle plan upgrades/downgrades

3. **Usage Tracker**
   - Check quota before generating
   - Increment counter after successful quote
   - Return upgrade prompt if quota exceeded

---

## Frontend Pages (MVP)

### Public Pages (No Auth)
- `/` - Landing page (hero, features, pricing, testimonials)
- `/pricing` - Detailed pricing comparison
- `/login` - Supabase Auth UI
- `/signup` - Supabase Auth UI

### Protected Pages (Auth Required)
- `/dashboard` - Quote history, usage stats, quick actions
- `/quote/new` - Multi-step quote form
- `/quote/[id]` - View/edit/export single quote
- `/settings` - Account, billing portal link

---

## Component Structure (MVP)

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── quote/
│   │   ├── QuoteForm.jsx      # Multi-step guided form
│   │   ├── QuotePreview.jsx   # Generated quote display
│   │   └── QuoteExport.jsx    # PDF export
│   ├── dashboard/
│   │   ├── StatsCards.jsx
│   │   ├── QuoteHistory.jsx
│   │   └── UsageBar.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── Card.jsx
│       ├── Modal.jsx
│       └── Input.jsx
├── pages/
│   ├── Landing.jsx
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── NewQuote.jsx
│   └── ViewQuote.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useQuotes.js
│   └── useSubscription.js
├── lib/
│   ├── supabase.js
│   ├── api.js             # n8n webhook callers
│   └── stripe.js
└── App.jsx
```

---

## Quote Form Fields (MVP)

### Event Basics (Required)
- Event type (corporate, concert, wedding, conference, festival, other)
- Event name
- Venue name and address
- Venue capacity / expected attendance
- Room dimensions (if known)

### Dates & Schedule (Required)
- Event date(s)
- Load-in date/time
- Strike date/time
- Show times

### Equipment Categories (Select all that apply)
- [ ] Audio (PA, wireless, monitors)
- [ ] Video (projection, LED, cameras)
- [ ] Lighting (stage, ambient, effects)
- [ ] Staging (risers, platforms, scenic)

### Audio Details (if selected)
- Program type: Music / Speech / Both
- Wireless mic count
- Monitor type: Wedges / IEMs / Both

### Video Details (if selected)
- Screen count and approximate sizes
- Projection or LED preference
- Recording/streaming needed?

### Lighting Details (if selected)
- Style: Concert / Corporate / Broadcast / Minimal
- Followspots needed?
- Haze/fog allowed?

### Labor & Budget
- Crew provided by: Vendor / Client / Mix
- Budget range (optional)
- Quote format: Single option / Good-Better-Best

---

## Stripe Integration (MVP)

### Products
- Product: "QuoteMyAV"
- Prices:
  - `price_starter_monthly` = $20/mo (25 quotes)
  - `price_pro_monthly` = $60/mo (unlimited)
  - `price_enterprise_monthly` = from $200/mo (custom)

### Flow
1. User clicks "Upgrade" → Redirect to Stripe Checkout
2. Stripe Checkout completes → Webhook to n8n
3. n8n updates Supabase subscription record
4. Frontend checks subscription on each quote request

### Usage Enforcement
```javascript
// n8n webhook: Check quota before generating
const { data: sub } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', userId)
  .single();

if (sub.plan === 'free' && sub.quotes_used >= 3) {
  return { error: 'quota_exceeded', upgrade_url: '/pricing' };
}
if (sub.plan === 'starter' && sub.quotes_used >= 25) {
  return { error: 'quota_exceeded', upgrade_url: '/pricing' };
}
// Pro = unlimited, no check needed
```

---

## Deployment (MVP)

### Frontend (Vercel)
- Connect GitHub repo
- Set environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_STRIPE_PUBLISHABLE_KEY`
  - `VITE_N8N_WEBHOOK_URL`
- Auto-deploy on push to main

### Backend (n8n)
- Running on localhost:5678
- Cloudflare Tunnel exposes webhooks to internet
- Tunnel URL configured in frontend env vars

### Domain
- Point quotemyav.com to Vercel
- Add to Supabase allowed origins

---

## Implementation Checklist (MVP)

### Foundation
- [ ] Create project at `D:\Projects\quotemyav\`
- [ ] Initialize Vite + React + TailwindCSS
- [ ] Setup Supabase project (auth + tables)
- [ ] Setup Stripe account + products
- [ ] Setup Cloudflare Tunnel for n8n webhooks

### Backend (n8n)
- [ ] Create quote generation workflow
- [ ] Create Stripe webhook handler
- [ ] Create usage check workflow
- [ ] Test webhooks via tunnel

### Frontend Core
- [ ] Build landing page (hero, features, pricing)
- [ ] Implement Supabase auth (login/signup)
- [ ] Build dashboard (quote history, usage stats)
- [ ] Build quote form (guided multi-step)
- [ ] Build quote preview/display component

### Payments & Polish
- [ ] Integrate Stripe Checkout
- [ ] Add usage enforcement
- [ ] Add PDF export
- [ ] Deploy to Vercel
- [ ] Point quotemyav.com to Vercel

---

## File Structure (MVP)

```
D:\Projects\quotemyav\
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
├── .env.local                 # Supabase + Stripe keys
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── QuoteForm.jsx
│   │   ├── QuotePreview.jsx
│   │   ├── QuoteHistory.jsx
│   │   └── UsageBar.jsx
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── NewQuote.jsx
│   │   └── ViewQuote.jsx
│   └── lib/
│       ├── supabase.js
│       └── api.js             # n8n webhook callers
├── supabase/
│   └── schema.sql
└── n8n-workflows/
    ├── quote-generator.json
    ├── stripe-webhook.json
    └── usage-check.json
```

---

## Cost Breakdown (Monthly)

| Service | Free Tier | Production |
|---------|-----------|------------|
| Vercel | Free | Free |
| Supabase | Free (500MB) | $25/mo if needed |
| Stripe | 2.9% + $0.30/tx | Same |
| n8n | Self-host free | $20/mo cloud |
| Claude API | ~$0.01-0.05/quote | ~$50/mo at scale |
| Domain | - | $12/year |

**Breakeven:** ~4 Starter subscribers or ~2 Pro subscribers covers costs

---

## Related Documents

- `../shared/rules-engine.md` - Equipment and labor selection logic
- `../shared/llm-architecture.md` - Claude integration details
- `../shared/questionnaire-fields.md` - Full 14-section field reference
- `02-wireframes.md` - MVP UI wireframes
- `03-ux-flow.md` - Form flow and animations
