// API-specific types

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise';

// API Key types
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyPrefix: string; // First 8 chars for identification
  keyHash: string; // bcrypt hash of full key
  scopes: string[];
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

export interface ApiKeyCreate {
  name: string;
  scopes?: string[];
  expiresInDays?: number;
}

export interface ApiKeyResponse {
  id: string;
  key: string; // Full key - only shown once at creation
  name: string;
  scopes: string[];
  createdAt: string;
  expiresAt: string | null;
}

// API Usage tracking
export interface ApiUsage {
  userId: string;
  date: string; // YYYY-MM-DD
  apiCalls: number;
  aiCalls: number;
}

// Rate limit configuration by tier
export const RATE_LIMITS: Record<SubscriptionTier, { apiCallsPerDay: number; aiCallsPerHour: number }> = {
  free: { apiCallsPerDay: 0, aiCallsPerHour: 0 }, // No API access
  starter: { apiCallsPerDay: 0, aiCallsPerHour: 0 }, // No API access
  pro: { apiCallsPerDay: 100, aiCallsPerHour: 20 },
  enterprise: { apiCallsPerDay: 10000, aiCallsPerHour: 500 }, // High limits
};

// Quote quota limits by tier
export const QUOTA_LIMITS: Record<SubscriptionTier, number | 'unlimited'> = {
  free: 3,
  starter: 25,
  pro: 'unlimited',
  enterprise: 'unlimited',
};

// Webhook types
export interface WebhookEndpoint {
  id: string;
  userId: string;
  url: string;
  events: WebhookEventType[];
  secretHash: string;
  isActive: boolean;
  createdAt: string;
  lastDeliveryAt: string | null;
  failureCount: number;
}

export type WebhookEventType =
  | 'quote.created'
  | 'quote.updated'
  | 'quote.sent'
  | 'quote.viewed'
  | 'quote.accepted'
  | 'quote.rejected'
  | 'quote.expired'
  | 'ai.job.completed'
  | 'ai.job.failed';

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  eventType: WebhookEventType;
  payload: Record<string, unknown>;
  status: 'pending' | 'delivered' | 'failed';
  responseCode: number | null;
  responseBody: string | null;
  attempts: number;
  createdAt: string;
  deliveredAt: string | null;
}

export interface WebhookPayload {
  id: string;
  type: WebhookEventType;
  apiVersion: string;
  createdAt: string;
  data: Record<string, unknown>;
}

// AI Job types
export interface AIJob {
  id: string;
  userId: string;
  type: 'generate' | 'edit';
  status: 'processing' | 'completed' | 'failed';
  input: Record<string, unknown>;
  result: Record<string, unknown> | null;
  error: { code: string; message: string } | null;
  createdAt: string;
  completedAt: string | null;
}

// Pagination
export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Standard API response types
export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    requestId: string;
  };
}
