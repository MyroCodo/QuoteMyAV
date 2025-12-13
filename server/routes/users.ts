import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { nanoid } from 'nanoid';
import { hashSecret } from '../lib/crypto.js';
import { query, queryOne, queryAll } from '../lib/database.js';
import { getUserById, isCognitoConfigured } from '../lib/cognito.js';
import { Errors } from '../lib/errors.js';
import { apiKeyCreateSchema } from '../lib/validators.js';
import { getQuotaStatus } from '../middleware/quota.js';
import { requireTier } from '../middleware/auth.js';
import type { Variables } from '../../api/index.js';

const router = new Hono<{ Variables: Variables }>();

// Fallback to Supabase during migration (optional)
let supabaseAvailable = false;
let getSupabaseAdmin: (() => unknown) | null = null;

// Try to import Supabase for fallback during migration
try {
  const supabaseModule = await import('../lib/supabase.js');
  getSupabaseAdmin = supabaseModule.getSupabaseAdmin;
  supabaseAvailable = true;
} catch {
  // Supabase not available - using Cognito/RDS only
  console.log('[Users] Supabase not available, using Cognito/RDS only');
}

// Row interfaces
interface SubscriptionRow {
  user_id: string;
  plan: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
}

interface ApiKeyRow {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  scopes: string[];
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
}

interface ApiUsageRow {
  user_id: string;
  date: string;
  api_calls: number;
  ai_calls: number;
}

// GET /v1/me - Get current user
router.get('/', async (c) => {
  const userId = c.get('userId');
  const userTier = c.get('userTier');

  // Try Cognito first if configured
  if (isCognitoConfigured()) {
    try {
      const user = await getUserById(userId);

      if (user) {
        return c.json({
          data: {
            id: user.id,
            email: user.email,
            fullName: user.name || '',
            company: user.company || '',
            tier: userTier,
            createdAt: null, // Cognito doesn't expose created_at easily
          },
        });
      }
    } catch (err) {
      console.error('[Users] Cognito user lookup error:', err);
      // Fall through to Supabase
    }
  }

  // Fallback to Supabase
  if (supabaseAvailable && getSupabaseAdmin) {
    try {
      const admin = getSupabaseAdmin() as {
        auth: {
          admin: {
            getUserById: (id: string) => Promise<{
              data: { user: { id: string; email: string; user_metadata?: { full_name?: string; company?: string }; created_at: string } | null };
              error: Error | null;
            }>;
          };
        };
      };

      const { data: { user }, error } = await admin.auth.admin.getUserById(userId);

      if (error || !user) {
        throw Errors.userNotFound(userId);
      }

      return c.json({
        data: {
          id: user.id,
          email: user.email,
          fullName: user.user_metadata?.full_name || '',
          company: user.user_metadata?.company || '',
          tier: userTier,
          createdAt: user.created_at,
        },
      });
    } catch (err) {
      console.error('[Users] Supabase user lookup error:', err);
    }
  }

  throw Errors.userNotFound(userId);
});

// GET /v1/me/subscription - Get subscription status
router.get('/subscription', async (c) => {
  const userId = c.get('userId');
  const userTier = c.get('userTier');

  // Get subscription details - try RDS first
  let subscription: SubscriptionRow | null = null;
  try {
    subscription = await queryOne<SubscriptionRow>(
      `SELECT user_id, plan, stripe_customer_id, stripe_subscription_id,
              current_period_start, current_period_end
       FROM subscriptions WHERE user_id = $1`,
      [userId]
    );
  } catch (err) {
    console.error('[Users] RDS subscription lookup error:', err);

    // Fallback to Supabase
    if (supabaseAvailable && getSupabaseAdmin) {
      try {
        const admin = getSupabaseAdmin() as {
          from: (table: string) => {
            select: (cols: string) => {
              eq: (col: string, val: string) => {
                single: () => Promise<{ data: SubscriptionRow | null }>;
              };
            };
          };
        };

        const { data } = await admin
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .single();

        subscription = data;
      } catch {
        // Ignore Supabase errors
      }
    }
  }

  // Get quota status
  const quotaStatus = await getQuotaStatus(userId);

  // Get today's API usage (if Pro/Enterprise)
  let apiCallsToday = 0;
  if (userTier === 'pro' || userTier === 'enterprise') {
    const today = new Date().toISOString().split('T')[0];

    try {
      const usage = await queryOne<ApiUsageRow>(
        `SELECT api_calls, ai_calls FROM api_usage
         WHERE user_id = $1 AND date = $2`,
        [userId, today]
      );
      apiCallsToday = usage?.api_calls || 0;
    } catch (err) {
      console.error('[Users] RDS api_usage lookup error:', err);

      // Fallback to Supabase
      if (supabaseAvailable && getSupabaseAdmin) {
        try {
          const admin = getSupabaseAdmin() as {
            from: (table: string) => {
              select: (cols: string) => {
                eq: (col: string, val: string) => {
                  eq: (col: string, val: string) => {
                    single: () => Promise<{ data: ApiUsageRow | null }>;
                  };
                };
              };
            };
          };

          const { data } = await admin
            .from('api_usage')
            .select('api_calls, ai_calls')
            .eq('user_id', userId)
            .eq('date', today)
            .single();

          apiCallsToday = data?.api_calls || 0;
        } catch {
          // Ignore Supabase errors
        }
      }
    }
  }

  return c.json({
    data: {
      plan: userTier,
      quotesUsed: quotaStatus.used,
      quotesLimit: quotaStatus.limit,
      quotesRemaining: quotaStatus.remaining,
      apiCallsToday,
      apiCallsLimit: userTier === 'pro' ? 100 : userTier === 'enterprise' ? 10000 : 0,
      currentPeriodStart: subscription?.current_period_start || null,
      currentPeriodEnd: subscription?.current_period_end || quotaStatus.resetDate,
      stripeCustomerId: subscription?.stripe_customer_id || null,
    },
  });
});

// GET /v1/me/api-keys - List API keys (Pro/Enterprise only)
router.get('/api-keys', requireTier('pro', 'enterprise'), async (c) => {
  const userId = c.get('userId');

  // Try RDS first
  let data: ApiKeyRow[] | null = null;
  try {
    data = await queryAll<ApiKeyRow>(
      `SELECT id, name, key_prefix, scopes, last_used_at, created_at, expires_at, is_active
       FROM api_keys WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
  } catch (err) {
    console.error('[Users] RDS list API keys error:', err);

    // Fallback to Supabase
    if (supabaseAvailable && getSupabaseAdmin) {
      try {
        const admin = getSupabaseAdmin() as {
          from: (table: string) => {
            select: (cols: string) => {
              eq: (col: string, val: string) => {
                order: (col: string, opts: { ascending: boolean }) => Promise<{ data: ApiKeyRow[] | null; error: Error | null }>;
              };
            };
          };
        };

        const { data: sbData, error } = await admin
          .from('api_keys')
          .select('id, name, key_prefix, scopes, last_used_at, created_at, expires_at, is_active')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }
        data = sbData;
      } catch (sbErr) {
        console.error('[Users] Supabase list API keys error:', sbErr);
        throw Errors.database('list API keys');
      }
    } else {
      throw Errors.database('list API keys');
    }
  }

  const keys = (data || []).map((key) => ({
    id: key.id,
    name: key.name,
    keyPrefix: `qmav_****_${key.key_prefix}`,
    scopes: key.scopes,
    lastUsedAt: key.last_used_at,
    createdAt: key.created_at,
    expiresAt: key.expires_at,
    isActive: key.is_active,
  }));

  return c.json({ data: keys });
});

// POST /v1/me/api-keys - Create API key (Pro/Enterprise only)
router.post(
  '/api-keys',
  requireTier('pro', 'enterprise'),
  zValidator('json', apiKeyCreateSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');

    // Generate API key
    const keyId = nanoid(12);
    const keySecret = nanoid(32);
    const fullKey = `qmav_live_${keySecret}`;
    const keyPrefix = keySecret.substring(0, 8);

    // Hash the key
    const keyHash = await hashSecret(fullKey);

    // Calculate expiry if specified
    const expiresAt = body.expiresInDays
      ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const scopes = body.scopes || ['*'];

    // Try RDS first
    let success = false;
    try {
      await query(
        `INSERT INTO api_keys (id, user_id, name, key_prefix, key_hash, scopes, expires_at, is_active, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())`,
        [keyId, userId, body.name, keyPrefix, keyHash, JSON.stringify(scopes), expiresAt]
      );
      success = true;
    } catch (err) {
      console.error('[Users] RDS create API key error:', err);

      // Fallback to Supabase
      if (supabaseAvailable && getSupabaseAdmin) {
        try {
          const admin = getSupabaseAdmin() as {
            from: (table: string) => {
              insert: (data: unknown) => Promise<{ error: Error | null }>;
            };
          };

          const { error } = await admin.from('api_keys').insert({
            id: keyId,
            user_id: userId,
            name: body.name,
            key_prefix: keyPrefix,
            key_hash: keyHash,
            scopes: scopes,
            expires_at: expiresAt,
            is_active: true,
          });

          if (error) {
            throw error;
          }
          success = true;
        } catch (sbErr) {
          console.error('[Users] Supabase create API key error:', sbErr);
        }
      }
    }

    if (!success) {
      throw Errors.database('create API key');
    }

    // Return full key - only shown once!
    return c.json(
      {
        data: {
          id: keyId,
          key: fullKey, // IMPORTANT: This is the only time the full key is shown
          name: body.name,
          scopes: scopes,
          createdAt: new Date().toISOString(),
          expiresAt,
        },
        warning: 'Store this API key securely. It will not be shown again.',
      },
      201
    );
  }
);

// DELETE /v1/me/api-keys/:keyId - Revoke API key
router.delete('/api-keys/:keyId', requireTier('pro', 'enterprise'), async (c) => {
  const userId = c.get('userId');
  const keyId = c.req.param('keyId');

  // Try RDS first
  let success = false;
  try {
    await query(
      `UPDATE api_keys SET is_active = false WHERE id = $1 AND user_id = $2`,
      [keyId, userId]
    );
    success = true;
  } catch (err) {
    console.error('[Users] RDS revoke API key error:', err);

    // Fallback to Supabase
    if (supabaseAvailable && getSupabaseAdmin) {
      try {
        const admin = getSupabaseAdmin() as {
          from: (table: string) => {
            update: (data: unknown) => {
              eq: (col: string, val: string) => {
                eq: (col: string, val: string) => Promise<{ error: Error | null }>;
              };
            };
          };
        };

        const { error } = await admin
          .from('api_keys')
          .update({ is_active: false })
          .eq('id', keyId)
          .eq('user_id', userId);

        if (error) {
          throw error;
        }
        success = true;
      } catch (sbErr) {
        console.error('[Users] Supabase revoke API key error:', sbErr);
      }
    }
  }

  if (!success) {
    throw Errors.database('revoke API key');
  }

  return c.body(null, 204);
});

// PATCH /v1/me/api-keys/:keyId - Update API key (name, scopes)
router.patch('/api-keys/:keyId', requireTier('pro', 'enterprise'), async (c) => {
  const userId = c.get('userId');
  const keyId = c.req.param('keyId');
  const body = await c.req.json();

  const updates: Record<string, unknown> = {};
  if (body.name) updates.name = body.name;
  if (body.scopes) updates.scopes = body.scopes;

  if (Object.keys(updates).length === 0) {
    throw Errors.validation('No fields to update');
  }

  // Try RDS first
  let data: ApiKeyRow | null = null;
  try {
    // Build dynamic update query
    const setClauses: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.name) {
      setClauses.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.scopes) {
      setClauses.push(`scopes = $${paramIndex++}`);
      values.push(JSON.stringify(updates.scopes));
    }

    values.push(keyId);
    values.push(userId);

    const result = await query<ApiKeyRow>(
      `UPDATE api_keys
       SET ${setClauses.join(', ')}
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
       RETURNING id, name, key_prefix, scopes, last_used_at, created_at, expires_at, is_active`,
      values
    );

    if (result.rows.length > 0) {
      data = result.rows[0];
    }
  } catch (err) {
    console.error('[Users] RDS update API key error:', err);

    // Fallback to Supabase
    if (supabaseAvailable && getSupabaseAdmin) {
      try {
        const admin = getSupabaseAdmin() as {
          from: (table: string) => {
            update: (data: unknown) => {
              eq: (col: string, val: string) => {
                eq: (col: string, val: string) => {
                  select: (cols: string) => {
                    single: () => Promise<{ data: ApiKeyRow | null; error: Error | null }>;
                  };
                };
              };
            };
          };
        };

        const { data: sbData, error } = await admin
          .from('api_keys')
          .update(updates)
          .eq('id', keyId)
          .eq('user_id', userId)
          .select('id, name, key_prefix, scopes, last_used_at, created_at, expires_at, is_active')
          .single();

        if (error) {
          throw error;
        }
        data = sbData;
      } catch (sbErr) {
        console.error('[Users] Supabase update API key error:', sbErr);
      }
    }
  }

  if (!data) {
    throw Errors.notFound('API key', keyId);
  }

  return c.json({
    data: {
      id: data.id,
      name: data.name,
      keyPrefix: `qmav_****_${data.key_prefix}`,
      scopes: data.scopes,
      lastUsedAt: data.last_used_at,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
      isActive: data.is_active,
    },
  });
});

export default router;
