/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type User = {
    id?: string;
    email?: string;
    fullName?: string;
    company?: string;
    tier?: User.tier;
    createdAt?: string;
};
export namespace User {
    export enum tier {
        FREE = 'free',
        STARTER = 'starter',
        PRO = 'pro',
        ENTERPRISE = 'enterprise',
    }
}

