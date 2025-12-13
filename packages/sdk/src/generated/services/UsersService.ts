/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { APIKey } from '../models/APIKey';
import type { APIKeyCreate } from '../models/APIKeyCreate';
import type { Subscription } from '../models/Subscription';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Get current user
     * Returns the authenticated user's profile
     * @returns any User profile
     * @throws ApiError
     */
    public static getCurrentUser(): CancelablePromise<{
        data?: User;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/me',
            errors: {
                401: `Authentication required or invalid`,
            },
        });
    }
    /**
     * Get subscription status
     * Returns the user's subscription and usage information
     * @returns any Subscription details
     * @throws ApiError
     */
    public static getSubscription(): CancelablePromise<{
        data?: Subscription;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/me/subscription',
            errors: {
                401: `Authentication required or invalid`,
            },
        });
    }
    /**
     * List API keys
     * Returns the user's API keys (Pro/Enterprise only)
     * @returns any List of API keys
     * @throws ApiError
     */
    public static listApiKeys(): CancelablePromise<{
        data?: Array<APIKey>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/me/api-keys',
            errors: {
                401: `Authentication required or invalid`,
                403: `Higher subscription tier required`,
            },
        });
    }
    /**
     * Create API key
     * Creates a new API key (Pro/Enterprise only).
     * **Important:** The full key is only returned once in this response. Store it securely.
     *
     * @returns any API key created
     * @throws ApiError
     */
    public static createApiKey({
        requestBody,
    }: {
        requestBody: APIKeyCreate,
    }): CancelablePromise<{
        data?: {
            id?: string;
            /**
             * The full API key (only shown once)
             */
            key?: string;
            name?: string;
            scopes?: Array<string>;
            createdAt?: string;
            expiresAt?: string | null;
        };
        warning?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/me/api-keys',
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
     * Update API key
     * Updates an API key's name or scopes
     * @returns any API key updated
     * @throws ApiError
     */
    public static updateApiKey({
        keyId,
        requestBody,
    }: {
        keyId: string,
        requestBody: {
            name?: string;
            scopes?: Array<string>;
        },
    }): CancelablePromise<{
        data?: APIKey;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/me/api-keys/{keyId}',
            path: {
                'keyId': keyId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Authentication required or invalid`,
                403: `Higher subscription tier required`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Revoke API key
     * Revokes an API key (cannot be undone)
     * @returns void
     * @throws ApiError
     */
    public static revokeApiKey({
        keyId,
    }: {
        keyId: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/me/api-keys/{keyId}',
            path: {
                'keyId': keyId,
            },
            errors: {
                401: `Authentication required or invalid`,
                403: `Higher subscription tier required`,
                404: `Resource not found`,
            },
        });
    }
}
