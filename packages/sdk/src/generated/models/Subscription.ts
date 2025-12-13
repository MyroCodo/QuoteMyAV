/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Subscription = {
    plan?: Subscription.plan;
    quotesUsed?: number;
    /**
     * null for unlimited
     */
    quotesLimit?: number | null;
    quotesRemaining?: number | null;
    apiCallsToday?: number;
    apiCallsLimit?: number;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    stripeCustomerId?: string | null;
};
export namespace Subscription {
    export enum plan {
        FREE = 'free',
        STARTER = 'starter',
        PRO = 'pro',
        ENTERPRISE = 'enterprise',
    }
}

