import { OpenAPI } from './generated/core/OpenAPI';
import { QuotesService } from './generated/services/QuotesService';
import { LineItemsService } from './generated/services/LineItemsService';
import { VersionsService } from './generated/services/VersionsService';
import { AiService } from './generated/services/AiService';
import { UsersService } from './generated/services/UsersService';
import { WebhooksService } from './generated/services/WebhooksService';

export interface QuoteMyAVConfig {
  /** API key for programmatic access (Pro/Enterprise) */
  apiKey?: string;
  /** JWT token for web dashboard authentication */
  accessToken?: string;
  /** Base URL for the API (defaults to production) */
  baseUrl?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
}

export interface PollOptions {
  /** Polling interval in milliseconds (default: 1000) */
  interval?: number;
  /** Maximum time to wait in milliseconds (default: 60000) */
  timeout?: number;
}

/**
 * QuoteMyAV SDK Client
 *
 * @example
 * ```typescript
 * import { QuoteMyAV } from '@quotemyav/sdk';
 *
 * const client = new QuoteMyAV({
 *   apiKey: 'qmav_live_xxxxx'
 * });
 *
 * // List quotes
 * const { data: quotes } = await client.quotes.list({ status: 'draft' });
 *
 * // Generate quote with AI (handles polling automatically)
 * const result = await client.ai.generateAndWait({
 *   eventDetails: { eventName: 'Conference', eventType: 'conference' },
 *   equipment: { categories: ['audio', 'video'] }
 * });
 * ```
 */
export class QuoteMyAV {
  private config: QuoteMyAVConfig;

  constructor(config: QuoteMyAVConfig = {}) {
    this.config = {
      baseUrl: 'https://api.quotemyav.com/v1',
      timeout: 30000,
      ...config,
    };

    // Configure the generated client
    OpenAPI.BASE = this.config.baseUrl!;
    OpenAPI.TOKEN = this.config.accessToken;
    OpenAPI.HEADERS = this.config.apiKey
      ? { 'X-API-Key': this.config.apiKey }
      : undefined;
  }

  /**
   * Quote management operations
   */
  get quotes() {
    return {
      /**
       * List quotes with optional filtering and pagination
       */
      list: QuotesService.listQuotes,

      /**
       * Get a single quote by ID
       */
      get: QuotesService.getQuote,

      /**
       * Create a new quote
       */
      create: QuotesService.createQuote,

      /**
       * Update an existing quote
       */
      update: QuotesService.updateQuote,

      /**
       * Delete a quote (soft delete)
       */
      delete: QuotesService.deleteQuote,

      /**
       * Clone an existing quote
       */
      clone: QuotesService.cloneQuote,

      /**
       * Send quote to client via email
       */
      send: QuotesService.sendQuote,

      /**
       * Line item operations
       */
      items: {
        add: LineItemsService.addLineItem,
        update: LineItemsService.updateLineItem,
        delete: LineItemsService.deleteLineItem,
        replaceAll: LineItemsService.replaceLineItems,
      },

      /**
       * Version history operations
       */
      versions: {
        list: VersionsService.listQuoteVersions,
        get: VersionsService.getQuoteVersion,
        compare: VersionsService.compareVersions,
        revert: VersionsService.revertToVersion,
      },
    };
  }

  /**
   * AI-powered quote generation and editing
   */
  get ai() {
    const self = this;
    return {
      /**
       * Start AI quote generation (returns job ID immediately)
       */
      generate: AiService.aiGenerate,

      /**
       * Start AI quote editing (returns job ID immediately)
       */
      edit: AiService.aiEdit,

      /**
       * Get AI job status
       */
      getJob: AiService.getAiJob,

      /**
       * Generate quote with AI and wait for result
       * Automatically polls until completion or timeout
       */
      async generateAndWait(
        requestBody: Parameters<typeof AiService.aiGenerate>[0]['requestBody'],
        options: PollOptions = {}
      ) {
        const { interval = 1000, timeout = 60000 } = options;
        const response = await AiService.aiGenerate({ requestBody });
        const jobId = response.data?.jobId;

        if (!jobId) {
          throw new Error('Failed to start AI generation job');
        }

        return self.pollJob(jobId, { interval, timeout });
      },

      /**
       * Edit quote with AI and wait for result
       * Automatically polls until completion or timeout
       */
      async editAndWait(
        requestBody: Parameters<typeof AiService.aiEdit>[0]['requestBody'],
        options: PollOptions = {}
      ) {
        const { interval = 1000, timeout = 60000 } = options;
        const response = await AiService.aiEdit({ requestBody });
        const jobId = response.data?.jobId;

        if (!jobId) {
          throw new Error('Failed to start AI edit job');
        }

        return self.pollJob(jobId, { interval, timeout });
      },
    };
  }

  /**
   * User profile and API key management
   */
  get me() {
    return {
      /**
       * Get current user profile
       */
      get: UsersService.getCurrentUser,

      /**
       * Get subscription status and quotas
       */
      subscription: UsersService.getSubscription,

      /**
       * API key management
       */
      apiKeys: {
        list: UsersService.listApiKeys,
        create: UsersService.createApiKey,
        update: UsersService.updateApiKey,
        revoke: UsersService.revokeApiKey,
      },
    };
  }

  /**
   * Webhook management (Enterprise only)
   */
  get webhooks() {
    return {
      /**
       * List webhook endpoints
       */
      list: WebhooksService.listWebhooks,

      /**
       * Get a webhook endpoint
       */
      get: WebhooksService.getWebhook,

      /**
       * Create a webhook endpoint
       */
      create: WebhooksService.createWebhook,

      /**
       * Update a webhook endpoint
       */
      update: WebhooksService.updateWebhook,

      /**
       * Delete a webhook endpoint
       */
      delete: WebhooksService.deleteWebhook,

      /**
       * List recent deliveries for a webhook
       */
      deliveries: WebhooksService.listWebhookDeliveries,

      /**
       * Send a test webhook
       */
      test: WebhooksService.testWebhook,
    };
  }

  /**
   * Poll an AI job until completion or timeout
   */
  private async pollJob(
    jobId: string,
    options: Required<PollOptions>
  ): Promise<Awaited<ReturnType<typeof AiService.getAiJob>>['data']> {
    const { interval, timeout } = options;
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const response = await AiService.getAiJob({ jobId });
      const job = response.data;

      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      if (job.status === 'completed') {
        return job;
      }

      if (job.status === 'failed') {
        throw new Error(job.error?.message || 'AI job failed');
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error(`AI job ${jobId} timed out after ${timeout}ms`);
  }
}
