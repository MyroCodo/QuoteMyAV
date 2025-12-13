/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PaginationMeta } from '../models/PaginationMeta';
import type { Quote } from '../models/Quote';
import type { QuoteCreate } from '../models/QuoteCreate';
import type { QuoteStatus } from '../models/QuoteStatus';
import type { QuoteSummary } from '../models/QuoteSummary';
import type { QuoteUpdate } from '../models/QuoteUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class QuotesService {
    /**
     * List quotes
     * Returns a paginated list of quotes for the authenticated user
     * @returns any List of quotes
     * @throws ApiError
     */
    public static listQuotes({
        status,
        search,
        limit = 20,
        offset,
        sort = '-createdAt',
    }: {
        /**
         * Filter by quote status
         */
        status?: QuoteStatus,
        /**
         * Search in client name, event name, or venue
         */
        search?: string,
        /**
         * Number of results per page (max 100)
         */
        limit?: number,
        /**
         * Number of results to skip
         */
        offset?: number,
        /**
         * Sort field (prefix with - for descending)
         */
        sort?: 'createdAt' | '-createdAt' | 'updatedAt' | '-updatedAt' | 'totalAmount' | '-totalAmount' | 'eventDate' | '-eventDate',
    }): CancelablePromise<{
        data?: Array<QuoteSummary>;
        meta?: PaginationMeta;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/quotes',
            query: {
                'status': status,
                'search': search,
                'limit': limit,
                'offset': offset,
                'sort': sort,
            },
            errors: {
                401: `Authentication required or invalid`,
                429: `Rate limit exceeded`,
            },
        });
    }
    /**
     * Create a quote
     * Creates a new quote for the authenticated user
     * @returns any Quote created successfully
     * @throws ApiError
     */
    public static createQuote({
        requestBody,
        idempotencyKey,
    }: {
        requestBody: QuoteCreate,
        /**
         * Unique key for idempotent requests (recommended)
         */
        idempotencyKey?: string,
    }): CancelablePromise<{
        data?: Quote;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/quotes',
            headers: {
                'Idempotency-Key': idempotencyKey,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Request validation failed`,
                401: `Authentication required or invalid`,
                403: `Monthly quote quota exceeded`,
                429: `Rate limit exceeded`,
            },
        });
    }
    /**
     * Get a quote
     * Returns a single quote by ID
     * @returns any Quote details
     * @throws ApiError
     */
    public static getQuote({
        quoteId,
    }: {
        /**
         * Quote ID
         */
        quoteId: string,
    }): CancelablePromise<{
        data?: Quote;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/quotes/{quoteId}',
            path: {
                'quoteId': quoteId,
            },
            errors: {
                401: `Authentication required or invalid`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Update a quote
     * Updates an existing quote. Cannot update quotes with status sent, accepted, rejected, or expired.
     * @returns any Quote updated successfully
     * @throws ApiError
     */
    public static updateQuote({
        quoteId,
        requestBody,
    }: {
        /**
         * Quote ID
         */
        quoteId: string,
        requestBody: QuoteUpdate,
    }): CancelablePromise<{
        data?: Quote;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/quotes/{quoteId}',
            path: {
                'quoteId': quoteId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Request validation failed`,
                401: `Authentication required or invalid`,
                404: `Resource not found`,
                422: `Quote cannot be modified in current status`,
            },
        });
    }
    /**
     * Delete a quote
     * Soft deletes a quote. The quote can be restored within 30 days.
     * @returns void
     * @throws ApiError
     */
    public static deleteQuote({
        quoteId,
    }: {
        /**
         * Quote ID
         */
        quoteId: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/quotes/{quoteId}',
            path: {
                'quoteId': quoteId,
            },
            errors: {
                401: `Authentication required or invalid`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Clone a quote
     * Creates a copy of an existing quote with draft status
     * @returns any Quote cloned successfully
     * @throws ApiError
     */
    public static cloneQuote({
        quoteId,
    }: {
        /**
         * Quote ID
         */
        quoteId: string,
    }): CancelablePromise<{
        data?: Quote;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/quotes/{quoteId}/clone',
            path: {
                'quoteId': quoteId,
            },
            errors: {
                401: `Authentication required or invalid`,
                403: `Monthly quote quota exceeded`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Send quote to client
     * Sends the quote to the client via email and updates status to 'sent'
     * @returns any Quote sent successfully
     * @throws ApiError
     */
    public static sendQuote({
        quoteId,
        requestBody,
    }: {
        /**
         * Quote ID
         */
        quoteId: string,
        requestBody?: {
            /**
             * Override the client email
             */
            recipientEmail?: string;
            /**
             * Custom message to include in the email
             */
            message?: string;
        },
    }): CancelablePromise<{
        data?: {
            sentAt?: string;
            expiresAt?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/quotes/{quoteId}/send',
            path: {
                'quoteId': quoteId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or invalid`,
                404: `Resource not found`,
                422: `Quote cannot be sent (invalid status)`,
            },
        });
    }
}
