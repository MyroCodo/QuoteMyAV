# QuoteMyAV - Service Level Agreement & Support Documentation

**Version:** 1.0
**Effective Date:** TBD
**Last Updated:** 2025-12-12

---

## Table of Contents
1. [Service Level Agreement (SLA)](#service-level-agreement-sla)
2. [Support Tiers by Plan](#support-tiers-by-plan)
3. [Response Time Commitments](#response-time-commitments)
4. [Support Channels](#support-channels)
5. [Escalation Procedures](#escalation-procedures)
6. [Issue Categories & Handling](#issue-categories--handling)
7. [Support Tools & Systems](#support-tools--systems)
8. [Knowledge Base Structure](#knowledge-base-structure)
9. [SLA Credits & Remediation](#sla-credits--remediation)
10. [Exclusions & Limitations](#exclusions--limitations)

---

## 1. Service Level Agreement (SLA)

### 1.1 Uptime Guarantee

**99.5% Monthly Uptime Commitment**

QuoteMyAV guarantees 99.5% availability of the core platform per calendar month for all paid plans (Starter and Pro).

- **Included in uptime calculation:**
  - Core application availability (quotemyav.com)
  - Quote generation functionality
  - Equipment database access
  - User authentication
  - Quote export/PDF generation

- **Downtime Definition:**
  - Service unavailable for 5+ consecutive minutes
  - Core functionality (quote creation) non-functional
  - API returning 500-level errors for 5+ minutes

- **Measurement Period:** Calendar month (UTC timezone)
- **Maximum Allowable Downtime:** ~3.6 hours per month

### 1.2 Planned Maintenance Windows

**Standard Maintenance Schedule:**
- **Weekly:** Tuesdays 2:00 AM - 4:00 AM EST (low-traffic window)
- **Monthly Deep Maintenance:** First Sunday of month, 12:00 AM - 6:00 AM EST
- **Emergency Hotfixes:** As needed, with 1-hour advance notice when possible

**Advance Notice Requirements:**
- Routine maintenance: 48 hours via email + in-app notification
- Emergency maintenance: Best-effort notification via status page
- Major upgrades: 7 days via email, in-app, and status page

**Planned maintenance does NOT count against uptime SLA.**

### 1.3 Service Availability Targets by Component

| Component | Target Uptime | Impact if Down |
|-----------|---------------|----------------|
| Web Application | 99.5% | Full service outage |
| API (Claude Integration) | 99.0% | Quote generation unavailable |
| Authentication (Supabase) | 99.9% | Login issues |
| Database (Supabase Postgres) | 99.9% | Data access issues |
| File Storage (R2/Supabase) | 99.5% | PDF/export issues |
| Email Delivery (Resend) | 99.0% | Notification delays |

### 1.4 Performance Targets

- **Page Load Time:** < 2 seconds (75th percentile)
- **Quote Generation:** < 10 seconds for standard quotes
- **AI Assistant Response:** < 15 seconds for questionnaire help
- **PDF Export:** < 5 seconds for standard quotes
- **API Response Time:** < 500ms (median), < 2s (95th percentile)

---

## 2. Support Tiers by Plan

### 2.1 Free Plan Support

**Community & Self-Service Only**

- Access to comprehensive documentation
- Video tutorials and getting started guides
- Community forum (when launched)
- FAQ and troubleshooting articles
- Status page for service updates
- **No direct support** - users encouraged to upgrade for assistance

**Expected Response:** N/A - Community-driven

---

### 2.2 Starter Plan Support ($20/mo)

**Email Support with Business Hours Coverage**

**Included:**
- Email support: support@quotemyav.com
- Business hours coverage: Mon-Fri 9 AM - 6 PM EST
- Access to full knowledge base
- Feature request submission
- Bug report prioritization
- Account management assistance
- Billing support

**Response Time SLA:**
- P1 (Critical): 4 business hours
- P2 (High): 8 business hours
- P3 (Medium): 24 business hours
- P4 (Low): 48 business hours

**Channels:**
- Email (primary)
- In-app help widget (routes to email)
- Knowledge base search

**Limitations:**
- No phone support
- No after-hours/weekend support
- No dedicated account manager

---

### 2.3 Pro Plan Support ($60/mo)

**Priority Support with Extended Coverage**

**Included:**
- Priority email support (front of queue)
- Extended hours: Mon-Fri 8 AM - 8 PM EST
- Weekend emergency support for P1 issues
- Screen-sharing sessions (scheduled)
- Quarterly check-in calls (optional)
- Beta feature early access
- Dedicated onboarding assistance
- Custom equipment database help

**Response Time SLA:**
- P1 (Critical): 2 business hours (1 hour on weekdays)
- P2 (High): 4 business hours
- P3 (Medium): 12 business hours
- P4 (Low): 24 business hours

**Channels:**
- Priority email queue
- In-app live chat (when available)
- Scheduled video calls (for complex issues)
- Phone support (callback within SLA window)

**Premium Features:**
- Direct access to product team for complex issues
- Influence on feature roadmap
- Early warning of breaking changes
- Migration assistance from other platforms

---

### 2.4 Enterprise Plan Support (Future)

**Dedicated Support & Custom SLA**

**Proposed Features:**
- Named Customer Success Manager
- 24/7/365 critical support
- 99.9% uptime SLA
- Custom integrations assistance
- On-site training (if needed)
- Annual business reviews
- Direct engineering escalation
- Custom feature development consideration

**Pricing:** Custom (starting ~$500/mo)

---

## 3. Response Time Commitments

### 3.1 Priority Definitions

| Priority | Name | Description | Examples |
|----------|------|-------------|----------|
| **P1** | Critical | Service down or unusable for all users | • Login completely broken<br>• Quote generation failing for everyone<br>• Database outage<br>• Payment processing down |
| **P2** | High | Major feature broken or significant user impact | • Export to PDF not working<br>• Equipment search returning no results<br>• AI assistant errors for all users<br>• Billing calculation errors |
| **P3** | Medium | Minor feature issue or workaround available | • UI layout issue<br>• Specific equipment missing<br>• Slow performance (not outage)<br>• Broken link in app |
| **P4** | Low | Question, enhancement, or cosmetic issue | • How-to questions<br>• Feature requests<br>• Typo in UI text<br>• Documentation improvement |

### 3.2 Response Time Matrix

**Business Hours:** Mon-Fri 9 AM - 6 PM EST (unless otherwise noted)

| Priority | Free Plan | Starter Plan | Pro Plan |
|----------|-----------|--------------|----------|
| **P1 Critical** | No SLA | 4 business hours | **1 hour** (Mon-Fri 8AM-8PM)<br>**2 hours** (Weekends for emergencies) |
| **P2 High** | No SLA | 8 business hours | **4 business hours** |
| **P3 Medium** | No SLA | 24 business hours | **12 business hours** |
| **P4 Low** | No SLA | 48 business hours | **24 business hours** |

**Resolution Time Expectations:**
- **P1:** Target resolution within 8 hours (Starter), 4 hours (Pro)
- **P2:** Target resolution within 48 hours (Starter), 24 hours (Pro)
- **P3/P4:** Resolved based on complexity, roadmap prioritization

### 3.3 After-Hours Support

**Pro Plan Weekend/After-Hours:**
- P1 issues only (true emergencies)
- Contact: emergency@quotemyav.com
- 2-hour response commitment
- Engineer on-call rotation (Fri 8 PM - Mon 8 AM EST)

**Starter Plan:**
- No after-hours support
- Tickets submitted after-hours queued for next business day
- Critical issues addressed in next maintenance window

---

## 4. Support Channels

### 4.1 Email Support

**Primary Support Channel**

- **Address:** support@quotemyav.com
- **Auto-Response:** Immediate confirmation with ticket number
- **Ticketing System:** Crisp or Front (see Tools section)
- **Email Requirements:**
  - Subject line with brief issue description
  - Account email used for login
  - Steps to reproduce (for bugs)
  - Screenshots/attachments if relevant

**Sample Auto-Response:**
```
Thank you for contacting QuoteMyAV Support!

Ticket #12345 has been created.

Plan: Starter
Priority: P2 (High)
Expected Response: Within 8 business hours

You can track this ticket at: https://support.quotemyav.com/tickets/12345

For urgent issues, please reply "URGENT" and describe the business impact.

- QuoteMyAV Support Team
```

### 4.2 In-App Help Widget

**Integrated Support (Crisp or Intercom)**

- **Location:** Bottom-right corner of all app pages
- **Features:**
  - Live chat (Pro plan, business hours)
  - Email ticket submission (all plans)
  - Knowledge base search
  - Video tutorials
  - Status page link

**Chat Availability:**
- Pro Plan: Mon-Fri 9 AM - 6 PM EST (live agent)
- Starter/Free: Auto-routes to email ticket
- After-hours: Bot provides knowledge base articles, creates ticket

### 4.3 Knowledge Base / Help Center

**Self-Service Documentation Portal**

- **URL:** help.quotemyav.com or quotemyav.com/docs
- **Platform:** Crisp Helpdesk, GitBook, or Readme.io
- **Content:**
  - Getting Started guides
  - Feature tutorials
  - Equipment database guides
  - Billing & account management
  - API documentation (future)
  - Video walkthroughs
  - Troubleshooting guides

**Search-First Approach:**
- AI-powered search (Algolia DocSearch)
- Related articles suggestions
- "Was this helpful?" feedback buttons
- Easy escalation to support ticket

### 4.4 Status Page

**Real-Time Service Health**

- **URL:** status.quotemyav.com
- **Platform:** StatusPage.io, Atlassian Statuspage, or Uptime Robot
- **Features:**
  - Current system status (all green / partial outage / major outage)
  - Planned maintenance calendar
  - Incident history (90 days)
  - Component-level status (API, Auth, Database, etc.)
  - RSS feed for automated monitoring
  - Subscribe to updates (email/SMS)

**Transparency Commitment:**
- All P1/P2 incidents posted within 15 minutes
- Hourly updates during outages
- Post-mortem published within 48 hours of resolution

### 4.5 Community Forum (Future)

**Peer-to-Peer Support**

- **Platform:** Discourse or Circle
- **Moderation:** QuoteMyAV team + power users
- **Categories:**
  - General Discussion
  - Feature Requests
  - Show & Tell (quote examples)
  - Bug Reports
  - Equipment Database (suggestions)

**Benefits:**
- Free plan users can help each other
- Power users share templates/workflows
- Product team monitors for trends
- Gamification (badges, reputation)

### 4.6 Phone Support (Pro Plan, Scheduled)

**Callback System (Not Call-In)**

- Pro plan users can request callback in ticket
- Scheduled within response SLA window
- Used for complex issues needing screen-share
- Zoom or Google Meet sessions
- Max 30 minutes per session
- Limit: 2 sessions per month (standard), unlimited for P1/P2

---

## 5. Escalation Procedures

### 5.1 Internal Escalation Path

**Tier 1 → Tier 2 → Engineering**

**Tier 1 Support (Initial Response):**
- First-line email/chat support
- Knowledge base experts
- Can resolve 80% of issues
- Escalates to Tier 2 if:
  - Issue unresolved after 2 interactions
  - Requires code-level investigation
  - Customer requests escalation (Pro plan)

**Tier 2 Support (Technical Specialists):**
- Deep product knowledge
- Database/API troubleshooting
- Custom solutions for complex workflows
- Escalates to Engineering if:
  - Confirmed bug requiring code fix
  - Feature limitation needing workaround
  - Security concern

**Engineering Team (Development):**
- Receives escalated bugs/feature requests
- P1/P2 bugs go to sprint immediately
- P3/P4 added to backlog
- Provides technical guidance to support team

### 5.2 Customer-Initiated Escalation

**When to Escalate:**
- Response SLA missed
- Issue unresolved after 5 business days
- Dissatisfaction with support quality
- Critical business impact not being addressed

**How to Escalate:**
- Reply to existing ticket with "ESCALATE" in subject
- Email: escalations@quotemyav.com
- Pro plan: Request call with support manager

**Escalation Response:**
- Starter: 24-hour review by support manager
- Pro: 4-hour review by support manager + product lead

### 5.3 Executive Escalation (Last Resort)

**Severe Issues or Persistent Problems**

- **Contact:** founders@quotemyav.com
- **When to Use:**
  - Multiple missed SLAs
  - Data loss or security incident
  - Legal/compliance concerns
  - Account suspension disputes

**Commitment:** Founder review within 24 hours, direct involvement if warranted

### 5.4 Escalation Tracking

All escalations logged in CRM with:
- Original ticket timeline
- Reason for escalation
- Actions taken
- Resolution outcome
- Customer satisfaction score

**Monthly Review:**
- Escalation trends analyzed
- Process improvements identified
- Support team training needs assessed

---

## 6. Issue Categories & Handling

### 6.1 Billing Issues

**Priority:** Automatic P2 (High)

**Common Issues:**
- Charge disputes
- Subscription cancellation requests
- Downgrade/upgrade questions
- Failed payment recovery
- Invoice requests

**Handling:**
- Tier 1 can resolve most billing questions
- Escalate to billing specialist for disputes
- Stripe dashboard access for support leads
- Refund authority:
  - Tier 1: Up to $20 (1 month Starter)
  - Tier 2: Up to $200 (goodwill credits)
  - Manager: Unlimited (with approval)

**Response SLA:**
- Starter/Pro: 4 business hours
- Resolution Target: 24 hours

**Refund Policy:**
- Pro-rated refunds for annual plans (first 30 days)
- No refunds for monthly plans (cancel anytime)
- Goodwill credits for service outages (see SLA Credits)

### 6.2 Technical Bugs

**Priority:** Varies (P1-P3 based on impact)

**Triage Questions:**
- How many users affected? (one user = P3, all users = P1)
- Can user complete their work with workaround? (yes = P3, no = P2)
- Is core functionality broken? (quote creation = P1, minor feature = P3)

**Bug Report Requirements:**
- Steps to reproduce
- Expected vs. actual behavior
- Browser/device information
- Screenshots or screen recording
- Account email (for investigation)

**Handling:**
- Tier 1 attempts to reproduce
- Confirmed bugs logged in Linear/Jira
- Engineering assigns to sprint based on priority
- Customer notified when fix is deployed

**Follow-Up:**
- P1: Immediate notification when fixed
- P2: Email within 24 hours of fix deployment
- P3: Included in weekly release notes

### 6.3 Feature Requests

**Priority:** P4 (Low)

**Submission Channels:**
- Support ticket
- In-app feedback widget
- Community forum (upvoting)
- Annual Pro plan check-in calls

**Handling:**
- Tier 1 logs in product roadmap tool (Canny, ProductBoard)
- Product team reviews monthly
- Pro plan requests weighted higher
- Requestor notified when:
  - Request is accepted to roadmap
  - Feature is in development
  - Feature is released

**Transparency:**
- Public roadmap at roadmap.quotemyav.com
- Users can upvote/comment on requests
- Quarterly product update emails

### 6.4 Account Issues

**Priority:** P2-P3 based on urgency

**Common Issues:**
- Password reset problems
- Email change requests
- Account deletion (GDPR)
- User permission issues (team plans, future)
- Export data requests

**Handling:**
- Tier 1 can assist with most account tasks
- Security verification required:
  - Email confirmation
  - Account creation date
  - Recent quote details (for verification)
- Data exports provided within 48 hours (GDPR compliance)
- Account deletion within 30 days (GDPR compliance)

**Security Protocols:**
- No passwords transmitted via email
- Password resets use Supabase magic link
- Account changes logged in audit trail

### 6.5 Security Concerns

**Priority:** Automatic P1 (Critical)

**Examples:**
- Suspected data breach
- Unauthorized account access
- Vulnerability reports
- Phishing attempts using QuoteMyAV branding

**Handling:**
- Immediate escalation to engineering + founder
- Security incident response plan activated:
  1. Assess scope (minutes)
  2. Contain threat (within 1 hour)
  3. Notify affected users (within 24 hours if data exposed)
  4. Remediate vulnerability
  5. Post-incident review
- Responsible disclosure program:
  - security@quotemyav.com
  - Bug bounty (future, via HackerOne)

**Customer Communication:**
- Transparency about security incidents
- Regular security audits published annually
- Compliance certifications (SOC 2 Type II goal)

### 6.6 Data Loss / Recovery

**Priority:** Automatic P1 (Critical)

**Scenarios:**
- Deleted quote recovery (user error)
- Account data missing
- Export corruption

**Handling:**
- Database backups: Hourly snapshots (Supabase)
- Point-in-time recovery available (7-day window)
- Tier 2 has read-only database access
- Engineering performs recovery with approval
- User notified within 4 hours of recovery completion

**Data Retention:**
- Active accounts: Indefinite
- Deleted quotes: 30-day soft delete (recoverable)
- Closed accounts: 90-day retention, then permanent deletion (GDPR)

---

## 7. Support Tools & Systems

### 7.1 Helpdesk Platform Recommendation

**Top Choice: Crisp**

**Why Crisp:**
- Affordable ($25/seat/mo, unlimited conversations)
- Live chat + email ticketing in one platform
- Knowledge base builder included
- Chatbot automation (for Free plan users)
- Integrates with Slack (internal notifications)
- Mobile app for on-the-go support
- GDPR compliant (EU-based company)

**Alternatives Considered:**
- **Intercom:** Best-in-class but expensive ($74/seat/mo)
- **Zendesk:** Robust but overkill for early-stage ($55/agent/mo)
- **Front:** Great for email teams but lacks live chat ($19/seat + chat add-on)
- **Help Scout:** Good middle ground ($20/user/mo, simpler than Zendesk)

**Decision Factors:**
- Budget-friendly for bootstrapped startup
- Grows with us (can add seats as needed)
- All-in-one (no separate chat/ticketing tools)

### 7.2 Knowledge Base Platform

**Top Choice: Crisp Helpdesk (Built-In)**

**Features:**
- Markdown-based article editor
- Category organization
- Search functionality
- Public or private articles
- Embeddable in app (iframe or SDK)
- Analytics (most-viewed articles)

**Alternative for Advanced Docs:**
- **GitBook:** If we need version control, API docs, multi-language
- **Readme.io:** Best for API-heavy products (future)

**Content Strategy:**
- Start with 20-30 core articles
- Add 5-10 articles per month
- Use support ticket trends to identify gaps
- Video tutorials for complex workflows

### 7.3 Status Page

**Top Choice: Uptime Robot (Free) → StatusPage.io (Paid)**

**Uptime Robot (MVP):**
- Free tier: 50 monitors
- Public status page included
- Email alerts for downtime
- 5-minute check intervals

**Upgrade to StatusPage.io When:**
- Need component-level status
- Want incident management workflow
- Require SMS notifications
- Hit 50-monitor limit

**Monitoring Checklist:**
- Main app (quotemyav.com)
- API endpoint (api.quotemyav.com/health)
- Authentication (Supabase status)
- Database (Supabase status)
- Claude API (anthropic.com/status)
- Email delivery (Resend status)

### 7.4 Internal Communication

**Slack Workspace: quotemyav.slack.com**

**Channels:**
- `#support-tickets` - Crisp integration (new ticket alerts)
- `#support-team` - Internal support discussion
- `#engineering-escalations` - Bug reports from support
- `#alerts-uptime` - Monitoring alerts from Uptime Robot
- `#customer-feedback` - Feature requests, praise, complaints

**On-Call Rotation (Pro Plan After-Hours):**
- PagerDuty or Opsgenie (future)
- Slack alerts for now
- Documented on-call procedures

### 7.5 Customer Relationship Management (CRM)

**Supabase Database (Built-In) + Crisp CRM Features**

**Track in Supabase:**
- User metadata (plan, signup date, usage stats)
- Quote history (for context in support)
- Feature flags (beta access)
- Support tier (Free/Starter/Pro)

**Crisp CRM Features:**
- Conversation history per customer
- Notes on past interactions
- Tags (high-value, churned, power-user, etc.)
- Segments (Pro users, trial users, etc.)

**Future: Migrate to Dedicated CRM**
- HubSpot (when we have sales team)
- Attio (modern, API-first CRM)
- Salesforce (if we go enterprise)

### 7.6 Analytics & Reporting

**Support Metrics Dashboard (Crisp Built-In):**

**Key Metrics to Track:**
- First Response Time (FRT)
- Average Resolution Time (ART)
- Ticket Volume by Priority
- Customer Satisfaction Score (CSAT)
- Net Promoter Score (NPS)
- Tickets by Category (billing, bug, feature, etc.)
- Escalation Rate
- Reopened Tickets (sign of poor initial resolution)

**Weekly Support Report:**
- Sent to team every Monday
- Highlights:
  - Total tickets (vs. last week)
  - SLA compliance %
  - Top 5 issues (trends)
  - Customer shoutouts (great support experiences)
  - Areas for improvement

**Monthly Business Review:**
- Support trends over time
- Impact on churn (support issues → cancellations)
- Knowledge base effectiveness (% of users finding answers)
- Feature request themes

---

## 8. Knowledge Base Structure

### 8.1 Article Categories

**1. Getting Started (10 articles)**
- Welcome to QuoteMyAV
- Creating Your First Quote
- Understanding the Three Intake Modes
- Navigating the Dashboard
- Account Setup & Profile
- Subscription Plans Explained
- Keyboard Shortcuts & Tips
- Mobile Experience (if applicable)
- Exporting Quotes (PDF, Excel)
- Video: 5-Minute QuoteMyAV Tour

**2. Quote Builder (15 articles)**
- Manual "Boss Mode" Form Guide
- Using the AI Assistant (Chat Mode)
- Upload Mode: RFP Document Upload
- Equipment Database Search Tips
- Adding Custom Equipment
- Labor & Crew Calculation Rules
- Pricing Override & Discounts
- Quote Templates (future)
- Cloning & Editing Existing Quotes
- Multi-Event Projects (future)

**3. Equipment Database (10 articles)**
- How Equipment Selection Works
- PA System Sizing Guide
- Projector Lumen Calculator
- Lighting Fixture Selection Rules
- Rigging & Load-In Constraints
- Equipment Substitution (comparable models)
- Requesting New Equipment
- Equipment Cost Database (how pricing works)

**4. Account & Billing (8 articles)**
- Updating Payment Method
- Upgrading/Downgrading Plans
- Annual vs. Monthly Billing
- Canceling Your Subscription
- Invoice & Receipt Downloads
- Team Management (future)
- Referral Program (future)
- GDPR Data Export & Deletion

**5. Integrations (Future) (5 articles)**
- Exporting to Your CRM
- Google Drive Sync
- Email Templates for Client Delivery
- API Documentation (developer tier)
- Zapier Integration (if built)

**6. Troubleshooting (12 articles)**
- Login Issues (password reset, magic link)
- Quote Not Saving (browser cache, session timeout)
- AI Assistant Errors (rate limits, API issues)
- PDF Export Not Working (browser compatibility)
- Slow Performance (large quotes, browser)
- Browser Compatibility (Chrome, Safari, Firefox, Edge)
- Mobile Issues (responsive design limits)
- Payment Declined (Stripe troubleshooting)

**7. Feature Tutorials (Video) (8 videos)**
- Creating a Quote in 60 Seconds
- AI Assistant Deep Dive (10 min)
- Upload Mode Walkthrough (5 min)
- Equipment Database Tour (7 min)
- Advanced Pricing Strategies (8 min)
- Exporting for Clients (4 min)
- Boss Mode Power User Tips (12 min)
- Monthly Feature Highlights (ongoing series)

**Total: ~70 articles + 8 videos at launch**

### 8.2 Article Templates

**Standard Article Structure:**
```markdown
# [Article Title]

**Estimated Reading Time:** 3 minutes
**Last Updated:** 2025-12-12
**Applies To:** All Plans / Starter & Pro / Pro Only

## Quick Answer
[One-sentence solution for users who just need the TL;DR]

## Step-by-Step Guide
1. [Step one with screenshot]
2. [Step two with screenshot]
3. [Step three with screenshot]

## Video Tutorial
[Embedded Loom/YouTube video if available]

## Common Issues
- **Issue:** [Problem users might encounter]
  - **Solution:** [How to fix it]

## Related Articles
- [Link to related article 1]
- [Link to related article 2]

## Still Need Help?
[Button: Contact Support] (routes to email for Free, chat for Pro)
```

### 8.3 Search Optimization

**SEO for Help Center:**
- Keywords in titles (e.g., "How to Create a Quote" not "Getting Started")
- Meta descriptions for Google indexing
- Structured data markup (HowTo schema)
- Sitemap submission to Google Search Console

**Internal Search (Algolia DocSearch):**
- Index article titles, headings, and body text
- Typo tolerance (users misspell "questionnaire")
- Synonyms (quote = proposal, event = show)
- Search analytics (what users search but don't find = content gaps)

---

## 9. SLA Credits & Remediation

### 9.1 Downtime Credits (Paid Plans Only)

**When Uptime Falls Below 99.5% in a Month:**

| Uptime Achieved | Service Credit |
|-----------------|----------------|
| 99.0% - 99.49% | 10% of monthly fee |
| 98.0% - 98.99% | 25% of monthly fee |
| 95.0% - 97.99% | 50% of monthly fee |
| Below 95.0% | 100% of monthly fee |

**How Credits Work:**
- Automatically calculated at month-end
- Applied to next month's invoice
- No credit for Free plan (no paid service)
- Must be an active paid subscriber to claim

**Example:**
- Pro plan customer ($60/mo)
- Uptime in November: 98.7% (below 99.5%)
- Credit: $15 (25% of $60)
- December invoice: $60 - $15 = $45

### 9.2 Credit Request Process

**Automatic vs. Manual:**
- **Automatic:** Credits for measured uptime (via Uptime Robot logs)
- **Manual Request Required:** Support response SLA misses

**To Request Credit for Missed SLA:**
1. Reply to original support ticket with "SLA CREDIT REQUEST"
2. Include ticket number and timestamps
3. Support manager reviews within 24 hours
4. Credit applied to next invoice if validated

**Credit Limits:**
- Max 100% of one month's subscription fee
- Credits do not stack beyond one month
- Annual plans: Credits pro-rated to monthly value

### 9.3 Remediation for Major Outages

**If Downtime Exceeds 12 Hours in One Incident:**

**Immediate Actions:**
- Transparent post-mortem published within 48 hours
- Direct email to all affected users (not just status page)
- Optional call with Pro plan customers (if requested)

**Additional Remediation:**
- Beyond standard SLA credits
- Founder-level apology
- Consideration of extended trial (for new customers affected)
- Priority access to new features (as goodwill)

**Post-Mortem Template:**
- What happened (technical explanation)
- Root cause (why it happened)
- Timeline of events (detection → resolution)
- Impact (how many users, what functionality)
- What we're doing to prevent recurrence
- Compensation offered (credits, etc.)

---

## 10. Exclusions & Limitations

### 10.1 Not Covered by SLA

**Excluded from Uptime Guarantee:**
- Planned maintenance (with proper notice)
- Third-party service outages (Claude API, Supabase, Stripe, Resend)
- Force majeure (natural disasters, war, pandemics, etc.)
- User's internet connectivity issues
- User's browser/device compatibility (outdated browsers)
- DDoS attacks or other malicious activity (beyond our control)
- Beta features (clearly marked as experimental)

**Example:**
- If Claude AI API is down, QuoteMyAV AI Assistant won't work
- This does NOT count against our uptime SLA
- We still provide support (workarounds, manual entry)

### 10.2 Support Limitations

**What Support CANNOT Do:**
- Provide AV industry consulting (we're software support, not AV consultants)
- Write quotes for you (we teach you how to use the tool)
- Guarantee quote accuracy (user responsible for final numbers)
- Reverse permanent account deletions (after 90-day retention)
- Recover data deleted >30 days ago (backup retention limit)
- Provide legal advice (contract terms, liability, insurance)

**What Support CAN Do:**
- Explain how features work
- Troubleshoot technical issues
- Provide best practices for quote building
- Connect you with community experts (future)

### 10.3 Fair Use Policy

**To Prevent Abuse:**
- Support is for legitimate technical issues, not unlimited consulting
- Pro plan phone support: Max 2 scheduled calls/month (P3/P4 issues)
- Excessive tickets (>50/month from one user) may be reviewed
- Abusive behavior toward support staff = account review/termination

**We Reserve the Right To:**
- Limit support for users on outdated subscription plans
- Terminate accounts for TOS violations (fraudulent payment, etc.)
- Adjust SLA terms with 30 days' notice (sent via email)

---

## 11. Implementation Checklist

### 11.1 Phase 1: MVP Support (Launch)

**Week 1-2:**
- [ ] Set up support@quotemyav.com email
- [ ] Configure Crisp account (or chosen helpdesk)
- [ ] Create Slack #support-tickets channel
- [ ] Write 20 core knowledge base articles
- [ ] Set up Uptime Robot monitoring
- [ ] Create status page (status.quotemyav.com)
- [ ] Write support email templates (auto-responses)

**Week 3-4:**
- [ ] Train initial support person (founder or hire)
- [ ] Document internal support playbooks (bug triage, billing issues)
- [ ] Set up Stripe webhook for billing alerts
- [ ] Create escalation contact list
- [ ] Test support flow end-to-end

### 11.2 Phase 2: Scaling Support (Months 2-6)

**As User Base Grows:**
- [ ] Record first 8 video tutorials
- [ ] Add in-app help widget (Crisp SDK)
- [ ] Implement CSAT survey (post-ticket resolution)
- [ ] Hire part-time support specialist (if needed)
- [ ] Launch community forum (Discourse)
- [ ] Create public roadmap (Canny)
- [ ] Set up PagerDuty for Pro plan after-hours

### 11.3 Phase 3: Mature Support (Year 1+)

**Enterprise-Grade Support:**
- [ ] SOC 2 Type II compliance (for Enterprise sales)
- [ ] Dedicated account managers for Enterprise
- [ ] 24/7 support (outsourced night shift or global team)
- [ ] Advanced analytics (support impact on retention)
- [ ] AI chatbot for instant answers (Crisp MagicReply)
- [ ] Quarterly NPS surveys
- [ ] Annual customer advisory board (top Pro customers)

---

## 12. Support Team Roles & Hiring Plan

### 12.1 Founder-Led Support (Month 1-3)

**Why Founders Should Do Early Support:**
- Direct customer feedback (inform product roadmap)
- Learn pain points firsthand
- Build empathy for user struggles
- Perfect knowledge base articles (based on real questions)

**Time Commitment:**
- Expect 2-5 tickets/day initially (1-2 hours/day)
- Scales quickly as users grow

### 12.2 First Support Hire (Month 3-6)

**Title:** Customer Support Specialist (Part-Time → Full-Time)

**Skills Needed:**
- AV industry experience (preferred but not required)
- Excellent written communication
- Patient, empathetic, solutions-oriented
- Comfortable with SaaS tools (learns fast)
- Basic troubleshooting skills

**Responsibilities:**
- Respond to all support tickets (Tier 1)
- Maintain knowledge base
- Escalate bugs to engineering
- Weekly support metrics report
- Customer feedback synthesis

**Compensation:**
- Part-time: $20-25/hr (20 hrs/week)
- Full-time: $45-55k salary + equity (when revenue supports)

### 12.3 Scaling the Team (Year 1+)

**At 500+ Customers:**
- 2 full-time support specialists (Tier 1)
- 1 senior technical support (Tier 2)
- Founder handles escalations + product feedback

**At 2000+ Customers:**
- 4-5 support specialists (24-hour coverage, shifts)
- 2 technical support engineers (Tier 2)
- 1 support manager (oversees team, metrics)
- 1 customer success manager (Pro/Enterprise accounts)

---

## 13. Support Metrics & Goals

### 13.1 Key Performance Indicators (KPIs)

**Response Time:**
- **Goal:** 95% of tickets responded within SLA window
- **Measurement:** Crisp analytics (first response time)

**Resolution Time:**
- **Goal:** 80% of P3/P4 tickets resolved in <48 hours
- **Measurement:** Median time to close

**Customer Satisfaction (CSAT):**
- **Goal:** 4.5/5.0 average rating
- **Measurement:** Post-ticket survey ("How did we do? 1-5 stars")

**Knowledge Base Deflection:**
- **Goal:** 40% of users find answers without contacting support
- **Measurement:** Crisp search analytics + "Was this helpful?" votes

**Escalation Rate:**
- **Goal:** <10% of tickets escalated to Tier 2/Engineering
- **Measurement:** Manual tracking (tags in Crisp)

**Reopened Tickets:**
- **Goal:** <5% of closed tickets reopened (sign of incomplete resolution)
- **Measurement:** Crisp analytics

### 13.2 Monthly Support Review Template

**For Internal Team (Shared in Slack):**

```
📊 QuoteMyAV Support Report - [Month Year]

**Volume:**
- Total Tickets: 127 (↑ 15% vs. last month)
- By Plan: Free (12), Starter (89), Pro (26)
- By Priority: P1 (2), P2 (18), P3 (64), P4 (43)

**Performance:**
- First Response Time: 3.2 hours (Goal: <4 hours) ✅
- Avg Resolution Time: 18 hours (Goal: <24 hours) ✅
- SLA Compliance: 97% (Goal: 95%) ✅
- CSAT Score: 4.7/5.0 (Goal: 4.5) ✅

**Top 5 Issues:**
1. PDF export not working (Safari) - 18 tickets
2. Equipment search confusion - 14 tickets
3. Billing questions (upgrade/downgrade) - 11 tickets
4. AI assistant timeout errors - 9 tickets
5. Password reset issues - 7 tickets

**Actions This Month:**
- Created new KB article: "PDF Export Troubleshooting"
- Fixed Safari PDF bug (deployed 2025-12-08)
- Improved equipment search UX (in progress)

**Customer Shoutouts:**
🌟 "This support is incredible! Faster than companies 100x your size." - Pro Customer
🌟 "You actually understood my problem and fixed it in 20 minutes. Thank you!" - Starter Customer

**Next Month Focus:**
- Reduce equipment search confusion (new video tutorial)
- Hire part-time support help (screening candidates)
- Launch community forum (beta)
```

---

## 14. Legal & Compliance

### 14.1 GDPR Compliance (Data Requests)

**User Rights Under GDPR:**
1. **Right to Access:** Export all data (quotes, account info) within 48 hours
2. **Right to Deletion:** Delete account + data within 30 days
3. **Right to Portability:** Export in machine-readable format (JSON, CSV)
4. **Right to Rectification:** Update/correct personal data

**How Support Handles GDPR Requests:**
- Email: privacy@quotemyav.com
- Verify identity (email confirmation + security questions)
- Use Supabase export scripts
- Provide download link (expires in 7 days)

### 14.2 Data Retention Policy

**Active Accounts:**
- Quotes: Stored indefinitely
- Support tickets: 2 years
- Session logs: 90 days

**Deleted Accounts:**
- Soft delete: 90-day grace period (recoverable)
- Hard delete: Permanent after 90 days (GDPR compliance)
- Backups purged after 7 days (point-in-time recovery limit)

### 14.3 Terms of Service & SLA Updates

**How We Notify Users of Changes:**
- Email to all users (30 days before effective date)
- In-app banner notification
- Changelog page (changelog.quotemyav.com)
- Accept updated terms on next login (for material changes)

**User Rights:**
- Can cancel subscription if they disagree with new terms
- Pro-rated refund for annual plans (within 30 days of notice)

---

## 15. Contact Information

**Primary Support Channels:**
- **Email:** support@quotemyav.com
- **Live Chat:** Pro plan users (Mon-Fri 9 AM - 6 PM EST)
- **Knowledge Base:** help.quotemyav.com
- **Status Page:** status.quotemyav.com

**Specialized Contacts:**
- **Billing:** billing@quotemyav.com
- **Privacy/GDPR:** privacy@quotemyav.com
- **Security:** security@quotemyav.com
- **Escalations:** escalations@quotemyav.com
- **Press/Media:** press@quotemyav.com

**Emergency (Pro Plan After-Hours):**
- emergency@quotemyav.com (P1 issues only, monitored 24/7)

**Company Information:**
- QuoteMyAV, LLC (or Inc. - TBD)
- [Address TBD]
- [Phone TBD]

---

## Document Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-12-12 | Initial SLA & support documentation | Claude (AI Assistant) |

---

**End of Document**

*This document is a living resource and will be updated as QuoteMyAV's support operations mature. Feedback welcome at founders@quotemyav.com.*
