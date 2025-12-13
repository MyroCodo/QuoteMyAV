// Main client
export { QuoteMyAV } from './client';
export type { QuoteMyAVConfig, PollOptions } from './client';

// Re-export all generated types for convenience
export type {
  AIEditRequest,
  AIGenerateRequest,
  AIJob,
  APIKey,
  APIKeyCreate,
  Error as ApiError,
  LineItem,
  LineItemCategory,
  LineItemCreate,
  LineItemUpdate,
  PaginationMeta,
  Quote,
  QuoteCreate,
  QuoteStatus,
  QuoteSummary,
  QuoteUpdate,
  QuoteVersion,
  Subscription,
  User,
  VersionDiff,
  WebhookCreate,
  WebhookDelivery,
  WebhookEndpoint,
  WebhookEventType,
  WebhookUpdate,
} from './generated';

// Re-export services for advanced usage
export {
  QuotesService,
  LineItemsService,
  VersionsService,
  AiService,
  UsersService,
  WebhooksService,
} from './generated';

// Re-export OpenAPI config for advanced customization
export { OpenAPI } from './generated';
