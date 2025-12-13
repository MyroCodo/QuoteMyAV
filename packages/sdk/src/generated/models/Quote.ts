/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LineItem } from './LineItem';
import type { QuoteStatus } from './QuoteStatus';
export type Quote = {
    id?: string;
    clientName?: string;
    clientEmail?: string;
    eventName?: string;
    eventDate?: string;
    venue?: string;
    status?: QuoteStatus;
    totalAmount?: number;
    lineItems?: Array<LineItem>;
    createdAt?: string;
    updatedAt?: string;
    expiresAt?: string | null;
};

