# QuoteMyAV Production Launch Checklist

**Version:** 1.0
**Last Updated:** 2025-12-12
**Owner:** Myers
**Stack:** Vite + React (Vercel) → n8n (local + Cloudflare Tunnel) → Supabase → Stripe → Claude API

---

## Table of Contents

1. [Pre-Launch Checklist](#pre-launch-checklist)
2. [Launch Day Procedures](#launch-day-procedures)
3. [Post-Launch Monitoring](#post-launch-monitoring)
4. [Emergency Procedures](#emergency-procedures)
5. [Soft Launch vs Hard Launch Strategy](#soft-launch-vs-hard-launch-strategy)

---

## Pre-Launch Checklist

### Infrastructure (21 items)

#### Vercel Production Deployment
- [ ] Production deployment successful (no build errors)
- [ ] Environment variables set in Vercel dashboard
- [ ] Build output size optimized (<500KB initial JS bundle)
- [ ] Preview deployments working for PRs
- [ ] Auto-deploy from `main` branch enabled
- [ ] Build cache configured correctly
- [ ] Edge network regions configured (US + EU minimum)

#### Custom Domain & DNS
- [ ] `quotemyav.com` domain registered
- [ ] DNS pointed to Vercel nameservers
- [ ] SSL certificate active and auto-renewing
- [ ] `www` subdomain redirects to apex domain
- [ ] Email DNS records configured (SPF, DKIM, DMARC)
- [ ] Subdomain for n8n webhook receiver configured (`api.quotemyav.com`)

#### n8n Workflow Service
- [ ] n8n running as Windows service (auto-restart on boot)
- [ ] Cloudflare Tunnel configured and stable
- [ ] Tunnel domain secured with access policies
- [ ] All workflows activated and tested
- [ ] Workflow error notifications configured
- [ ] n8n version pinned (avoid auto-updates breaking workflows)
- [ ] Backup credentials stored in password manager

#### Supabase Production
- [ ] Production Supabase project created (not dev)
- [ ] Database migrations run successfully
- [ ] Connection pooler configured (for serverless)
- [ ] Automatic backups enabled (daily minimum)
- [ ] Point-in-time recovery (PITR) enabled if available

---

### Security (24 items)

#### Secrets Management
- [ ] All API keys in environment variables (never in code)
- [ ] `.env` files in `.gitignore`
- [ ] Vercel env vars set to production-only scope
- [ ] n8n credentials use encrypted storage
- [ ] Supabase service role key kept secret (server-side only)
- [ ] Stripe secret key never exposed to frontend
- [ ] Claude API key rotated from dev key
- [ ] No hardcoded passwords anywhere in codebase

#### Database Security
- [ ] Row Level Security (RLS) enabled on ALL tables
- [ ] RLS policies tested for each user role
- [ ] Service role key used only in trusted server context
- [ ] No public table access without RLS policies
- [ ] Database logs reviewed for suspicious queries
- [ ] Foreign key constraints enforced

#### API Security
- [ ] CORS configured to allow only `quotemyav.com` origin
- [ ] Rate limiting enabled on all public endpoints
- [ ] Authentication required for sensitive endpoints
- [ ] Input validation on all user-submitted data
- [ ] SQL injection protection verified (parameterized queries)
- [ ] XSS protection headers configured

#### Application Security
- [ ] Content Security Policy (CSP) headers configured
- [ ] Strict-Transport-Security header enabled
- [ ] X-Frame-Options set to DENY
- [ ] X-Content-Type-Options set to nosniff
- [ ] Referrer-Policy configured
- [ ] Permissions-Policy headers set (camera, microphone, etc.)

---

### Payments & Billing (18 items)

#### Stripe Configuration
- [ ] Stripe account upgraded to live mode
- [ ] Live API keys generated and configured
- [ ] Webhook endpoints registered in Stripe dashboard
- [ ] Webhook signature verification implemented
- [ ] Test mode data purged (or kept separate)
- [ ] Payment intents flow tested end-to-end
- [ ] Subscription billing tested (creation, renewal, cancellation)

#### Pricing & Products
- [ ] All pricing tiers created in Stripe
- [ ] Free tier limitations enforced in code
- [ ] Starter ($20/mo) features match marketing copy
- [ ] Pro ($60/mo) features match marketing copy
- [ ] Enterprise (from $200/mo) features match marketing copy
- [ ] Annual billing discounts configured if offered
- [ ] Proration rules set for plan changes

#### Transaction Flow
- [ ] Test purchase completed successfully
- [ ] Subscription signup flow works
- [ ] Failed payment handling tested
- [ ] Refund process tested
- [ ] Receipt emails sending correctly
- [ ] Invoice generation working
- [ ] Dunning emails configured (for failed renewals)

---

### Monitoring & Observability (16 items)

#### Error Tracking
- [ ] Sentry project created for production
- [ ] Sentry DSN configured in Vercel env vars
- [ ] Source maps uploaded to Sentry
- [ ] Error alerts configured (email + Slack/Discord)
- [ ] Sample rate set appropriately (100% for launch week, then 10%)
- [ ] User context attached to error reports

#### Uptime Monitoring
- [ ] UptimeRobot monitors created for:
  - [ ] Main site (`quotemyav.com`)
  - [ ] API endpoint (`api.quotemyav.com`)
  - [ ] Stripe webhook receiver
  - [ ] Supabase database health
- [ ] Alert contacts configured (email + SMS)
- [ ] Check frequency: 5 minutes
- [ ] Alert threshold: 2 failed checks

#### Analytics & Metrics
- [ ] Vercel Analytics enabled
- [ ] Google Analytics 4 configured (if using)
- [ ] Conversion tracking set up (signups, purchases)
- [ ] Funnel analysis configured (landing → signup → payment)

---

### Performance (12 items)

#### Frontend Performance
- [ ] Lighthouse score >90 on all pages
- [ ] Core Web Vitals passing (LCP, FID, CLS)
- [ ] Images optimized and lazy-loaded
- [ ] Code splitting implemented (route-based)
- [ ] Critical CSS inlined
- [ ] Font loading optimized (font-display: swap)

#### API Performance
- [ ] n8n workflow execution time <5s for critical paths
- [ ] Claude API timeout set (30s max)
- [ ] Supabase query performance reviewed (indexes added)
- [ ] Edge caching configured for static assets
- [ ] API response times monitored

#### Load Testing
- [ ] Simulated 100 concurrent users without errors

---

### Legal & Compliance (12 items)

#### Required Pages
- [ ] Privacy Policy published and linked in footer
- [ ] Terms of Service published and linked in footer
- [ ] Cookie Policy created (if using cookies beyond auth)
- [ ] Refund Policy published
- [ ] Contact page with support email

#### GDPR Compliance (if serving EU users)
- [ ] Cookie consent banner implemented
- [ ] Data export functionality built
- [ ] Data deletion functionality built
- [ ] Privacy policy mentions GDPR rights
- [ ] Data processing agreement with Supabase reviewed

#### Business Legal
- [ ] Business entity registered (LLC, etc.)
- [ ] Payment processor agreement signed (Stripe)

---

### Content & Marketing (15 items)

#### Website Content
- [ ] Landing page copy finalized and proofread
- [ ] Pricing page shows all tiers accurately
- [ ] Feature comparison table complete
- [ ] Help docs/FAQ written (minimum 10 articles)
- [ ] 404 page designed
- [ ] 500 error page designed

#### SEO
- [ ] Meta title tags set on all pages (<60 chars)
- [ ] Meta descriptions set on all pages (<160 chars)
- [ ] OG images created for social sharing
- [ ] Sitemap.xml generated and submitted to Google
- [ ] Robots.txt configured
- [ ] Structured data markup added (Schema.org)

#### Email Templates
- [ ] Welcome email template designed
- [ ] Receipt email template designed
- [ ] Password reset email template designed

---

### Testing (18 items)

#### Functional Testing
- [ ] User signup flow tested (all 3 modes)
- [ ] Login/logout tested
- [ ] Password reset tested
- [ ] Quote generation tested (Manual Boss Mode)
- [ ] Quote generation tested (AI Assistant Mode)
- [ ] Quote generation tested (Upload Mode)
- [ ] Claude API integration tested
- [ ] Equipment rules engine tested (PA sizing, projector lumens, etc.)
- [ ] Labor calculation tested
- [ ] PDF quote export tested

#### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

#### Mobile Testing
- [ ] iOS Safari tested
- [ ] Android Chrome tested
- [ ] Responsive design verified on 320px, 768px, 1024px, 1920px

#### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader tested (NVDA or JAWS)

---

### Operational Readiness (10 items)

#### Documentation
- [ ] README.md updated with production deployment instructions
- [ ] Architecture diagram created
- [ ] API documentation complete
- [ ] Runbook created for common issues

#### Team Readiness
- [ ] Support email inbox set up (`support@quotemyav.com`)
- [ ] Support response templates created
- [ ] On-call schedule defined (who monitors first week)
- [ ] Escalation path defined

#### Backup & Recovery
- [ ] Database backup verified (can restore)
- [ ] Code repository backed up (GitHub)

---

## Launch Day Procedures

### Timeline: Launch Day (T-Day)

#### T-Minus 24 Hours
**Time:** Day before launch, 5:00 PM
**Owner:** Myers

- [ ] Final code freeze - no new features
- [ ] Run full test suite one last time
- [ ] Verify all Pre-Launch Checklist items green
- [ ] Prepare rollback plan (previous Vercel deployment URL saved)
- [ ] Notify stakeholders of launch window
- [ ] Get good sleep

---

#### T-Minus 2 Hours
**Time:** Launch day, 8:00 AM
**Owner:** Myers

- [ ] Verify n8n service running and healthy
- [ ] Check Cloudflare Tunnel status (green)
- [ ] Verify Supabase database accessible
- [ ] Test Stripe webhook endpoint manually
- [ ] Confirm Claude API quota available
- [ ] Clear browser cache and test site incognito
- [ ] Screenshot current UptimeRobot dashboard (baseline)

---

#### T-Minus 30 Minutes
**Time:** 9:30 AM
**Owner:** Myers

- [ ] Create launch announcement draft (Twitter, LinkedIn, email list)
- [ ] Open monitoring dashboards:
  - Vercel deployment dashboard
  - Sentry errors dashboard
  - UptimeRobot status page
  - Stripe dashboard
  - Supabase logs
- [ ] Start screen recording of launch process (for retrospective)

---

#### T-Minus 0 (LAUNCH)
**Time:** 10:00 AM
**Owner:** Myers

**GO/NO-GO Decision Point**
- All Pre-Launch items: GREEN
- All monitoring dashboards: HEALTHY
- No critical bugs in issue tracker

**Launch Actions:**
1. [ ] Merge final production branch to `main`
2. [ ] Verify Vercel auto-deploy triggered
3. [ ] Watch build logs - confirm success
4. [ ] Test production URL (`quotemyav.com`) - perform full signup flow
5. [ ] Post launch announcement (social media, email)
6. [ ] Change status page to "Live"

---

#### T-Plus 1 Hour
**Time:** 11:00 AM
**Owner:** Myers

- [ ] Monitor error rate (Sentry) - should be <1%
- [ ] Check UptimeRobot - all green
- [ ] Review first real user signups (if any)
- [ ] Test Stripe webhook received successfully
- [ ] Verify n8n follow-up bot triggered (if signups)
- [ ] Respond to any support emails

---

#### T-Plus 4 Hours
**Time:** 2:00 PM
**Owner:** Myers

- [ ] First checkpoint review:
  - Total signups:
  - Conversion rate (visitor → signup):
  - Errors logged:
  - Performance issues:
- [ ] Address any urgent bugs
- [ ] Tweet/post progress update

---

#### T-Plus 8 Hours (End of Day 1)
**Time:** 6:00 PM
**Owner:** Myers

- [ ] Final Day 1 review:
  - Total users:
  - Total quotes generated:
  - Revenue (if any):
  - Critical issues:
- [ ] Document lessons learned
- [ ] Plan Day 2 priorities
- [ ] Set overnight monitoring alerts (phone notifications ON)

---

### Communication Plan

#### Internal Communication
- **Platform:** Slack/Discord (or personal notes if solo)
- **Frequency:** Hourly updates first 8 hours
- **Escalation:** Immediate for P0 issues (site down, payment failures)

#### External Communication
- **Social Media:** Twitter/LinkedIn posts at T+0, T+4h, T+24h
- **Email List:** Launch announcement at T+0
- **Users:** Status page updates if incidents occur

---

### Rollback Triggers

**Immediate rollback if:**
- Site down for >5 minutes
- Error rate >10% of requests
- Payment processing completely broken
- Data breach detected
- Database corruption

**Rollback procedure:**
1. Revert Vercel deployment to previous version
2. Disable new signups (maintenance mode)
3. Investigate issue in staging environment
4. Communicate to users via status page

---

## Post-Launch Monitoring

### First 24 Hours Checklist

#### Every Hour (0-8 hours)
- [ ] Check Sentry for new errors
- [ ] Review UptimeRobot status
- [ ] Monitor Vercel Analytics (traffic, errors)
- [ ] Check support email inbox
- [ ] Verify Stripe payments processing
- [ ] Test one feature randomly

#### Every 4 Hours (8-24 hours)
- [ ] Review Claude API usage (stay under quota)
- [ ] Check n8n workflow execution logs
- [ ] Verify follow-up emails sending correctly
- [ ] Monitor database performance (Supabase metrics)

---

### First Week Monitoring

#### Daily Tasks
- [ ] Morning health check (9:00 AM):
  - All services green
  - No critical errors overnight
  - Review user feedback
- [ ] Evening summary (6:00 PM):
  - New signups today:
  - Quotes generated today:
  - Revenue today:
  - Support tickets resolved:

#### Key Metrics to Watch

**Traffic Metrics:**
- Unique visitors per day
- Bounce rate (should be <60%)
- Time on site (target >2 minutes)

**Conversion Metrics:**
- Visitor → Signup rate (target >2%)
- Signup → Quote generated rate (target >50%)
- Quote → Payment rate (target >10% for paid tiers)

**Technical Metrics:**
- Error rate (target <0.5%)
- API response time (target <2s for 95th percentile)
- Claude API timeout rate (target <1%)
- Uptime (target 99.9%)

**Business Metrics:**
- MRR (Monthly Recurring Revenue)
- Churn rate (target <5% monthly)
- Average quote value
- Customer acquisition cost (CAC)

---

### Response Procedures

#### High Error Rate (>5%)
1. Check Sentry for common error patterns
2. If frontend error: roll back deployment
3. If backend error: check n8n logs, Claude API status
4. Post status update to users
5. Fix in staging, deploy patch

#### Site Slowness
1. Check Vercel Analytics for slow pages
2. Review Supabase query performance
3. Check Claude API response times
4. Enable edge caching if not already
5. Optimize slow queries

#### Payment Failures
1. Check Stripe dashboard for webhook delivery
2. Verify webhook signature validation working
3. Test payment flow manually
4. Check n8n workflow handling Stripe events
5. Refund affected users if needed

---

## Emergency Procedures

### Site Down Response

**Detection:**
- UptimeRobot alerts via email/SMS
- User reports via social media
- Manual check shows site unreachable

**Immediate Actions (within 5 minutes):**
1. [ ] Check Vercel deployment status
2. [ ] Check DNS resolution (`nslookup quotemyav.com`)
3. [ ] Check Cloudflare Tunnel status
4. [ ] Post to status page: "Investigating outage"

**Investigation (5-15 minutes):**
1. [ ] Review Vercel deployment logs
2. [ ] Check recent code changes (git log)
3. [ ] Verify environment variables set
4. [ ] Test API endpoints directly

**Resolution:**
- If Vercel issue: Contact Vercel support
- If code issue: Rollback deployment
- If DNS issue: Check domain registrar
- If Cloudflare Tunnel issue: Restart tunnel service

**Post-Incident (within 24 hours):**
1. [ ] Write incident postmortem
2. [ ] Identify root cause
3. [ ] Implement preventive measures
4. [ ] Communicate resolution to users

---

### Payment Failure Response

**Detection:**
- Stripe webhook delivery failures
- User reports unable to subscribe
- Sentry errors related to payment processing

**Immediate Actions:**
1. [ ] Check Stripe dashboard for errors
2. [ ] Verify webhook endpoint responding (200 OK)
3. [ ] Test payment flow manually
4. [ ] Disable paid signups if critical (graceful degradation)

**Investigation:**
1. [ ] Review n8n workflow handling Stripe events
2. [ ] Check webhook signature verification code
3. [ ] Verify Stripe API keys correct
4. [ ] Check network connectivity to Stripe

**User Impact Mitigation:**
1. [ ] Identify affected users (failed charges)
2. [ ] Email affected users with status update
3. [ ] Offer free trial extension if payment issue on our end
4. [ ] Process refunds if double charges occurred

---

### Data Breach Response

**Detection:**
- Sentry alert for suspicious activity
- User reports unauthorized access
- Database logs show unusual queries

**CRITICAL - Immediate Actions:**
1. [ ] **STOP** - Do not delete anything (preserve evidence)
2. [ ] Isolate affected system (disable API keys, rotate secrets)
3. [ ] Notify legal counsel (if applicable)
4. [ ] Begin incident log (timestamped actions)

**Within 1 Hour:**
1. [ ] Identify scope of breach (which data, how many users)
2. [ ] Contain breach (close vulnerability)
3. [ ] Preserve logs and evidence
4. [ ] Notify stakeholders

**Within 24 Hours:**
1. [ ] Notify affected users via email
2. [ ] File breach report if required by law (GDPR = 72 hours)
3. [ ] Offer credit monitoring if PII exposed
4. [ ] Post public incident report

**Within 1 Week:**
1. [ ] Complete security audit
2. [ ] Implement fixes
3. [ ] Third-party security review
4. [ ] Update security policies

---

### Claude API Quota Exceeded

**Detection:**
- Sentry errors: "Rate limit exceeded"
- n8n workflows failing
- User reports AI features not working

**Immediate Actions:**
1. [ ] Check Anthropic console for usage
2. [ ] Identify which feature using most tokens
3. [ ] Implement emergency rate limiting (queue requests)
4. [ ] Notify users of temporary slowdown

**Short-Term Fixes:**
1. [ ] Upgrade Anthropic plan if available
2. [ ] Optimize prompts (reduce token usage)
3. [ ] Cache common responses
4. [ ] Prioritize paid users over free tier

**Long-Term Fixes:**
1. [ ] Implement user-based rate limiting
2. [ ] Add token usage dashboard
3. [ ] Set up alerts at 80% quota

---

### Emergency Contact Information

#### Internal Contacts
- **Primary On-Call:** Myers - [phone number] - All issues
- **Backup On-Call:** [TBD] - Escalation if primary unavailable

#### External Vendor Support
- **Vercel Support:** support@vercel.com - Deployment issues
- **Supabase Support:** support@supabase.com - Database issues
- **Stripe Support:** https://support.stripe.com - Payment issues
- **Anthropic Support:** support@anthropic.com - Claude API issues
- **Cloudflare Support:** https://www.cloudflare.com/support - Tunnel issues

#### Service Status Pages
- Vercel: https://www.vercel-status.com
- Supabase: https://status.supabase.com
- Stripe: https://status.stripe.com
- Anthropic: https://status.anthropic.com
- Cloudflare: https://www.cloudflarestatus.com

---

## Soft Launch vs Hard Launch Strategy

### Soft Launch (Beta Phase)

**Goal:** Validate product-market fit, catch bugs, gather feedback before public launch

#### Soft Launch Criteria
- [ ] All Pre-Launch Checklist items complete
- [ ] At least 10 beta testers identified
- [ ] Feedback collection process defined
- [ ] Iteration plan in place (2-4 week beta period)

#### Limited Release Strategy

**Week 1-2: Friends & Family (5-10 users)**
- [ ] Personal network only
- [ ] High-touch support (direct communication)
- [ ] Manual onboarding (schedule calls)
- [ ] Collect detailed feedback after each quote

**Week 3-4: Industry Peers (20-50 users)**
- [ ] AV professionals from Markey's network
- [ ] Limited public link (shared on request only)
- [ ] Survey sent after first week
- [ ] Iterate on major feedback

**Week 5-6: Early Adopters (100-200 users)**
- [ ] Soft launch announcement to AV communities
- [ ] Limited marketing (LinkedIn, Reddit, Facebook groups)
- [ ] Track usage patterns
- [ ] Identify power users for testimonials

#### Beta Features
- [ ] "BETA" badge visible on landing page
- [ ] Feedback form accessible on every page
- [ ] Free tier for all beta users (upgrade later)
- [ ] Grandfathered pricing for early supporters

#### Success Metrics for Hard Launch Decision
- [ ] >50% of beta users generate at least one quote
- [ ] <5% error rate across all workflows
- [ ] Average quote generation time <3 minutes
- [ ] Net Promoter Score (NPS) >30
- [ ] At least 5 testimonials collected
- [ ] No critical bugs in issue tracker

---

### Hard Launch (Public Release)

**Goal:** Open to public, scale user acquisition, drive revenue

#### When to Go Public
**All of the following must be true:**
1. Soft launch success metrics met (above)
2. Payment processing tested with real transactions
3. Support processes proven (response time <24 hours)
4. Infrastructure scaled (load tested for 1000+ users)
5. Marketing assets ready (launch video, case studies, press kit)

#### Hard Launch Checklist
- [ ] Press release written and distributed
- [ ] Product Hunt launch scheduled
- [ ] Social media campaign planned (1 week pre-launch hype)
- [ ] Email list ready (beta users + waitlist)
- [ ] Launch video published (YouTube, LinkedIn, Twitter)
- [ ] Influencer outreach completed (AV industry bloggers)
- [ ] Paid ads ready (Google, LinkedIn, Facebook if budget allows)
- [ ] Launch discount code ready (e.g., LAUNCH20 for 20% off first month)

#### Launch Day Activities
- [ ] Post to Product Hunt (early morning for visibility)
- [ ] Email blast to beta users + waitlist
- [ ] Tweet storm (5-7 tweets with screenshots, testimonials)
- [ ] LinkedIn article with case study
- [ ] Post in AV communities (Reddit, Facebook groups, forums)
- [ ] Live demo stream (optional - Twitch, YouTube Live)

#### Post-Hard-Launch (First Month)
- [ ] Daily monitoring of signups and conversions
- [ ] Weekly blog posts (feature highlights, customer stories)
- [ ] User interviews (understand why they signed up)
- [ ] Iterate on onboarding flow (reduce drop-off)
- [ ] Plan feature roadmap based on feedback

---

### Rollback from Hard Launch

**If hard launch goes poorly (low signups, high churn, critical bugs):**
1. Pause marketing spend immediately
2. Revert to soft launch mode (private beta)
3. Fix critical issues identified
4. Re-launch with improvements in 2-4 weeks

---

## Checklist Summary

**Total Pre-Launch Items:** 146

**By Category:**
- Infrastructure: 21
- Security: 24
- Payments: 18
- Monitoring: 16
- Performance: 12
- Legal: 12
- Content: 15
- Testing: 18
- Operational: 10

---

## Notes

- This checklist assumes a solo founder (Myers) launching QuoteMyAV
- Adjust timelines and team responsibilities as team grows
- Print this checklist and physically check boxes during launch
- Keep a launch journal - document everything for future retrospective
- Celebrate wins, learn from failures

---

**End of Production Checklist**
**Good luck with the launch!**
