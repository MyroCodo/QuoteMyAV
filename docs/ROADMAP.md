# QuoteMyAV Product Roadmap

## Vision

Build a comprehensive quote-building system "like R2" for AV and live events, covering quoting, inventory, logistics, approvals, and client management end-to-end.

---

## Release Timeline

| Phase | Name | Status | Target |
|-------|------|--------|--------|
| MVP | Form-Based Quote Generation | ✅ Complete | Launch |
| 1 | Live Quote Editor | ✅ Complete | v1.1 |
| 2 | AI Edit Assistant | ✅ Complete | v1.2 |
| 3 | Quote Versioning | ✅ Complete | v1.3 |
| 4 | Equipment Catalog & Packages | 🔲 Planned | v2.0 |
| 5 | Inventory & Availability | 🔲 Planned | v2.1 |
| 6 | Labor & Logistics | 🔲 Planned | v2.2 |
| 7 | Multi-Layer Pricing & Approvals | 🔲 Planned | v3.0 |
| 8 | Documents & E-Signature | 🔲 Planned | v3.1 |
| 9 | Client Portal | 🔲 Planned | v3.2 |
| 10 | CRM & Reporting | 🔲 Planned | v4.0 |
| 11 | Audit Trail & Admin | 🔲 Planned | v4.1 |

---

## MVP (Complete)

**Goal:** Form-based AI quote generation

See: `docs/mvp/01-architecture.md`

### Features
- Multi-step quote wizard (Type → Event → Gear → Review)
- AI-powered quote generation via Claude
- 12 equipment categories (audio, video, lighting, staging, rigging, cables, signal, decor, power, comms, labor, other)
- User authentication (Supabase)
- Quote history dashboard
- PDF export
- Usage-based subscription tiers

### Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Zustand (state management)
- n8n (AI workflows)
- Supabase (auth + database)
- jsPDF (PDF generation)

---

## Phase 1: Live Quote Editor ✅

**Goal:** Make quotes fully editable with inline controls

### Features Delivered
- Click-to-edit line items (description, quantity, unit price)
- Real-time total recalculation
- Add/remove line items with confirmation dialogs
- Category-organized display with color coding
- Category subtotals

### Files Created
- `src/components/quote/EditableLineItem.tsx`
- `src/components/quote/AddLineItemModal.tsx`
- `src/components/quote/QuoteTotals.tsx`
- `src/components/quote/LiveQuoteEditor.tsx`
- `src/components/quote/constants.ts`
- `src/components/ui/Modal.tsx`

---

## Phase 2: AI Edit Assistant ✅

**Goal:** Natural language quote modifications

### Features Delivered
- AI sidebar for text commands ("reduce cost by 15%")
- 6 quick actions:
  - Hit Budget (reduce costs 15-20%)
  - Premium Version (upgrade equipment)
  - Simplify Setup (reduce rigging complexity)
  - Add Recording (video recording package)
  - Add Streaming (live stream capability)
  - Cut Labor (minimize labor costs)
- Preview changes before applying
- Change summary with cost impact
- Command history

### Files Created
- `src/components/quote/AIEditSidebar.tsx`
- `src/components/quote/QuickActionButtons.tsx`
- `src/components/quote/ChangeLogItem.tsx`
- `src/stores/aiEditStore.ts`
- `src/services/ai-edit.ts`

---

## Phase 3: Quote Versioning ✅

**Goal:** Track changes with snapshots and comparison

### Features Delivered
- Auto-versioning on changes (8 change types)
- Version history panel (timeline view)
- Side-by-side version comparison
- Visual diff (added/removed/modified items)
- Restore any previous version
- localStorage persistence

### Files Created
- `src/stores/versionStore.ts`
- `src/services/versions.ts`
- `src/components/quote/VersionHistoryPanel.tsx`
- `src/components/quote/VersionCompareModal.tsx`

### Types Added
- `QuoteVersion`
- `QuoteSnapshot`
- `QuoteChangeType`
- `QuoteVersionDiff`
- `VersionChange`

---

## Phase 4: Equipment Catalog & Packages

**Goal:** Configurable item catalog with packages, dynamic pricing rules, and margin controls

### Planned Features
- Master equipment catalog with SKUs
- Daily/weekly/monthly rental rates
- Weekend multipliers
- Cost basis and minimum margin locks
- Maximum discount limits
- Equipment packages (Good/Better/Best tiers)
- Package builder for creating bundles
- Dynamic pricing rules (quantity discounts, date-based)
- AI suggestions based on catalog data

### New Types
```typescript
interface CatalogItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: LineItemCategory;
  subcategory?: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate?: number;
  weekendMultiplier: number;
  minimumCharge: number;
  costBasis: number;
  minMargin: number;
  maxDiscount: number;
  inventoryItemId?: string;
  isSubRentalAllowed: boolean;
  weight?: number;
  dimensions?: string;
  powerRequirements?: string;
  imageUrl?: string;
  tags: string[];
  isActive: boolean;
}

interface EquipmentPackage {
  id: string;
  name: string;
  description: string;
  category: LineItemCategory;
  tier: 'basic' | 'standard' | 'premium';
  items: PackageItem[];
  packagePrice?: number;
  discountPercent?: number;
  eventTypes: string[];
  minAttendees?: number;
  maxAttendees?: number;
  isActive: boolean;
}

interface PricingRule {
  id: string;
  name: string;
  type: 'discount' | 'multiplier' | 'override';
  conditions: {
    minQuantity?: number;
    minTotal?: number;
    eventTypes?: string[];
    customerTiers?: string[];
    dateRanges?: { start: string; end: string }[];
    promotionCode?: string;
  };
  value: number;
  appliesTo: 'item' | 'category' | 'total';
  categoryFilter?: LineItemCategory[];
  priority: number;
  isStackable: boolean;
  requiresApproval: boolean;
  isActive: boolean;
}
```

### Files to Create
- `src/types/catalog.ts`
- `src/stores/catalogStore.ts`
- `src/services/catalog.ts`
- `src/pages/CatalogManager.tsx`
- `src/components/catalog/CatalogItemEditor.tsx`
- `src/components/catalog/PackageBuilder.tsx`
- `src/components/catalog/PricingRuleEditor.tsx`
- `src/components/quote/PackageSelector.tsx`

---

## Phase 5: Inventory & Availability

**Goal:** Real-time inventory tracking, availability checks, and conflict detection

### Planned Features
- Equipment inventory with quantities
- Warehouse/location tracking
- Serial number and asset tag tracking
- Condition tracking (excellent/good/fair/repair)
- Maintenance scheduling
- Soft reservations (tentative) vs hard reservations (confirmed)
- Real-time availability checks per date range
- Conflict detection when dates shift
- "Affected orders" view for date changes
- Sub-rental suggestions when stock is low
- Alternate item suggestions

### New Types
```typescript
interface InventoryItem {
  id: string;
  catalogItemId: string;
  totalQuantity: number;
  ownedQuantity: number;
  subRentalQuantity: number;
  warehouseId: string;
  location?: string;
  condition: 'excellent' | 'good' | 'fair' | 'repair';
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  serialNumbers?: string[];
  assetTags?: string[];
}

interface Reservation {
  id: string;
  quoteId: string;
  lineItemId: string;
  inventoryItemId: string;
  type: 'soft' | 'hard';
  status: 'pending' | 'confirmed' | 'released' | 'fulfilled';
  quantity: number;
  pickupDate: string;
  returnDate: string;
  eventId?: string;
  createdAt: string;
  expiresAt?: string;
}

interface AvailabilityCheck {
  inventoryItemId: string;
  catalogItemId: string;
  requestedQuantity: number;
  dateRange: { start: string; end: string };
  availableQuantity: number;
  conflictingReservations: Reservation[];
  alternateItems?: CatalogItem[];
  subRentalOptions?: SubRentalOption[];
}
```

### Files to Create
- `src/types/inventory.ts`
- `src/stores/inventoryStore.ts`
- `src/services/inventory.ts`
- `src/pages/InventoryManager.tsx`
- `src/components/inventory/InventoryGrid.tsx`
- `src/components/inventory/AvailabilityCalendar.tsx`
- `src/components/inventory/ConflictResolver.tsx`
- `src/components/quote/AvailabilityIndicator.tsx`

---

## Phase 6: Labor & Logistics

**Goal:** Crew scheduling, role-based labor planning, and logistics management

### Planned Features
- Labor roles with day/half-day/hourly rates
- Overtime multipliers (after 10 hours)
- Travel day rates, per diem, mileage
- Crew member database with certifications
- Availability and blocked dates
- Drag-and-drop crew scheduling
- Crew assignment status (tentative/confirmed/declined)
- Truck planning with load lists
- Load-in/load-out scheduling
- Venue constraints (dock access, elevator, max truck size)
- Power requirement calculator
- Rigging notes and weight limits
- Auto-populate logistics from venue presets

### New Types
```typescript
interface LaborRole {
  id: string;
  name: string;
  category: 'technical' | 'stagehand' | 'management' | 'specialized';
  dayRate: number;
  halfDayRate: number;
  hourlyRate: number;
  overtimeMultiplier: number;
  travelDayRate?: number;
  perDiem?: number;
  mileageRate?: number;
  certifications?: string[];
  minimumExperience?: number;
}

interface CrewMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roles: string[];
  certifications: string[];
  defaultAvailability: WeeklyAvailability;
  blockedDates: string[];
  maxTravelDistance?: number;
  preferredVenues?: string[];
}

interface CrewAssignment {
  id: string;
  quoteId: string;
  eventId?: string;
  crewMemberId: string;
  roleId: string;
  dates: {
    date: string;
    callTime: string;
    estimatedWrap: string;
    type: 'setup' | 'show' | 'strike' | 'travel';
  }[];
  dayRate: number;
  estimatedTotal: number;
  status: 'tentative' | 'confirmed' | 'declined';
  confirmedAt?: string;
}

interface LogisticsInfo {
  quoteId: string;
  trucks: TruckAssignment[];
  loadInDate: string;
  loadInTime: string;
  loadOutDate: string;
  loadOutTime: string;
  venueConstraints: {
    dockAccess: boolean;
    elevatorAccess: boolean;
    maxTruckSize?: string;
    loadingNotes?: string;
  };
  powerRequirements: {
    totalAmps: number;
    voltage: '120V' | '208V' | '480V';
    phases: 1 | 3;
    distroNeeded: boolean;
    generatorNeeded: boolean;
    notes?: string;
  };
  riggingNotes?: string;
  riggingPoints?: number;
  maxWeight?: number;
}
```

### Files to Create
- `src/types/labor.ts`
- `src/stores/laborStore.ts`
- `src/services/labor.ts`
- `src/pages/CrewScheduler.tsx`
- `src/components/labor/CrewBoard.tsx`
- `src/components/labor/RoleRateCard.tsx`
- `src/components/logistics/LogisticsPanel.tsx`
- `src/components/logistics/TruckPlanner.tsx`
- `src/components/logistics/PowerCalculator.tsx`

---

## Phase 7: Multi-Layer Pricing & Approvals

**Goal:** Customer-specific pricing, promotion codes, margin thresholds, and approval workflows

### Planned Features
- Customer discount tiers (standard/preferred/VIP/contract)
- Category-specific discounts per customer
- Contract pricing (fixed prices for specific items)
- Promotion codes with restrictions
- Approval workflow triggers:
  - Discount exceeds threshold
  - Margin falls below minimum
  - Quote total exceeds limit
  - Manual pricing overrides
  - Sub-rentals included
- Multi-step approval chains
- Approval timeout and escalation
- Deposit schedules (50% deposit, balance on delivery)
- Staged billing support

### New Types
```typescript
interface CustomerPricing {
  customerId: string;
  discountTier: 'standard' | 'preferred' | 'vip' | 'contract';
  baseDiscount: number;
  categoryDiscounts: Record<LineItemCategory, number>;
  contractPrices?: {
    catalogItemId: string;
    contractPrice: number;
    validUntil: string;
  }[];
  paymentTerms: 'prepay' | 'net30' | 'net60';
  creditLimit?: number;
}

interface PromotionCode {
  id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_item';
  value: number;
  minOrderValue?: number;
  maxDiscount?: number;
  validCategories?: LineItemCategory[];
  excludedItems?: string[];
  validFrom: string;
  validUntil: string;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
}

interface ApprovalWorkflow {
  id: string;
  name: string;
  triggers: {
    discountExceeds?: number;
    marginBelow?: number;
    totalExceeds?: number;
    hasManualPricing?: boolean;
    hasSubRental?: boolean;
  };
  steps: ApprovalStep[];
}

interface ApprovalRequest {
  id: string;
  quoteId: string;
  workflowId: string;
  currentStep: number;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  requestedBy: string;
  requestedAt: string;
  triggerReason: string;
  notes?: string;
  decisions: {
    step: number;
    decidedBy: string;
    decision: 'approved' | 'rejected' | 'escalated';
    notes?: string;
    decidedAt: string;
  }[];
}
```

### Files to Create
- `src/types/pricing.ts`
- `src/stores/pricingStore.ts`
- `src/stores/approvalStore.ts`
- `src/services/pricing.ts`
- `src/services/approvals.ts`
- `src/pages/ApprovalQueue.tsx`
- `src/components/pricing/PriceBreakdown.tsx`
- `src/components/pricing/DiscountApplier.tsx`
- `src/components/approval/ApprovalBadge.tsx`
- `src/components/approval/ApprovalModal.tsx`

---

## Phase 8: Documents & E-Signature

**Goal:** Branded templates, e-signature, and professional document generation

### Planned Features
- Document templates (quote, proposal, contract, SOW, invoice)
- Custom branding (logo, header, footer)
- Configurable sections and content
- Variable placeholders ({{client_name}}, {{event_date}}, etc.)
- Live PDF preview
- E-signature integration (DocuSign or HelloSign)
- Multi-signer support with ordering
- Signature tracking (viewed, signed, declined)
- Email templates for delivery
- Document open/view tracking
- Signed document storage

### New Types
```typescript
interface DocumentTemplate {
  id: string;
  name: string;
  type: 'quote' | 'proposal' | 'contract' | 'sow' | 'invoice';
  logoUrl?: string;
  headerHtml?: string;
  footerHtml?: string;
  sections: TemplateSection[];
  defaultTerms?: string;
  showLineItemDetails: boolean;
  showUnitPrices: boolean;
  groupByCategory: boolean;
  isDefault: boolean;
}

interface SignatureRequest {
  id: string;
  documentId: string;
  quoteId: string;
  signers: {
    email: string;
    name: string;
    role: 'client' | 'approver' | 'witness';
    order: number;
    status: 'pending' | 'viewed' | 'signed' | 'declined';
    signedAt?: string;
    ipAddress?: string;
  }[];
  expiresAt: string;
  status: 'pending' | 'completed' | 'expired' | 'cancelled';
  completedAt?: string;
  completedDocumentUrl?: string;
}
```

### Files to Create
- `src/types/documents.ts`
- `src/stores/documentStore.ts`
- `src/services/documents.ts`
- `src/services/esignature.ts`
- `src/services/email.ts`
- `src/pages/DocumentTemplates.tsx`
- `src/components/documents/TemplateEditor.tsx`
- `src/components/documents/DocumentPreview.tsx`
- `src/components/documents/SignatureBlock.tsx`
- `src/components/documents/SendQuoteModal.tsx`

### External Integrations
- DocuSign or HelloSign API
- SendGrid or Resend for email

---

## Phase 9: Client Portal

**Goal:** Self-service portal for clients to view, select options, sign, and pay

### Planned Features
- Secure portal access via token link
- Configurable permissions (view pricing, select options, sign, pay, message)
- Quote options (Good/Better/Best tiers)
- Add-on selection
- Client notes/questions
- In-context messaging with staff
- Stripe payment integration
- Deposit and balance payments
- Payment receipts
- Activity tracking (views, selections)
- Email notifications

### New Types
```typescript
interface ClientPortalAccess {
  id: string;
  quoteId: string;
  accessToken: string;
  expiresAt: string;
  clientEmail: string;
  clientName: string;
  canViewPricing: boolean;
  canSelectOptions: boolean;
  canSign: boolean;
  canPay: boolean;
  canMessage: boolean;
  lastAccessedAt?: string;
  accessCount: number;
}

interface QuoteOption {
  id: string;
  quoteId: string;
  name: string;
  description: string;
  includedPackages: string[];
  additionalItems: LineItem[];
  excludedItemIds: string[];
  totalAmount: number;
  savingsVsBase?: number;
  isRecommended: boolean;
  order: number;
}

interface PaymentIntent {
  id: string;
  quoteId: string;
  amount: number;
  description: string;
  type: 'deposit' | 'balance' | 'custom';
  stripePaymentIntentId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completedAt?: string;
  receiptUrl?: string;
}
```

### Files to Create
- `src/types/portal.ts`
- `src/stores/portalStore.ts`
- `src/services/portal.ts`
- `src/services/payments.ts`
- `src/pages/ClientPortal.tsx`
- `src/components/portal/OptionSelector.tsx`
- `src/components/portal/PortalQuoteView.tsx`
- `src/components/portal/PaymentForm.tsx`
- `src/components/portal/MessageThread.tsx`
- `src/components/portal/PortalNav.tsx`

### External Integrations
- Stripe Payments API
- Stripe Elements for checkout

---

## Phase 10: CRM & Reporting

**Goal:** Integrated CRM, pipeline tracking, and business analytics

### Planned Features
- Account management (companies, individuals, venues)
- Contact management with roles
- Opportunity/deal tracking
- Sales pipeline (Kanban view)
- Win/loss tracking with reasons
- Link quotes to opportunities
- Custom report builder
- Dashboard widgets (metrics, charts, lists)
- Key metrics:
  - Quote cycle time
  - Win/loss rate by category, rep, event type
  - Average margin by category
  - Equipment utilization rate
  - Revenue forecast
  - Top customers by revenue
  - Quote revision frequency
- Scheduled report emails
- Export to CSV/PDF

### New Types
```typescript
interface Account {
  id: string;
  name: string;
  type: 'company' | 'individual' | 'venue';
  email?: string;
  phone?: string;
  website?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  accountOwnerId: string;
  tier: 'prospect' | 'standard' | 'preferred' | 'vip';
  lifetimeValue: number;
  outstandingBalance: number;
  creditLimit?: number;
  paymentTerms: string;
  tags: string[];
  notes?: string;
  createdAt: string;
}

interface Opportunity {
  id: string;
  accountId: string;
  contactId?: string;
  name: string;
  description?: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  estimatedValue: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  quoteIds: string[];
  ownerId: string;
  lostReason?: string;
  competitorId?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportDefinition {
  id: string;
  name: string;
  type: 'quotes' | 'revenue' | 'utilization' | 'pipeline' | 'custom';
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'custom';
  customDateRange?: { start: string; end: string };
  filters: Record<string, any>;
  chartType?: 'bar' | 'line' | 'pie' | 'table';
  groupBy?: string;
  isScheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly';
  recipients?: string[];
}
```

### Files to Create
- `src/types/crm.ts`
- `src/stores/crmStore.ts`
- `src/services/crm.ts`
- `src/services/reporting.ts`
- `src/pages/Accounts.tsx`
- `src/pages/Pipeline.tsx`
- `src/pages/Reports.tsx`
- `src/components/crm/AccountCard.tsx`
- `src/components/crm/OpportunityBoard.tsx`
- `src/components/reports/DashboardBuilder.tsx`
- `src/components/reports/MetricCard.tsx`

### External Integrations
- QuickBooks or Xero (accounting sync)

---

## Phase 11: Audit Trail & Admin

**Goal:** Complete audit logging, role-based permissions, and admin tools

### Planned Features
- Detailed audit log of all changes:
  - Who made the change
  - When it was made
  - What was changed (old/new values)
  - AI vs human actions
  - IP address and user agent
- Role-based access control (RBAC)
- Custom roles with granular permissions
- Permission scopes (all, team, own)
- Role-based limits (max discount, max quote value)
- Tax profile management
- API key management for integrations
- System settings configuration
- Sandbox/development environment
- Feature flags
- Audit trail export (CSV, PDF)

### New Types
```typescript
interface AuditLogEntry {
  id: string;
  entityType: 'quote' | 'line_item' | 'catalog_item' | 'user' | 'setting' | 'approval';
  entityId: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'send' | 'sign' | 'ai_edit';
  userId: string;
  userName: string;
  userRole: string;
  isAIAction: boolean;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  maxDiscountPercent?: number;
  maxQuoteValue?: number;
  requiresApprovalAbove?: number;
  isSystem: boolean;
}

interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'approve')[];
  scope: 'all' | 'team' | 'own';
  conditions?: Record<string, any>;
}

interface TaxProfile {
  id: string;
  name: string;
  rates: {
    name: string;
    rate: number;
    appliesTo: 'equipment' | 'labor' | 'all';
    jurisdiction?: string;
  }[];
  isDefault: boolean;
  exemptCategories?: LineItemCategory[];
  exemptCustomerTypes?: string[];
}

interface APIKey {
  id: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  permissions: string[];
  rateLimit?: number;
  isActive: boolean;
  expiresAt?: string;
  lastUsedAt?: string;
  createdBy: string;
  createdAt: string;
}
```

### Files to Create
- `src/types/admin.ts`
- `src/stores/adminStore.ts`
- `src/services/audit.ts`
- `src/services/permissions.ts`
- `src/pages/AuditLog.tsx`
- `src/pages/UserManagement.tsx`
- `src/pages/SystemSettings.tsx`
- `src/components/admin/RoleEditor.tsx`
- `src/components/admin/AuditTable.tsx`
- `src/components/admin/TaxProfileEditor.tsx`
- `src/components/admin/APIKeyManager.tsx`

---

## Database Schema Evolution

### Current (MVP + Phases 1-3)

```sql
-- Via Supabase Auth
profiles (id, full_name, company, tier, created_at)

-- Core
quotes (id, user_id, event_name, event_date, venue, status, total_amount, line_items, created_at, updated_at)

-- Subscriptions
subscriptions (id, user_id, stripe_customer_id, plan, quotes_used, quotes_limit)
```

### Future Additions (Phases 4-11)

```sql
-- Phase 4: Catalog
catalog_items (id, sku, name, category, daily_rate, weekly_rate, cost_basis, min_margin, is_active)
equipment_packages (id, name, tier, items, package_price, event_types)
pricing_rules (id, name, type, conditions, value, applies_to, priority)

-- Phase 5: Inventory
inventory (id, catalog_item_id, total_quantity, warehouse_id, condition)
reservations (id, quote_id, inventory_id, type, quantity, pickup_date, return_date, status)
warehouses (id, name, address, is_default)

-- Phase 6: Labor
labor_roles (id, name, category, day_rate, overtime_multiplier)
crew_members (id, name, email, roles, certifications, blocked_dates)
crew_assignments (id, quote_id, crew_member_id, role_id, dates, status)
logistics (id, quote_id, trucks, load_in, load_out, power_requirements)

-- Phase 7: Pricing & Approvals
customer_pricing (id, customer_id, discount_tier, category_discounts, payment_terms)
promotion_codes (id, code, type, value, valid_from, valid_until, max_uses)
approval_workflows (id, name, triggers, steps)
approval_requests (id, quote_id, workflow_id, status, decisions)

-- Phase 8: Documents
document_templates (id, name, type, sections, branding)
generated_documents (id, quote_id, template_id, pdf_url, sent_at)
signature_requests (id, document_id, signers, status, completed_at)

-- Phase 9: Portal
portal_access (id, quote_id, access_token, permissions, expires_at)
quote_options (id, quote_id, name, tier, items, total_amount)
client_selections (id, quote_id, selected_option_id, add_ons, status)
portal_messages (id, quote_id, sender_id, message, created_at)
payment_intents (id, quote_id, amount, stripe_id, status)

-- Phase 10: CRM
accounts (id, name, type, tier, owner_id, lifetime_value)
contacts (id, account_id, name, email, role, is_primary)
opportunities (id, account_id, name, stage, probability, estimated_value, quote_ids)

-- Phase 11: Admin
audit_log (id, entity_type, entity_id, action, user_id, changes, timestamp)
roles (id, name, permissions, limits)
user_roles (user_id, role_id, team_id)
system_settings (id, category, key, value, type)
tax_profiles (id, name, rates, is_default)
api_keys (id, name, key_hash, permissions, is_active)
```

---

## External Service Integrations

| Service | Purpose | Phase |
|---------|---------|-------|
| n8n | AI workflows, webhooks | ✅ MVP |
| Supabase | Auth, database | ✅ MVP |
| Claude API | AI quote generation | ✅ MVP |
| Stripe | Subscriptions | ✅ MVP |
| Stripe Payments | Client payments | Phase 9 |
| DocuSign/HelloSign | E-signatures | Phase 8 |
| SendGrid/Resend | Email delivery | Phase 8 |
| Google Calendar | Event sync | Phase 6 |
| QuickBooks/Xero | Accounting sync | Phase 10 |

---

## Success Metrics

### MVP (Launch)
- [x] Users can create quotes via guided form
- [x] AI generates professional equipment lists
- [x] PDF export works
- [x] Subscription tiers enforce limits

### v1.x (Phases 1-3)
- [x] Users can edit line items inline
- [x] AI sidebar accepts natural language commands
- [x] Version history tracks all changes
- [x] Users can compare and restore versions

### v2.x (Phases 4-6)
- [ ] 100+ catalog items with packages
- [ ] Real-time availability checks
- [ ] Crew scheduling with drag-and-drop
- [ ] Logistics auto-calculated from equipment

### v3.x (Phases 7-9)
- [ ] Multi-layer pricing calculates correctly
- [ ] Approval workflows route properly
- [ ] E-signatures complete the workflow
- [ ] Clients self-serve via portal

### v4.x (Phases 10-11)
- [ ] Full CRM with pipeline tracking
- [ ] Dashboards show key metrics
- [ ] Complete audit trail of all changes
- [ ] Role-based permissions work correctly

---

## Related Documentation

- `docs/mvp/01-architecture.md` - MVP technical architecture
- `docs/mvp/02-wireframes.md` - MVP UI wireframes
- `docs/shared/rules-engine.md` - Equipment selection logic
- `docs/shared/llm-architecture.md` - Claude integration details
- `docs/shared/quote-lifecycle.md` - Quote status workflow
- `docs/business/pricing-tiers.md` - Subscription pricing
