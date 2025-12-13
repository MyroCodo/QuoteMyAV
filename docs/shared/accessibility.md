# Accessibility Guidelines - QuoteMyAV

**Version:** 1.0
**Last Updated:** 2025-12-12
**Target:** WCAG 2.1 Level AA Compliance

## Overview

QuoteMyAV is committed to creating an accessible experience for all AV professionals, including those using assistive technologies. This document outlines our accessibility standards for the dark-themed SaaS application.

---

## 1. WCAG 2.1 AA Compliance Targets

### 1.1 Color Contrast Ratios (Dark Theme)

**Text Contrast Requirements:**
- **Normal text (< 18pt):** Minimum 4.5:1 contrast ratio
- **Large text (≥ 18pt or 14pt bold):** Minimum 3:1 contrast ratio
- **UI components & graphics:** Minimum 3:1 contrast ratio

**Dark Theme Recommended Palettes:**
```css
/* Primary Text on Dark Background */
--text-primary: #FFFFFF;        /* 21:1 on #000000 */
--text-secondary: #B4B4B4;      /* 7:1 on #1A1A1A */
--text-tertiary: #8A8A8A;       /* 4.5:1 on #1A1A1A */

/* Background Colors */
--bg-primary: #0F0F0F;          /* Main background */
--bg-secondary: #1A1A1A;        /* Cards, panels */
--bg-tertiary: #2A2A2A;         /* Elevated elements */

/* Interactive Elements */
--accent-primary: #00A8E8;      /* 4.6:1 on dark bg */
--accent-hover: #00C9FF;        /* 5.8:1 on dark bg */
--error: #FF6B6B;               /* 4.5:1 on dark bg */
--success: #51CF66;             /* 4.8:1 on dark bg */
--warning: #FFD43B;             /* 8:1 on dark bg */

/* Focus Indicators */
--focus-ring: #00C9FF;          /* High visibility */
--focus-ring-width: 3px;
```

**Testing Tools:**
- Chrome DevTools Lighthouse
- WebAIM Contrast Checker
- Stark plugin (Figma/Browser)

### 1.2 Text Sizing & Scaling

**Minimum Sizes:**
- Body text: 16px (1rem) minimum
- Small text (captions, labels): 14px (0.875rem) minimum
- Icon-only buttons: 24x24px minimum

**Responsive Text:**
```css
/* Allow text scaling up to 200% without horizontal scrolling */
html {
  font-size: 16px;
}

/* Support browser text zoom */
body {
  font-size: 1rem;
  line-height: 1.5; /* Minimum for readability */
}

/* Headers should scale proportionally */
h1 { font-size: clamp(1.75rem, 4vw, 2.5rem); }
h2 { font-size: clamp(1.5rem, 3vw, 2rem); }
h3 { font-size: clamp(1.25rem, 2.5vw, 1.75rem); }
```

### 1.3 Touch Target Sizes

**Minimum Interactive Element Sizes:**
- Touch targets: **44x44px minimum** (WCAG 2.1 AAA)
- Recommended: **48x48px** for primary actions
- Spacing between targets: **8px minimum**

**Examples:**
```css
/* Buttons */
.btn {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 24px;
}

/* Icon buttons */
.icon-btn {
  width: 48px;
  height: 48px;
  padding: 12px;
}

/* Form inputs */
input, select, textarea {
  min-height: 44px;
  padding: 12px 16px;
}

/* Checkboxes/Radio buttons */
input[type="checkbox"],
input[type="radio"] {
  width: 24px;
  height: 24px;
  margin: 10px; /* Adds to clickable area */
}
```

---

## 2. Keyboard Navigation

### 2.1 Tab Order by Page

**Landing Page:**
1. Skip to main content link
2. Logo (home link)
3. Navigation menu items (Features, Pricing, About)
4. CTA button (Get Started)
5. Login button
6. Hero section CTA
7. Feature cards (if interactive)
8. Footer links

**Dashboard:**
1. Skip to main content
2. Logo/Home
3. Main navigation (Dashboard, Quotes, Items, Reports)
4. User menu
5. Primary action (New Quote)
6. Search input
7. Filter controls
8. Quote list items
9. Pagination controls
10. Footer

**Quote Form (Multi-step):**
1. Skip to main content
2. Breadcrumb navigation
3. Step indicators (if clickable)
4. Form fields (top to bottom, left to right)
5. Add/Remove item buttons
6. Previous/Next step buttons
7. Save draft button
8. Submit quote button

**Quote Preview Modal:**
1. Close button (first for easy exit)
2. Preview content (scrollable)
3. Edit button
4. Download PDF button
5. Send quote button

### 2.2 Focus Indicators

**Requirements:**
- **Visible:** Minimum 3px outline or border
- **High contrast:** 3:1 ratio against background
- **Distinct:** Different from hover state
- **Persistent:** Visible until focus moves

**Implementation:**
```css
/* Global focus style */
*:focus {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}

/* Skip outline for mouse users (use :focus-visible) */
*:focus:not(:focus-visible) {
  outline: none;
}

*:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}

/* Custom focus for buttons */
.btn:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
  box-shadow: 0 0 0 5px rgba(0, 201, 255, 0.2);
}

/* Focus within for containers */
.card:focus-within {
  border-color: var(--focus-ring);
  box-shadow: 0 0 0 3px rgba(0, 201, 255, 0.3);
}
```

### 2.3 Keyboard Shortcuts

**Global Shortcuts:**
- `Alt + H` - Go to home/dashboard
- `Alt + N` - Create new quote
- `Alt + S` - Open search
- `Alt + /` - Show keyboard shortcuts help
- `Esc` - Close modal/dialog
- `Ctrl + S` - Save draft (quote form)

**Table/List Navigation:**
- `↑` / `↓` - Navigate rows
- `Enter` - Open/edit selected item
- `Space` - Toggle selection (if multi-select)
- `Home` - First item
- `End` - Last item

**Form Navigation:**
- `Tab` - Next field
- `Shift + Tab` - Previous field
- `Enter` - Submit form (when appropriate)
- `Esc` - Cancel/close

**Implementation:**
```javascript
// Keyboard shortcut manager
document.addEventListener('keydown', (e) => {
  // Global shortcuts
  if (e.altKey && e.key === 'h') {
    e.preventDefault();
    navigateTo('/dashboard');
  }

  if (e.altKey && e.key === 'n') {
    e.preventDefault();
    openNewQuote();
  }

  // ESC to close modals
  if (e.key === 'Escape') {
    closeActiveModal();
  }
});
```

### 2.4 Skip Links

**Required Skip Links:**
- Skip to main content
- Skip to navigation
- Skip to search (if applicable)

**Implementation:**
```html
<!-- At the very top of <body> -->
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
<a href="#main-nav" class="skip-link">
  Skip to navigation
</a>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--accent-primary);
  color: var(--bg-primary);
  padding: 12px 20px;
  text-decoration: none;
  font-weight: 600;
  z-index: 10000;
  border-radius: 0 0 4px 0;
}

.skip-link:focus {
  top: 0;
  outline: 3px solid var(--focus-ring);
}
</style>
```

### 2.5 Focus Trapping in Modals

**Requirements:**
- Focus moves to modal when opened
- Tab cycles within modal only
- Escape key closes modal
- Focus returns to trigger element on close

**Implementation:**
```javascript
class AccessibleModal {
  constructor(modalElement) {
    this.modal = modalElement;
    this.focusableElements = null;
    this.firstFocusable = null;
    this.lastFocusable = null;
    this.previouslyFocused = null;
  }

  open() {
    // Store previously focused element
    this.previouslyFocused = document.activeElement;

    // Show modal
    this.modal.style.display = 'block';
    this.modal.setAttribute('aria-hidden', 'false');

    // Get focusable elements
    this.focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    this.firstFocusable = this.focusableElements[0];
    this.lastFocusable = this.focusableElements[this.focusableElements.length - 1];

    // Focus first element
    this.firstFocusable.focus();

    // Add event listeners
    this.modal.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  close() {
    this.modal.style.display = 'none';
    this.modal.setAttribute('aria-hidden', 'true');

    // Return focus
    if (this.previouslyFocused) {
      this.previouslyFocused.focus();
    }

    // Remove event listeners
    this.modal.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  handleKeyDown(e) {
    // ESC to close
    if (e.key === 'Escape') {
      this.close();
      return;
    }

    // TAB key trap
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === this.firstFocusable) {
          e.preventDefault();
          this.lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === this.lastFocusable) {
          e.preventDefault();
          this.firstFocusable.focus();
        }
      }
    }
  }
}
```

---

## 3. Screen Reader Support

### 3.1 ARIA Labels and Roles

**Navigation:**
```html
<!-- Main navigation -->
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/dashboard" aria-current="page">Dashboard</a></li>
    <li><a href="/quotes">Quotes</a></li>
  </ul>
</nav>

<!-- Breadcrumbs -->
<nav aria-label="Breadcrumb">
  <ol role="list">
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/quotes">Quotes</a></li>
    <li aria-current="page">New Quote</li>
  </ol>
</nav>
```

**Buttons and Controls:**
```html
<!-- Icon-only buttons MUST have aria-label -->
<button aria-label="Edit quote" class="icon-btn">
  <svg aria-hidden="true"><!-- icon --></svg>
</button>

<button aria-label="Delete quote" aria-describedby="delete-warning">
  <svg aria-hidden="true"><!-- icon --></svg>
</button>
<span id="delete-warning" class="sr-only">
  This action cannot be undone
</span>

<!-- Toggle buttons -->
<button
  aria-pressed="false"
  aria-label="Toggle dark mode"
  onclick="toggleDarkMode(this)">
  <svg aria-hidden="true"><!-- icon --></svg>
</button>
```

**Form Controls:**
```html
<!-- Always use <label> with 'for' attribute -->
<label for="client-name">Client Name *</label>
<input
  id="client-name"
  type="text"
  required
  aria-required="true"
  aria-describedby="client-name-help"
  aria-invalid="false">
<small id="client-name-help">Enter the full company or individual name</small>

<!-- Error state -->
<input
  id="client-email"
  type="email"
  aria-required="true"
  aria-invalid="true"
  aria-describedby="client-email-error">
<span id="client-email-error" role="alert" class="error-text">
  Please enter a valid email address
</span>
```

**Interactive Widgets:**
```html
<!-- Accordion -->
<div class="accordion">
  <h3>
    <button
      aria-expanded="false"
      aria-controls="section1-content"
      id="section1-button">
      Section 1 Title
    </button>
  </h3>
  <div
    id="section1-content"
    role="region"
    aria-labelledby="section1-button"
    hidden>
    <!-- Content -->
  </div>
</div>

<!-- Tabs -->
<div class="tabs">
  <div role="tablist" aria-label="Quote sections">
    <button role="tab" aria-selected="true" aria-controls="panel-items" id="tab-items">
      Items
    </button>
    <button role="tab" aria-selected="false" aria-controls="panel-labor" id="tab-labor" tabindex="-1">
      Labor
    </button>
  </div>

  <div role="tabpanel" id="panel-items" aria-labelledby="tab-items">
    <!-- Items content -->
  </div>

  <div role="tabpanel" id="panel-labor" aria-labelledby="tab-labor" hidden>
    <!-- Labor content -->
  </div>
</div>
```

**Data Tables:**
```html
<table role="table" aria-label="Recent quotes">
  <caption>Your 10 most recent quotes</caption>
  <thead>
    <tr>
      <th scope="col">Quote #</th>
      <th scope="col">Client</th>
      <th scope="col">Total</th>
      <th scope="col">Status</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Q-2024-001</td>
      <td>Acme Corp</td>
      <td>$45,230.00</td>
      <td>
        <span class="status-badge status-approved" aria-label="Status: Approved">
          <svg aria-hidden="true"><!-- checkmark --></svg>
          Approved
        </span>
      </td>
      <td>
        <button aria-label="Edit quote Q-2024-001">Edit</button>
        <button aria-label="Delete quote Q-2024-001">Delete</button>
      </td>
    </tr>
  </tbody>
</table>
```

### 3.2 Live Regions for Dynamic Content

**Form Validation:**
```html
<!-- Error summary at top of form -->
<div role="alert" aria-live="assertive" class="error-summary" id="form-errors">
  <!-- Populated on submit if errors exist -->
</div>

<script>
function showFormErrors(errors) {
  const errorSummary = document.getElementById('form-errors');
  errorSummary.innerHTML = `
    <h3>Please fix the following errors:</h3>
    <ul>
      ${errors.map(e => `<li><a href="#${e.fieldId}">${e.message}</a></li>`).join('')}
    </ul>
  `;
  errorSummary.focus();
}
</script>
```

**Quote Generation Status:**
```html
<div aria-live="polite" aria-atomic="true" class="status-message">
  <!-- Updated during quote generation process -->
</div>

<script>
function updateStatus(message) {
  const status = document.querySelector('.status-message');
  status.textContent = message;
  // Screen reader will announce: "Generating PDF... please wait"
}

// Usage
updateStatus('Generating PDF... please wait');
// Later...
updateStatus('Quote generated successfully! Downloading now.');
</script>
```

**Loading States:**
```html
<button aria-busy="true" disabled>
  <span class="spinner" aria-hidden="true"></span>
  <span>Saving...</span>
</button>

<!-- When complete -->
<button aria-busy="false">
  <span>Saved!</span>
</button>
```

**Toast Notifications:**
```html
<!-- Container for toast messages -->
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="toast-container">
  <!-- Toasts inserted here -->
</div>

<script>
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.textContent = message;

  document.querySelector('.toast-container').appendChild(toast);

  // Auto-dismiss after 5 seconds
  setTimeout(() => toast.remove(), 5000);
}
</script>
```

### 3.3 Semantic HTML Requirements

**Page Structure:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Quote - QuoteMyAV</title>
</head>
<body>
  <!-- Skip links first -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Site header -->
  <header role="banner">
    <nav aria-label="Main navigation"><!-- nav --></nav>
  </header>

  <!-- Main content -->
  <main id="main-content" role="main">
    <h1>Create New Quote</h1>
    <!-- Page content -->
  </main>

  <!-- Footer -->
  <footer role="contentinfo">
    <nav aria-label="Footer navigation"><!-- links --></nav>
  </footer>
</body>
</html>
```

**Heading Hierarchy:**
```html
<!-- CORRECT: Logical hierarchy -->
<h1>Dashboard</h1>
  <h2>Recent Quotes</h2>
    <h3>Quote #Q-2024-001</h3>
  <h2>Quick Actions</h2>
    <h3>Create New Quote</h3>

<!-- WRONG: Skipping levels -->
<h1>Dashboard</h1>
  <h4>Recent Quotes</h4> <!-- Don't skip from h1 to h4 -->
```

**Lists:**
```html
<!-- Ordered lists for sequences -->
<ol>
  <li>Select equipment</li>
  <li>Configure options</li>
  <li>Review quote</li>
</ol>

<!-- Unordered lists for groups -->
<ul>
  <li>Lighting fixtures</li>
  <li>Audio equipment</li>
  <li>Video displays</li>
</ul>

<!-- Description lists for term/definition pairs -->
<dl>
  <dt>Quote Number</dt>
  <dd>Q-2024-001</dd>

  <dt>Client</dt>
  <dd>Acme Corporation</dd>
</dl>
```

### 3.4 Screen-Reader Only Content

**Utility Class:**
```css
/* Visually hidden but available to screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Focusable version (for skip links) */
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

**Usage Examples:**
```html
<!-- Provide context for icon buttons -->
<button>
  <svg aria-hidden="true"><!-- icon --></svg>
  <span class="sr-only">Edit quote</span>
</button>

<!-- Additional context for links -->
<a href="/quotes/123">
  View details
  <span class="sr-only"> for quote Q-2024-001</span>
</a>

<!-- Required field indicators -->
<label for="client-name">
  Client Name
  <span class="sr-only">required</span>
  <span aria-hidden="true">*</span>
</label>
```

---

## 4. Forms & Inputs

### 4.1 Error Announcement

**Inline Field Errors:**
```html
<div class="form-field">
  <label for="email">Email Address *</label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid="true"
    aria-describedby="email-error">

  <!-- Error message with role="alert" for immediate announcement -->
  <span id="email-error" role="alert" class="error-text">
    <svg aria-hidden="true"><!-- error icon --></svg>
    Please enter a valid email address
  </span>
</div>

<style>
.error-text {
  color: var(--error);
  font-size: 0.875rem;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Show error border */
input[aria-invalid="true"] {
  border-color: var(--error);
  border-width: 2px;
}

input[aria-invalid="true"]:focus {
  outline-color: var(--error);
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.2);
}
</style>
```

**Error Summary:**
```html
<!-- At top of form, hidden until errors occur -->
<div
  id="error-summary"
  role="alert"
  aria-live="assertive"
  class="error-summary"
  hidden>
  <h2>There are errors in your form</h2>
  <p>Please fix the following issues:</p>
  <ul id="error-list">
    <!-- Populated dynamically -->
  </ul>
</div>

<script>
function showErrors(errors) {
  const summary = document.getElementById('error-summary');
  const list = document.getElementById('error-list');

  // Clear previous errors
  list.innerHTML = '';

  // Add new errors with links to fields
  errors.forEach(error => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${error.fieldId}`;
    link.textContent = error.message;
    link.onclick = (e) => {
      e.preventDefault();
      document.getElementById(error.fieldId).focus();
    };
    li.appendChild(link);
    list.appendChild(li);
  });

  // Show summary and move focus to it
  summary.hidden = false;
  summary.focus();
  summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
</script>
```

### 4.2 Required Field Indicators

**Visual + Screen Reader:**
```html
<!-- Method 1: Asterisk with sr-only text -->
<label for="client-name">
  Client Name
  <abbr title="required" aria-label="required">*</abbr>
</label>
<input
  id="client-name"
  type="text"
  required
  aria-required="true">

<!-- Method 2: Explicit text -->
<label for="event-date">
  Event Date
  <span class="required-indicator">(required)</span>
</label>
<input
  id="event-date"
  type="date"
  required
  aria-required="true">

<style>
.required-indicator,
abbr[title="required"] {
  color: var(--error);
  font-weight: 600;
}

abbr[title="required"] {
  text-decoration: none;
  cursor: help;
}
</style>
```

**Form-Level Indication:**
```html
<form aria-describedby="form-instructions">
  <p id="form-instructions" class="form-help">
    Fields marked with an asterisk (*) are required.
  </p>

  <!-- Form fields -->
</form>
```

### 4.3 Help Text Association

**Using aria-describedby:**
```html
<div class="form-field">
  <label for="discount">Discount Percentage</label>
  <input
    id="discount"
    type="number"
    min="0"
    max="100"
    aria-describedby="discount-help">
  <small id="discount-help" class="help-text">
    Enter a value between 0 and 100
  </small>
</div>
```

**Multiple Descriptions:**
```html
<div class="form-field">
  <label for="password">New Password</label>
  <input
    id="password"
    type="password"
    required
    aria-required="true"
    aria-describedby="password-help password-requirements"
    aria-invalid="false">

  <small id="password-help" class="help-text">
    Create a strong password to secure your account
  </small>

  <ul id="password-requirements" class="requirements-list">
    <li>At least 8 characters long</li>
    <li>Contains uppercase and lowercase letters</li>
    <li>Contains at least one number</li>
  </ul>

  <!-- Error message added when invalid -->
  <span id="password-error" role="alert" class="error-text" hidden>
    Password does not meet requirements
  </span>
</div>

<script>
// When validation fails, add error to aria-describedby
function showPasswordError() {
  const input = document.getElementById('password');
  const error = document.getElementById('password-error');

  input.setAttribute('aria-invalid', 'true');
  input.setAttribute('aria-describedby',
    'password-help password-requirements password-error');
  error.hidden = false;
}
</script>
```

### 4.4 Multi-Step Form Navigation

**Progress Indicator:**
```html
<nav aria-label="Quote creation progress">
  <ol class="stepper" role="list">
    <li class="step step-complete">
      <a href="#step1" aria-label="Step 1: Client Information (completed)">
        <span class="step-number" aria-hidden="true">1</span>
        <span class="step-label">Client Info</span>
      </a>
    </li>
    <li class="step step-current">
      <span aria-current="step" aria-label="Step 2: Equipment (current step)">
        <span class="step-number" aria-hidden="true">2</span>
        <span class="step-label">Equipment</span>
      </span>
    </li>
    <li class="step step-incomplete">
      <span aria-label="Step 3: Review (not started)">
        <span class="step-number" aria-hidden="true">3</span>
        <span class="step-label">Review</span>
      </span>
    </li>
  </ol>
</nav>
```

**Step Navigation:**
```html
<form id="quote-form" aria-labelledby="form-title">
  <h1 id="form-title">Create Quote - Step 2 of 3</h1>

  <!-- Current step content -->
  <fieldset aria-describedby="step-instructions">
    <legend>Equipment Selection</legend>
    <p id="step-instructions">
      Add all equipment items needed for this project
    </p>

    <!-- Form fields -->
  </fieldset>

  <!-- Navigation -->
  <div class="form-navigation" role="group" aria-label="Form navigation">
    <button type="button" onclick="goToPreviousStep()">
      <svg aria-hidden="true"><!-- back arrow --></svg>
      Previous: Client Info
    </button>

    <button type="button" onclick="goToNextStep()">
      Next: Review
      <svg aria-hidden="true"><!-- forward arrow --></svg>
    </button>

    <button type="button" onclick="saveDraft()" class="btn-secondary">
      <svg aria-hidden="true"><!-- save icon --></svg>
      Save Draft
    </button>
  </div>
</form>

<script>
function goToNextStep() {
  // Validate current step
  if (!validateCurrentStep()) {
    // Focus error summary
    document.getElementById('error-summary').focus();
    return;
  }

  // Announce step change
  announceToScreenReader('Moving to step 3: Review');

  // Navigate to next step
  showStep(3);

  // Focus first field in new step
  const firstField = document.querySelector('#step3 input, #step3 button');
  if (firstField) firstField.focus();
}

function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
}
</script>
```

**Save and Resume:**
```html
<!-- When user returns to saved draft -->
<div role="status" aria-live="polite" class="draft-restored">
  <svg aria-hidden="true"><!-- info icon --></svg>
  <span>Draft restored. You left off on step 2: Equipment Selection.</span>
  <button aria-label="Continue editing draft">Continue</button>
  <button aria-label="Start new quote">Start Over</button>
</div>
```

---

## 5. Color & Visual Design

### 5.1 Don't Rely on Color Alone

**Status Indicators with Icons + Text:**
```html
<!-- WRONG: Color only -->
<span class="status-green">Approved</span>

<!-- CORRECT: Icon + Text + Color -->
<span class="status status-approved">
  <svg aria-hidden="true" class="status-icon">
    <!-- checkmark icon -->
  </svg>
  <span class="status-text">Approved</span>
</span>

<style>
.status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 500;
}

.status-approved {
  background: rgba(81, 207, 102, 0.15);
  color: var(--success);
  border: 1px solid var(--success);
}

.status-pending {
  background: rgba(255, 212, 59, 0.15);
  color: var(--warning);
  border: 1px solid var(--warning);
}

.status-rejected {
  background: rgba(255, 107, 107, 0.15);
  color: var(--error);
  border: 1px solid var(--error);
}

.status-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>
```

**Form Validation:**
```html
<!-- WRONG: Red border only -->
<input class="error" type="email">

<!-- CORRECT: Border + Icon + Error text -->
<div class="form-field">
  <label for="email">Email</label>
  <div class="input-wrapper">
    <input
      id="email"
      type="email"
      aria-invalid="true"
      aria-describedby="email-error">
    <svg class="input-icon input-icon-error" aria-hidden="true">
      <!-- error icon -->
    </svg>
  </div>
  <span id="email-error" role="alert" class="error-text">
    <svg aria-hidden="true"><!-- error icon --></svg>
    Invalid email format
  </span>
</div>

<style>
.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  pointer-events: none;
}

.input-icon-error {
  color: var(--error);
}

input[aria-invalid="true"] {
  border: 2px solid var(--error);
  padding-right: 40px; /* Space for icon */
}
</style>
```

**Charts & Graphs:**
```html
<!-- Use patterns in addition to color -->
<svg viewBox="0 0 200 100" role="img" aria-labelledby="chart-title chart-desc">
  <title id="chart-title">Revenue by Quarter</title>
  <desc id="chart-desc">
    Bar chart showing Q1: $50k, Q2: $75k, Q3: $60k, Q4: $90k
  </desc>

  <!-- Bars with patterns -->
  <rect x="0" y="50" width="40" height="50" fill="url(#pattern-q1)" />
  <rect x="50" y="25" width="40" height="75" fill="url(#pattern-q2)" />
  <rect x="100" y="40" width="40" height="60" fill="url(#pattern-q3)" />
  <rect x="150" y="10" width="40" height="90" fill="url(#pattern-q4)" />

  <!-- Pattern definitions -->
  <defs>
    <pattern id="pattern-q1" patternUnits="userSpaceOnUse" width="4" height="4">
      <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#00A8E8" stroke-width="1" />
    </pattern>
    <!-- More patterns... -->
  </defs>
</svg>

<!-- Data table alternative -->
<details>
  <summary>View data table</summary>
  <table>
    <caption>Revenue by Quarter</caption>
    <thead>
      <tr>
        <th>Quarter</th>
        <th>Revenue</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>Q1</td><td>$50,000</td></tr>
      <tr><td>Q2</td><td>$75,000</td></tr>
      <tr><td>Q3</td><td>$60,000</td></tr>
      <tr><td>Q4</td><td>$90,000</td></tr>
    </tbody>
  </table>
</details>
```

### 5.2 Reduced Motion Support

**Respect prefers-reduced-motion:**
```css
/* Default: Animations enabled */
.modal {
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: 0;
  transform: translateY(-20px);
}

.modal.open {
  opacity: 1;
  transform: translateY(0);
}

/* Reduced motion: Instant or minimal animation */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  /* Keep essential transitions (very short) */
  .btn,
  .link {
    transition: background-color 0.1s ease, color 0.1s ease;
  }
}
```

**Alternative Interaction Patterns:**
```css
/* Animated loading spinner */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Reduced motion: Pulsing opacity instead */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
}
```

**Parallax & Scroll Effects:**
```css
/* Default: Parallax background */
.hero {
  background-attachment: fixed;
  background-size: cover;
}

/* Reduced motion: Static background */
@media (prefers-reduced-motion: reduce) {
  .hero {
    background-attachment: scroll;
  }

  /* Disable scroll-triggered animations */
  .fade-in-on-scroll {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

### 5.3 Focus on Usability Patterns

**Loading States:**
```html
<!-- Skeleton screens (reduced motion friendly) -->
<div class="card skeleton" aria-busy="true" aria-live="polite">
  <div class="skeleton-header"></div>
  <div class="skeleton-text"></div>
  <div class="skeleton-text"></div>
</div>

<style>
.skeleton {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 20px;
}

.skeleton-header {
  height: 20px;
  width: 60%;
  background: var(--bg-tertiary);
  border-radius: 4px;
  margin-bottom: 16px;
}

.skeleton-text {
  height: 12px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  margin-bottom: 8px;
}

.skeleton-text:last-child {
  width: 80%;
}

/* Subtle pulse (respects reduced motion) */
@media (prefers-reduced-motion: no-preference) {
  .skeleton > div {
    animation: skeleton-pulse 1.5s ease-in-out infinite;
  }

  @keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
}
</style>
```

**Hover Effects:**
```css
/* Ensure hover states work with keyboard focus too */
.btn {
  background: var(--accent-primary);
  color: white;
  transition: background 0.2s ease;
}

/* Combine hover and focus styles */
.btn:hover,
.btn:focus-visible {
  background: var(--accent-hover);
}

/* Don't rely on hover for critical info */
.tooltip-trigger[aria-describedby] {
  cursor: help;
  text-decoration: underline;
  text-decoration-style: dotted;
}

/* Tooltip visible on focus too, not just hover */
.tooltip {
  display: none;
}

.tooltip-trigger:hover + .tooltip,
.tooltip-trigger:focus + .tooltip {
  display: block;
}
```

---

## 6. Testing Checklist

### 6.1 Automated Testing Tools

**Browser Extensions:**
- **axe DevTools** (Chrome/Firefox)
  - Scan entire page or specific components
  - Provides severity ratings and remediation guidance
  - Run on every major page/component

- **WAVE** (WebAIM)
  - Visual feedback overlay on page
  - Identifies errors, alerts, and features
  - Good for quick visual checks

- **Lighthouse** (Chrome DevTools)
  - Accessibility score + specific issues
  - Performance and SEO insights too
  - Run on production builds

**Command Line Tools:**
```bash
# Install pa11y for CI/CD pipeline
npm install -g pa11y

# Test a page
pa11y http://localhost:3000/dashboard

# Test multiple pages
pa11y-ci --config .pa11yci.json

# axe-core CLI
npm install -g @axe-core/cli
axe http://localhost:3000
```

**CI/CD Integration:**
```json
// .pa11yci.json
{
  "defaults": {
    "standard": "WCAG2AA",
    "timeout": 10000,
    "wait": 1000,
    "chromeLaunchConfig": {
      "args": ["--no-sandbox"]
    }
  },
  "urls": [
    "http://localhost:3000/",
    "http://localhost:3000/dashboard",
    "http://localhost:3000/quotes/new",
    "http://localhost:3000/quotes/preview"
  ]
}
```

### 6.2 Screen Reader Testing

**Testing Matrix:**

| Screen Reader | Browser | Platform | Priority |
|---------------|---------|----------|----------|
| NVDA | Firefox | Windows | High |
| NVDA | Chrome | Windows | High |
| JAWS | Chrome | Windows | Medium |
| VoiceOver | Safari | macOS | High |
| VoiceOver | Safari | iOS | Medium |
| TalkBack | Chrome | Android | Low |

**NVDA Testing Checklist (Windows):**
1. **Start NVDA:** Insert + N to open menu
2. **Browse mode:** Use arrow keys to navigate page content
3. **Forms mode:** Automatic when focusing inputs
4. **Headings navigation:** H / Shift+H to jump between headings
5. **Landmarks:** D / Shift+D to navigate regions (header, nav, main, footer)
6. **Links:** K / Shift+K to jump between links
7. **Form fields:** F / Shift+F to jump between inputs
8. **Buttons:** B / Shift+B to jump between buttons
9. **Tables:** T / Shift+T to jump between tables
10. **Lists:** L / Shift+L to jump between lists

**Key Commands:**
- `Insert + F7` - List all elements (headings, links, form fields)
- `Insert + Ctrl + Down` - Read from cursor to end
- `Insert + Up Arrow` - Read current line
- `Insert + Tab` - Speak focus
- `Caps Lock + Space` - Toggle browse/focus mode

**VoiceOver Testing Checklist (macOS):**
1. **Start VoiceOver:** Cmd + F5
2. **Rotor:** Cmd + Option + U (navigate by headings, links, form controls)
3. **Navigate:** Cmd + Option + Arrow Keys
4. **Interact with groups:** Cmd + Option + Shift + Down
5. **Stop interacting:** Cmd + Option + Shift + Up
6. **Web Rotor:** Cmd + Option + U, then Left/Right arrows to change category

**What to Listen For:**
- [ ] All images have alt text or are marked decorative
- [ ] Forms read labels before input fields
- [ ] Buttons announce their purpose clearly
- [ ] Error messages are announced immediately
- [ ] Loading states are announced
- [ ] Modal open/close is announced
- [ ] Page title is descriptive
- [ ] Heading hierarchy makes sense when navigating by headings
- [ ] Links make sense out of context
- [ ] Table headers are announced with cell content

### 6.3 Keyboard Navigation Testing

**Test Script:**

1. **Unplug your mouse** (seriously!)
2. **Tab through entire page:**
   - [ ] All interactive elements reachable
   - [ ] Focus order is logical (top to bottom, left to right)
   - [ ] Focus indicator always visible
   - [ ] No focus traps (except intentional modals)
   - [ ] Can skip to main content

3. **Test modals/dialogs:**
   - [ ] Opens on Enter/Space when focused on trigger
   - [ ] Focus moves to modal when opened
   - [ ] Tab cycles within modal only
   - [ ] Escape closes modal
   - [ ] Focus returns to trigger on close

4. **Test forms:**
   - [ ] Tab moves through fields logically
   - [ ] Radio buttons navigable with arrow keys
   - [ ] Checkboxes toggle with Space
   - [ ] Enter submits form (when appropriate)
   - [ ] Validation errors announced and focusable

5. **Test custom widgets:**
   - [ ] Accordions expand/collapse with Enter/Space
   - [ ] Arrow keys work in tabs, menus, lists
   - [ ] Dropdowns open with Enter/Space, navigate with arrows
   - [ ] Escape closes open widgets

6. **Test keyboard shortcuts:**
   - [ ] All shortcuts documented
   - [ ] Shortcuts work as expected
   - [ ] No conflicts with browser/screen reader shortcuts
   - [ ] Help dialog shows available shortcuts

### 6.4 Visual Testing

**Zoom and Reflow:**
- [ ] Test at 200% browser zoom (no horizontal scrolling)
- [ ] Test at 400% zoom (text reflows properly)
- [ ] No content cut off or overlapping
- [ ] Touch targets still 44x44px minimum

**Color Contrast:**
- [ ] Run all pages through WebAIM Contrast Checker
- [ ] Test focus indicators have 3:1 ratio
- [ ] Test disabled states are distinguishable
- [ ] Test hover/active states maintain contrast

**Color Blindness Simulation:**
- Use Chrome extension "Colorblindly" or similar
- Test with:
  - [ ] Protanopia (red-blind)
  - [ ] Deuteranopia (green-blind)
  - [ ] Tritanopia (blue-blind)
  - [ ] Achromatopsia (total color blindness)
- Ensure status indicators still distinguishable

**Dark Mode Testing:**
- [ ] All text meets contrast requirements
- [ ] No pure white (#FFF) on pure black (#000) - causes halation
- [ ] Preferred: Off-white (#E0E0E0+) on dark gray (#0F0F0F-#1A1A1A)
- [ ] Focus indicators visible on all backgrounds

### 6.5 Manual Testing Checklist

**Every Page/Component Must:**

- [ ] Have a unique, descriptive `<title>`
- [ ] Have exactly one `<h1>`
- [ ] Use heading hierarchy correctly (no skipped levels)
- [ ] Have a skip link to main content
- [ ] Use semantic HTML (`<nav>`, `<main>`, `<header>`, `<footer>`)
- [ ] Have sufficient color contrast (4.5:1 text, 3:1 UI)
- [ ] Have visible focus indicators
- [ ] Work without a mouse (keyboard only)
- [ ] Work with a screen reader (test with NVDA or VoiceOver)
- [ ] Scale to 200% without breaking
- [ ] Support reduced motion preferences
- [ ] Have no automatic timeouts (or provide warning)
- [ ] Have no flashing content (or flash less than 3 times per second)

**Forms Must:**

- [ ] Have labels for all inputs (`<label>` with `for`)
- [ ] Mark required fields clearly
- [ ] Announce errors to screen readers (`role="alert"`)
- [ ] Link errors to fields (`aria-describedby`)
- [ ] Provide inline validation feedback
- [ ] Show error summary at top of form
- [ ] Allow errors to be corrected easily

**Interactive Elements Must:**

- [ ] Be keyboard operable (Tab, Enter, Space, Arrows, Esc)
- [ ] Have visible focus states
- [ ] Have appropriate ARIA roles and states
- [ ] Announce state changes to screen readers
- [ ] Have sufficient touch target size (44x44px)
- [ ] Have clear labels or accessible names

### 6.6 Accessibility Review Cadence

**Development Phase:**
- Run axe DevTools on every new component
- Test keyboard navigation before PR review
- Check color contrast in design handoff

**Pre-Release:**
- Full Lighthouse audit on all major pages
- NVDA/VoiceOver testing of critical flows
- Keyboard-only navigation of entire app
- Test at 200% zoom

**Post-Release:**
- Monthly pa11y CI scans
- Quarterly manual screen reader audit
- Annual third-party WCAG audit (if budget allows)

**Bug Reporting:**
- Label accessibility issues as P1 (critical) or P2 (important)
- Fix WCAG Level A issues immediately
- Fix WCAG Level AA issues within one sprint
- Track AAA issues for future enhancement

---

## 7. Resources & References

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Resources](https://webaim.org/resources/)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Accessible Color Generator](https://toolness.github.io/accessible-color-matrix/)
- [Inclusive Components](https://inclusive-components.design/)

### Testing
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover/welcome/mac)
- [Keyboard Shortcuts Reference](https://www.a11yproject.com/posts/keyboard-shortcuts/)

### Contact
For accessibility questions or to report issues:
- **Email:** accessibility@quotemyav.com
- **Slack:** #accessibility channel

---

**Document Maintained By:** Development Team
**Last Audit:** 2025-12-12
**Next Review:** Quarterly
