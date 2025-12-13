# QuoteMyAV Design Tokens

**Version:** 1.0.0
**Last Updated:** 2025-12-12

This document defines the complete design system for QuoteMyAV, a dark-themed SaaS platform for AV professionals.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing System](#spacing-system)
4. [Border Radius](#border-radius)
5. [Shadows & Glows](#shadows--glows)
6. [Component Tokens](#component-tokens)
7. [Animation & Transitions](#animation--transitions)
8. [Breakpoints](#breakpoints)
9. [Usage Guidelines](#usage-guidelines)

---

## Color Palette

### Brand Colors

```css
--color-primary: #14B8A6;          /* Teal - Primary brand color */
--color-primary-light: #2DD4BF;    /* Light teal - Hover states */
--color-primary-dark: #0D9488;     /* Dark teal - Active states */

--color-secondary: #3B82F6;        /* Electric Blue - Secondary actions */
--color-secondary-light: #60A5FA;  /* Light blue - Hover states */
--color-secondary-dark: #2563EB;   /* Dark blue - Active states */

--color-accent: #10B981;           /* Emerald Green - Accents */
--color-accent-light: #34D399;     /* Light emerald - Hover states */
--color-accent-dark: #059669;      /* Dark emerald - Active states */
```

### Semantic Colors

```css
--color-success: #10B981;          /* Emerald - Success states */
--color-warning: #F59E0B;          /* Amber - Warning states */
--color-error: #EF4444;            /* Red - Error states */
--color-info: #3B82F6;             /* Blue - Info states */
```

### Background Colors

```css
--color-bg-primary: #0F172A;       /* Navy - Main background */
--color-bg-secondary: #1E293B;     /* Charcoal - Secondary background */
--color-bg-tertiary: #334155;      /* Dark Slate - Card backgrounds */
--color-bg-elevated: #475569;      /* Lighter slate - Elevated elements */

--color-bg-overlay: rgba(15, 23, 42, 0.8);      /* Modal overlays */
--color-bg-hover: rgba(20, 184, 166, 0.1);      /* Hover backgrounds */
--color-bg-active: rgba(20, 184, 166, 0.2);     /* Active backgrounds */
```

### Text Colors

```css
--color-text-primary: #F8FAFC;     /* White - Primary text */
--color-text-secondary: #94A3B8;   /* Slate Gray - Secondary text */
--color-text-tertiary: #64748B;    /* Darker slate - Tertiary text */
--color-text-disabled: #475569;    /* Disabled text */
--color-text-inverse: #0F172A;     /* Text on light backgrounds */

--color-text-brand: #14B8A6;       /* Teal - Brand text (prices, etc) */
--color-text-success: #34D399;     /* Success text */
--color-text-warning: #FCD34D;     /* Warning text */
--color-text-error: #F87171;       /* Error text */
```

### Border Colors

```css
--color-border-default: #334155;   /* Default borders */
--color-border-light: #475569;     /* Light borders */
--color-border-heavy: #64748B;     /* Heavy borders */
--color-border-primary: #14B8A6;   /* Primary brand borders */
--color-border-focus: #3B82F6;     /* Focus state borders */
--color-border-error: #EF4444;     /* Error state borders */
```

### Gradient Colors

```css
--gradient-hero: linear-gradient(135deg, #3B82F6 0%, #14B8A6 50%, #10B981 100%);
--gradient-card: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(20, 184, 166, 0.1) 100%);
--gradient-glow: radial-gradient(circle at center, rgba(20, 184, 166, 0.3) 0%, transparent 70%);
```

---

## Typography

### Font Families

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

### Font Sizes

```css
--text-xs: 0.75rem;      /* 12px - Captions, labels */
--text-sm: 0.875rem;     /* 14px - Small body text */
--text-base: 1rem;       /* 16px - Body text */
--text-lg: 1.125rem;     /* 18px - Large body text */
--text-xl: 1.25rem;      /* 20px - Section headings */
--text-2xl: 1.5rem;      /* 24px - Page headings */
--text-3xl: 1.875rem;    /* 30px - Feature headings */
--text-4xl: 2.25rem;     /* 36px - Hero headings */
--text-5xl: 3rem;        /* 48px - Display headings */
--text-6xl: 3.75rem;     /* 60px - Large display */
```

### Font Weights

```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Line Heights

```css
--leading-none: 1;
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

### Letter Spacing

```css
--tracking-tighter: -0.05em;
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;
```

---

## Spacing System

**Base unit:** 4px

```css
--space-0: 0;              /* 0px */
--space-1: 0.25rem;        /* 4px */
--space-2: 0.5rem;         /* 8px */
--space-3: 0.75rem;        /* 12px */
--space-4: 1rem;           /* 16px */
--space-5: 1.25rem;        /* 20px */
--space-6: 1.5rem;         /* 24px */
--space-8: 2rem;           /* 32px */
--space-10: 2.5rem;        /* 40px */
--space-12: 3rem;          /* 48px */
--space-16: 4rem;          /* 64px */
--space-20: 5rem;          /* 80px */
--space-24: 6rem;          /* 96px */
--space-32: 8rem;          /* 128px */
```

### Semantic Spacing

```css
--spacing-section: var(--space-16);     /* Between sections */
--spacing-card: var(--space-6);         /* Card padding */
--spacing-element: var(--space-4);      /* Between elements */
--spacing-inline: var(--space-2);       /* Inline elements */
```

---

## Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem;      /* 4px - Small elements */
--radius-base: 0.5rem;     /* 8px - Buttons, inputs */
--radius-md: 0.75rem;      /* 12px - Cards, modals */
--radius-lg: 1rem;         /* 16px - Large cards */
--radius-xl: 1.5rem;       /* 24px - Hero cards */
--radius-2xl: 2rem;        /* 32px - Special elements */
--radius-full: 9999px;     /* Pills, circles */
```

---

## Shadows & Glows

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-base: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

### Glows (Box Shadows)

```css
--glow-primary: 0 0 20px rgba(20, 184, 166, 0.3);
--glow-primary-sm: 0 0 10px rgba(20, 184, 166, 0.2);
--glow-primary-lg: 0 0 30px rgba(20, 184, 166, 0.4);

--glow-secondary: 0 0 20px rgba(59, 130, 246, 0.3);
--glow-accent: 0 0 20px rgba(16, 185, 129, 0.3);

--glow-hover: 0 0 15px rgba(20, 184, 166, 0.4);
--glow-focus: 0 0 0 3px rgba(20, 184, 166, 0.2);

--glow-card-border: 0 0 15px rgba(20, 184, 166, 0.15);
```

### Inner Shadows

```css
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
--shadow-inner-lg: inset 0 4px 8px 0 rgba(0, 0, 0, 0.1);
```

---

## Component Tokens

### Buttons

```css
/* Primary Button */
--btn-primary-bg: var(--color-primary);
--btn-primary-bg-hover: var(--color-primary-light);
--btn-primary-bg-active: var(--color-primary-dark);
--btn-primary-text: var(--color-text-primary);
--btn-primary-border: transparent;
--btn-primary-shadow: var(--glow-primary-sm);
--btn-primary-shadow-hover: var(--glow-primary);

/* Secondary Button */
--btn-secondary-bg: var(--color-bg-tertiary);
--btn-secondary-bg-hover: var(--color-bg-elevated);
--btn-secondary-text: var(--color-text-primary);
--btn-secondary-border: var(--color-border-light);
--btn-secondary-shadow: var(--shadow-base);

/* Outline Button */
--btn-outline-bg: transparent;
--btn-outline-bg-hover: var(--color-bg-hover);
--btn-outline-text: var(--color-primary);
--btn-outline-border: var(--color-border-primary);

/* Ghost Button */
--btn-ghost-bg: transparent;
--btn-ghost-bg-hover: var(--color-bg-hover);
--btn-ghost-text: var(--color-text-secondary);
--btn-ghost-text-hover: var(--color-text-primary);

/* Button Sizes */
--btn-height-sm: 2rem;       /* 32px */
--btn-height-base: 2.5rem;   /* 40px */
--btn-height-lg: 3rem;       /* 48px */
--btn-height-xl: 3.5rem;     /* 56px */

--btn-padding-x-sm: var(--space-3);
--btn-padding-x-base: var(--space-4);
--btn-padding-x-lg: var(--space-6);
--btn-padding-x-xl: var(--space-8);

--btn-radius: var(--radius-base);
```

### Inputs & Forms

```css
/* Input Fields */
--input-bg: var(--color-bg-secondary);
--input-bg-hover: var(--color-bg-tertiary);
--input-bg-focus: var(--color-bg-tertiary);
--input-bg-disabled: var(--color-bg-primary);

--input-text: var(--color-text-primary);
--input-text-placeholder: var(--color-text-tertiary);
--input-text-disabled: var(--color-text-disabled);

--input-border: var(--color-border-default);
--input-border-hover: var(--color-border-light);
--input-border-focus: var(--color-border-primary);
--input-border-error: var(--color-border-error);

--input-shadow-focus: var(--glow-focus);
--input-height: 2.5rem;      /* 40px */
--input-padding-x: var(--space-4);
--input-radius: var(--radius-base);

/* Labels */
--label-text: var(--color-text-secondary);
--label-text-required: var(--color-error);
--label-spacing: var(--space-2);

/* Helper Text */
--helper-text: var(--color-text-tertiary);
--helper-text-error: var(--color-text-error);
```

### Cards

```css
--card-bg: var(--color-bg-tertiary);
--card-bg-hover: var(--color-bg-elevated);

--card-border: var(--color-border-default);
--card-border-hover: var(--color-border-primary);

--card-shadow: var(--shadow-base);
--card-shadow-hover: var(--shadow-lg);

--card-glow: var(--glow-card-border);
--card-glow-hover: var(--glow-primary-sm);

--card-padding: var(--space-6);
--card-radius: var(--radius-xl);
```

### Navigation

```css
/* Top Navigation */
--nav-bg: var(--color-bg-secondary);
--nav-border: var(--color-border-default);
--nav-height: 4rem;          /* 64px */
--nav-padding-x: var(--space-6);
--nav-shadow: var(--shadow-md);

/* Nav Links */
--nav-link-text: var(--color-text-secondary);
--nav-link-text-hover: var(--color-text-primary);
--nav-link-text-active: var(--color-primary);
--nav-link-bg-hover: var(--color-bg-hover);

/* Sidebar */
--sidebar-bg: var(--color-bg-secondary);
--sidebar-width: 16rem;      /* 256px */
--sidebar-width-collapsed: 4rem;
```

### Modals & Overlays

```css
--modal-bg: var(--color-bg-tertiary);
--modal-overlay-bg: var(--color-bg-overlay);
--modal-border: var(--color-border-light);
--modal-shadow: var(--shadow-2xl);
--modal-radius: var(--radius-lg);
--modal-padding: var(--space-8);

--modal-width-sm: 24rem;     /* 384px */
--modal-width-base: 32rem;   /* 512px */
--modal-width-lg: 48rem;     /* 768px */
--modal-width-xl: 64rem;     /* 1024px */
```

### Tables

```css
--table-bg: var(--color-bg-tertiary);
--table-border: var(--color-border-default);
--table-row-hover: var(--color-bg-hover);
--table-row-selected: var(--color-bg-active);

--table-header-bg: var(--color-bg-secondary);
--table-header-text: var(--color-text-secondary);

--table-cell-padding-x: var(--space-4);
--table-cell-padding-y: var(--space-3);
```

### Badges & Tags

```css
--badge-height: 1.5rem;      /* 24px */
--badge-padding-x: var(--space-2);
--badge-radius: var(--radius-full);
--badge-text-size: var(--text-xs);

/* Badge Variants */
--badge-primary-bg: rgba(20, 184, 166, 0.15);
--badge-primary-text: var(--color-primary-light);
--badge-primary-border: var(--color-primary);

--badge-success-bg: rgba(16, 185, 129, 0.15);
--badge-success-text: var(--color-accent-light);
--badge-success-border: var(--color-accent);

--badge-warning-bg: rgba(245, 158, 11, 0.15);
--badge-warning-text: #FCD34D;
--badge-warning-border: var(--color-warning);

--badge-error-bg: rgba(239, 68, 68, 0.15);
--badge-error-text: #F87171;
--badge-error-border: var(--color-error);
```

### Tooltips

```css
--tooltip-bg: var(--color-bg-elevated);
--tooltip-text: var(--color-text-primary);
--tooltip-border: var(--color-border-light);
--tooltip-shadow: var(--shadow-lg);
--tooltip-padding-x: var(--space-3);
--tooltip-padding-y: var(--space-2);
--tooltip-radius: var(--radius-base);
--tooltip-max-width: 16rem;
```

### Progress Indicators

```css
--progress-bg: var(--color-bg-secondary);
--progress-fill: var(--color-primary);
--progress-height: 0.5rem;   /* 8px */
--progress-radius: var(--radius-full);

--spinner-color: var(--color-primary);
--spinner-size-sm: 1rem;
--spinner-size-base: 1.5rem;
--spinner-size-lg: 2rem;
```

---

## Animation & Transitions

### Durations

```css
--duration-instant: 0ms;
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--duration-slower: 500ms;
```

### Easing Functions

```css
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Common Transitions

```css
--transition-colors: color var(--duration-base) var(--ease-in-out),
                     background-color var(--duration-base) var(--ease-in-out),
                     border-color var(--duration-base) var(--ease-in-out);

--transition-shadow: box-shadow var(--duration-base) var(--ease-in-out);

--transition-transform: transform var(--duration-base) var(--ease-in-out);

--transition-all: all var(--duration-base) var(--ease-in-out);

--transition-glow: box-shadow var(--duration-slow) var(--ease-in-out);
```

### Hover Effects

```css
--hover-scale: 1.02;
--hover-scale-sm: 1.01;
--hover-scale-lg: 1.05;

--hover-translate-y: -2px;
--hover-brightness: 1.1;
```

---

## Breakpoints

**Mobile-first approach**

```css
/* Breakpoint Values */
--breakpoint-xs: 0px;
--breakpoint-sm: 640px;      /* Small devices (landscape phones) */
--breakpoint-md: 768px;      /* Medium devices (tablets) */
--breakpoint-lg: 1024px;     /* Large devices (laptops) */
--breakpoint-xl: 1280px;     /* Extra large devices (desktops) */
--breakpoint-2xl: 1536px;    /* XXL devices (large desktops) */
```

### Media Queries

```css
/* Min-width (mobile-first) */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }

/* Max-width (desktop-first - use sparingly) */
@media (max-width: 639px) { /* below sm */ }
@media (max-width: 767px) { /* below md */ }
@media (max-width: 1023px) { /* below lg */ }
```

### Container Widths

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

--container-padding: var(--space-4);    /* Mobile */
--container-padding-lg: var(--space-8); /* Desktop */
```

---

## Usage Guidelines

### Color Usage

1. **Backgrounds:**
   - Primary (Navy): Main app background
   - Secondary (Charcoal): Elevated sections, navigation
   - Tertiary (Dark Slate): Cards, modals, raised elements

2. **Text Hierarchy:**
   - Primary (White): Headings, important text
   - Secondary (Slate Gray): Body text, descriptions
   - Tertiary (Darker Slate): Meta info, timestamps
   - Brand (Teal): Prices, key metrics, monospace data

3. **Interactive Elements:**
   - Primary (Teal): Main CTAs, primary actions
   - Secondary (Blue): Secondary actions, links
   - Accent (Green): Success states, confirmations

### Typography Usage

1. **Headings:** Use Inter Bold, white color, generous spacing
2. **Body Text:** Use Inter Regular, slate gray, normal line height
3. **Monospace:** Use JetBrains Mono for prices, codes, technical data (teal color)
4. **Emphasis:** Use teal color or semibold weight, not italic

### Spacing Usage

1. Follow 4px base grid system
2. Use semantic spacing tokens for consistency
3. Maintain generous whitespace in dark themes
4. Increase spacing between sections (--spacing-section)

### Glow Effects

1. **Subtle glow on cards:** Use `--glow-card-border` by default
2. **Hover glow:** Increase to `--glow-primary` on hover
3. **Focus glow:** Use `--glow-focus` for keyboard navigation
4. **Button glow:** Primary buttons get subtle glow by default

### Animation Best Practices

1. Use `--duration-base` (200ms) for most transitions
2. Glow effects use `--duration-slow` (300ms) for smoothness
3. Always use easing functions, never linear (except for indeterminate loaders)
4. Respect `prefers-reduced-motion` for accessibility

### Responsive Design

1. **Mobile-first:** Start with mobile styles, add breakpoints up
2. **Touch targets:** Minimum 44x44px for interactive elements on mobile
3. **Typography:** Scale font sizes up at md breakpoint
4. **Layout:** Stack vertically on mobile, use grid/flex on desktop
5. **Navigation:** Hamburger menu below lg breakpoint

---

## Design System Checklist

When creating new components, ensure:

- [ ] Uses design tokens (no hardcoded values)
- [ ] Dark theme compatible
- [ ] Glow effects on interactive elements
- [ ] Smooth transitions (200-300ms)
- [ ] Rounded corners (xl = 12px for cards)
- [ ] Proper color contrast (WCAG AA minimum)
- [ ] Responsive at all breakpoints
- [ ] Touch-friendly on mobile
- [ ] Keyboard accessible
- [ ] Follows spacing system (4px base)

---

## Implementation Notes

### CSS Variables Setup

```css
:root {
  /* Import all tokens here */
  /* See sections above for complete list */
}

/* Dark mode (default) */
[data-theme="dark"] {
  /* Already set in :root */
}

/* Light mode (future) */
[data-theme="light"] {
  /* Override tokens if needed */
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Tailwind Configuration

If using Tailwind CSS, extend the theme with these tokens:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#14B8A6',
        secondary: '#3B82F6',
        accent: '#10B981',
        // ... map all color tokens
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      spacing: {
        // Map spacing tokens
      },
      borderRadius: {
        // Map radius tokens
      },
      boxShadow: {
        // Map shadow and glow tokens
      },
    },
  },
};
```

---

## Version History

- **1.0.0** (2025-12-12): Initial design tokens specification

---

**Questions or suggestions?** Contact the design team or open an issue in the project repository.