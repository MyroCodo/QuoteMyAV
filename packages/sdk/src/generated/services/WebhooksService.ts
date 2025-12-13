/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WebhookCreate } from '../models/WebhookCreate';
import type { WebhookDelivery } from '../models/WebhookDelivery';
import type { WebhookEndpoint } from '../models/WebhookEndpoint';
import type { WebhookUpdate } from '../models/WebhookUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WebhooksService {
    /**
     * List webhook endpoints
     * Returns the user's webhook endpoints (Enterprise only)
     * @returns any List of webhook endpoints
     * @throws ApiError
     */
    public static listWebhooks(): CancelablePromise<{
        data?: Array<WebhookEndpoint>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/webhooks',
            errors: {
                401: `Authentication required or invalid`,
                403: `Higher subscription tier required`,
            },
        });
    }
    /**
     * Create webhook endpoint
     * Creates a new webhook endpoint (Enterprise only).
     * If no secret is provided, one will be generated and returned.
     *
     * @returns any Webhook created
     * @throws ApiError
     */
    public static createWebhook({
        requestBody,
    }: {
        requestBody: WebhookCreate,
    }): CancelablePromise<{
        data?: (WebhookEndpoint & {
            /**
             * The webhook secret (only shown once if generated)
             */
            secret?: string;
        });
        warning?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/webhooks',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Request validation failed`,
                401: `Authentication required or invalid`,
                403: `Higher subscription tier required`,
            },
        });
    }
    /**
     * Get webhook endpoint
     * Returns a webhook endpoint's details
     * @returns any Webhook details
     * @throws ApiError
     */
    public static getWebhook({
        webhookId,
    }: {
        /**
         * Webhook endpoint ID
         */
        webhookId: string,
    }): CancelablePromise<{
        data?: WebhookEndpoint;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/webhooks/{webhookId}',
            path: {
                'webhookId': webhookId,
            },
            errors: {
                401: `Authentication required or invalid`,
                403: `Higher subscription tier required`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Update webhook endpoint
     * Updates a webhook endpoint
     * @returns any Webhook updated
     * @throws ApiError
     */
    public static updateWebhook({
        webhookId,
        requestBody,
    }: {
        /**
         * Webhook endpoint ID
         */
        webhookId: string,
        requestBody: WebhookUpdate,
    }): CancelablePromise<{
        data?: WebhookEndpoint;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/webhooks/{webhookId}',
            path: {
                'webhookId': webhookId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Request validation failed`,
                401: `Authentication required or invalid`,
                403: `Higher subscription tier required`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Delete webhook endpoint
     * Deletes a webhook endpoint
     * @returns void
     * @throws ApiError
     */
    public static deleteWebhook({
        webhookId,
    }: {
        /**
         * Webhook endpoint ID
         */
        webhookId: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/webhooks/{webhookId}',
            path: {
                'webhookId': webhookId,
            },
            errors: {
                401: `Authentication required or invalid`,
                403: `Higher subscription tier required`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * List webhook deliveries
     * Returns recent delivery attempts for a webhook
     * @returns any List of deliveries
     * @throws ApiError
     */
    public static listWebhookDeliveries({
        webhookId,
    }: {
        /**
         * Webhook endpoint ID
         */
        webhookId: string,
    }): CancelablePromise<{
        data?: Array<WebhookDelivery>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/webhooks/{webhookId}/deliveries',
            path: {
                'webhookId': webhookId,
            },
            errors: {
                401: `Authentication required or invalid`,
                403: `Higher subscription tier required`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Send test webhook
     * Sends a test webhook to verify the endpoint is working
     * @returns any Test result
     * @throws ApiError
     */
    public static testWebhook({
        webhookId,
    }: {
        /**
         * Webhook endpoint ID
         */
        webhookId: string,
    }): CancelablePromise<{
        data?: {
            success?: boolean;
            statusCode?: number | null;
            message?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/webhooks/{webhookId}/test',
            path: {
                'webhookId': webhookId,
            },
            errors: {
                401: `Authentication required or invalid`,
                403: `Higher subscription tier required`,
                404: `Resource not found`,
            },
        });
    }
}
