/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WebhookEventType } from './WebhookEventType';
export type WebhookDelivery = {
    id?: string;
    eventType?: WebhookEventType;
    status?: WebhookDelivery.status;
    responseCode?: number | null;
    attempts?: number;
    createdAt?: string;
    deliveredAt?: string | null;
};
export namespace WebhookDelivery {
    export enum status {
        PENDING = 'pending',
        DELIVERED = 'delivered',
        FAILED = 'failed',
    }
}

