import type { ErrorHandler } from 'hono';
import { ApiError } from '../lib/errors.js';
import type { Variables } from '../../api/index.js';

export const errorHandler: ErrorHandler<{ Variables: Variables }> = (err, c) => {
  const requestId = c.get('requestId') || crypto.randomUUID();

  // Handle known API errors
  if (err instanceof ApiError) {
    console.error(`[API Error] ${err.code}: ${err.message}`, {
      requestId,
      statusCode: err.statusCode,
      details: err.details,
    });

    return c.json(
      {
        error: {
          code: err.code,
          message: err.message,
          details: err.details,
          requestId,
        },
      },
      err.statusCode as 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 503
    );
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    const zodError = err as unknown as { errors: Array<{ path: string[]; message: string }> };
    const details = zodError.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    console.error(`[Validation Error]`, { requestId, details });

    return c.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: { errors: details },
          requestId,
        },
      },
      400
    );
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && 'body' in err) {
    return c.json(
      {
        error: {
          code: 'INVALID_JSON',
          message: 'Invalid JSON in request body',
          requestId,
        },
      },
      400
    );
  }

  // Handle unknown errors
  console.error(`[Unknown Error] ${err.message}`, {
    requestId,
    stack: err.stack,
  });

  // Don't expose internal error details in production
  const isProduction = process.env.NODE_ENV === 'production';

  return c.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: isProduction
          ? 'An unexpected error occurred'
          : err.message || 'An unexpected error occurred',
        requestId,
      },
    },
    500
  );
};
