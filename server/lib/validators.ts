import { z } from 'zod';

// Line item category enum
export const lineItemCategorySchema = z.enum([
  'audio',
  'video',
  'lighting',
  'staging',
  'rigging',
  'cables',
  'signal',
  'decor',
  'power',
  'comms',
  'labor',
  'other',
]);

// Quote status enum
export const quoteStatusSchema = z.enum([
  'draft',
  'pending_review',
  'approved',
  'sent',
  'accepted',
  'rejected',
  'expired',
  'revision_requested',
]);

// Valid status transitions
export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['pending_review', 'sent'],
  pending_review: ['approved', 'draft'],
  approved: ['sent', 'draft'],
  sent: ['accepted', 'rejected', 'expired', 'revision_requested'],
  accepted: ['revision_requested'],
  rejected: ['revision_requested'],
  expired: ['revision_requested'],
  revision_requested: ['draft'],
};

// Line item schema
export const lineItemSchema = z.object({
  id: z.string().optional(),
  category: lineItemCategorySchema,
  description: z.string().min(1).max(500),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  total: z.number().nonnegative().optional(),
});

export const lineItemCreateSchema = lineItemSchema.omit({ id: true, total: true });

export const lineItemUpdateSchema = z.object({
  category: lineItemCategorySchema.optional(),
  description: z.string().min(1).max(500).optional(),
  quantity: z.number().int().positive().optional(),
  unitPrice: z.number().nonnegative().optional(),
});

// Quote schemas
export const quoteCreateSchema = z.object({
  clientName: z.string().min(1).max(200),
  clientEmail: z.string().email(),
  eventName: z.string().min(1).max(200),
  eventDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  venue: z.string().min(1).max(300),
  lineItems: z.array(lineItemSchema).default([]),
  status: quoteStatusSchema.default('draft'),
  expiresAt: z.string().datetime().optional(),
});

export const quoteUpdateSchema = z.object({
  clientName: z.string().min(1).max(200).optional(),
  clientEmail: z.string().email().optional(),
  eventName: z.string().min(1).max(200).optional(),
  eventDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  venue: z.string().min(1).max(300).optional(),
  status: quoteStatusSchema.optional(),
  lineItems: z.array(lineItemSchema).optional(),
  expiresAt: z.string().datetime().optional(),
});

// Pagination and filtering
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const quoteListQuerySchema = paginationSchema.extend({
  status: quoteStatusSchema.optional(),
  sort: z.enum(['createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'totalAmount', '-totalAmount']).default('-createdAt'),
  search: z.string().max(100).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

// AI generation schemas
export const eventDetailsSchema = z.object({
  eventName: z.string().min(1).max(200),
  eventType: z.string().min(1).max(100),
  venueSize: z.enum(['small', 'medium', 'large', 'xl']).or(z.string()),
  venueName: z.string().min(1).max(200),
  startDate: z.string(),
  endDate: z.string().optional(),
  setupDays: z.number().int().nonnegative().default(0),
  strikeDays: z.number().int().nonnegative().default(0),
  notes: z.string().max(2000).optional(),
});

export const equipmentNeedsSchema = z.object({
  categories: z.array(lineItemCategorySchema).min(1),
  budgetRange: z.string().min(1).max(100),
  specificRequests: z.string().max(2000).optional(),
});

export const aiGenerateSchema = z.object({
  eventDetails: eventDetailsSchema,
  equipment: equipmentNeedsSchema,
});

export const aiEditSchema = z.object({
  quoteId: z.string().min(1),
  command: z.string().min(1).max(500).optional(),
  quickAction: z.enum([
    'hit_budget',
    'premium_version',
    'simplify_rigging',
    'add_recording',
    'add_streaming',
    'reduce_labor',
  ]).optional(),
  targetBudget: z.number().positive().optional(),
}).refine(
  (data) => data.command || data.quickAction,
  { message: 'Either command or quickAction is required' }
);

// API key schemas
export const apiKeyCreateSchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).default(['*']),
  expiresInDays: z.number().int().positive().max(365).optional(),
});

// Webhook schemas
export const webhookEventTypeSchema = z.enum([
  'quote.created',
  'quote.updated',
  'quote.sent',
  'quote.viewed',
  'quote.accepted',
  'quote.rejected',
  'quote.expired',
  'ai.job.completed',
  'ai.job.failed',
]);

export const webhookCreateSchema = z.object({
  url: z.string().url().max(500),
  events: z.array(webhookEventTypeSchema).min(1),
  secret: z.string().min(16).max(100).optional(),
});

export const webhookUpdateSchema = z.object({
  url: z.string().url().max(500).optional(),
  events: z.array(webhookEventTypeSchema).min(1).optional(),
  isActive: z.boolean().optional(),
});

// Quote send schema
export const quoteSendSchema = z.object({
  recipientEmail: z.string().email().optional(),
  message: z.string().max(2000).optional(),
});

// Version comparison schema
export const versionCompareSchema = z.object({
  a: z.string().min(1),
  b: z.string().min(1),
});

// Type exports
export type LineItemCategory = z.infer<typeof lineItemCategorySchema>;
export type QuoteStatus = z.infer<typeof quoteStatusSchema>;
export type LineItem = z.infer<typeof lineItemSchema>;
export type LineItemCreate = z.infer<typeof lineItemCreateSchema>;
export type LineItemUpdate = z.infer<typeof lineItemUpdateSchema>;
export type QuoteCreate = z.infer<typeof quoteCreateSchema>;
export type QuoteUpdate = z.infer<typeof quoteUpdateSchema>;
export type QuoteListQuery = z.infer<typeof quoteListQuerySchema>;
export type AIGenerateInput = z.infer<typeof aiGenerateSchema>;
export type AIEditInput = z.infer<typeof aiEditSchema>;
export type ApiKeyCreate = z.infer<typeof apiKeyCreateSchema>;
export type WebhookCreate = z.infer<typeof webhookCreateSchema>;
export type WebhookUpdate = z.infer<typeof webhookUpdateSchema>;
