/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WebhookEventType } from './WebhookEventType';
export type WebhookCreate = {
    url: string;
    events: Array<WebhookEventType>;
    /**
     * Optional custom secret (one will be generated if not provided)
     */
    secret?: string;
};

