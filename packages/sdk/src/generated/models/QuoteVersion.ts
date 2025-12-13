/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Quote } from './Quote';
export type QuoteVersion = {
    id?: string;
    quoteId?: string;
    versionNumber?: number;
    trigger?: QuoteVersion.trigger;
    description?: string;
    changeType?: QuoteVersion.changeType;
    snapshot?: Quote;
    createdAt?: string;
};
export namespace QuoteVersion {
    export enum trigger {
        AUTO = 'auto',
        MANUAL = 'manual',
    }
    export enum changeType {
        CREATED = 'created',
        ITEMS_ADDED = 'items_added',
        ITEMS_REMOVED = 'items_removed',
        ITEMS_MODIFIED = 'items_modified',
        STATUS_CHANGED = 'status_changed',
        AI_EDIT_APPLIED = 'ai_edit_applied',
        MANUAL_SNAPSHOT = 'manual_snapshot',
    }
}

