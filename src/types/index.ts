// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  company?: string;
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  profilePictureUrl?: string;
  createdAt: string;
}

// Quote types
export type QuoteStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'expired'
  | 'revision_requested';

export interface Quote {
  id: string;
  userId: string;
  clientName: string;
  clientEmail: string;
  eventName: string;
  eventDate: string;
  venue: string;
  status: QuoteStatus;
  totalAmount: number;
  lineItems: LineItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export type LineItemCategory =
  | 'audio'
  | 'video'
  | 'lighting'
  | 'staging'
  | 'rigging'
  | 'cables'
  | 'signal'
  | 'decor'
  | 'power'
  | 'comms'
  | 'labor'
  | 'other';

export interface LineItem {
  id: string;
  category: LineItemCategory;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Form/Questionnaire types
export interface EventRequirements {
  eventType: string;
  attendeeCount: number;
  venueType: 'indoor' | 'outdoor' | 'hybrid';
  audioNeeds: AudioRequirements;
  videoNeeds: VideoRequirements;
  lightingNeeds: LightingRequirements;
  laborNeeds: LaborRequirements;
}

export interface AudioRequirements {
  hasSpeakers: boolean;
  speakerCount?: number;
  hasMicrophones: boolean;
  microphoneTypes?: string[];
  hasPlayback: boolean;
  hasRecording: boolean;
}

export interface VideoRequirements {
  hasProjection: boolean;
  screenCount?: number;
  hasLEDWall: boolean;
  hasCamera: boolean;
  cameraCount?: number;
  hasStreaming: boolean;
  hasRecording: boolean;
}

export interface LightingRequirements {
  hasStageWash: boolean;
  hasMovingLights: boolean;
  hasUplighting: boolean;
  uplightCount?: number;
  hasFollowspot: boolean;
}

export interface LaborRequirements {
  setupDays: number;
  showDays: number;
  strikeDays: number;
  technicianCount: number;
}

// Quote Versioning types
export type QuoteChangeType =
  | 'created'
  | 'items_added'
  | 'items_removed'
  | 'items_modified'
  | 'status_changed'
  | 'ai_edit_applied'
  | 'manual_snapshot';

export interface QuoteSnapshot {
  eventName: string;
  eventDate: string;
  venue: string;
  status: QuoteStatus;
  totalAmount: number;
  lineItems: LineItem[];
}

export interface QuoteVersion {
  id: string;
  quoteId: string;
  versionNumber: number;
  createdAt: string;
  trigger: 'auto' | 'manual';
  description: string;
  changeType: QuoteChangeType;
  snapshot: QuoteSnapshot;
}

export interface VersionChange {
  type: 'added' | 'removed' | 'modified';
  category: LineItemCategory;
  description: string;
  oldValue?: {
    quantity?: number;
    unitPrice?: number;
    total?: number;
  };
  newValue?: {
    quantity?: number;
    unitPrice?: number;
    total?: number;
  };
  priceDelta: number;
}

export interface QuoteVersionDiff {
  versionA: QuoteVersion;
  versionB: QuoteVersion;
  changes: VersionChange[];
  summary: {
    itemsAdded: number;
    itemsRemoved: number;
    itemsModified: number;
    totalAmountDelta: number;
    percentageChange: number;
  };
}

// Subscription types
export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise';

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  plan: SubscriptionPlan;
  quotesUsed: number;
  quotesLimit: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
}

export interface PlanDetails {
  name: string;
  price: number;
  quotesPerMonth: number | 'unlimited';
  features: string[];
  stripePriceId?: string;
}

export const PLAN_DETAILS: Record<SubscriptionPlan, PlanDetails> = {
  free: {
    name: 'Free',
    price: 0,
    quotesPerMonth: 3,
    features: [
      '3 quotes per month',
      'AI-powered generation',
      'PDF export',
      'Email support',
    ],
  },
  starter: {
    name: 'Starter',
    price: 20,
    quotesPerMonth: 25,
    features: [
      '25 quotes per month',
      'AI-powered generation',
      'PDF export',
      'AI Edit Assistant',
      'Quote versioning',
      'Priority support',
    ],
    stripePriceId: 'price_starter_monthly',
  },
  pro: {
    name: 'Pro',
    price: 60,
    quotesPerMonth: 'unlimited',
    features: [
      'Unlimited quotes',
      'AI-powered generation',
      'PDF export',
      'AI Edit Assistant',
      'Quote versioning',
      'Quick actions',
      'Priority support',
      'Custom branding',
    ],
    stripePriceId: 'price_pro_monthly',
  },
  enterprise: {
    name: 'Enterprise',
    price: 200,
    quotesPerMonth: 'unlimited',
    features: [
      'Everything in Pro',
      'Multi-seat teams',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
    ],
    stripePriceId: 'price_enterprise_monthly',
  },
};
