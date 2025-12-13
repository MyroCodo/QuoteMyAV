/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LineItem } from './LineItem';
import type { QuoteVersion } from './QuoteVersion';
export type VersionDiff = {
    versionA?: QuoteVersion;
    versionB?: QuoteVersion;
    changes?: {
        itemsAdded?: Array<LineItem>;
        itemsRemoved?: Array<LineItem>;
        itemsModified?: Array<{
            itemId?: string;
            before?: LineItem;
            after?: LineItem;
        }>;
        amountDiff?: number;
    };
};

