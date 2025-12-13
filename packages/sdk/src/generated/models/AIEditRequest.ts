/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AIEditRequest = {
    quoteId: string;
    /**
     * Natural language command (e.g., "reduce costs by 20%")
     */
    command?: string;
    quickAction?: AIEditRequest.quickAction;
    /**
     * Target budget for hit_budget action
     */
    targetBudget?: number;
};
export namespace AIEditRequest {
    export enum quickAction {
        HIT_BUDGET = 'hit_budget',
        PREMIUM_VERSION = 'premium_version',
        SIMPLIFY_RIGGING = 'simplify_rigging',
        ADD_BACKUP_EQUIPMENT = 'add_backup_equipment',
        OPTIMIZE_LABOR = 'optimize_labor',
        REDUCE_TRANSPORT = 'reduce_transport',
    }
}

