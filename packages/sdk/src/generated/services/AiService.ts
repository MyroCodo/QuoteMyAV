/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AIEditRequest } from '../models/AIEditRequest';
import type { AIGenerateRequest } from '../models/AIGenerateRequest';
import type { AIJob } from '../models/AIJob';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AiService {
    /**
     * Generate quote with AI
     * Starts an async AI job to generate a quote based on event details and equipment requirements.
     * Returns immediately with a job ID - poll `/ai/jobs/{jobId}` for results.
     *
     * @returns any AI job started
     * @throws ApiError
     */
    public static aiGenerate({
        requestBody,
    }: {
        requestBody: AIGenerateRequest,
    }): CancelablePromise<{
        data?: {
            jobId?: string;
            status?: 'processing';
            message?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/ai/generate',
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
     * Edit quote with AI
     * Starts an async AI job to modify an existing quote using natural language commands.
     * Returns immediately with a job ID - poll `/ai/jobs/{jobId}` for results.
     *
     * @returns any AI job started
     * @throws ApiError
     */
    public static aiEdit({
        requestBody,
    }: {
        requestBody: AIEditRequest,
    }): CancelablePromise<{
        data?: {
            jobId?: string;
            status?: 'processing';
            message?: string;
        };
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/ai/edit',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Request validation failed`,
                401: `Authentication required or invalid`,
                404: `Resource not found`,
                422: `Quote cannot be modified in current status`,
                429: `Rate limit exceeded`,
            },
        });
    }
    /**
     * Get AI job status
     * Returns the status and result of an AI job
     * @returns any Job status
     * @throws ApiError
     */
    public static getAiJob({
        jobId,
    }: {
        jobId: string,
    }): CancelablePromise<{
        data?: AIJob;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/ai/jobs/{jobId}',
            path: {
                'jobId': jobId,
            },
            errors: {
                401: `Authentication required or invalid`,
                404: `Resource not found`,
            },
        });
    }
}
