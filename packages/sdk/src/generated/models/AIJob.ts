/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LineItem } from './LineItem';
export type AIJob = {
    jobId?: string;
    type?: AIJob.type;
    status?: AIJob.status;
    result?: {
        lineItems?: Array<LineItem>;
        totalAmount?: number;
        summary?: string;
    } | null;
    error?: {
        code?: string;
        message?: string;
    } | null;
    createdAt?: string;
    completedAt?: string | null;
};
export namespace AIJob {
    export enum type {
        GENERATE = 'generate',
        EDIT = 'edit',
    }
    export enum status {
        PROCESSING = 'processing',
        COMPLETED = 'completed',
        FAILED = 'failed',
    }
}

