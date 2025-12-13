/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Quote } from '../models/Quote';
import type { QuoteVersion } from '../models/QuoteVersion';
import type { VersionDiff } from '../models/VersionDiff';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class VersionsService {
    /**
     * List quote versions
     * Returns the version history for a quote
     * @returns any List of versions
     * @throws ApiError
     */
    public static listQuoteVersions({
        quoteId,
    }: {
        /**
         * Quote ID
         */
        quoteId: string,
    }): CancelablePromise<{
        data?: Array<QuoteVersion>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/quotes/{quoteId}/versions',
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
     * Get quote version
     * Returns a specific version snapshot
     * @returns any Version details
     * @throws ApiError
     */
    public static getQuoteVersion({
        quoteId,
        versionId,
    }: {
        /**
         * Quote ID
         */
        quoteId: string,
        /**
         * Version ID
         */
        versionId: string,
    }): CancelablePromise<{
        data?: QuoteVersion;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/quotes/{quoteId}/versions/{versionId}',
            path: {
                'quoteId': quoteId,
                'versionId': versionId,
            },
            errors: {
                401: `Authentication required or invalid`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Compare versions
     * Returns a diff between two versions
     * @returns any Version comparison
     * @throws ApiError
     */
    public static compareVersions({
        quoteId,
        a,
        b,
    }: {
        /**
         * Quote ID
         */
        quoteId: string,
        /**
         * First version ID
         */
        a: string,
        /**
         * Second version ID
         */
        b: string,
    }): CancelablePromise<{
        data?: VersionDiff;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/quotes/{quoteId}/versions/compare',
            path: {
                'quoteId': quoteId,
            },
            query: {
                'a': a,
                'b': b,
            },
            errors: {
                401: `Authentication required or invalid`,
                404: `Resource not found`,
            },
        });
    }
    /**
     * Revert to version
     * Reverts the quote to a previous version
     * @returns any Quote reverted successfully
     * @throws ApiError
     */
    public static revertToVersion({
        quoteId,
        versionId,
    }: {
        /**
         * Quote ID
         */
        quoteId: string,
        /**
         * Version ID
         */
        versionId: string,
    }): CancelablePromise<{
        data?: Quote;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/quotes/{quoteId}/versions/{versionId}/revert',
            path: {
                'quoteId': quoteId,
                'versionId': versionId,
            },
            errors: {
                401: `Authentication required or invalid`,
                404: `Resource not found`,
                422: `Quote cannot be modified in current status`,
            },
        });
    }
}
