import type { Context, Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import bcrypt from 'bcryptjs';
import { getSupabaseAdmin, getSupabaseAnon } from '../lib/supabase';
import { Errors } from '../lib/errors';
import type { Variables } from '../index';
import type { SubscriptionTier } from '../lib/types';

// API key format: qmav_live_xxx or qmav_test_xxx
const API_KEY_PREFIX_LIVE = 'qmav_live_';
const API_KEY_PREFIX_TEST = 'qmav_test_';

interface AuthResult {
  userId: string;
  userTier: SubscriptionTier;
  apiKeyId?: string;
  isApiKey: boolean;
}

// Verify JWT token from Supabase
async function verifyJwt(token: string): Promise<AuthResult | null> {
  try {
    const supabase = getSupabaseAnon();

    // Get user from JWT
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('[Auth] JWT verification failed:', error?.message);
      return null;
    }

    // Get subscription tier from database
    const admin = getSupabaseAdmin();
    const { data: subscription } = await admin
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .single();

    const tier = (subscription?.plan || 'free') as SubscriptionTier;

    return {
      userId: user.id,
      userTier: tier,
      isApiKey: false,
    };
  } catch (err) {
    console.error('[Auth] JWT verification error:', err);
    return null;
  }
}

// Verify API key
async function verifyApiKey(apiKey: string): Promise<AuthResult | null> {
  try {
    // Validate key format
    const isLive = apiKey.startsWith(API_KEY_PREFIX_LIVE);
    const isTest = apiKey.startsWith(API_KEY_PREFIX_TEST);

    if (!isLive && !isTest) {
      console.error('[Auth] Invalid API key format');
      return null;
    }

    // Extract prefix for lookup (first 8 chars after qmav_live_ or qmav_test_)
    const prefixStart = isLive ? API_KEY_PREFIX_LIVE.length : API_KEY_PREFIX_TEST.length;
    const keyPrefix = apiKey.substring(prefixStart, prefixStart + 8);

    const admin = getSupabaseAdmin();

    // Find key by prefix
    const { data: apiKeyRecord, error } = await admin
      .from('api_keys')
      .select('*, subscriptions!inner(plan)')
      .eq('key_prefix', keyPrefix)
      .eq('is_active', true)
      .single();

    if (error || !apiKeyRecord) {
      console.error('[Auth] API key not found:', error?.message);
      return null;
    }

    // Check expiration
    if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
      console.error('[Auth] API key expired');
      return null;
    }

    // Verify key hash
    const isValid = await bcrypt.compare(apiKey, apiKeyRecord.key_hash);
    if (!isValid) {
      console.error('[Auth] API key hash mismatch');
      return null;
    }

    // Update last used timestamp (fire and forget)
    admin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', apiKeyRecord.id)
      .then(() => {});

    // Get tier from joined subscription
    const subscription = apiKeyRecord.subscriptions as { plan: SubscriptionTier } | null;
    const tier = subscription?.plan || 'free';

    // Check if tier allows API access
    if (tier !== 'pro' && tier !== 'enterprise') {
      console.error('[Auth] API access denied - tier:', tier);
      return null;
    }

    return {
      userId: apiKeyRecord.user_id,
      userTier: tier,
      apiKeyId: apiKeyRecord.id,
      isApiKey: true,
    };
  } catch (err) {
    console.error('[Auth] API key verification error:', err);
    return null;
  }
}

// Auth middleware
export const authMiddleware = createMiddleware<{ Variables: Variables }>(
  async (c: Context<{ Variables: Variables }>, next: Next) => {
    // Generate request ID for tracing
    const requestId = crypto.randomUUID();
    c.set('requestId', requestId);
    c.header('X-Request-Id', requestId);

    // Skip auth for health check
    if (c.req.path === '/v1/health') {
      return next();
    }

    // Check for API key first (X-API-Key header)
    const apiKey = c.req.header('X-API-Key');
    if (apiKey) {
      const result = await verifyApiKey(apiKey);

      if (!result) {
        throw Errors.authInvalid();
      }

      // Check if API access is allowed for this tier
      if (result.userTier !== 'pro' && result.userTier !== 'enterprise') {
        throw Errors.apiAccessDenied();
      }

      c.set('userId', result.userId);
      c.set('userTier', result.userTier);
      c.set('apiKeyId', result.apiKeyId);
      c.set('isApiKey', true);

      return next();
    }

    // Check for JWT (Authorization: Bearer <token>)
    const authHeader = c.req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const result = await verifyJwt(token);

      if (!result) {
        throw Errors.authInvalid();
      }

      c.set('userId', result.userId);
      c.set('userTier', result.userTier);
      c.set('isApiKey', false);

      return next();
    }

    // No authentication provided
    throw Errors.authRequired();
  }
);

// Middleware to require specific tier or higher
export function requireTier(...allowedTiers: SubscriptionTier[]) {
  return createMiddleware<{ Variables: Variables }>(async (c, next) => {
    const userTier = c.get('userTier');

    if (!allowedTiers.includes(userTier)) {
      throw Errors.tierRequired(allowedTiers.join(' or '));
    }

    return next();
  });
}

// Middleware to require API key auth (not JWT)
export const requireApiKey = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    if (!c.get('isApiKey')) {
      throw Errors.forbidden('This endpoint requires API key authentication');
    }
    return next();
  }
);

// Middleware to check specific scopes on API key
export function requireScopes(...requiredScopes: string[]) {
  return createMiddleware<{ Variables: Variables }>(async (c, next) => {
    const apiKeyId = c.get('apiKeyId');

    if (!apiKeyId) {
      // JWT auth - all scopes allowed
      return next();
    }

    // Get API key scopes from database
    const admin = getSupabaseAdmin();
    const { data: apiKey } = await admin
      .from('api_keys')
      .select('scopes')
      .eq('id', apiKeyId)
      .single();

    const keyScopes = apiKey?.scopes || [];

    // Check if key has wildcard scope or all required scopes
    if (!keyScopes.includes('*') && !requiredScopes.every((s) => keyScopes.includes(s))) {
      throw Errors.forbidden(
        `API key missing required scopes: ${requiredScopes.filter((s) => !keyScopes.includes(s)).join(', ')}`
      );
    }

    return next();
  });
}
