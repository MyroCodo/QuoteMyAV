# QuoteMyAV - UX Animations & Onboarding Guide

## Animation Philosophy

**Principles:**
- Purposeful, not flashy - every animation communicates something
- Fast but noticeable (200-400ms for most, 600ms max for emphasis)
- Consistent direction: content enters from right/bottom, exits left/top
- Teal glow = success, Amber pulse = attention needed

**Library:** Framer Motion (React) - lightweight, powerful, easy

---

## 1. Page Transitions

### Portal/Swoosh Effect
When navigating between main pages, content "portals" - scales down slightly while fading, then new content scales up from center.

```
Current Page                    New Page
┌─────────────┐                ┌─────────────┐
│             │                │      ·      │
│   Content   │  ──portal──▶   │     /│\     │
│             │                │    / │ \    │
│             │                │   (expand)  │
└─────────────┘                └─────────────┘

Animation sequence:
1. Current page: scale(1) → scale(0.95), opacity(1) → opacity(0)  [200ms]
2. Brief pause [50ms]
3. New page: scale(0.95) → scale(1), opacity(0) → opacity(1)  [250ms]
```

### Slide Transitions (for related content)
- Quote form steps: slide left/right based on direction
- Sidebar panels: slide in from left
- Modals: scale up from click origin point

```javascript
// Framer Motion variants
const pageVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

const slideVariants = {
  enterRight: { x: 100, opacity: 0 },
  enterLeft: { x: -100, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exitLeft: { x: -100, opacity: 0 },
  exitRight: { x: 100, opacity: 0 }
};
```

---

## 2. Micro-Interactions

### Buttons

**Primary (Teal Gradient):**
```
Idle        → Hover         → Click        → Release
[Button]    → [Button]      → [Button]     → [Button]
             glow expands    scale(0.97)    ripple out
             brightness+10%  glow pulse     scale(1)
```

**Ghost Buttons:**
```
Idle        → Hover         → Click
[----]      → [====]        → [████]
border      → fill 20%      → fill 40%
             teal tint       quick flash
```

### Form Inputs

**Focus Animation:**
```
Unfocused                    Focused
┌─────────────────────┐      ┌─────────────────────┐
│ Placeholder...      │  →   │ |                   │
└─────────────────────┘      └─────────────────────┘
 gray border                  teal border
                              teal glow (0 4px 12px)
                              label floats up
```

**Validation:**
```
Valid                        Invalid
┌─────────────────────┐      ┌─────────────────────┐
│ user@email.com    ✓ │      │ invalid@@         ✗ │
└─────────────────────┘      └─────────────────────┘
 green border                 red border
 checkmark fades in           shake animation (3x)
                              error slides down
```

### Cards

**Quote Card Hover:**
```
Idle                         Hover
┌─────────────────────┐      ┌─────────────────────┐
│ Quote #123          │      │ Quote #123          │
│ $4,500              │  →   │ $4,500         [→]  │
│                     │      │                     │
└─────────────────────┘      └─────────────────────┘
 translateY(0)                translateY(-4px)
 shadow: subtle               shadow: larger, teal tint
                              arrow slides in from right
```

**Selection Cards (Quote Type):**
```
Unselected                   Selected
┌─────────────────────┐      ╔═════════════════════╗
│                     │      ║                     ║
│   🎤 RENTAL         │  →   ║   🎤 RENTAL    ✓   ║
│                     │      ║                     ║
└─────────────────────┘      ╚═════════════════════╝
 gray border                  teal border (2px)
                              teal glow
                              checkmark scales in
                              slight scale(1.02)
```

---

## 3. Success/Action Animations

### Quote Generated - "Swoosh Send" Effect
When AI finishes generating quote:

```
Step 1: Card appears           Step 2: Success burst         Step 3: Settle
         ·                            ✨
        /|\                          ╱│╲                    ┌─────────────┐
       / | \                        ╱ │ ╲                   │  QUOTE      │
      (scales up)                  (particles)              │  READY!     │
                                   radiate out              └─────────────┘
                                                            (gentle bounce)

Duration: 800ms total
- Card scales from 0.8 → 1.05 → 1.0 (bounce ease)
- Teal particles burst from center
- Checkmark draws itself (SVG path animation)
```

### PDF Export - "Fly Away" Effect
When user downloads PDF:

```
┌─────────────┐
│  📄 Quote   │        📄
│             │  →      ↗    →    📄 ✨ (flies to corner)
│             │           ↗
└─────────────┘

Animation:
1. PDF icon appears at button location
2. Icon scales up slightly (1.2x)
3. Arcs upward and to the right (bezier curve)
4. Shrinks as it flies
5. Disappears with sparkle at screen edge
6. Toast notification slides in: "PDF downloaded!"
```

### Email Sent - "Envelope Seal" Effect
When quote is emailed:

```
Step 1: Envelope open       Step 2: Paper slides in    Step 3: Seal & fly
    ╱╲                          ╱╲                         ╱╲
   ╱  ╲                        ╱░░╲                       ╱██╲  ✉️→
  │    │                      │░░░░│                     │████│
  │    │                      │░░░░│                     sealed!
  └────┘                      └────┘

Duration: 1000ms
- Envelope flap opens
- Quote paper slides into envelope
- Flap closes, seal appears (teal wax stamp effect)
- Envelope shrinks and flies off right
- Toast: "Quote sent to client@email.com"
```

### Quote Status Change
When marking quote as Sent/Accepted:

```
● Draft  →  ✓ Sent

Animation:
1. Old status fades out with slight left movement
2. New status badge scales in from 0 with bounce
3. Subtle confetti burst for "Accepted" status
4. Row briefly highlights with green tint
```

---

## 4. Loading States

### AI Generating Quote - Animated Steps
```
┌─────────────────────────────────────┐
│                                     │
│     🤖 Building your quote...       │
│                                     │
│     Analyzing requirements    [✓]   │  ← checkmark draws in
│     Selecting equipment       [✓]   │  ← 400ms delay
│     Calculating pricing       [●]   │  ← pulsing dot
│     Formatting output         [ ]   │  ← waiting (gray)
│                                     │
│     ════════════░░░░░░░░░░░░░       │  ← progress bar fills
│                                     │
└─────────────────────────────────────┘

Progress bar: Gradient fill (blue → teal → green) with shimmer effect
Each step: Checkmark SVG draws itself when complete
Current step: Dot pulses with teal glow
```

### Skeleton Loading (Dashboard)
```
┌─────────────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓░░░░  ▓▓▓▓░░░  ▓▓▓▓▓░░░  │  ← shimmer sweeps left to right
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░ │    │
│  │ ▓▓▓▓▓▓░░░░░░               │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░ │    │
│  │ ▓▓▓▓░░░░░░                 │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘

Shimmer: Linear gradient that slides across (2s loop)
Color: #334155 base, #475569 shimmer highlight
```

---

## 5. Onboarding Walkthrough

### First-Time User Flow

**Trigger:** User signs up → lands on Dashboard → Onboarding starts automatically

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                     │   │
│  │     👋 Welcome to QuoteMyAV!                                        │   │
│  │                                                                     │   │
│  │     Let's take a quick tour to get you started.                     │   │
│  │     This will only take 60 seconds.                                 │   │
│  │                                                                     │   │
│  │     [Skip Tour]              [✦ Let's Go! ✦]                        │   │
│  │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  (background: Dashboard dimmed to 40% opacity)                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tour Steps (5 total)

**Step 1: New Quote Button**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ╭──────────────────────────────────────╮                                  │
│   │  [✦✦✦✦ + NEW QUOTE ✦✦✦✦]  ←─────────┼──── Start here!                  │
│   ╰──────────────────────────────────────╯     Click this button to         │
│       ↑ spotlight (everything else dimmed)     create your first quote.     │
│                                                                             │
│                                           ○ ○ ○ ○ ○   [Next →]              │
│                                           1 2 3 4 5                         │
└─────────────────────────────────────────────────────────────────────────────┘

Animation:
- Button pulses with teal glow
- Tooltip card slides in from right
- Spotlight effect (radial gradient mask)
```

**Step 2: Quote Form**
```
"Fill in event details, select equipment categories, and let AI do the rest."
- Highlight: Form area
- Show: Quick preview of form fields
```

**Step 3: AI Generation**
```
"Our AI analyzes your requirements and generates a detailed quote in seconds."
- Highlight: Generate button area
- Show: Brief animation preview of loading state
```

**Step 4: Quote Preview**
```
"Review your quote, make edits, then download as PDF or email directly."
- Highlight: Action buttons area
- Show: Sample quote card
```

**Step 5: Dashboard**
```
"Track all your quotes here. See usage, history, and quick stats."
- Highlight: Stats cards + quote list
- CTA: "Create Your First Quote!"
```

### Tooltip Element Anatomy
```
                                    ╭─────────────────────────────────╮
                                    │  💡 Pro Tip                     │
   ┌─────────────────────┐         │                                 │
   │  Highlighted        │◄────────│  Add specific equipment         │
   │  Element            │         │  requests in the notes field    │
   │                     │         │  for more accurate quotes.      │
   └─────────────────────┘         │                                 │
                                    │  ○○●○○        [Got it]         │
                                    ╰─────────────────────────────────╯
                                              ▲
                                         arrow points
                                         to element

Tooltip styling:
- Background: #1E293B (charcoal)
- Border: 1px solid #334155
- Arrow: CSS triangle pointing to element
- Max-width: 280px
- Entrance: Scale from 0.9 + fade in
```

---

## 6. Persistent Tooltips (Post-Onboarding)

### Tooltip Trigger Points
After completing onboarding, subtle help icons appear:

```
Dashboard:
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   QUOTES USED [?]        THIS MONTH [?]        TOTAL [?]        │
│      2 / 25                 $4,250               $127k          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

[?] = Small teal circle, appears on hover near label
Click = Shows tooltip with explanation
```

### Tooltip Content Map

| Element | Tooltip Text |
|---------|-------------|
| Quotes Used | "Your monthly quote allowance. Resets on your billing date." |
| This Month | "Total value of quotes generated this billing period." |
| Total Value | "Lifetime value of all quotes you've created." |
| Quote Status: Draft | "Quote is saved but not sent. Click to edit or send." |
| Quote Status: Sent | "Quote was emailed to client. Awaiting response." |
| Quote Status: Accepted | "Client accepted this quote. Congrats! 🎉" |
| Budget Range | "Optional. Helps AI match equipment to your target price." |
| Specific Requests | "Mention preferred brands, quantities, or special requirements." |

### Settings Toggle
```
┌─────────────────────────────────────────────────────────────────┐
│  PREFERENCES                                                    │
│                                                                 │
│  Show helpful tooltips    [████ ON]     ← toggle switch        │
│                                                                 │
│  Replay onboarding tour   [Start Tour]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Toast Notifications

### Position & Styling
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                                                                             │
│                                                                             │
│                                                                             │
│                                                                             │
│                                                                             │
│                                                                             │
│                                                    ┌─────────────────────┐  │
│                                                    │ ✓ Quote saved       │  │
│                                                    │                     │  │
│                                                    └─────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                                     ↑ Bottom-right corner
                                                       16px from edges
```

### Toast Types

**Success (Green accent):**
```
┌─────────────────────────────────────┐
│ ✓  Quote saved successfully         │
└─────────────────────────────────────┘
```

**Info (Teal accent):**
```
┌─────────────────────────────────────┐
│ ℹ️  PDF downloading...               │
└─────────────────────────────────────┘
```

**Warning (Amber accent):**
```
┌─────────────────────────────────────┐
│ ⚠️  You have 1 quote remaining       │
└─────────────────────────────────────┘
```

**Error (Red accent):**
```
┌─────────────────────────────────────┐
│ ✗  Failed to send email. Retry?     │
└─────────────────────────────────────┘
```

### Animation
```
Enter: slideInRight + fadeIn (300ms)
Stay: 4 seconds (or until dismissed)
Exit: slideOutRight + fadeOut (200ms)

Stacking: New toasts push older ones up
Max visible: 3 (older ones auto-dismiss)
```

---

## 8. Empty States

### No Quotes Yet
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                                                                             │
│                              📝                                             │
│                           (bouncing)                                        │
│                                                                             │
│                    No quotes yet!                                           │
│                                                                             │
│            Create your first quote and watch the magic happen.              │
│                                                                             │
│                    [✦ Create Your First Quote ✦]                            │
│                                                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘

Animation:
- Icon has subtle bounce (translateY loop)
- Button has gentle pulse glow
- Background has floating particles (very subtle)
```

---

## 9. Animation Timing Reference

| Animation | Duration | Easing |
|-----------|----------|--------|
| Page transition | 250ms | ease-out |
| Button hover | 150ms | ease |
| Button click | 100ms | ease-in |
| Card hover lift | 200ms | ease-out |
| Form field focus | 200ms | ease |
| Toast enter | 300ms | ease-out |
| Toast exit | 200ms | ease-in |
| Modal open | 250ms | spring(1, 0.9) |
| Modal close | 200ms | ease-in |
| Success burst | 600ms | ease-out |
| Fly-away icon | 800ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Skeleton shimmer | 2000ms | linear (loop) |
| Tooltip appear | 150ms | ease-out |
| Onboarding spotlight | 400ms | ease |

---

## 10. Implementation Checklist

### Framer Motion Setup
- [ ] Install: `npm install framer-motion`
- [ ] Create `src/lib/animations.js` with shared variants
- [ ] Wrap app in `<AnimatePresence>` for page transitions

### Components to Animate
- [ ] Button (hover, click, loading states)
- [ ] Card (hover lift, selection)
- [ ] Input (focus, validation)
- [ ] Toast (enter, exit, stack)
- [ ] Modal (open, close)
- [ ] PageWrapper (transitions)
- [ ] Skeleton (shimmer)
- [ ] ProgressSteps (checkmark draw)

### Onboarding System
- [ ] Create `useOnboarding` hook (tracks completion)
- [ ] Create `TourOverlay` component
- [ ] Create `Tooltip` component (reusable)
- [ ] Create `Spotlight` component (highlight effect)
- [ ] Store completion in localStorage + Supabase
- [ ] Add "Replay Tour" button in Settings

### Success Animations
- [ ] Create `SuccessBurst` component (particles)
- [ ] Create `FlyAwayIcon` component (PDF/email)
- [ ] Create `ConfettiPop` component (accepted quotes)

---

## Code Snippets

### Page Transition Wrapper
```jsx
// src/components/PageWrapper.jsx
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

export function PageWrapper({ children }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
```

### Fly Away Animation
```jsx
// src/components/FlyAwayIcon.jsx
import { motion } from 'framer-motion';

export function FlyAwayIcon({ icon, onComplete }) {
  return (
    <motion.div
      initial={{ scale: 1, x: 0, y: 0, opacity: 1 }}
      animate={{
        scale: [1, 1.2, 0.3],
        x: [0, 50, 200],
        y: [0, -30, -100],
        opacity: [1, 1, 0],
      }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      onAnimationComplete={onComplete}
      className="fixed pointer-events-none z-50"
    >
      {icon}
    </motion.div>
  );
}
```

### Onboarding Hook
```jsx
// src/hooks/useOnboarding.js
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useOnboarding() {
  const [step, setStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showTooltips, setShowTooltips] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem('onboarding_complete');
    if (!completed) {
      setIsActive(true);
    }
  }, []);

  const completeOnboarding = async () => {
    setIsActive(false);
    localStorage.setItem('onboarding_complete', 'true');
    // Also save to Supabase for cross-device sync
    await supabase.from('user_preferences').upsert({
      onboarding_complete: true,
      show_tooltips: true
    });
  };

  const restartTour = () => {
    setStep(0);
    setIsActive(true);
  };

  return {
    step,
    setStep,
    isActive,
    showTooltips,
    setShowTooltips,
    completeOnboarding,
    restartTour
  };
}
```
