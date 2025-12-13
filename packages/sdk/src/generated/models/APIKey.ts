/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type APIKey = {
    id?: string;
    name?: string;
    /**
     * Masked key for identification
     */
    keyPrefix?: string;
    scopes?: Array<string>;
    lastUsedAt?: string | null;
    createdAt?: string;
    expiresAt?: string | null;
    isActive?: boolean;
};

