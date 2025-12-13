/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LineItem } from '../models/LineItem';
import type { LineItemCreate } from '../models/LineItemCreate';
import type { LineItemUpdate } from '../models/LineItemUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LineItemsService {
    /**
     * Add line item
     * Adds a new line item to the quote
     * @returns any Line item added successfully
     * @throws ApiError
     */
    public static addLineItem({
        quoteId,
        requestBody,
    }: {
        /**
         * Quote ID
         */
        quoteId: string,
        requestBody: LineItemCreate,
    }): CancelablePromise<{
        data?: LineItem;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/quotes/{quoteId}/items',
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
     * Replace all line items
     * Replaces all line items in the quote with the provided list
     * @returns any Line items replaced successfully
     * @throws ApiError
     */
    public static replaceLineItems({
        quoteId,
        requestBody,
    }: {
        /**
         * Quote ID
         */
        quoteId: string,
        requestBody: {
            items: Array<LineItemCreate>;
        },
    }): CancelablePromise<{
        data?: Array<LineItem>;
    }> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/quotes/{quoteId}/items',
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
     * Update line item
     * Updates an existing line item
     * @returns any Line item updated successfully
     * @throws ApiError
     */
    public static updateLineItem({
        quoteId,
        itemId,
        requestBody,
    }: {
        /**
         * Quote ID
         */
        quoteId: string,
        /**
         * Line item ID
         */
        itemId: string,
        requestBody: LineItemUpdate,
    }): CancelablePromise<{
        data?: LineItem;
    }> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/quotes/{quoteId}/items/{itemId}',
            path: {
                'quoteId': quoteId,
                'itemId': itemId,
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
     * Delete line item
     * Removes a line item from the quote
     * @returns void
     * @throws ApiError
     */
    public static deleteLineItem({
        quoteId,
        itemId,
    }: {
        /**
         * Quote ID
         */
        quoteId: string,
        /**
         * Line item ID
         */
        itemId: string,
    }): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/quotes/{quoteId}/items/{itemId}',
            path: {
                'quoteId': quoteId,
                'itemId': itemId,
            },
            errors: {
                401: `Authentication required or invalid`,
                404: `Resource not found`,
                422: `Quote cannot be modified in current status`,
            },
        });
    }
}
