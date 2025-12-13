import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { rateLimitMiddleware } from './middleware/rateLimit';
import quotesRouter from './routes/quotes';
import aiRouter from './routes/ai';
import usersRouter from './routes/users';
import webhooksRouter from './routes/webhooks';

// Types for Hono context
export type Variables = {
  userId: string;
  userTier: 'free' | 'starter' | 'pro' | 'enterprise';
  apiKeyId?: string;
  isApiKey: boolean;
  requestId: string;
};

// Create Hono app
const app = new Hono<{ Variables: Variables }>();

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'https://quotemyav.com',
      'https://www.quotemyav.com',
      'https://app.quotemyav.com',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'Idempotency-Key'],
    exposeHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Quota-Limit',
      'X-Quota-Used',
      'X-Quota-Reset',
      'X-Request-Id',
    ],
    maxAge: 86400,
    credentials: true,
  })
);

// Health check (no auth required)
app.get('/v1/health', (c) => {
  return c.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Apply auth and rate limiting to API routes
app.use('/v1/*', authMiddleware);
app.use('/v1/*', rateLimitMiddleware);

// Mount routers
app.route('/v1/quotes', quotesRouter);
app.route('/v1/ai', aiRouter);
app.route('/v1/me', usersRouter);
app.route('/v1/webhooks', webhooksRouter);

// Global error handler
app.onError(errorHandler);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: {
        code: 'NOT_FOUND',
        message: `Route ${c.req.method} ${c.req.path} not found`,
        requestId: c.get('requestId') || crypto.randomUUID(),
      },
    },
    404
  );
});

// Export for Vercel Edge
export default app;
