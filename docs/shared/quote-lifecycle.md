# Quote Lifecycle Management

## Overview

This document defines the complete lifecycle of quotes in QuoteMyAV, from initial draft creation through acceptance, revision, expiration, and cancellation. It provides technical specifications for state management, database schema, notification triggers, and UI behavior.

---

## 1. Quote States

### State Definitions

| State | Description | User Action Required | System Automated |
|-------|-------------|---------------------|------------------|
| `draft` | Quote being edited, not yet sent | Edit, send, or delete | - |
| `sent` | Quote delivered to customer via email | Wait for customer response | Track delivery |
| `viewed` | Customer opened quote link | Wait for decision | Log view timestamp |
| `accepted` | Customer approved quote | Begin production planning | Send confirmation |
| `rejected` | Customer declined quote | Follow up or archive | Send notification |
| `expired` | Past validity date without decision | Extend or archive | Auto-expire at date |
| `cancelled` | Vendor cancelled before completion | - | Archive quote |
| `revised` | New version created from original | Send new version | Link to parent |

### State Metadata

Each state tracks:

```typescript
interface QuoteState {
  status: QuoteStatus;
  entered_at: Date;
  triggered_by: 'user' | 'system' | 'customer';
  triggered_by_id?: string; // User ID or customer email
  notes?: string;
}
```

---

## 2. State Machine Diagram

```
                    ┌─────────────────┐
                    │     DRAFT       │
                    └────────┬────────┘
                             │
                   ┌─────────┴─────────┐
                   │   send_to_customer │
                   └─────────┬─────────┘
                             │
                             ▼
                    ┌─────────────────┐
             ┌──────│      SENT       │──────┐
             │      └─────────────────┘      │
             │                                │
     ┌───────▼──────┐                ┌───────▼──────┐
     │   customer   │                │   expires_at  │
     │  views quote │                │   timestamp   │
     └───────┬──────┘                └───────┬──────┘
             │                                │
             ▼                                ▼
    ┌─────────────────┐              ┌─────────────────┐
    │     VIEWED      │              │    EXPIRED      │
    └────┬──────┬─────┘              └────────┬────────┘
         │      │                              │
         │      │                    ┌─────────▼──────────┐
         │      │                    │  extend_expiry or  │
         │      │                    │  create_revision   │
         │      │                    └─────────┬──────────┘
         │      │                              │
         │      │                              ▼
         │      │                    ┌─────────────────┐
         │      │                    │     DRAFT       │
         │      │                    │  (new version)  │
         │      │                    └─────────────────┘
         │      │
┌────────▼──┐ ┌▼─────────┐
│ customer  │ │ customer │
│ approves  │ │ declines │
└────┬──────┘ └┬─────────┘
     │         │
     ▼         ▼
┌─────────┐ ┌──────────┐
│ACCEPTED │ │ REJECTED │
└─────────┘ └──────────┘

         ANY STATE
             │
     ┌───────▼──────┐
     │ user cancels │
     └───────┬──────┘
             │
             ▼
      ┌─────────────┐
      │  CANCELLED  │
      └─────────────┘

         ANY STATE
             │
    ┌────────▼────────┐
    │ customer_changes│
    │   _required     │
    └────────┬────────┘
             │
             ▼
      ┌─────────────┐
      │   REVISED   │──────► New quote created
      └─────────────┘        (status: draft)
```

### Valid State Transitions

```typescript
const STATE_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  draft: ['sent', 'cancelled'],
  sent: ['viewed', 'expired', 'accepted', 'rejected', 'cancelled', 'revised'],
  viewed: ['accepted', 'rejected', 'expired', 'cancelled', 'revised'],
  accepted: ['revised', 'cancelled'],
  rejected: ['revised', 'cancelled'],
  expired: ['revised', 'cancelled'],
  cancelled: [], // Terminal state
  revised: ['sent'], // Revision creates new quote
};
```

### Transition Triggers

| Transition | Trigger Type | Triggered By | Action |
|-----------|--------------|--------------|---------|
| `draft` → `sent` | User | Quote author | Email sent to customer |
| `sent` → `viewed` | System | Customer clicks link | Log view timestamp |
| `sent/viewed` → `accepted` | Customer | Customer clicks "Accept" | Notify user, create project |
| `sent/viewed` → `rejected` | Customer | Customer clicks "Decline" | Notify user, prompt follow-up |
| `sent/viewed` → `expired` | System | Cron job at `expires_at` | Auto-expire, send notification |
| Any → `cancelled` | User | Quote author | Mark as cancelled, archive |
| Any → `revised` | User/Customer | Either party | Create new version, link to parent |

---

## 3. Expiration Policy

### Default Settings

- **Default validity period:** 30 days from send date
- **Customizable:** User can set `expires_at` to any future date
- **Minimum validity:** 7 days (system enforced)
- **Maximum validity:** 90 days (configurable per plan tier)

### Warning Notifications

```typescript
const EXPIRATION_WARNINGS = {
  first_warning: 7, // 7 days before expiry
  second_warning: 1, // 1 day before expiry
  final_warning: 0, // On expiry day (before auto-expire)
};
```

**Notification Schedule:**

1. **7 days before:** Email to quote author
   - Subject: "Quote #12345 expires in 7 days"
   - CTA: "Extend expiry" or "Follow up with customer"

2. **1 day before:** Email to quote author + optional customer reminder
   - Subject: "Quote #12345 expires tomorrow"
   - CTA: "Extend expiry" or "Remind customer"

3. **On expiry day (4 hours before):** Final warning to quote author
   - Subject: "Quote #12345 expires today"
   - CTA: "Extend expiry now"

4. **At expiry:** Auto-expire + notification
   - Quote status → `expired`
   - Email to quote author: "Quote #12345 has expired"
   - Customer sees "This quote has expired" on link

### Expiration Behavior

**What happens at expiration:**

1. Status changes to `expired`
2. Customer can no longer accept/reject (UI shows expired message)
3. Quote remains viewable (read-only)
4. User can:
   - Extend expiry (revert to `sent` or `viewed`)
   - Create revision (new version)
   - Cancel quote

**Re-activation Process:**

```typescript
// Option 1: Extend expiry (same quote, new date)
async function extendQuote(quoteId: string, newExpiryDate: Date) {
  await db.quote.update({
    where: { id: quoteId },
    data: {
      expires_at: newExpiryDate,
      status: 'sent', // Revert to sent (or viewed if previously viewed)
      state_history: {
        create: {
          status: 'sent',
          triggered_by: 'user',
          notes: 'Expiry extended',
        },
      },
    },
  });

  // Send email to customer
  await sendEmail({
    to: quote.customer_email,
    subject: `Updated: Quote #${quote.number}`,
    template: 'quote-extended',
    data: { quote, newExpiryDate },
  });
}

// Option 2: Create revision (new quote, new version)
async function createRevisionFromExpired(quoteId: string) {
  const original = await db.quote.findUnique({ where: { id: quoteId } });

  const revision = await db.quote.create({
    data: {
      ...original,
      id: undefined, // New ID
      status: 'draft',
      version: original.version + 1,
      parent_quote_id: quoteId,
      created_at: new Date(),
      expires_at: addDays(new Date(), 30),
    },
  });

  return revision;
}
```

---

## 4. Revision / Change Order Flow

### When Revisions Are Created

1. **Customer requests changes** (pricing, scope, equipment)
2. **User discovers error** in original quote
3. **Expired quote** needs to be resent
4. **Accepted quote** needs modifications (change order)

### Version Numbering

```
Quote #12345 v1 (original)
  ├─ Quote #12345 v2 (first revision)
  ├─ Quote #12345 v3 (second revision)
  └─ Quote #12345 v4 (third revision)
```

**Version number format:**
- Stored as integer: `1`, `2`, `3`...
- Displayed as: `v1`, `v2`, `v3`...
- Quote number stays the same across versions

### Linking Revisions

```typescript
interface Quote {
  id: string;
  number: string; // e.g., "QT-2025-001"
  version: number; // 1, 2, 3...
  parent_quote_id?: string; // ID of previous version
  root_quote_id?: string; // ID of v1 (for fast lookup)
}
```

**Database relationships:**

```sql
-- Get all versions of a quote
SELECT * FROM quotes
WHERE root_quote_id = 'quote_xyz'
ORDER BY version ASC;

-- Get immediate parent
SELECT * FROM quotes
WHERE id = (SELECT parent_quote_id FROM quotes WHERE id = 'quote_abc');

-- Get latest version
SELECT * FROM quotes
WHERE root_quote_id = 'quote_xyz'
ORDER BY version DESC
LIMIT 1;
```

### Price Change Handling

**When creating a revision:**

1. **Copy original quote data** (equipment, labor, etc.)
2. **Allow user to modify** line items
3. **Calculate price delta:**

```typescript
interface RevisionSummary {
  original_total: number;
  revised_total: number;
  price_change: number;
  price_change_percent: number;
  items_added: LineItem[];
  items_removed: LineItem[];
  items_modified: LineItem[];
}

function calculateRevisionSummary(
  original: Quote,
  revision: Quote
): RevisionSummary {
  const originalTotal = original.grand_total;
  const revisedTotal = revision.grand_total;
  const priceChange = revisedTotal - originalTotal;
  const priceChangePercent = (priceChange / originalTotal) * 100;

  // Item-level diff
  const originalItems = new Map(original.line_items.map(item => [item.id, item]));
  const revisedItems = new Map(revision.line_items.map(item => [item.id, item]));

  const itemsAdded = revision.line_items.filter(item => !originalItems.has(item.id));
  const itemsRemoved = original.line_items.filter(item => !revisedItems.has(item.id));
  const itemsModified = revision.line_items.filter(item => {
    const orig = originalItems.get(item.id);
    return orig && (orig.quantity !== item.quantity || orig.unit_price !== item.unit_price);
  });

  return {
    original_total: originalTotal,
    revised_total: revisedTotal,
    price_change: priceChange,
    price_change_percent: priceChangePercent,
    items_added: itemsAdded,
    items_removed: itemsRemoved,
    items_modified: itemsModified,
  };
}
```

4. **Display change summary to user** before sending
5. **Show comparison view to customer:**

```
Original Quote (v1): $45,000
Revised Quote (v2): $52,500
Change: +$7,500 (+16.7%)

Changes:
+ Added: 4x Shure QLXD2/SM58 Wireless Mic (+$2,400)
+ Added: 2x Additional Labor Hours (+$500)
~ Modified: QSC KW122 Speakers (4 → 6 units) (+$4,600)
```

### Audit Trail

All revisions are logged in `quote_state_history`:

```typescript
interface StateHistoryEntry {
  id: string;
  quote_id: string;
  status: QuoteStatus;
  entered_at: Date;
  triggered_by: 'user' | 'system' | 'customer';
  triggered_by_id?: string;
  notes?: string;
  metadata?: {
    revision_from?: string; // Parent quote ID
    price_change?: number;
    items_changed?: number;
  };
}
```

**Revision creation workflow:**

```typescript
async function createRevision(
  originalQuoteId: string,
  changes: Partial<Quote>,
  reason: string
): Promise<Quote> {
  const original = await db.quote.findUnique({
    where: { id: originalQuoteId },
    include: { line_items: true },
  });

  // Mark original as revised
  await db.quote.update({
    where: { id: originalQuoteId },
    data: {
      status: 'revised',
      state_history: {
        create: {
          status: 'revised',
          triggered_by: 'user',
          notes: reason,
        },
      },
    },
  });

  // Create new version
  const revision = await db.quote.create({
    data: {
      ...original,
      ...changes,
      id: undefined, // New ID
      status: 'draft',
      version: original.version + 1,
      parent_quote_id: originalQuoteId,
      root_quote_id: original.root_quote_id || originalQuoteId,
      created_at: new Date(),
      sent_at: null,
      viewed_at: null,
      expires_at: addDays(new Date(), 30),
      line_items: {
        create: changes.line_items || original.line_items,
      },
    },
  });

  // Log revision creation
  await db.quoteStateHistory.create({
    data: {
      quote_id: revision.id,
      status: 'draft',
      triggered_by: 'user',
      notes: `Created from v${original.version}: ${reason}`,
      metadata: {
        revision_from: originalQuoteId,
      },
    },
  });

  return revision;
}
```

---

## 5. Cancellation Policy

### Before Sending (Draft State)

**Action:** User deletes quote
**Policy:** Free deletion (soft delete)
**Database:** `deleted_at` timestamp set
**Recovery:** Admin can restore within 30 days

```typescript
async function deleteDraft(quoteId: string, userId: string) {
  await db.quote.update({
    where: { id: quoteId, status: 'draft' },
    data: {
      deleted_at: new Date(),
      deleted_by: userId,
    },
  });
  // No email sent
}
```

### After Sending (Sent/Viewed/Expired States)

**Action:** User cancels quote
**Policy:** Mark as `cancelled`, notify customer
**Database:** Status changed, cancellation reason logged
**Customer view:** Shows "This quote has been cancelled"

```typescript
async function cancelQuote(
  quoteId: string,
  userId: string,
  reason: string
) {
  const quote = await db.quote.update({
    where: { id: quoteId },
    data: {
      status: 'cancelled',
      cancelled_at: new Date(),
      cancelled_by: userId,
      cancellation_reason: reason,
      state_history: {
        create: {
          status: 'cancelled',
          triggered_by: 'user',
          triggered_by_id: userId,
          notes: reason,
        },
      },
    },
  });

  // Email customer
  await sendEmail({
    to: quote.customer_email,
    subject: `Quote #${quote.number} has been cancelled`,
    template: 'quote-cancelled',
    data: { quote, reason },
  });
}
```

### Customer-Initiated Cancellation

**Customer clicks "No longer interested" on quote page:**

```typescript
async function customerCancelQuote(quoteId: string, customerEmail: string) {
  const quote = await db.quote.update({
    where: { id: quoteId },
    data: {
      status: 'cancelled',
      cancelled_at: new Date(),
      cancellation_reason: 'Customer no longer interested',
      state_history: {
        create: {
          status: 'cancelled',
          triggered_by: 'customer',
          triggered_by_id: customerEmail,
          notes: 'Customer initiated cancellation',
        },
      },
    },
  });

  // Email vendor
  await sendEmail({
    to: quote.user.email,
    subject: `Customer cancelled Quote #${quote.number}`,
    template: 'customer-cancelled-quote',
    data: { quote },
  });
}
```

### Refund Implications (If Deposits Taken)

**Note:** QuoteMyAV handles quoting only, not payments. If integrated with payment processor:

1. **Before deposit:** Cancellation is free
2. **After deposit paid:** Follow company refund policy:
   - Full refund if cancelled within 24 hours
   - Partial refund (minus processing fees) if cancelled within 7 days
   - No refund after 7 days or if work has begun

**Integration point:**

```typescript
interface Quote {
  payment_status?: 'none' | 'deposit_paid' | 'paid_in_full';
  deposit_amount?: number;
  deposit_paid_at?: Date;
}

async function cancelWithRefund(quoteId: string, userId: string) {
  const quote = await db.quote.findUnique({ where: { id: quoteId } });

  if (quote.payment_status === 'deposit_paid') {
    const hoursSinceDeposit = differenceInHours(new Date(), quote.deposit_paid_at);

    let refundAmount = 0;
    if (hoursSinceDeposit <= 24) {
      refundAmount = quote.deposit_amount; // Full refund
    } else if (hoursSinceDeposit <= 168) { // 7 days
      refundAmount = quote.deposit_amount * 0.9; // Minus 10% processing
    }

    if (refundAmount > 0) {
      // Trigger refund via payment processor
      await paymentProcessor.refund(quote.id, refundAmount);
    }
  }

  // Continue with cancellation
  await cancelQuote(quoteId, userId, 'Cancelled with refund');
}
```

---

## 6. Dispute Handling

### Types of Disputes

1. **Quote accuracy disputes** - Customer says quote doesn't match their request
2. **Pricing discrepancies** - Customer sees different price than expected
3. **Equipment mismatch** - Wrong equipment listed
4. **Scope creep** - Quote missing items customer expected

### Dispute Resolution Process

```
Customer raises dispute
        ↓
Quote flagged for review
        ↓
User reviews dispute
        ↓
   ┌────┴────┐
   │         │
Accept    Reject
   │         │
   ↓         ↓
Create    Explain
revision  + close
```

### Database Schema for Disputes

```typescript
interface QuoteDispute {
  id: string;
  quote_id: string;
  raised_by: 'customer' | 'user';
  raised_by_email: string;
  dispute_type: 'accuracy' | 'pricing' | 'equipment' | 'scope' | 'other';
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  resolution?: string;
  resolved_at?: Date;
  resolved_by?: string;
  created_at: Date;
}
```

**Creating a dispute:**

```typescript
async function raiseDispute(
  quoteId: string,
  disputeType: string,
  description: string,
  customerEmail: string
) {
  const dispute = await db.quoteDispute.create({
    data: {
      quote_id: quoteId,
      raised_by: 'customer',
      raised_by_email: customerEmail,
      dispute_type: disputeType,
      description: description,
      status: 'open',
    },
  });

  // Flag quote
  await db.quote.update({
    where: { id: quoteId },
    data: {
      has_dispute: true,
      dispute_count: { increment: 1 },
    },
  });

  // Notify user
  await sendEmail({
    to: quote.user.email,
    subject: `Dispute raised on Quote #${quote.number}`,
    template: 'dispute-raised',
    data: { quote, dispute },
  });
}
```

### Escalation to Support

**If user and customer can't resolve:**

1. Customer clicks "Escalate to Support"
2. Dispute flagged as `escalated: true`
3. Email sent to `support@quotemyav.com`
4. Support team reviews quote + conversation history
5. Support mediates or makes final decision

```typescript
async function escalateDispute(disputeId: string) {
  await db.quoteDispute.update({
    where: { id: disputeId },
    data: {
      status: 'escalated',
      escalated_at: new Date(),
    },
  });

  // Email support team
  await sendEmail({
    to: 'support@quotemyav.com',
    subject: `Dispute escalated - Quote #${dispute.quote.number}`,
    template: 'dispute-escalated',
    data: { dispute, quote, messages },
  });
}
```

### Resolution Documentation

**When dispute is resolved:**

```typescript
async function resolveDispute(
  disputeId: string,
  resolution: string,
  userId: string,
  action: 'revised' | 'explained' | 'refunded'
) {
  await db.quoteDispute.update({
    where: { id: disputeId },
    data: {
      status: 'resolved',
      resolution: resolution,
      resolved_at: new Date(),
      resolved_by: userId,
      resolution_action: action,
    },
  });

  // Log resolution in quote history
  await db.quoteStateHistory.create({
    data: {
      quote_id: dispute.quote_id,
      status: quote.status, // Current status
      triggered_by: 'user',
      triggered_by_id: userId,
      notes: `Dispute resolved: ${resolution}`,
    },
  });

  // Email customer
  await sendEmail({
    to: dispute.raised_by_email,
    subject: `Dispute resolved - Quote #${quote.number}`,
    template: 'dispute-resolved',
    data: { dispute, resolution, action },
  });
}
```

---

## 7. Database Schema Additions

### Quotes Table Updates

```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number VARCHAR(50) UNIQUE NOT NULL, -- QT-2025-001
  version INTEGER DEFAULT 1,
  parent_quote_id UUID REFERENCES quotes(id), -- Previous version
  root_quote_id UUID REFERENCES quotes(id), -- Original v1

  -- Status tracking
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  -- Enum: draft, sent, viewed, accepted, rejected, expired, cancelled, revised

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  viewed_at TIMESTAMP,
  expires_at TIMESTAMP,
  accepted_at TIMESTAMP,
  rejected_at TIMESTAMP,
  cancelled_at TIMESTAMP,

  -- Cancellation
  cancelled_by UUID REFERENCES users(id),
  cancellation_reason TEXT,

  -- Disputes
  has_dispute BOOLEAN DEFAULT FALSE,
  dispute_count INTEGER DEFAULT 0,

  -- Soft delete
  deleted_at TIMESTAMP,
  deleted_by UUID REFERENCES users(id),

  -- Existing fields...
  user_id UUID NOT NULL REFERENCES users(id),
  customer_email VARCHAR(255) NOT NULL,
  grand_total DECIMAL(10,2),
  -- ... other fields

  -- Indexes
  CREATE INDEX idx_quotes_status ON quotes(status);
  CREATE INDEX idx_quotes_expires_at ON quotes(expires_at) WHERE status IN ('sent', 'viewed');
  CREATE INDEX idx_quotes_version_chain ON quotes(root_quote_id, version);
  CREATE INDEX idx_quotes_deleted ON quotes(deleted_at) WHERE deleted_at IS NOT NULL;
);
```

### Quote State History Table

```sql
CREATE TABLE quote_state_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  entered_at TIMESTAMP DEFAULT NOW(),
  triggered_by VARCHAR(20) NOT NULL, -- user, system, customer
  triggered_by_id VARCHAR(255), -- User ID or customer email
  notes TEXT,
  metadata JSONB, -- Flexible additional data

  CREATE INDEX idx_state_history_quote ON quote_state_history(quote_id, entered_at DESC);
  CREATE INDEX idx_state_history_status ON quote_state_history(status);
);
```

### Quote Disputes Table

```sql
CREATE TABLE quote_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  raised_by VARCHAR(20) NOT NULL, -- customer, user
  raised_by_email VARCHAR(255) NOT NULL,
  dispute_type VARCHAR(50) NOT NULL,
  -- Enum: accuracy, pricing, equipment, scope, other
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open',
  -- Enum: open, under_review, escalated, resolved, rejected
  resolution TEXT,
  resolution_action VARCHAR(20), -- revised, explained, refunded
  resolved_at TIMESTAMP,
  resolved_by UUID REFERENCES users(id),
  escalated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),

  CREATE INDEX idx_disputes_quote ON quote_disputes(quote_id);
  CREATE INDEX idx_disputes_status ON quote_disputes(status) WHERE status IN ('open', 'escalated');
);
```

### Expiration Warnings Table

```sql
CREATE TABLE quote_expiration_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  warning_type VARCHAR(20) NOT NULL, -- 7_day, 1_day, final
  sent_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(quote_id, warning_type),
  CREATE INDEX idx_expiration_warnings ON quote_expiration_warnings(quote_id);
);
```

---

## 8. Email Notifications

### Notification Templates

#### 1. Quote Sent Confirmation

**To:** Quote author
**When:** Quote status changes to `sent`
**Subject:** Quote #{{quote.number}} sent to {{customer.name}}

```html
<h2>Quote Sent Successfully</h2>
<p>Your quote has been sent to {{customer.name}} ({{customer.email}}).</p>

<div class="quote-summary">
  <strong>Quote #{{quote.number}}</strong> v{{quote.version}}<br>
  Total: ${{quote.grand_total}}<br>
  Expires: {{quote.expires_at | date}}
</div>

<a href="{{app_url}}/quotes/{{quote.id}}" class="btn">View Quote</a>

<p>You'll be notified when the customer views or responds to the quote.</p>
```

#### 2. Quote Viewed Notification

**To:** Quote author
**When:** Customer opens quote link (first time only)
**Subject:** {{customer.name}} viewed Quote #{{quote.number}}

```html
<h2>Quote Opened</h2>
<p>{{customer.name}} viewed your quote on {{viewed_at | datetime}}.</p>

<div class="quote-summary">
  <strong>Quote #{{quote.number}}</strong><br>
  Total: ${{quote.grand_total}}<br>
  Expires: {{quote.expires_at | date}}
</div>

<a href="{{app_url}}/quotes/{{quote.id}}" class="btn">View Quote</a>
```

#### 3. Expiration Warning (7 days)

**To:** Quote author
**When:** 7 days before `expires_at`
**Subject:** Quote #{{quote.number}} expires in 7 days

```html
<h2>Quote Expiring Soon</h2>
<p>Your quote to {{customer.name}} will expire in 7 days ({{quote.expires_at | date}}).</p>

<div class="quote-summary">
  <strong>Quote #{{quote.number}}</strong><br>
  Status: {{quote.status}}<br>
  Total: ${{quote.grand_total}}
</div>

<p><strong>Actions:</strong></p>
<ul>
  <li><a href="{{app_url}}/quotes/{{quote.id}}/extend">Extend expiry date</a></li>
  <li><a href="{{app_url}}/quotes/{{quote.id}}/remind">Send customer reminder</a></li>
  <li><a href="{{app_url}}/quotes/{{quote.id}}">View quote</a></li>
</ul>
```

#### 4. Expiration Warning (1 day)

**To:** Quote author (+ optional customer reminder)
**When:** 1 day before `expires_at`
**Subject:** Quote #{{quote.number}} expires tomorrow

```html
<h2>⚠️ Quote Expires Tomorrow</h2>
<p>Your quote to {{customer.name}} will expire tomorrow ({{quote.expires_at | date}}).</p>

<div class="alert">
  <strong>Quote #{{quote.number}}</strong><br>
  Status: {{quote.status}}<br>
  Total: ${{quote.grand_total}}<br>
  <span class="expires-soon">Expires in less than 24 hours</span>
</div>

<a href="{{app_url}}/quotes/{{quote.id}}/extend" class="btn-primary">Extend Expiry Now</a>
<a href="{{app_url}}/quotes/{{quote.id}}/remind" class="btn">Remind Customer</a>
```

#### 5. Quote Expired

**To:** Quote author
**When:** Status changes to `expired` (auto-expire job)
**Subject:** Quote #{{quote.number}} has expired

```html
<h2>Quote Expired</h2>
<p>Your quote to {{customer.name}} has expired without a response.</p>

<div class="quote-summary">
  <strong>Quote #{{quote.number}}</strong><br>
  Total: ${{quote.grand_total}}<br>
  Expired: {{quote.expires_at | date}}
</div>

<p><strong>What would you like to do?</strong></p>
<ul>
  <li><a href="{{app_url}}/quotes/{{quote.id}}/extend">Extend expiry and re-send</a></li>
  <li><a href="{{app_url}}/quotes/{{quote.id}}/revise">Create new revision</a></li>
  <li><a href="{{app_url}}/quotes/{{quote.id}}">Archive quote</a></li>
</ul>
```

#### 6. Quote Accepted

**To:** Quote author
**When:** Customer clicks "Accept Quote"
**Subject:** ✅ {{customer.name}} accepted Quote #{{quote.number}}

```html
<h2>🎉 Quote Accepted!</h2>
<p>Great news! {{customer.name}} has accepted your quote.</p>

<div class="quote-summary">
  <strong>Quote #{{quote.number}}</strong><br>
  Total: ${{quote.grand_total}}<br>
  Accepted: {{quote.accepted_at | datetime}}
</div>

<a href="{{app_url}}/quotes/{{quote.id}}" class="btn-success">View Quote</a>
<a href="{{app_url}}/projects/new?quote={{quote.id}}" class="btn">Create Project</a>

<p><strong>Next steps:</strong></p>
<ul>
  <li>Confirm event details with customer</li>
  <li>Schedule equipment and crew</li>
  <li>Send deposit invoice (if required)</li>
</ul>
```

#### 7. Quote Rejected

**To:** Quote author
**When:** Customer clicks "Decline Quote"
**Subject:** {{customer.name}} declined Quote #{{quote.number}}

```html
<h2>Quote Declined</h2>
<p>{{customer.name}} has declined Quote #{{quote.number}}.</p>

{{#if rejection_reason}}
<div class="rejection-reason">
  <strong>Reason:</strong> {{rejection_reason}}
</div>
{{/if}}

<div class="quote-summary">
  <strong>Quote #{{quote.number}}</strong><br>
  Total: ${{quote.grand_total}}<br>
  Declined: {{quote.rejected_at | datetime}}
</div>

<p><strong>What would you like to do?</strong></p>
<ul>
  <li><a href="{{app_url}}/quotes/{{quote.id}}/revise">Create revised quote</a></li>
  <li><a href="{{app_url}}/quotes/{{quote.id}}/contact">Contact customer</a></li>
  <li><a href="{{app_url}}/quotes/{{quote.id}}">View quote</a></li>
</ul>
```

#### 8. Quote Revised (to customer)

**To:** Customer
**When:** New version sent after revision
**Subject:** Updated Quote #{{quote.number}} v{{quote.version}}

```html
<h2>Updated Quote Available</h2>
<p>We've updated your quote based on {{revision_reason}}.</p>

<div class="revision-summary">
  <strong>Quote #{{quote.number}}</strong> v{{quote.version}}<br>
  Previous total: ${{original_total}}<br>
  New total: ${{revised_total}}<br>
  Change: {{#if price_increase}}+{{/if}}${{price_change}} ({{price_change_percent}}%)
</div>

{{#if summary.items_added.length}}
<h3>Added Items:</h3>
<ul>
{{#each summary.items_added}}
  <li>{{quantity}}x {{name}} - ${{total}}</li>
{{/each}}
</ul>
{{/if}}

{{#if summary.items_removed.length}}
<h3>Removed Items:</h3>
<ul>
{{#each summary.items_removed}}
  <li>{{quantity}}x {{name}}</li>
{{/each}}
</ul>
{{/if}}

<a href="{{quote_url}}" class="btn-primary">View Updated Quote</a>

<p>This quote expires on {{quote.expires_at | date}}.</p>
```

### Email Trigger Configuration

```typescript
// n8n workflow triggers
const EMAIL_TRIGGERS = {
  quote_sent: {
    event: 'quote.sent',
    to: 'user',
    template: 'quote-sent-confirmation',
  },
  quote_viewed: {
    event: 'quote.viewed',
    to: 'user',
    template: 'quote-viewed',
  },
  quote_accepted: {
    event: 'quote.accepted',
    to: 'user',
    template: 'quote-accepted',
  },
  quote_rejected: {
    event: 'quote.rejected',
    to: 'user',
    template: 'quote-rejected',
  },
  expiry_warning_7d: {
    event: 'quote.expiry_warning',
    condition: 'days_until_expiry === 7',
    to: 'user',
    template: 'expiry-warning-7d',
  },
  expiry_warning_1d: {
    event: 'quote.expiry_warning',
    condition: 'days_until_expiry === 1',
    to: ['user', 'customer'],
    template: 'expiry-warning-1d',
  },
  quote_expired: {
    event: 'quote.expired',
    to: 'user',
    template: 'quote-expired',
  },
  quote_revised: {
    event: 'quote.revised',
    to: 'customer',
    template: 'quote-revised',
  },
};
```

---

## 9. UI Implications

### Status Badges and Colors

```typescript
const STATUS_STYLES = {
  draft: {
    color: 'gray',
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
    icon: '📝',
    label: 'Draft',
  },
  sent: {
    color: 'blue',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    icon: '📤',
    label: 'Sent',
  },
  viewed: {
    color: 'purple',
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    icon: '👁️',
    label: 'Viewed',
  },
  accepted: {
    color: 'green',
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    icon: '✅',
    label: 'Accepted',
  },
  rejected: {
    color: 'red',
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    icon: '❌',
    label: 'Rejected',
  },
  expired: {
    color: 'orange',
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    icon: '⏰',
    label: 'Expired',
  },
  cancelled: {
    color: 'gray',
    bg: 'bg-gray-200',
    text: 'text-gray-600',
    border: 'border-gray-400',
    icon: '🚫',
    label: 'Cancelled',
  },
  revised: {
    color: 'yellow',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    icon: '📝',
    label: 'Revised',
  },
};
```

**Badge component:**

```tsx
function StatusBadge({ status }: { status: QuoteStatus }) {
  const style = STATUS_STYLES[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text} ${style.border} border`}>
      <span>{style.icon}</span>
      {style.label}
    </span>
  );
}
```

### Action Buttons Per State

```tsx
function QuoteActions({ quote }: { quote: Quote }) {
  const actions = getAvailableActions(quote.status);

  return (
    <div className="flex gap-2">
      {actions.map(action => (
        <button
          key={action.id}
          onClick={() => handleAction(action.id, quote.id)}
          className={`btn ${action.style}`}
        >
          {action.icon} {action.label}
        </button>
      ))}
    </div>
  );
}

function getAvailableActions(status: QuoteStatus): Action[] {
  const actionMap: Record<QuoteStatus, Action[]> = {
    draft: [
      { id: 'edit', label: 'Edit', icon: '✏️', style: 'btn-primary' },
      { id: 'send', label: 'Send to Customer', icon: '📤', style: 'btn-success' },
      { id: 'delete', label: 'Delete', icon: '🗑️', style: 'btn-danger' },
    ],
    sent: [
      { id: 'view', label: 'View', icon: '👁️', style: 'btn-secondary' },
      { id: 'extend', label: 'Extend Expiry', icon: '⏰', style: 'btn-primary' },
      { id: 'revise', label: 'Create Revision', icon: '📝', style: 'btn-primary' },
      { id: 'cancel', label: 'Cancel', icon: '🚫', style: 'btn-danger' },
    ],
    viewed: [
      { id: 'view', label: 'View', icon: '👁️', style: 'btn-secondary' },
      { id: 'extend', label: 'Extend Expiry', icon: '⏰', style: 'btn-primary' },
      { id: 'revise', label: 'Create Revision', icon: '📝', style: 'btn-primary' },
      { id: 'cancel', label: 'Cancel', icon: '🚫', style: 'btn-danger' },
    ],
    accepted: [
      { id: 'view', label: 'View', icon: '👁️', style: 'btn-secondary' },
      { id: 'create_project', label: 'Create Project', icon: '🚀', style: 'btn-success' },
      { id: 'revise', label: 'Change Order', icon: '📝', style: 'btn-primary' },
    ],
    rejected: [
      { id: 'view', label: 'View', icon: '👁️', style: 'btn-secondary' },
      { id: 'revise', label: 'Create Revision', icon: '📝', style: 'btn-primary' },
      { id: 'archive', label: 'Archive', icon: '📦', style: 'btn-secondary' },
    ],
    expired: [
      { id: 'view', label: 'View', icon: '👁️', style: 'btn-secondary' },
      { id: 'extend', label: 'Extend & Resend', icon: '📤', style: 'btn-success' },
      { id: 'revise', label: 'Create Revision', icon: '📝', style: 'btn-primary' },
      { id: 'archive', label: 'Archive', icon: '📦', style: 'btn-secondary' },
    ],
    cancelled: [
      { id: 'view', label: 'View', icon: '👁️', style: 'btn-secondary' },
      { id: 'archive', label: 'Archive', icon: '📦', style: 'btn-secondary' },
    ],
    revised: [
      { id: 'view', label: 'View', icon: '👁️', style: 'btn-secondary' },
      { id: 'view_latest', label: 'View Latest Version', icon: '🔄', style: 'btn-primary' },
    ],
  };

  return actionMap[status] || [];
}
```

### Quote History View

**Timeline component showing all state changes:**

```tsx
function QuoteTimeline({ quote }: { quote: Quote }) {
  const history = useQuoteHistory(quote.id);

  return (
    <div className="timeline">
      {history.map((entry, index) => (
        <div key={entry.id} className="timeline-entry">
          <div className="timeline-icon">
            <StatusIcon status={entry.status} />
          </div>
          <div className="timeline-content">
            <div className="timeline-header">
              <StatusBadge status={entry.status} />
              <span className="timeline-date">
                {formatDateTime(entry.entered_at)}
              </span>
            </div>
            <div className="timeline-body">
              <p className="text-sm text-gray-600">
                {getStatusDescription(entry)}
              </p>
              {entry.notes && (
                <p className="text-sm text-gray-500 italic mt-1">
                  "{entry.notes}"
                </p>
              )}
              {entry.triggered_by === 'user' && (
                <p className="text-xs text-gray-400 mt-1">
                  by {getUserName(entry.triggered_by_id)}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getStatusDescription(entry: StateHistoryEntry): string {
  const descriptions = {
    draft: 'Quote created',
    sent: `Sent to ${entry.metadata?.customer_email}`,
    viewed: `Viewed by customer`,
    accepted: `Accepted by customer`,
    rejected: `Declined by customer`,
    expired: `Quote expired`,
    cancelled: `Quote cancelled`,
    revised: `Revision created (v${entry.metadata?.version})`,
  };
  return descriptions[entry.status] || 'Status updated';
}
```

### Revision Comparison View

**Side-by-side diff for comparing versions:**

```tsx
function RevisionComparison({ originalId, revisionId }: Props) {
  const original = useQuote(originalId);
  const revision = useQuote(revisionId);
  const summary = calculateRevisionSummary(original, revision);

  return (
    <div className="revision-comparison">
      <div className="comparison-header">
        <h2>Quote Revision Comparison</h2>
        <div className="version-badges">
          <span className="version-badge">v{original.version}</span>
          <span className="arrow">→</span>
          <span className="version-badge current">v{revision.version}</span>
        </div>
      </div>

      <div className="price-summary">
        <div className="price-original">
          <label>Original Total</label>
          <div className="price">${original.grand_total}</div>
        </div>
        <div className="price-arrow">→</div>
        <div className="price-revised">
          <label>Revised Total</label>
          <div className="price">${revision.grand_total}</div>
        </div>
        <div className={`price-change ${summary.price_change >= 0 ? 'increase' : 'decrease'}`}>
          <label>Change</label>
          <div className="price">
            {summary.price_change >= 0 ? '+' : ''}${summary.price_change}
            <span className="percent">({summary.price_change_percent}%)</span>
          </div>
        </div>
      </div>

      <div className="line-items-comparison">
        <div className="changes-section">
          {summary.items_added.length > 0 && (
            <div className="added-items">
              <h3 className="text-green-600">+ Added Items ({summary.items_added.length})</h3>
              {summary.items_added.map(item => (
                <LineItemRow key={item.id} item={item} highlight="added" />
              ))}
            </div>
          )}

          {summary.items_removed.length > 0 && (
            <div className="removed-items">
              <h3 className="text-red-600">- Removed Items ({summary.items_removed.length})</h3>
              {summary.items_removed.map(item => (
                <LineItemRow key={item.id} item={item} highlight="removed" />
              ))}
            </div>
          )}

          {summary.items_modified.length > 0 && (
            <div className="modified-items">
              <h3 className="text-yellow-600">~ Modified Items ({summary.items_modified.length})</h3>
              {summary.items_modified.map(item => (
                <LineItemComparison
                  key={item.id}
                  original={getOriginalItem(original, item.id)}
                  revised={item}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Quote List with Expiry Indicators

```tsx
function QuoteListItem({ quote }: { quote: Quote }) {
  const daysUntilExpiry = getDaysUntilExpiry(quote.expires_at);
  const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;

  return (
    <div className={`quote-list-item ${isExpiringSoon ? 'expiring-soon' : ''}`}>
      <div className="quote-header">
        <h3>{quote.number} v{quote.version}</h3>
        <StatusBadge status={quote.status} />
      </div>

      <div className="quote-details">
        <div className="customer">{quote.customer_name}</div>
        <div className="total">${quote.grand_total}</div>

        {quote.status === 'sent' || quote.status === 'viewed' ? (
          <div className={`expiry ${isExpiringSoon ? 'warning' : ''}`}>
            {isExpiringSoon && <span className="icon">⚠️</span>}
            Expires {formatRelativeTime(quote.expires_at)}
          </div>
        ) : null}

        {quote.has_dispute && (
          <div className="dispute-indicator">
            <span className="icon">⚠️</span>
            Active dispute
          </div>
        )}
      </div>

      <QuoteActions quote={quote} />
    </div>
  );
}
```

---

## 10. Cron Jobs & Background Tasks

### Expiration Warning Job

**Runs:** Every day at 9:00 AM
**Purpose:** Send expiration warnings for quotes expiring soon

```typescript
// Supabase Edge Function or n8n workflow
async function sendExpirationWarnings() {
  const now = new Date();
  const sevenDaysFromNow = addDays(now, 7);
  const oneDayFromNow = addDays(now, 1);

  // 7-day warnings
  const quotes7d = await db.quote.findMany({
    where: {
      status: { in: ['sent', 'viewed'] },
      expires_at: {
        gte: sevenDaysFromNow,
        lt: addHours(sevenDaysFromNow, 1), // 1-hour window
      },
    },
    include: { user: true },
  });

  for (const quote of quotes7d) {
    const alreadySent = await db.quoteExpirationWarning.findUnique({
      where: { quote_id_warning_type: { quote_id: quote.id, warning_type: '7_day' } },
    });

    if (!alreadySent) {
      await sendEmail({
        to: quote.user.email,
        subject: `Quote #${quote.number} expires in 7 days`,
        template: 'expiry-warning-7d',
        data: { quote },
      });

      await db.quoteExpirationWarning.create({
        data: { quote_id: quote.id, warning_type: '7_day' },
      });
    }
  }

  // 1-day warnings (repeat for 1_day)
  // ...
}
```

### Auto-Expire Job

**Runs:** Every hour
**Purpose:** Expire quotes past their expiry date

```typescript
async function autoExpireQuotes() {
  const now = new Date();

  const expiredQuotes = await db.quote.findMany({
    where: {
      status: { in: ['sent', 'viewed'] },
      expires_at: { lt: now },
    },
    include: { user: true },
  });

  for (const quote of expiredQuotes) {
    await db.quote.update({
      where: { id: quote.id },
      data: {
        status: 'expired',
        state_history: {
          create: {
            status: 'expired',
            triggered_by: 'system',
            notes: 'Auto-expired by system',
          },
        },
      },
    });

    await sendEmail({
      to: quote.user.email,
      subject: `Quote #${quote.number} has expired`,
      template: 'quote-expired',
      data: { quote },
    });
  }

  return { expired_count: expiredQuotes.length };
}
```

---

## Summary

This document defines:

✅ **8 quote states** with clear definitions
✅ **State machine** with valid transitions and triggers
✅ **Expiration policy** with 30-day default, warnings, and re-activation
✅ **Revision flow** with version tracking and price change handling
✅ **Cancellation policy** for all states
✅ **Dispute handling** with escalation and resolution
✅ **Database schema** for quotes, state history, disputes, warnings
✅ **8 email templates** for all lifecycle events
✅ **UI components** for status badges, actions, timeline, comparison
✅ **Cron jobs** for expiration warnings and auto-expire

**Next steps for implementation:**

1. Create database migrations for new tables
2. Build state machine helper functions
3. Set up email templates in n8n
4. Create UI components for quote lifecycle views
5. Configure cron jobs in Supabase
6. Test full lifecycle from draft → expired → revised → accepted
