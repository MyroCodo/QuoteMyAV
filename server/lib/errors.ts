// Custom API errors

export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    statusCode: number = 400,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Common error factory functions
export const Errors = {
  // Authentication errors (401)
  authRequired: () =>
    new ApiError('AUTH_REQUIRED', 'Authentication required', 401),

  authInvalid: () =>
    new ApiError('AUTH_INVALID', 'Invalid authentication credentials', 401),

  apiKeyRevoked: () =>
    new ApiError('API_KEY_REVOKED', 'API key has been revoked', 401),

  apiKeyExpired: () =>
    new ApiError('API_KEY_EXPIRED', 'API key has expired', 401),

  // Authorization errors (403)
  forbidden: (reason?: string) =>
    new ApiError(
      'FORBIDDEN',
      reason || 'You do not have permission to perform this action',
      403
    ),

  tierRequired: (requiredTier: string) =>
    new ApiError(
      'TIER_REQUIRED',
      `This feature requires ${requiredTier} tier or higher`,
      403,
      { requiredTier }
    ),

  apiAccessDenied: () =>
    new ApiError(
      'API_ACCESS_DENIED',
      'API access requires Pro tier or higher',
      403
    ),

  // Rate limiting errors (429)
  rateLimited: (resetAt: number, limit: number, remaining: number) =>
    new ApiError(
      'RATE_LIMITED',
      'Too many requests. Please try again later.',
      429,
      { limit, remaining, resetAt }
    ),

  quotaExceeded: (current: number, limit: number, resetDate: string) =>
    new ApiError(
      'QUOTA_EXCEEDED',
      'Monthly quote limit reached',
      429,
      { current, limit, resetDate }
    ),

  aiRateLimited: (resetAt: number) =>
    new ApiError(
      'AI_RATE_LIMITED',
      'AI request limit reached. Please try again later.',
      429,
      { resetAt }
    ),

  // Not found errors (404)
  notFound: (resource: string, id?: string) =>
    new ApiError(
      `${resource.toUpperCase()}_NOT_FOUND`,
      id ? `${resource} with ID '${id}' not found` : `${resource} not found`,
      404
    ),

  quoteNotFound: (id: string) => Errors.notFound('Quote', id),
  userNotFound: (id: string) => Errors.notFound('User', id),
  versionNotFound: (id: string) => Errors.notFound('Version', id),
  webhookNotFound: (id: string) => Errors.notFound('Webhook', id),
  jobNotFound: (id: string) => Errors.notFound('Job', id),

  // Validation errors (400)
  validation: (message: string, details?: Record<string, unknown>) =>
    new ApiError('VALIDATION_ERROR', message, 400, details),

  invalidInput: (field: string, reason: string) =>
    new ApiError(
      'INVALID_INPUT',
      `Invalid value for '${field}': ${reason}`,
      400,
      { field, reason }
    ),

  missingField: (field: string) =>
    new ApiError('MISSING_FIELD', `Required field '${field}' is missing`, 400, {
      field,
    }),

  // Conflict errors (409)
  conflict: (message: string, details?: Record<string, unknown>) =>
    new ApiError('CONFLICT', message, 409, details),

  duplicateKey: (field: string) =>
    new ApiError(
      'DUPLICATE_KEY',
      `A record with this ${field} already exists`,
      409,
      { field }
    ),

  idempotencyConflict: (existingResult: unknown) =>
    new ApiError(
      'IDEMPOTENCY_CONFLICT',
      'Request with this idempotency key has already been processed',
      409,
      { existingResult }
    ),

  // Business logic errors (422)
  invalidStatusTransition: (from: string, to: string, allowed: string[]) =>
    new ApiError(
      'INVALID_STATUS_TRANSITION',
      `Cannot transition quote from '${from}' to '${to}'`,
      422,
      { from, to, allowed }
    ),

  quoteReadOnly: (status: string) =>
    new ApiError(
      'QUOTE_READONLY',
      `Quote with status '${status}' cannot be modified`,
      422,
      { status }
    ),

  quoteExpired: (expiresAt: string) =>
    new ApiError('QUOTE_EXPIRED', 'This quote has expired', 422, { expiresAt }),

  // AI errors (500/503)
  aiGenerationFailed: (reason?: string) =>
    new ApiError(
      'AI_GENERATION_FAILED',
      reason || 'AI quote generation failed',
      500
    ),

  aiTimeout: () =>
    new ApiError(
      'AI_TIMEOUT',
      'AI request timed out. Please try again.',
      503
    ),

  // Internal errors (500)
  internal: (message?: string) =>
    new ApiError(
      'INTERNAL_ERROR',
      message || 'An unexpected error occurred',
      500
    ),

  serverError: (message?: string) =>
    new ApiError(
      'SERVER_ERROR',
      message || 'Server error occurred',
      500
    ),

  database: (operation: string) =>
    new ApiError(
      'DATABASE_ERROR',
      `Database ${operation} failed`,
      500,
      { operation }
    ),
};
