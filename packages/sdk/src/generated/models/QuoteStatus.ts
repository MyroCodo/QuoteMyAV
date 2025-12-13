/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Quote status:
 * - `draft`: Initial state, can be edited
 * - `pending_review`: Awaiting internal approval
 * - `approved`: Approved, ready to send
 * - `sent`: Sent to client
 * - `accepted`: Client accepted
 * - `rejected`: Client rejected
 * - `expired`: Quote expired (30 days after sent)
 * - `revision_requested`: Client requested changes
 *
 */
export enum QuoteStatus {
    DRAFT = 'draft',
    PENDING_REVIEW = 'pending_review',
    APPROVED = 'approved',
    SENT = 'sent',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    EXPIRED = 'expired',
    REVISION_REQUESTED = 'revision_requested',
}
