# QuoteMyAV - User Onboarding Strategy

## Overview

This document outlines the complete onboarding experience for new QuoteMyAV users, from signup through first quote creation. The goal is to get users from "curious visitor" to "activated user" (defined as someone who has created at least one quote) as quickly and smoothly as possible.

**Key Metrics:**
- **Time to First Quote (TTFQ):** Target < 10 minutes
- **Activation Rate:** Target 70%+ of signups create a quote within 7 days
- **Free-to-Paid Conversion:** Target 15%+ upgrade within 30 days

---

## 1. New User Flow

### 1.1 Signup Process (Supabase Auth)

**Entry Points:**
- Landing page CTA: "Start Free" button
- Pricing page: "Get Started" buttons
- Navbar: "Sign Up" link

**Signup Form:**
```
┌─────────────────────────────────────────────┐
│                                             │
│  [◇] QuoteMyAV                             │
│                                             │
│  Create Your Free Account                  │
│  ────────────────────────                  │
│                                             │
│  Email                                     │
│  ┌───────────────────────────────────────┐ │
│  │ you@company.com                       │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Password (8+ characters)                  │
│  ┌───────────────────────────────────────┐ │
│  │ ••••••••••••••                        │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Company Name (optional)                   │
│  ┌───────────────────────────────────────┐ │
│  │ Acme AV Productions                   │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ☑ I agree to Terms & Privacy Policy       │
│                                             │
│  [✦✦✦ CREATE ACCOUNT ✦✦✦]                 │
│  (teal gradient button)                    │
│                                             │
│  ────────── or ──────────                  │
│                                             │
│  [G] Sign up with Google                   │
│  (dark outline button)                     │
│                                             │
│  Already have an account? Log in (teal)    │
│                                             │
└─────────────────────────────────────────────┘
```

**Process:**
1. User enters email + password (or Google OAuth)
2. Supabase creates auth user
3. Backend creates subscription record (plan: 'free', quotes_limit: 3)
4. Supabase sends verification email
5. User redirected to onboarding wizard

**Technical Implementation:**
```javascript
// After successful signup
const { data: user, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      company_name: companyName,
      onboarding_completed: false,
    },
    emailRedirectTo: 'https://quotemyav.com/onboarding'
  }
});

// Trigger webhook to create subscription record
await fetch(`${n8nWebhookUrl}/new-user`, {
  method: 'POST',
  body: JSON.stringify({ user_id: user.id, company_name: companyName })
});
```

---

### 1.2 Email Verification

**Verification Email (sent by Supabase):**
```
Subject: Verify your QuoteMyAV account

Hi there!

Welcome to QuoteMyAV! You're one click away from generating professional AV quotes in seconds.

[VERIFY EMAIL] (teal button)

Once verified, you'll unlock:
✓ 3 free quotes per month
✓ AI-powered equipment selection
✓ Professional PDF export
✓ Quote history & tracking

Questions? Just reply to this email.

Thanks,
The QuoteMyAV Team

---
QuoteMyAV | AI-powered quotes for AV professionals
quotemyav.com
```

**After Verification:**
- User clicks link → Email verified in Supabase
- Redirect to `/onboarding` (if not completed) or `/dashboard` (if completed)

---

### 1.3 Welcome Email (Post-Verification)

**Sent immediately after verification:**
```
Subject: 🎉 You're all set! Here's how to create your first quote

Hi [FirstName],

Your QuoteMyAV account is ready to go! Here's what happens next:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT YOU GET (FREE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ 3 quotes per month
✓ AI-powered equipment selection
✓ Professional PDF export
✓ 30-day quote validity
✓ Email support

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR FIRST QUOTE IN 3 STEPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Tell us about the event (venue, dates, attendees)
2. Pick equipment categories (audio, video, lighting)
3. Let AI generate your quote (usually < 60 seconds)

[CREATE YOUR FIRST QUOTE →] (teal button)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUICK TIP:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The more details you provide, the better your quote. Don't worry about being perfect - you can always edit the quote after AI generates it.

Need help? Just reply to this email.

Let's go,
The QuoteMyAV Team

---
QuoteMyAV | quotemyav.com | support@quotemyav.com
```

---

### 1.4 First Login Experience

**After email verification, user lands on Dashboard for first time:**

**Empty State Dashboard:**
```
┌───────────────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ NAVY BACKGROUND ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                                                           │
│  [◇] QuoteMyAV    🔍 Search quotes...           ○ Myers ▼  [?] [⚙]      │
│                                                                           │
├─────────────┬─────────────────────────────────────────────────────────────┤
│▓▓ SIDEBAR ▓│                                                             │
│             │   ┌─────────────────────────────────────────────────────┐   │
│             │   │░░░░░░░░░░░░ ONBOARDING CARD ░░░░░░░░░░░░░░░░░░░░░░░│   │
│ ◈ Dashboard │   │                                                     │   │
│   (teal)    │   │  👋 Welcome to QuoteMyAV, Myers!                    │   │
│             │   │  ───────────────────────────                        │   │
│ ◇ Quotes    │   │                                                     │   │
│             │   │  You're all set! Here's how to create your first    │   │
│ ◇ Settings  │   │  professional AV quote in under 60 seconds:         │   │
│             │   │                                                     │   │
│ ◇ Billing   │   │  ╭───╮                                              │   │
│             │   │  │ 1 │  Fill out the event form (5 min)            │   │
│             │   │  ╰───╯  → Venue, dates, attendees                   │   │
│ ────────    │   │                                                     │   │
│             │   │  ╭───╮                                              │   │
│ PLAN        │   │  │ 2 │  Select equipment categories                │   │
│ 🆓 Free     │   │  ╰───╯  → Audio, video, lighting, etc.              │   │
│ 3 quotes/mo │   │                                                     │   │
│             │   │  ╭───╮                                              │   │
│ [Upgrade ↑] │   │  │ 3 │  AI generates your quote (<60s)             │   │
│ (teal)      │   │  ╰───╯  → Review, edit, download PDF                │   │
│             │   │                                                     │   │
│             │   │  [✦✦✦✦✦ CREATE MY FIRST QUOTE ✦✦✦✦✦]               │   │
│             │   │  (large teal gradient button with glow)             │   │
│             │   │                                                     │   │
│             │   │  Or explore a sample quote first →                  │   │
│             │   │                                                     │   │
│             │   └─────────────────────────────────────────────────────┘   │
│             │                                                             │
│             │   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│             │   │▓▓▓▓▓▓▓▓▓▓▓▓▓│ │▓▓▓▓▓▓▓▓▓▓▓▓▓│ │▓▓▓▓▓▓▓▓▓▓▓▓▓│          │
│             │   │   0 / 3     │ │    $0       │ │    $0       │          │
│             │   │   ═══════   │ │    ═══      │ │    ═══      │          │
│             │   │ QUOTES USED │ │ THIS MONTH  │ │ TOTAL VALUE │          │
│             │   │ ░░░░░░░░░░░ │ │             │ │  all time   │          │
│             │   │ (gray bar)  │ │ (teal)      │ │ (blue)      │          │
│             │   └─────────────┘ └─────────────┘ └─────────────┘          │
│             │                                                             │
│             │   NO QUOTES YET                                             │
│             │   ══════════════                                            │
│             │                                                             │
│             │   ╭────────────────────────────────────────╮                │
│             │   │                                        │                │
│             │   │        📄 (gray icon)                  │                │
│             │   │                                        │                │
│             │   │    Your quotes will appear here        │                │
│             │   │                                        │                │
│             │   │  [+ Create Your First Quote]           │                │
│             │   │  (teal ghost button)                   │                │
│             │   │                                        │                │
│             │   ╰────────────────────────────────────────╯                │
│             │                                                             │
└─────────────┴─────────────────────────────────────────────────────────────┘
```

**Key Features:**
- **Onboarding card:** Explains the 3-step process clearly
- **Large CTA:** Primary action is unmissable
- **Empty state messaging:** Friendly, encouraging tone
- **Stats cards:** Show 0/3 quotes used (makes free plan visible)
- **Multiple CTAs:** Primary button + secondary link

---

## 2. Onboarding Wizard/Checklist

### 2.1 Progress Tracking (Optional)

For users who want more guidance, show a collapsible onboarding checklist in the dashboard sidebar:

```
┌─────────────────────────────────────────┐
│ GETTING STARTED                    75%  │
│ ═══════════════                         │
│ ████████████████░░░░ (teal bar)         │
│                                         │
│ ✓ Create account                        │
│ ✓ Verify email                          │
│ ✓ Set up profile                        │
│ ● Create first quote       [Start →]    │
│   (teal dot, in progress)               │
│ ○ Download PDF                          │
│ ○ Explore Pro features                  │
│                                         │
│ [Hide checklist] (small link)           │
└─────────────────────────────────────────┘
```

**Checklist Items:**
1. ✓ Create account (auto-completed)
2. ✓ Verify email (auto-completed)
3. ○ Set up profile (company name, logo, tax rate)
4. ○ Create first quote
5. ○ Review generated quote
6. ○ Download PDF or email quote
7. ○ Explore Pro features (optional)

**Technical Implementation:**
```javascript
// Store onboarding progress in Supabase
const onboarding = {
  account_created: true,
  email_verified: true,
  profile_setup: false,
  first_quote_created: false,
  first_quote_reviewed: false,
  first_export: false,
  pro_features_viewed: false,
};

// Update on each action
await supabase
  .from('subscriptions')
  .update({ onboarding_progress: onboarding })
  .eq('user_id', userId);
```

---

### 2.2 Profile Setup (Optional)

**Prompt after first login:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Complete Your Profile (Optional)                  │
│  ─────────────────────────────                     │
│                                                     │
│  Help us personalize your quotes:                  │
│                                                     │
│  Company Name                                      │
│  ┌───────────────────────────────────────────────┐ │
│  │ Acme AV Productions                           │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Tax Rate (%)                                      │
│  ┌───────────────────────────────────────────────┐ │
│  │ 8.25                                          │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Skip for Now]           [Save & Continue →]      │
│  (ghost button)           (teal gradient)          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**What gets saved:**
- Company name → appears on quotes
- Tax rate → auto-applied to all quotes
- Optional fields for Pro users: logo upload, payment terms, custom footer

---

## 3. First Quote Experience

### 3.1 Guided Form Mode (Default for New Users)

**Tooltips & Help Text:**

On each form step, show contextual help bubbles:

```
┌─────────────────────────────────────────────────────┐
│  Event Type                                         │
│  ┌───────────────────────┐  ⓘ                      │
│  │ Corporate           ▼ │  (hover for tooltip)    │
│  └───────────────────────┘                          │
│                                                     │
│  [Tooltip on hover:]                                │
│  ┌─────────────────────────────────────────────┐   │
│  │ Corporate: Conferences, meetings, seminars  │   │
│  │ Concert: Live music, festivals             │   │
│  │ Wedding: Ceremonies, receptions            │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Key Tooltips:**
- **Venue Size:** "Rough estimate is fine. We use this to size PA systems."
- **Setup/Strike Days:** "Number of days before/after event for load-in/strike."
- **Budget Range:** "Optional. Helps AI suggest appropriate equipment tiers."
- **Equipment Categories:** "Select all that apply. You can refine later."

---

### 3.2 Example Data & Templates

**Quick Start Templates:**

On Step 1 (Quote Type), show example scenarios:

```
┌─────────────────────────────────────────────────────┐
│  Not sure where to start? Try an example:          │
│                                                     │
│  [🎤 Corporate Conference]                          │
│  500 attendees, 2-day event, audio + video + lights│
│  (fills form with realistic example data)          │
│                                                     │
│  [🎸 Live Concert]                                  │
│  1,000 capacity venue, 1-night show, full PA + FX  │
│                                                     │
│  [💍 Wedding Reception]                             │
│  150 guests, ceremony + reception, basic AV        │
│                                                     │
│  Or start from scratch → (link)                    │
└─────────────────────────────────────────────────────┘
```

**Pre-filled Example (Corporate Conference):**
- Event Name: "Annual Sales Conference 2025"
- Event Type: Corporate
- Venue: "Marriott Grand Ballroom"
- Venue Size: 500 attendees
- Dates: 3 days from today
- Equipment: Audio ✓, Video ✓, Lighting ✓
- Budget: $10,000 - $20,000

Users can edit any field after loading the template.

---

### 3.3 Inline Validation & Helpful Errors

**Good Error Messages:**

Instead of:
```
❌ Invalid date
```

Show:
```
⚠️ Event date must be in the future.
   Did you mean 01/15/2026?
```

**Progressive Disclosure:**

Only show advanced fields if user needs them:

```
┌─────────────────────────────────────────────────────┐
│  Event Date: 01/15/2025                             │
│  End Date: 01/17/2025                               │
│                                                     │
│  🔽 Advanced Options (click to expand)              │
│  ┌───────────────────────────────────────────────┐ │
│  │ Setup Days: 1      Strike Days: 1             │ │
│  │ Show Times: 9am - 5pm                         │ │
│  │ Multiple rooms: ☐                             │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

### 3.4 Success Celebration

**After First Quote is Generated:**

Show animated success modal:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│              🎉 (animated confetti)                 │
│                                                     │
│         YOUR FIRST QUOTE IS READY!                 │
│         ═══════════════════════════                │
│                                                     │
│  Annual Sales Conference 2025                      │
│  Total: $13,369                                    │
│                                                     │
│  What would you like to do next?                   │
│                                                     │
│  [📄 Download PDF]     [📧 Email to Client]        │
│  (teal gradient)       (green gradient)            │
│                                                     │
│  [✏️ Edit Quote]       [🏠 Back to Dashboard]       │
│  (ghost button)        (ghost button)              │
│                                                     │
│  ────────────────────────────────────────────      │
│                                                     │
│  💡 TIP: You have 2 quotes left this month.        │
│     Upgrade to Starter for 25 quotes/mo.           │
│     [Learn More →]                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Celebration Elements:**
- Animated confetti (JavaScript canvas or CSS animation)
- Clear summary of what was created
- Multiple CTAs for next steps
- Gentle upgrade prompt (not pushy)

---

## 4. Empty State Designs

### 4.1 Dashboard (No Quotes Yet)

**Already shown above in Section 1.4**

**Key Elements:**
- Hero message: "Welcome to QuoteMyAV, [Name]!"
- 3-step guide with visual steps
- Large primary CTA button
- Secondary CTA: "View sample quote"
- Stats cards showing 0/3 usage

---

### 4.2 Quote List (Empty)

**Shown when user clicks "Quotes" in sidebar:**

```
┌───────────────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ NAVY BACKGROUND ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                                                           │
│  [◇] QuoteMyAV    🔍 Search quotes...           ○ Myers ▼  [?] [⚙]      │
│                                                                           │
├─────────────┬─────────────────────────────────────────────────────────────┤
│▓▓ SIDEBAR ▓│                                                             │
│             │   MY QUOTES                                                 │
│ ◇ Dashboard │   ════════════                                              │
│             │                                                             │
│ ◈ Quotes    │   [+ New Quote] (teal button, top-right)                    │
│   (teal)    │                                                             │
│             │   ╭────────────────────────────────────────╮                │
│ ◇ Settings  │   │                                        │                │
│             │   │        📄 (large gray icon)            │                │
│ ◇ Billing   │   │                                        │                │
│             │   │    No quotes created yet               │                │
│             │   │                                        │                │
│ ────────    │   │  Create your first professional AV     │                │
│             │   │  quote in under 60 seconds.            │                │
│ PLAN        │   │                                        │                │
│ 🆓 Free     │   │  [✦ Create Quote ✦]                    │                │
│             │   │  (teal gradient button)                │                │
│ [Upgrade]   │   │                                        │                │
│             │   ╰────────────────────────────────────────╯                │
│             │                                                             │
│             │   💡 TIPS FOR GREAT QUOTES:                                 │
│             │   ───────────────────────                                   │
│             │   • Provide venue dimensions for better PA sizing           │
│             │   • Mention brand preferences (e.g., "L'Acoustics")         │
│             │   • Include client budget range if known                    │
│             │   • Be specific about event type and vibe                   │
│             │                                                             │
└─────────────┴─────────────────────────────────────────────────────────────┘
```

---

### 4.3 Equipment Library (Pro Tier, Empty)

**For Pro users who haven't added custom equipment:**

```
┌───────────────────────────────────────────────────────────────────────────┐
│  EQUIPMENT LIBRARY                                                        │
│  ══════════════════════                                                   │
│                                                                           │
│  [+ Add Equipment] (teal button, top-right)                               │
│                                                                           │
│  ╭────────────────────────────────────────╮                               │
│  │                                        │                               │
│  │        🔧 (large gray icon)            │                               │
│  │                                        │                               │
│  │    Build your custom equipment library │                               │
│  │                                        │                               │
│  │  Add your own gear with custom pricing │                               │
│  │  to speed up future quotes.            │                               │
│  │                                        │                               │
│  │  [+ Add First Item]                    │                               │
│  │  (teal gradient button)                │                               │
│  │                                        │                               │
│  ╰────────────────────────────────────────╯                               │
│                                                                           │
│  OR IMPORT FROM CSV:                                                      │
│  [📁 Upload CSV File] (ghost button)                                      │
│  Download template → (link)                                               │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

### 4.4 Empty State CTAs Summary

**What CTAs to Show:**

| State | Primary CTA | Secondary CTA |
|-------|-------------|---------------|
| Dashboard (no quotes) | "Create My First Quote" | "View Sample Quote" |
| Quote List (empty) | "Create Quote" | Tips section |
| Equipment Library (empty) | "Add First Item" | "Upload CSV" |
| Settings (incomplete profile) | "Complete Profile" | "Skip for Now" |

---

## 5. Nurture Email Sequence

### 5.1 Day 0: Welcome Email (Already Shown Above)

**Trigger:** Email verification complete

**Goal:** Orient user, explain value, encourage first quote

**Sent:** Immediately after email verification

---

### 5.2 Day 1: First Quote Tips

**Trigger:** 24 hours after signup

**Condition:** User has NOT created a quote yet

```
Subject: Quick tips for your first quote

Hi Myers,

I noticed you haven't created your first quote yet. No worries! Here are some quick tips to make it super easy:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
5 TIPS FOR GREAT QUOTES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. START WITH AN EXAMPLE
   Not sure what to enter? Use our pre-filled templates (Corporate Conference, Live Concert, or Wedding)

2. BE SPECIFIC ABOUT THE VENUE
   "Hotel ballroom, 500 capacity" works better than just "event space"

3. MENTION BRAND PREFERENCES
   If your client wants L'Acoustics or Shure, include it in "Specific Requests"

4. DON'T SWEAT THE DETAILS
   You can always edit the quote after AI generates it

5. BUDGET RANGE HELPS
   If you know the client's budget, include it - AI will tailor suggestions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STUCK? TRY THIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Here's a sample request that generates a great quote:

Event: Corporate Sales Conference
Venue: Marriott Downtown, 500 attendees
Needs: PA system, confidence monitors, projection, basic stage lighting
Budget: $10-15k

[TRY IT NOW →] (button with example pre-filled)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions? Just hit reply - I read every message.

Happy quoting,
Sarah @ QuoteMyAV

P.S. You have 3 free quotes waiting for you. Use 'em!

---
QuoteMyAV | quotemyav.com
```

---

### 5.3 Day 3: Feature Highlight

**Trigger:** 3 days after signup

**Condition:** User HAS created at least one quote

```
Subject: 3 features you might have missed

Hi Myers,

Nice work on your first quote! 🎉

Here are 3 features that can save you even more time:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. EDIT GENERATED QUOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Don't like a line item? Click "Edit" and tweak quantities, add items, or change pricing. AI gets you 90% there - you perfect it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. EMAIL QUOTES DIRECTLY TO CLIENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hit "Email Client" to send professional quotes straight from QuoteMyAV. We track when they open it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. QUOTE HISTORY SEARCH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Need to find that Marriott quote from last week? Use the search bar in your dashboard - searches event names, venues, and clients.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Want to unlock unlimited quotes? Starter plan is just $20/mo.

[EXPLORE PLANS →]

Thanks for using QuoteMyAV!
Sarah

---
QuoteMyAV | quotemyav.com
```

---

### 5.4 Day 7: Check-in (No Quotes Created)

**Trigger:** 7 days after signup

**Condition:** User has NOT created any quotes

```
Subject: Need help getting started?

Hi Myers,

I noticed you signed up a week ago but haven't created a quote yet. Is something blocking you?

Common issues I hear:

❓ "I'm not sure what to enter"
→ Try one of our pre-filled examples (Corporate, Concert, Wedding)

❓ "I want to see how it works first"
→ Check out our demo video (2 minutes): [WATCH DEMO]

❓ "I'm waiting for a real client project"
→ Totally fine! Your account stays active. When you're ready, we're here.

❓ "Something isn't working"
→ Just reply to this email and I'll personally help you out.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Still want to give it a shot? Here's a quick-start link:

[CREATE QUOTE NOW →] (button)

If QuoteMyAV isn't a good fit, no worries - you can cancel anytime.

Here to help,
Sarah @ QuoteMyAV

P.S. Your 3 free quotes are waiting whenever you need them.

---
QuoteMyAV | quotemyav.com | support@quotemyav.com
```

---

### 5.5 Day 14: Upgrade Prompt (Free Tier)

**Trigger:** 14 days after signup

**Condition:** User HAS created at least one quote, still on Free tier

```
Subject: Ready for unlimited quotes?

Hi Myers,

You've created [X] quotes in the last 2 weeks - awesome!

Your free plan gives you 3 quotes per month. If you're finding QuoteMyAV useful, our Starter plan might be a good fit:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STARTER PLAN: $20/month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ 25 quotes per month
✓ Priority email support
✓ Quote templates & history
✓ PDF export with your branding (coming soon)
✓ Email tracking (see when clients open quotes)

That's $0.80 per quote - probably less than the cost of one cup of coffee.

[UPGRADE TO STARTER →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OR GO PRO: $60/month
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ UNLIMITED quotes
✓ Custom equipment library
✓ White-label PDF exports
✓ API access (automate workflows)
✓ Priority support

Perfect for production companies and rental houses.

[EXPLORE PRO FEATURES →]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Not ready to upgrade? No problem! Your free plan keeps working.

Happy quoting,
Sarah @ QuoteMyAV

P.S. All paid plans include a 14-day money-back guarantee. Try it risk-free.

---
QuoteMyAV | quotemyav.com
```

---

### 5.6 Email Sequence Summary

| Day | Subject | Trigger | Goal | CTA |
|-----|---------|---------|------|-----|
| 0 | "You're all set!" | Email verified | Orient user | Create First Quote |
| 1 | "Quick tips for your first quote" | No quotes created | Re-engage, educate | Try Example |
| 3 | "3 features you might have missed" | Quote created | Deepen engagement | Explore Features |
| 7 | "Need help getting started?" | No quotes created | Surface blockers | Offer Support |
| 14 | "Ready for unlimited quotes?" | Free tier, active user | Convert to paid | Upgrade to Starter |

**Technical Implementation:**

Use n8n scheduled workflow to check onboarding status daily:

```javascript
// n8n workflow: Daily Onboarding Check
// Runs at 10am UTC every day

// Query Supabase for users matching each trigger condition
const day1Users = await supabase
  .from('subscriptions')
  .select('user_id, created_at')
  .eq('onboarding_progress->first_quote_created', false)
  .gte('created_at', new Date(Date.now() - 25 * 60 * 60 * 1000)) // 24-25 hours ago
  .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000));

// Send Day 1 email via SendGrid/Resend
for (const user of day1Users) {
  await sendEmail({
    to: user.email,
    template: 'day-1-tips',
    data: { first_name: user.first_name }
  });
}

// Repeat for day 3, 7, 14...
```

---

## 6. Success Metrics

### 6.1 Time to First Quote (TTFQ)

**Definition:** Time from email verification to first quote created

**Target:** < 10 minutes median

**Tracking:**
```javascript
// Log timestamp when email verified
await supabase
  .from('subscriptions')
  .update({ email_verified_at: new Date() })
  .eq('user_id', userId);

// Log timestamp when first quote created
await supabase
  .from('subscriptions')
  .update({ first_quote_created_at: new Date() })
  .eq('user_id', userId);

// Calculate TTFQ
const ttfq = first_quote_created_at - email_verified_at; // milliseconds
```

**Benchmarks:**
- **Excellent:** < 5 minutes (user is highly motivated)
- **Good:** 5-30 minutes (user exploring)
- **Concerning:** 1-24 hours (user distracted)
- **Critical:** > 24 hours (likely needs email nudge)

---

### 6.2 Activation Rate

**Definition:** % of users who create at least one quote within 7 days

**Target:** 70%+ activation rate

**Formula:**
```
Activation Rate = (Users who created ≥1 quote within 7 days) / (Total signups) × 100
```

**Tracking:**
```sql
-- Run weekly report
SELECT
  COUNT(DISTINCT s.user_id) as total_signups,
  COUNT(DISTINCT CASE WHEN q.created_at <= s.created_at + INTERVAL '7 days' THEN s.user_id END) as activated_users,
  ROUND(
    COUNT(DISTINCT CASE WHEN q.created_at <= s.created_at + INTERVAL '7 days' THEN s.user_id END)::numeric
    / COUNT(DISTINCT s.user_id) * 100,
    2
  ) as activation_rate_pct
FROM subscriptions s
LEFT JOIN quotes q ON s.user_id = q.user_id
WHERE s.created_at >= NOW() - INTERVAL '30 days';
```

**Breakdowns to Track:**
- Activation by signup source (landing page, pricing page, Google OAuth)
- Activation by user role (free, starter, pro - if they upgrade before creating)
- Activation by template usage (did they use an example?)

---

### 6.3 Completion Rate of Onboarding

**Definition:** % of users who complete all onboarding steps

**Onboarding Steps:**
1. ✓ Create account
2. ✓ Verify email
3. ○ Complete profile (optional)
4. ○ Create first quote
5. ○ Download/export first quote

**Target:** 60%+ complete steps 4-5 within 7 days

**Tracking:**
```javascript
// Update onboarding_progress JSON on each action
const progress = {
  account_created: true, // auto
  email_verified: true,  // auto
  profile_completed: true,
  first_quote_created: true,
  first_export: true,
};

await supabase
  .from('subscriptions')
  .update({ onboarding_progress: progress })
  .eq('user_id', userId);
```

**Funnel Analysis:**
```
100% → Account Created
 95% → Email Verified (5% drop-off)
 85% → Profile Completed (10% drop-off)
 70% → First Quote Created (15% drop-off)
 60% → First Export (10% drop-off)
```

**Optimization:** Focus on biggest drop-off (email → quote creation)

---

### 6.4 Activation Criteria (Activated User Definition)

**What defines an "activated" user?**

**Level 1 Activation (Basic):**
- ✓ Email verified
- ✓ Created at least 1 quote

**Level 2 Activation (Engaged):**
- ✓ Email verified
- ✓ Created at least 1 quote
- ✓ Downloaded PDF or emailed quote

**Level 3 Activation (Power User):**
- ✓ Email verified
- ✓ Created 2+ quotes
- ✓ Exported at least 1 quote
- ✓ Profile completed (company name, tax rate)

**Why This Matters:**
- Level 1 = User tried the product
- Level 2 = User got value (sent quote to client)
- Level 3 = User is habitual (repeat usage)

**Tracking:**
```javascript
// Calculate activation level
function getActivationLevel(user) {
  if (!user.email_verified) return 0;
  if (user.quote_count < 1) return 0;

  // Level 1
  if (user.quote_count >= 1) {
    if (user.export_count >= 1) {
      // Level 2
      if (user.quote_count >= 2 && user.profile_completed) {
        return 3; // Level 3
      }
      return 2; // Level 2
    }
    return 1; // Level 1
  }

  return 0; // Not activated
}
```

---

### 6.5 Churn Indicators

**Early Warning Signs (Within 7 Days of Signup):**

1. **No quotes created after Day 3**
   - Action: Send Day 7 check-in email
   - Escalation: Personal outreach if high-value lead

2. **Created 1 quote but never exported**
   - Potential issue: Quote quality was poor
   - Action: Send "How was your quote?" survey email
   - Survey: "Was the quote accurate?" (Yes/No) + feedback box

3. **Logged in once, never returned**
   - Action: Day 3 re-engagement email
   - Offer: "Book a 15-minute demo call" (for Pro prospects)

4. **Hit quota limit on Free tier but didn't upgrade**
   - Action: Trigger upgrade prompt modal
   - Offer: "Get 10 extra quotes free - upgrade to Starter today"

5. **Free user who created 3 quotes in Week 1, none in Week 2**
   - Likely: Out of quota, can't afford upgrade
   - Action: Send pricing email with testimonials (social proof)

**Technical Implementation:**
```javascript
// n8n workflow: Churn Risk Detection
// Runs daily at 9am UTC

// Query users with churn signals
const churnRiskUsers = await supabase
  .from('subscriptions')
  .select('*')
  .eq('plan', 'free')
  .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)) // Last 14 days
  .or('quotes_used.gte.3,last_login_at.lt.' + new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

// Segment by churn reason
for (const user of churnRiskUsers) {
  if (user.quotes_used >= 3 && user.plan === 'free') {
    // Hit quota, send upgrade prompt
    await sendEmail(user.user_id, 'quota-upgrade-prompt');
  } else if (user.last_login_at < sevenDaysAgo) {
    // Inactive, send re-engagement
    await sendEmail(user.user_id, 'inactive-reengagement');
  }
}
```

---

## 7. Pro Tier Onboarding

### 7.1 Additional Steps for Pro Users

**Pro onboarding extends the base flow with:**

1. ✓ Complete profile (company name, tax rate)
2. ✓ Upload company logo
3. ○ Set up custom quote templates
4. ○ Build equipment library
5. ○ Invite team members (future feature)

---

### 7.2 Branding Setup

**After first Pro subscription, show modal:**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  Welcome to QuoteMyAV Pro! 🎉                       │
│  ═══════════════════════════                        │
│                                                     │
│  Let's personalize your quotes:                    │
│                                                     │
│  1. UPLOAD YOUR LOGO                               │
│  ┌─────────────────────────────────────────────┐   │
│  │  ┌─────────┐                                │   │
│  │  │  LOGO   │  [Upload Logo]                 │   │
│  │  │  PREVIEW│  (dark gray button)            │   │
│  │  └─────────┘                                │   │
│  │  Recommended: 300x100px PNG with transparent bg │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  2. CUSTOM FOOTER TEXT                             │
│  ┌─────────────────────────────────────────────┐   │
│  │ Terms: 50% deposit, balance due on delivery.│   │
│  │ Contact: sales@acmeav.com | (555) 123-4567 │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  3. DEFAULT TAX RATE                               │
│  ┌───────────┐                                     │
│  │ 8.25 %    │                                     │
│  └───────────┘                                     │
│                                                     │
│  [Skip for Now]           [Save & Continue →]      │
│  (ghost)                  (teal gradient)          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**What Gets Saved:**
- Logo → stored in Supabase Storage, URL saved to profile
- Footer text → injected into all PDF exports
- Tax rate → auto-applied to quotes

---

### 7.3 Equipment Library Setup

**Empty state shown in Section 4.3**

**After user adds first item:**

```
┌───────────────────────────────────────────────────────────────────────────┐
│  EQUIPMENT LIBRARY                                                        │
│  ══════════════════════                                                   │
│                                                                           │
│  [+ Add Equipment] [⚙ Categories] [📁 Import CSV] (top-right buttons)    │
│                                                                           │
│  🔍 Search equipment...                    Sort by: Name ▼  Filter: All ▼ │
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ AUDIO ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │
│  │                                                                     │  │
│  │  L'Acoustics A10 Line Array                            $60/day     │  │
│  │  Professional point-source line array element           [Edit] [X] │  │
│  │  (teal border on hover)                                             │  │
│  │                                                                     │  │
│  │  Shure ULXD Wireless Mic System                         $15/day     │  │
│  │  Digital wireless with rechargeable batteries           [Edit] [X] │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                           │
│  💡 TIP: The more gear you add, the faster future quotes will be.         │
│      AI will pull from your library first.                                │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

**Features:**
- Custom pricing per item
- Categories (Audio, Video, Lighting, etc.)
- Search & filter
- CSV import for bulk upload
- AI preferentially uses library items in quotes

---

### 7.4 Team Invitation (Future Feature)

**For Pro users who want to add team members:**

```
┌─────────────────────────────────────────────────────┐
│  INVITE TEAM MEMBERS                                │
│  ═══════════════════════                            │
│                                                     │
│  Pro plan includes up to 5 team members.           │
│                                                     │
│  Email Address                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │ john@acmeav.com                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Role: ◉ Editor  ○ Viewer                          │
│  • Editors can create and edit quotes             │
│  • Viewers can only view quotes                   │
│                                                     │
│  [Send Invitation →] (teal button)                 │
│                                                     │
│  ────────────────────────────────────────────      │
│                                                     │
│  INVITED MEMBERS:                                  │
│  • Sarah (sarah@acmeav.com) - Editor ✓            │
│  • Mike (mike@acmeav.com) - Viewer (pending)      │
│                                                     │
│  [Invite More +]                                   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Future Enhancement:** Team workspaces with shared quote libraries

---

## 8. Implementation Checklist

### Phase 1: Core Onboarding (MVP)
- [ ] Supabase Auth signup flow
- [ ] Email verification flow
- [ ] Welcome email template (Day 0)
- [ ] Empty state dashboard design
- [ ] First quote guided form
- [ ] Success celebration modal
- [ ] Basic profile setup (company name, tax rate)

### Phase 2: Email Nurture
- [ ] Day 1 tips email
- [ ] Day 3 feature highlight email
- [ ] Day 7 check-in email (no quotes)
- [ ] Day 14 upgrade prompt email
- [ ] n8n workflow for email triggers
- [ ] Onboarding progress tracking in DB

### Phase 3: Retention & Metrics
- [ ] Onboarding checklist sidebar widget
- [ ] TTFQ tracking & dashboard
- [ ] Activation rate analytics
- [ ] Churn risk detection workflow
- [ ] In-app upgrade prompts (quota exceeded)

### Phase 4: Pro Onboarding
- [ ] Branding setup modal (logo upload)
- [ ] Equipment library UI
- [ ] CSV import for equipment
- [ ] Custom quote footer settings
- [ ] Pro feature tour

### Phase 5: Optimization
- [ ] A/B test email subject lines
- [ ] A/B test CTA copy (dashboard)
- [ ] User feedback surveys ("How was your quote?")
- [ ] Session replay integration (Hotjar/LogRocket)
- [ ] Exit intent surveys for churned users

---

## 9. A/B Testing Ideas

### Test 1: Dashboard Hero Message

**Control (A):**
> "Welcome to QuoteMyAV, Myers!"

**Variant (B):**
> "You're 60 seconds away from your first quote"

**Hypothesis:** Variant B emphasizes speed, may increase activation

---

### Test 2: First Quote CTA Copy

**Control (A):**
> "Create My First Quote"

**Variant (B):**
> "Generate Quote in 60 Seconds"

**Hypothesis:** Variant B adds urgency and speed promise

---

### Test 3: Example Templates

**Control (A):**
> Show 3 templates (Corporate, Concert, Wedding)

**Variant (B):**
> Show 5 templates (add Festival, Theater)

**Hypothesis:** More options may increase engagement, or cause choice paralysis

---

### Test 4: Empty State CTA Position

**Control (A):**
> Large CTA at top of empty state card

**Variant (B):**
> Large CTA at bottom + small "Create Quote" button in top-right

**Hypothesis:** Variant B gives two CTAs, may increase clicks

---

## 10. Metrics Dashboard (Internal)

**Build an internal onboarding dashboard tracking:**

```
┌───────────────────────────────────────────────────────────────────────────┐
│  ONBOARDING METRICS - Last 30 Days                                        │
│  ══════════════════════════════════════                                   │
│                                                                           │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐              │
│  │ 847 SIGNUPS     │ │ 72% ACTIVATION  │ │ 5.2 min TTFQ    │              │
│  │ ↑ 12% vs prev   │ │ ↓ 3% vs prev    │ │ ↓ 1.1 min       │              │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘              │
│                                                                           │
│  FUNNEL:                                                                  │
│  ═══════                                                                  │
│  Signups:          847  ████████████████████████████████████ 100%         │
│  Email Verified:   802  ██████████████████████████████████░░  95%         │
│  First Quote:      610  ███████████████████████████░░░░░░░░░  72%         │
│  First Export:     524  ████████████████████████░░░░░░░░░░░░  62%         │
│                                                                           │
│  EMAIL PERFORMANCE:                                                       │
│  ═══════════════════                                                      │
│  Day 0 (Welcome):       95% open, 42% click                               │
│  Day 1 (Tips):          68% open, 31% click                               │
│  Day 3 (Features):      54% open, 19% click                               │
│  Day 7 (Check-in):      41% open, 23% click                               │
│  Day 14 (Upgrade):      38% open, 12% click, 4% convert                   │
│                                                                           │
│  CHURN RISK:                                                              │
│  ═══════════                                                              │
│  47 users haven't created a quote in 7+ days                              │
│  23 users hit quota but didn't upgrade                                    │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

**SQL for Funnel:**
```sql
WITH funnel AS (
  SELECT
    COUNT(DISTINCT s.user_id) as signups,
    COUNT(DISTINCT CASE WHEN s.email_verified THEN s.user_id END) as verified,
    COUNT(DISTINCT CASE WHEN q.id IS NOT NULL THEN s.user_id END) as created_quote,
    COUNT(DISTINCT CASE WHEN q.status IN ('sent', 'accepted') THEN s.user_id END) as exported
  FROM subscriptions s
  LEFT JOIN quotes q ON s.user_id = q.user_id
  WHERE s.created_at >= NOW() - INTERVAL '30 days'
)
SELECT
  signups,
  verified,
  ROUND(verified::numeric / signups * 100, 1) as verified_pct,
  created_quote,
  ROUND(created_quote::numeric / signups * 100, 1) as activation_pct,
  exported,
  ROUND(exported::numeric / signups * 100, 1) as export_pct
FROM funnel;
```

---

## 11. User Feedback Loop

### 11.1 Post-Quote Survey

**After user exports their first quote, show modal:**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  How was your first quote? 💬                       │
│  ═══════════════════════                            │
│                                                     │
│  Was the AI-generated quote accurate?              │
│                                                     │
│  ◉ Yes, very accurate                              │
│  ○ Mostly accurate, minor edits needed             │
│  ○ Needed significant edits                        │
│  ○ Not accurate at all                             │
│                                                     │
│  What could we improve? (optional)                 │
│  ┌───────────────────────────────────────────────┐ │
│  │                                               │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  [Skip]               [Submit Feedback →]          │
│  (ghost)              (teal gradient)              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Store feedback in Supabase:**
```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  quote_id UUID REFERENCES quotes(id),
  accuracy_rating TEXT, -- 'very_accurate', 'mostly_accurate', 'needed_edits', 'not_accurate'
  comment TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

**Use feedback to improve AI prompts:**
- If many users say "needed edits" → review Claude system prompt
- If specific equipment categories get low ratings → refine rules engine

---

### 11.2 Exit Intent Survey (Churned Users)

**If user hasn't logged in for 14 days, send email:**

```
Subject: We miss you! Quick question

Hi Myers,

I noticed you haven't used QuoteMyAV in a couple weeks.

Can I ask - what made you stop using it?

[QUICK 1-MINUTE SURVEY →]

Your feedback helps us build a better product. As a thank you, I'll add 3 extra quotes to your account (on the house).

Thanks,
Sarah @ QuoteMyAV
```

**Survey Questions:**
1. Why did you stop using QuoteMyAV? (select all that apply)
   - [ ] Quotes weren't accurate enough
   - [ ] Too expensive / pricing didn't fit my needs
   - [ ] Missing features I need
   - [ ] Too complicated to use
   - [ ] Switched to another tool
   - [ ] Just didn't need it right now
   - [ ] Other: ___________

2. What would make you come back?
   - (open text)

3. Can we reach out to learn more?
   - ○ Yes, I'm open to a call
   - ○ No, thanks

**Incentive:** 3 bonus quotes added to account after survey completion

---

## 12. Related Documents

- `../mvp/01-architecture.md` - MVP technical architecture
- `../mvp/02-wireframes.md` - UI wireframes and design system
- `../mvp/03-ux-animations.md` - UX flows and animations (if exists)
- `../shared/questionnaire-fields.md` - Full form field reference
- `../phase-2/ai-assistant-mode.md` - Chat-based quote creation (Phase 2)

---

## Summary

This onboarding strategy focuses on **speed to value**:

1. **Immediate value:** Get users to first quote < 10 minutes
2. **Clear guidance:** Example templates, tooltips, step-by-step wizard
3. **Celebrate wins:** Success modal after first quote
4. **Nurture sequence:** 5 emails over 14 days to re-engage and convert
5. **Track everything:** TTFQ, activation rate, churn indicators
6. **Iterate fast:** A/B test CTAs, survey users, optimize funnel

**Key Success Metrics:**
- ✓ 70%+ activation rate (quote created within 7 days)
- ✓ < 10 min median TTFQ
- ✓ 15%+ free-to-paid conversion within 30 days

**Next Steps:**
1. Build MVP onboarding (Phase 1 checklist)
2. Set up email nurture workflows in n8n
3. Instrument analytics (Supabase + Plausible/PostHog)
4. Launch and monitor activation funnel
5. Run A/B tests on CTA copy and email subject lines
6. Collect user feedback and iterate
