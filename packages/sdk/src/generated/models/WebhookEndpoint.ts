/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WebhookEventType } from './WebhookEventType';
export type WebhookEndpoint = {
    id?: string;
    url?: string;
    events?: Array<WebhookEventType>;
    isActive?: boolean;
    createdAt?: string;
    lastDeliveryAt?: string | null;
    failureCount?: number;
};

