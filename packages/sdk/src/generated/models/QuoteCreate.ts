/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LineItemCreate } from './LineItemCreate';
export type QuoteCreate = {
    clientName: string;
    clientEmail: string;
    eventName: string;
    /**
     * Event date (any format, stored as string)
     */
    eventDate: string;
    venue: string;
    lineItems?: Array<LineItemCreate>;
};

