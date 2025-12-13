/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LineItemCreate } from './LineItemCreate';
import type { QuoteStatus } from './QuoteStatus';
export type QuoteUpdate = {
    clientName?: string;
    clientEmail?: string;
    eventName?: string;
    eventDate?: string;
    venue?: string;
    status?: QuoteStatus;
    lineItems?: Array<LineItemCreate>;
};

