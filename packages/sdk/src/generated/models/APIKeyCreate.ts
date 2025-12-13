/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type APIKeyCreate = {
    name: string;
    scopes?: Array<'*' | 'quotes:read' | 'quotes:write' | 'ai:generate' | 'ai:edit'>;
    /**
     * Number of days until expiration (optional)
     */
    expiresInDays?: number;
};

