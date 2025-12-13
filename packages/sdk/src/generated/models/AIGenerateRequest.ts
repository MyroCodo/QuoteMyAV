/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LineItemCategory } from './LineItemCategory';
export type AIGenerateRequest = {
    eventDetails: {
        eventName: string;
        eventType: AIGenerateRequest.eventType;
        venueSize?: AIGenerateRequest.venueSize;
        venueName?: string;
        dates?: Array<string>;
    };
    equipment: {
        categories?: Array<LineItemCategory>;
        budgetRange?: {
            min?: number;
            max?: number;
        };
        specificRequests?: string;
    };
};
export namespace AIGenerateRequest {
    export enum eventType {
        CORPORATE = 'corporate',
        CONCERT = 'concert',
        FESTIVAL = 'festival',
        WEDDING = 'wedding',
        CONFERENCE = 'conference',
        THEATER = 'theater',
        BROADCAST = 'broadcast',
        TRADE_SHOW = 'trade_show',
        OTHER = 'other',
    }
    export enum venueSize {
        SMALL = 'small',
        MEDIUM = 'medium',
        LARGE = 'large',
        OUTDOOR = 'outdoor',
    }
}

