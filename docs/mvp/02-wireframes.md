# QuoteMyAV - Frontend Wireframes

## Design System (Dark Tech Theme)

**Colors:**
- Primary: Teal/Cyan `#14B8A6`
- Secondary: Electric Blue `#3B82F6`
- Accent: Emerald Green `#10B981`
- Warning: Amber `#F59E0B`
- Error: Red `#EF4444`
- Background Dark: Navy `#0F172A`
- Background Mid: Charcoal `#1E293B`
- Cards: Dark Slate `#334155` with subtle border
- Text Primary: White `#F8FAFC`
- Text Secondary: Slate `#94A3B8`
- Gradient Hero: Blue → Teal → Green diagonal (`#3B82F6` → `#14B8A6` → `#10B981`)

**Typography:**
- Headings: Inter Bold (white)
- Body: Inter Regular (slate gray)
- Monospace: JetBrains Mono (for prices, teal color)
- Hero text: Extra bold, large

**Style Notes:**
- DARK THEME throughout (navy/charcoal backgrounds)
- Diagonal gradient sections (blue-green sweep)
- Glowing teal/green accents on hover
- Cards with subtle colored border glow
- Device mockups with screenshots
- Layered/overlapping card layouts
- Rounded corners (xl)
- Subtle grid/dot pattern backgrounds
- Green checkmarks, teal highlights
- Stats with large bold numbers + green accent

---

## 1. Landing Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ NAVY BACKGROUND ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                                                             │
│  [◇ LOGO] QuoteMyAV              Features  Pricing  Login  [✦ Get Started] │
│                                                            (teal glow btn)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░░░░░ DIAGONAL GRADIENT SECTION ░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│ ░░░░░░░░░░░░░░░░░░░░░░ (Blue → Teal → Green) ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                                             │
│      WE DELIVER YOU                                                         │
│      ████████ BEST ████████  (BEST in gradient text)                        │
│                                                                             │
│      AI-powered quotes for AV professionals.                                │
│      Stop spreadsheets. Start closing deals.                                │
│                                                                             │
│      [✦✦✦ START FREE ✦✦✦]   [▷ Watch Demo]                                  │
│       (teal gradient btn)    (ghost button)                                 │
│                                                                             │
│                    ┌─────────────────────────────────┐                      │
│                   /│  ╔═══════════════════════════╗  │\                     │
│                  / │  ║   DASHBOARD SCREENSHOT    ║  │ \                    │
│                 /  │  ║   with quote preview      ║  │  \                   │
│                    │  ║   (dark UI mockup)        ║  │   (layered cards)    │
│                    │  ╚═══════════════════════════╝  │                      │
│                    └─────────────────────────────────┘                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ STATS BAR (dark) ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                                                             │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐     │
│   │   765+      │   │    98%      │   │    60s      │   │    $2M+     │     │
│   │  ───────    │   │   ───────   │   │   ───────   │   │   ───────   │     │
│   │   Users     │   │  Accuracy   │   │  Avg Time   │   │   Quoted    │     │
│   │   (teal)    │   │   (green)   │   │   (blue)    │   │   (teal)    │     │
│   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ FEATURES SECTION ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                                                             │
│      WHY CHOOSE US                                                          │
│      ═════════════                                                          │
│                                                                             │
│   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│   │ ╭─────╮          │  │ ╭─────╮          │  │ ╭─────╮          │          │
│   │ │ ⚡  │ (teal)   │  │ │ 🎯  │ (green)  │  │ │ 💰  │ (blue)   │          │
│   │ ╰─────╯          │  │ ╰─────╯          │  │ ╰─────╯          │          │
│   │                  │  │                  │  │                  │          │
│   │  LIGHTNING FAST  │  │  AV-SMART AI     │  │  SAVE 90%        │          │
│   │                  │  │                  │  │                  │          │
│   │  Generate quotes │  │  Trained on real │  │  More quotes,    │          │
│   │  in under 60     │  │  AV pricing &    │  │  less time.      │          │
│   │  seconds         │  │  equipment       │  │  More revenue.   │          │
│   │                  │  │                  │  │                  │          │
│   │  (dark card      │  │  (dark card      │  │  (dark card      │          │
│   │   teal border)   │  │   green border)  │  │   blue border)   │          │
│   └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░░░░░ DIAGONAL GRADIENT (reverse) ░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                                             │
│                          HOW IT WORKS                                       │
│                          ═════════════                                      │
│                                                                             │
│   ╭───────╮       ╭───────╮       ╭───────╮       ╭───────╮                 │
│   │   1   │ ────▶ │   2   │ ────▶ │   3   │ ────▶ │   4   │                 │
│   │ ───── │       │ ───── │       │ ───── │       │ ───── │                 │
│   │ FILL  │       │  AI   │       │REVIEW │       │ SEND  │                 │
│   │ FORM  │       │MAGIC  │       │& EDIT │       │QUOTE  │                 │
│   ╰───────╯       ╰───────╯       ╰───────╯       ╰───────╯                 │
│   (teal ring)     (green ring)    (blue ring)     (teal ring)               │
│                                                                             │
│      ┌─────────────────────────────────────────────────────┐                │
│      │  ╔═══════════════════════════════════════════════╗  │                │
│      │  ║  PHONE + LAPTOP MOCKUP showing quote form     ║  │                │
│      │  ║  (layered devices, dark UI)                   ║  │                │
│      │  ╚═══════════════════════════════════════════════╝  │                │
│      └─────────────────────────────────────────────────────┘                │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ PRICING SECTION ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                                                             │
│                          SIMPLE PRICING                                     │
│                          ══════════════                                     │
│                                                                             │
│   ┌────────────────┐   ┌─────────────────────┐   ┌────────────────┐         │
│   │░░░ FREE ░░░░░░░│   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│   │░░░ PRO ░░░░░░░│         │
│   │                │   │     ★ STARTER ★     │   │                │         │
│   │    $0/mo       │   │                     │   │    $60/mo      │         │
│   │                │   │      $20/mo         │   │                │         │
│   │  ✓ 3 quotes    │   │                     │   │  ✓ Unlimited   │         │
│   │  ✓ Basic PDF   │   │  ✓ 25 quotes        │   │  ✓ Custom      │         │
│   │                │   │  ✓ PDF export       │   │    templates   │         │
│   │                │   │  ✓ Email support    │   │  ✓ Branding    │         │
│   │                │   │  ✓ Quote history    │   │  ✓ API access  │         │
│   │                │   │                     │   │  ✓ Priority    │         │
│   │                │   │  (teal glow border) │   │                │         │
│   │ [Start Free]   │   │ [✦ Get Started ✦]   │   │ [Go Pro]       │         │
│   │ (ghost btn)    │   │ (gradient button)   │   │ (ghost btn)    │         │
│   └────────────────┘   └─────────────────────┘   └────────────────┘         │
│                        (featured/larger card)                               │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ ░░░░░░░░░░░░░░░░░░░░░ TESTIMONIAL (gradient bg) ░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                                             │
│      "QuoteMyAV cut my quote time from 2 hours to 5 minutes.                │
│       Game changer for our production company."                             │
│                                                                             │
│       ○ Mike Reynolds                                                       │
│         Production Manager, Acme Events                                     │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ CTA BANNER ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                                                             │
│      READY TO QUOTE SMARTER?                                                │
│      [✦✦✦✦ START YOUR FREE TRIAL ✦✦✦✦]                                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ FOOTER ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                                                             │
│  QuoteMyAV             Product        Company        Legal                  │
│  AI quotes for AV      Features       About          Terms                  │
│  professionals         Pricing        Contact        Privacy                │
│                        Docs           Twitter                               │
│                                                                             │
│  © 2025 QuoteMyAV                                        [Twitter] [GitHub] │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Login / Signup Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░ SPLIT SCREEN LAYOUT ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                                             │
│  ┌──────────────────────────────┬──────────────────────────────────────┐    │
│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                                      │    │
│  │▓▓ LEFT PANEL (gradient) ▓▓▓▓│     ╭─────────────────────────────╮   │    │
│  │▓▓ Blue → Teal → Green   ▓▓▓▓│     │                             │   │    │
│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│     │   [◇] QuoteMyAV             │   │    │
│  │                              │     │                             │   │    │
│  │   ╭─────────────────────╮    │     │   Welcome Back              │   │    │
│  │   │  [Dashboard mockup] │    │     │   ────────────              │   │    │
│  │   │  showing quote      │    │     │                             │   │    │
│  │   │  preview (dark UI)  │    │     │   Email                     │   │    │
│  │   ╰─────────────────────╯    │     │   ┌───────────────────────┐ │   │    │
│  │                              │     │   │ you@company.com       │ │   │    │
│  │   "Generate professional    │     │   └───────────────────────┘ │   │    │
│  │    AV quotes in seconds"    │     │   (dark input, teal focus)  │   │    │
│  │                              │     │                             │   │    │
│  │   ✓ 60-second quotes        │     │   Password                  │   │    │
│  │   ✓ AV-smart pricing        │     │   ┌───────────────────────┐ │   │    │
│  │   ✓ PDF & email export      │     │   │ ••••••••••••          │ │   │    │
│  │                              │     │   └───────────────────────┘ │   │    │
│  │                              │     │                             │   │    │
│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│     │   [✦✦✦✦✦ SIGN IN ✦✦✦✦✦]    │   │    │
│  │                              │     │   (teal gradient button)    │   │    │
│  │                              │     │                             │   │    │
│  │                              │     │   ──────── or ────────      │   │    │
│  │                              │     │                             │   │    │
│  │                              │     │   [G] Continue with Google  │   │    │
│  │                              │     │   (dark outline button)     │   │    │
│  │                              │     │                             │   │    │
│  │                              │     │   Forgot password? (teal)   │   │    │
│  │                              │     │                             │   │    │
│  │                              │     │   ─────────────────────     │   │    │
│  │                              │     │   Don't have an account?    │   │    │
│  │                              │     │   Sign up free (teal link)  │   │    │
│  │                              │     │                             │   │    │
│  │                              │     ╰─────────────────────────────╯   │    │
│  │                              │     (dark card with subtle border)    │    │
│  │                              │                                      │    │
│  └──────────────────────────────┴──────────────────────────────────────┘    │
│                                  Navy background on right                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Dashboard

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ NAVY BACKGROUND ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                                                             │
│  [◇] QuoteMyAV       🔍 Search quotes...              ○ Myers ▼  [?] [⚙]   │
│                      (dark input, teal icon)          (avatar)              │
├───────────────┬─────────────────────────────────────────────────────────────┤
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                                                             │
│▓ SIDEBAR ▓▓▓▓│   Welcome back, Myers!                                      │
│▓ (charcoal)▓▓│   ─────────────────────                                     │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                                                             │
│               │   [✦✦✦✦✦✦ + NEW QUOTE ✦✦✦✦✦✦]                               │
│  ◈ Dashboard  │   (large teal gradient button with glow)                    │
│    (active,   │                                                             │
│     teal bg)  │   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│               │   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│  ◇ Quotes     │   │   2 / 25        │ │    $4,250       │ │    $127,800     │
│               │   │   ═══════       │ │    ═══════      │ │    ═══════      │
│  ◇ Settings   │   │   QUOTES USED   │ │   THIS MONTH    │ │   TOTAL VALUE   │
│               │   │   ████████░░░░  │ │    ↑ 23%        │ │    all time     │
│  ◇ Billing    │   │   (teal bar)    │ │    (green ↑)    │ │    (teal)       │
│               │   │                 │ │                 │ │                 │
│  ─────────────│   │ (dark card,     │ │ (dark card,     │ │ (dark card,     │
│               │   │  teal accent)   │ │  green accent)  │ │  blue accent)   │
│  PLAN         │   └─────────────────┘ └─────────────────┘ └─────────────────┘
│  ───────      │                                                             │
│  ⭐ Starter   │   RECENT QUOTES                                             │
│  $20/mo       │   ═══════════════                                           │
│               │                                                             │
│  [Upgrade ↑]  │   ┌─────────────────────────────────────────────────────────┐
│  (teal btn)   │   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│               │   │  Corporate AV - Marriott Ballroom              $8,450  │
│               │   │  📅 Dec 10, 2025   🏷️ Rental       ● Draft     [View →]│
│               │   │  (subtle teal left border)                 (amber dot) │
│               │   └─────────────────────────────────────────────────────────┘
│               │                                                             │
│               │   ┌─────────────────────────────────────────────────────────┐
│               │   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│               │   │  Wedding Reception - Oak Manor                 $3,200  │
│               │   │  📅 Dec 8, 2025    🏷️ Rental       ✓ Sent      [View →]│
│               │   │  (subtle green left border)                (green ✓)   │
│               │   └─────────────────────────────────────────────────────────┘
│               │                                                             │
│               │   ┌─────────────────────────────────────────────────────────┐
│               │   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│               │   │  Conference Install - TechCorp HQ             $12,800  │
│               │   │  📅 Dec 5, 2025    🏷️ Install      ✓ Accepted  [View →]│
│               │   │  (subtle blue left border)                 (teal ✓)    │
│               │   └─────────────────────────────────────────────────────────┘
│               │                                                             │
│               │                    View All Quotes → (teal link)            │
│               │                                                             │
└───────────────┴─────────────────────────────────────────────────────────────┘
```

---

## 4. New Quote - Multi-Step Form

### Step 1: Quote Type
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ NAVY BACKGROUND ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                                                             │
│  ← Back to Dashboard                                                        │
│                                                                             │
│  NEW QUOTE                                                                  │
│  ══════════                                                                 │
│                                                                             │
│  Step 1 of 4: What type of quote?                                           │
│                                                                             │
│  ●━━━━━━━○━━━━━━━○━━━━━━━○   (progress: teal filled, gray empty)            │
│  Type    Event   Gear    Review                                             │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐      │
│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│      │
│  │                 │  │                 │  │                         │      │
│  │   🎤 RENTAL     │  │   🔧 INSTALL    │  │   🎬 FULL PRODUCTION    │      │
│  │   ─────────     │  │   ─────────     │  │   ─────────────────     │      │
│  │                 │  │                 │  │                         │      │
│  │  Equipment      │  │  Permanent      │  │  Complete package:      │      │
│  │  rental for     │  │  installation   │  │  gear + labor + crew    │      │
│  │  events         │  │  or service     │  │  + travel               │      │
│  │                 │  │                 │  │                         │      │
│  │  (dark card,    │  │  (dark card,    │  │  (dark card,            │      │
│  │   teal border   │  │   hover glow)   │  │   hover glow)           │      │
│  │   when selected)│  │                 │  │                         │      │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘      │
│                                                                             │
│                                                [Next →] (teal gradient)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Step 2: Event Details
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ NAVY BACKGROUND ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                                                             │
│  Step 2 of 4: Tell us about the event                                       │
│                                                                             │
│  ●━━━━━━━●━━━━━━━○━━━━━━━○                                                  │
│  ✓       Event   Gear    Review                                             │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ FORM CARD ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │
│  │                                                                       │  │
│  │  Event Name                                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────┐      │  │
│  │  │ Annual Sales Conference 2025                                │      │  │
│  │  └─────────────────────────────────────────────────────────────┘      │  │
│  │  (dark input, teal focus ring)                                        │  │
│  │                                                                       │  │
│  │  Event Type                        Venue Size                         │  │
│  │  ┌───────────────────┐             ┌───────────────────┐              │  │
│  │  │ Corporate       ▼ │             │ 500 attendees     │              │  │
│  │  └───────────────────┘             └───────────────────┘              │  │
│  │                                                                       │  │
│  │  Venue Name                                                           │  │
│  │  ┌─────────────────────────────────────────────────────────────┐      │  │
│  │  │ Marriott Downtown Grand Ballroom                            │      │  │
│  │  └─────────────────────────────────────────────────────────────┘      │  │
│  │                                                                       │  │
│  │  Start Date            End Date            Setup     Strike           │  │
│  │  ┌────────────┐        ┌────────────┐      ┌────┐    ┌────┐           │  │
│  │  │ 01/15/25   │        │ 01/17/25   │      │ 1  │    │ 1  │           │  │
│  │  └────────────┘        └────────────┘      └────┘    └────┘           │  │
│  │                                                                       │  │
│  │  Notes (optional)                                                     │  │
│  │  ┌─────────────────────────────────────────────────────────────┐      │  │
│  │  │ Main stage + 3 breakout rooms. Client wants premium look.   │      │  │
│  │  │ Budget approximately $15k.                                  │      │  │
│  │  └─────────────────────────────────────────────────────────────┘      │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│                               [← Back] (ghost)  [Next →] (teal gradient)    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Step 3: Equipment Categories
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ NAVY BACKGROUND ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                                                             │
│  Step 3 of 4: What do they need?                                            │
│                                                                             │
│  ●━━━━━━━●━━━━━━━●━━━━━━━○                                                  │
│  ✓       ✓       Gear    Review                                             │
│                                                                             │
│  Select equipment categories needed:                                        │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │▓▓ ☑ AUDIO ▓▓▓▓▓│  │▓▓ ☑ VIDEO ▓▓▓▓▓│  │▓▓ ☑ LIGHTING ▓▓│              │
│  │   ─────────     │  │   ─────────     │  │   ─────────     │              │
│  │  Speakers,      │  │  Projectors,    │  │  Stage wash,    │              │
│  │  mics, mixers   │  │  screens, cams  │  │  spots, effects │              │
│  │  (teal border,  │  │  (teal border,  │  │  (teal border,  │              │
│  │   teal check)   │  │   teal check)   │  │   teal check)   │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │▓▓ ☐ STAGING ▓▓▓│  │▓▓ ☐ POWER ▓▓▓▓▓│  │▓▓ ☐ COMMS ▓▓▓▓▓│              │
│  │   ─────────     │  │   ─────────     │  │   ─────────     │              │
│  │  Risers,        │  │  Distro,        │  │  Intercom,      │              │
│  │  backdrop       │  │  generators     │  │  walkies        │              │
│  │  (gray border)  │  │  (gray border)  │  │  (gray border)  │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                             │
│  Budget Range (optional)                                                    │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │ $10,000 - $20,000                                           │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                             │
│  Specific requests (optional)                                               │
│  ┌─────────────────────────────────────────────────────────────┐            │
│  │ L'Acoustics preferred. Need 2 PTZ cameras.                  │            │
│  └─────────────────────────────────────────────────────────────┘            │
│                                                                             │
│                  [← Back] (ghost)  [✦ Generate Quote ✦] (teal gradient)     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Loading State
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ NAVY BACKGROUND ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                                                             │
│                                                                             │
│                                                                             │
│                        ┌─────────────────────────────┐                      │
│                        │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                      │
│                        │                             │                      │
│                        │     ◠ ◡ ◠ ◡ ◠ (teal)       │                      │
│                        │    (animated spinner)       │                      │
│                        │                             │                      │
│                        │  🤖 AI is building your     │                      │
│                        │     quote...                │                      │
│                        │                             │                      │
│                        │  Analyzing requirements  ✓  │ (green check)        │
│                        │  Selecting equipment     ✓  │ (green check)        │
│                        │  Calculating pricing    ●   │ (teal pulse)         │
│                        │  Formatting output          │ (gray)               │
│                        │                             │                      │
│                        │  Usually takes 10-30 sec    │                      │
│                        │                             │                      │
│                        │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                      │
│                        └─────────────────────────────┘                      │
│                        (dark card, centered)                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Quote Preview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ NAVY BACKGROUND ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                                                             │
│  ← Back to Dashboard                                                        │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ QUOTE CARD ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │
│  │                                                                       │  │
│  │  QUOTE #QM-2025-0042                    [✏️ Edit] [📄 PDF] [📧 Email] │  │
│  │  ══════════════════════                 (teal ghost buttons)          │  │
│  │                                                                       │  │
│  │  Annual Sales Conference 2025                                         │  │
│  │  Marriott Downtown Grand Ballroom                                     │  │
│  │  Jan 15-17, 2025 (3 days + 1 setup + 1 strike)                        │  │
│  │                                                                       │  │
│  │  Status: ● Draft (amber)     Created: Dec 12, 2025                    │  │
│  │                                                                       │  │
│  │  ─────────────────────────────────────────────────────────────────    │  │
│  │                                                                       │  │
│  │  AUDIO                                               (teal accent)    │  │
│  │  ═════                                                                │  │
│  │  L'Acoustics A10 Line Array (8)      5 days              $2,400       │  │
│  │  L'Acoustics SB18 Subs (4)           5 days              $1,200       │  │
│  │  Yamaha CL5 Console                  5 days                $750       │  │
│  │  Shure ULXD Wireless (8)             5 days                $800       │  │
│  │  Shure SM58 (12)                     5 days                $180       │  │
│  │                                             ─────────────────────     │  │
│  │                                             Subtotal:      $5,330     │  │
│  │                                                                       │  │
│  │  VIDEO                                               (blue accent)    │  │
│  │  ═════                                                                │  │
│  │  Panasonic PT-RZ120 Projector (2)    5 days              $2,000       │  │
│  │  Da-Lite 16x9 Screen (2)             5 days                $600       │  │
│  │  PTZ Camera System (2)               5 days                $800       │  │
│  │  Blackmagic ATEM Mini Extreme        5 days                $400       │  │
│  │                                             ─────────────────────     │  │
│  │                                             Subtotal:      $3,800     │  │
│  │                                                                       │  │
│  │  LIGHTING                                            (green accent)   │  │
│  │  ════════                                                             │  │
│  │  ETC Source Four (12)                5 days                $720       │  │
│  │  Chauvet Rogue R2 Wash (8)           5 days              $1,200       │  │
│  │  GrandMA2 onPC + Wing                5 days                $500       │  │
│  │  Truss Package (40ft)                5 days                $800       │  │
│  │                                             ─────────────────────     │  │
│  │                                             Subtotal:      $3,220     │  │
│  │                                                                       │  │
│  │  ─────────────────────────────────────────────────────────────────    │  │
│  │                                                                       │  │
│  │                                       Subtotal:          $12,350      │  │
│  │                                       Tax (8.25%):        $1,019      │  │
│  │                                       ════════════════════════════    │  │
│  │                                       TOTAL:             $13,369      │  │
│  │                                       (large, teal, monospace)        │  │
│  │                                                                       │  │
│  │  ─────────────────────────────────────────────────────────────────    │  │
│  │                                                                       │  │
│  │  NOTES                                                                │  │
│  │  • Pricing based on 5-day rental (3 show + 2 L/I)                     │  │
│  │  • Delivery and pickup included within 25 miles                       │  │
│  │  • Technician available at $65/hr if needed                           │  │
│  │                                                                       │  │
│  │  TERMS                                                                │  │
│  │  • 50% deposit required to confirm                                    │  │
│  │  • Balance due on delivery                                            │  │
│  │  • Quote valid until: Jan 1, 2025                                     │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │ 📄 Download PDF │  │ 📧 Email Client │  │ ✏️  Edit Quote  │              │
│  │  (teal btn)     │  │  (green btn)    │  │  (ghost btn)    │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Settings

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ NAVY BACKGROUND ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│                                                                             │
│  [◇] QuoteMyAV       🔍 Search...                        ○ Myers ▼  [?]     │
│                                                                             │
├───────────────┬─────────────────────────────────────────────────────────────┤
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓│                                                             │
│▓ SIDEBAR ▓▓▓▓│  SETTINGS                                                   │
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  ════════                                                   │
│               │                                                             │
│  ◇ Dashboard  │  ┌───────────────────────────────────────────────────────┐  │
│               │  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │
│  ◇ Quotes     │  │                                                       │  │
│               │  │  PROFILE                                              │  │
│  ◈ Settings   │  │  ═══════                                              │  │
│    (active,   │  │                                                       │  │
│     teal)     │  │  Company Name                                         │  │
│               │  │  ┌─────────────────────────────────────────────────┐  │  │
│  ◇ Billing    │  │  │ Acme AV Productions                             │  │  │
│               │  │  └─────────────────────────────────────────────────┘  │  │
│               │  │  (dark input, teal focus)                             │  │
│  ─────────────│  │                                                       │  │
│               │  │  Email                        Phone                   │  │
│  PLAN         │  │  ┌────────────────────┐       ┌────────────────────┐  │  │
│  ⭐ Starter   │  │  │ myers@acmeav.com   │       │ (555) 123-4567     │  │  │
│  $20/mo       │  │  └────────────────────┘       └────────────────────┘  │  │
│               │  │                                                       │  │
│               │  │                                    [Save] (teal btn)  │  │
│               │  │                                                       │  │
│               │  └───────────────────────────────────────────────────────┘  │
│               │                                                             │
│               │  ┌───────────────────────────────────────────────────────┐  │
│               │  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │
│               │  │                                                       │  │
│               │  │  QUOTE DEFAULTS                                       │  │
│               │  │  ══════════════                                       │  │
│               │  │                                                       │  │
│               │  │  Tax Rate        Valid Days        Payment Terms      │  │
│               │  │  ┌────────┐      ┌────────┐        ┌────────────────┐ │  │
│               │  │  │ 8.25%  │      │ 30     │        │ 50% deposit    │ │  │
│               │  │  └────────┘      └────────┘        └────────────────┘ │  │
│               │  │                                                       │  │
│               │  │                                    [Save] (teal btn)  │  │
│               │  │                                                       │  │
│               │  └───────────────────────────────────────────────────────┘  │
│               │                                                             │
│               │  ┌───────────────────────────────────────────────────────┐  │
│               │  │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  │
│               │  │                                                       │  │
│               │  │  SUBSCRIPTION                              ⭐ Starter │  │
│               │  │  ════════════                                         │  │
│               │  │                                                       │  │
│               │  │  Plan: Starter ($20/mo)                               │  │
│               │  │  Next billing: Jan 12, 2025                           │  │
│               │  │  Quotes used: 2 / 25   ████████░░░░ (teal bar)        │  │
│               │  │                                                       │  │
│               │  │  [✦ Upgrade to Pro ✦]  [Manage Billing]  [Cancel]     │  │
│               │  │   (teal gradient)       (ghost)           (red ghost) │  │
│               │  │                                                       │  │
│               │  └───────────────────────────────────────────────────────┘  │
│               │                                                             │
└───────────────┴─────────────────────────────────────────────────────────────┘
```

---

## User Flow

```
Landing Page
     │
     ▼
[Sign Up] ──────▶ Dashboard
     │                │
     │                ▼
     │         [+ New Quote]
     │                │
     │                ▼
     │         Step 1: Type
     │                │
     │                ▼
     │         Step 2: Event Details
     │                │
     │                ▼
     │         Step 3: Equipment
     │                │
     │                ▼
     │         AI Generates...
     │                │
     │                ▼
     │         Quote Preview
     │                │
     │    ┌───────────┼───────────┐
     │    ▼           ▼           ▼
     │  [Edit]    [Download]  [Email]
     │                │
     │                ▼
     │         Dashboard (quote saved)
     │
     └──────▶ Login (returning user)
```

---

## Component Checklist

**Layout:**
- [ ] Navbar
- [ ] Sidebar
- [ ] Footer
- [ ] PageContainer

**UI Elements:**
- [ ] Button (primary gradient, secondary, ghost)
- [ ] Input (text, select, textarea)
- [ ] Card
- [ ] Badge (status colors)
- [ ] Progress bar
- [ ] Checkbox card
- [ ] Stepper

**Quote Components:**
- [ ] QuoteTypeSelector
- [ ] EventDetailsForm
- [ ] EquipmentCategoryPicker
- [ ] QuoteLineItem
- [ ] QuoteSummary
- [ ] QuoteActions

**Dashboard:**
- [ ] StatsCard
- [ ] QuoteListItem
- [ ] UsageBar
