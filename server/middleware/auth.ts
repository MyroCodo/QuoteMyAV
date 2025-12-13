import type { Context, Next } from 'hono';
import { createMiddleware } from 'hono/factory';
import { verifySecret } from '../lib/crypto.js';
import { verifyCognitoToken, isCognitoConfigured } from '../lib/cognito.js';
import { queryOne, query } from '../lib/database.js';
import { Errors } from '../lib/errors.js';
import type { Variables } from '../../api/index.js';
import type { SubscriptionTier } from '../lib/types.js';

// Fallback to Supabase during migration (optional)
let supabaseAvailable = false;
let getSupabaseAdmin: (() => unknown) | null = null;
let getSupabaseAnon: (() => unknown) | null = null;

// Try to import Supabase for fallback during migration
try {
  const supabaseModule = await import('../lib/supabase.js');
  getSupabaseAdmin = supabaseModule.getSupabaseAdmin;
  getSupabaseAnon = supabaseModule.getSupabaseAnon;
  supabaseAvailable = true;
} catch {
  // Supabase not available - using Cognito/RDS only
  console.log('[Auth] Supabase not available, using Cognito/RDS');
}

// API key format: qmav_live_xxx or qmav_test_xxx
const API_KEY_PREFIX_LIVE = 'qmav_live_';
const API_KEY_PREFIX_TEST = 'qmav_test_';

interface AuthResult {
  userId: string;
  userTier: SubscriptionTier;
  apiKeyId?: string;
  isApiKey: boolean;
}

// Verify JWT token - tries Cognito first, falls back to Supabase during migration
async function verifyJwt(token: string): Promise<AuthResult | null> {
  // Try Cognito first if configured
  if (isCognitoConfigured()) {
    try {
      const user = await verifyCognitoToken(token);

      // Get subscription tier from RDS
      const subscription = await queryOne<{ plan: string }>(
        'SELECT plan FROM subscriptions WHERE user_id = $1',
        [user.id]
      );

      const tier = (subscription?.plan || user.tier || 'free') as SubscriptionTier;

      return {
        userId: user.id,
        userTier: tier,
        isApiKey: false,
      };
    } catch (err) {
      console.error('[Auth] Cognito JWT verification failed:', err);
      // Fall through to Supabase if available
    }
  }

  // Fallback to Supabase during migration period
  if (supabaseAvailable && getSupabaseAnon && getSupabaseAdmin) {
    try {
      const supabase = getSupabaseAnon() as {
        auth: { getUser: (token: string) => Promise<{ data: { user: { id: string } | null }; error: Error | null }> };
      };

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        console.error('[Auth] Supabase JWT verification failed:', error);
        return null;
      }

      // Get subscription tier from Supabase
      const admin = getSupabaseAdmin() as {
        from: (table: string) => {
          select: (cols: string) => {
            eq: (col: string, val: string) => {
              single: () => Promise<{ data: { plan: string } | null }>;
            };
          };
        };
      };

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
      console.error('[Auth] Supabase JWT verification error:', err);
      return null;
    }
  }

  console.error('[Auth] No auth provider available');
  return null;
}

// Verify API key - uses RDS, falls back to Supabase during migration
async function verifyApiKey(apiKey: string): Promise<AuthResult | null> {
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

  // Try RDS first
  try {
    const apiKeyRecord = await queryOne<{
      id: string;
      user_id: string;
      key_hash: string;
      expires_at: string | null;
      is_active: boolean;
      scopes: string[];
    }>(
      `SELECT ak.id, ak.user_id, ak.key_hash, ak.expires_at, ak.is_active, ak.scopes
       FROM api_keys ak
       WHERE ak.key_prefix = $1 AND ak.is_active = true`,
      [keyPrefix]
    );

    if (apiKeyRecord) {
      // Check expiration
      if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
        console.error('[Auth] API key expired');
        return null;
      }

      // Verify key hash
      const isValid = await verifySecret(apiKey, apiKeyRecord.key_hash);
      if (!isValid) {
        console.error('[Auth] API key hash mismatch');
        return null;
      }

      // Get subscription tier
      const subscription = await queryOne<{ plan: string }>(
        'SELECT plan FROM subscriptions WHERE user_id = $1',
        [apiKeyRecord.user_id]
      );

      const tier = (subscription?.plan || 'free') as SubscriptionTier;

      // Check if tier allows API access
      if (tier !== 'pro' && tier !== 'enterprise') {
        console.error('[Auth] API access denied - tier:', tier);
        return null;
      }

      // Update last used timestamp (fire and forget)
      query(
        'UPDATE api_keys SET last_used_at = NOW() WHERE id = $1',
        [apiKeyRecord.id]
      ).catch(() => {});

      return {
        userId: apiKeyRecord.user_id,
        userTier: tier,
        apiKeyId: apiKeyRecord.id,
        isApiKey: true,
      };
    }
  } catch (err) {
    console.error('[Auth] RDS API key lookup error:', err);
    // Fall through to Supabase
  }

  // Fallback to Supabase during migration
  if (supabaseAvailable && getSupabaseAdmin) {
    try {
      const admin = getSupabaseAdmin() as {
        from: (table: string) => {
          select: (cols: string) => {
            eq: (col: string, val: unknown) => {
              eq: (col: string, val: unknown) => {
                single: () => Promise<{
                  data: {
                    id: string;
                    user_id: string;
                    key_hash: string;
                    expires_at: string | null;
                    subscriptions: { plan: string } | null;
                  } | null;
                  error: Error | null;
                }>;
              };
            };
          };
        };
      };

      const { data: apiKeyRecord, error } = await admin
        .from('api_keys')
        .select('*, subscriptions!inner(plan)')
        .eq('key_prefix', keyPrefix)
        .eq('is_active', true)
        .single();

      if (error || !apiKeyRecord) {
        console.error('[Auth] API key not found:', error);
        return null;
      }

      // Check expiration
      if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
        console.error('[Auth] API key expired');
        return null;
      }

      // Verify key hash
      const isValid = await verifySecret(apiKey, apiKeyRecord.key_hash);
      if (!isValid) {
        console.error('[Auth] API key hash mismatch');
        return null;
      }

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
      console.error('[Auth] Supabase API key verification error:', err);
      return null;
    }
  }

  return null;
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

    // Get API key scopes from database (RDS first, then Supabase fallback)
    let keyScopes: string[] = [];

    try {
      const apiKey = await queryOne<{ scopes: string[] }>(
        'SELECT scopes FROM api_keys WHERE id = $1',
        [apiKeyId]
      );
      keyScopes = apiKey?.scopes || [];
    } catch {
      // Fallback to Supabase
      if (supabaseAvailable && getSupabaseAdmin) {
        const admin = getSupabaseAdmin() as {
          from: (table: string) => {
            select: (cols: string) => {
              eq: (col: string, val: string) => {
                single: () => Promise<{ data: { scopes: string[] } | null }>;
              };
            };
          };
        };

        const { data: apiKey } = await admin
          .from('api_keys')
          .select('scopes')
          .eq('id', apiKeyId)
          .single();

        keyScopes = apiKey?.scopes || [];
      }
    }

    // Check if key has wildcard scope or all required scopes
    if (!keyScopes.includes('*') && !requiredScopes.every((s) => keyScopes.includes(s))) {
      throw Errors.forbidden(
        `API key missing required scopes: ${requiredScopes.filter((s) => !keyScopes.includes(s)).join(', ')}`
      );
    }

    return next();
  });
}
