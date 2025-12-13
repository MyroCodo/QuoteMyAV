import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { getSupabaseAdmin } from '../lib/supabase';
import { Errors } from '../lib/errors';
import { apiKeyCreateSchema } from '../lib/validators';
import { getQuotaStatus } from '../middleware/quota';
import { requireTier } from '../middleware/auth';
import type { Variables } from '../index';

const router = new Hono<{ Variables: Variables }>();

// GET /v1/me - Get current user
router.get('/', async (c) => {
  const userId = c.get('userId');
  const userTier = c.get('userTier');
  const admin = getSupabaseAdmin();

  // Get user from Supabase auth
  const { data: { users }, error } = await admin.auth.admin.listUsers();

  if (error) {
    throw Errors.database('fetch user');
  }

  const user = users.find((u) => u.id === userId);

  if (!user) {
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
});

// GET /v1/me/subscription - Get subscription status
router.get('/subscription', async (c) => {
  const userId = c.get('userId');
  const userTier = c.get('userTier');
  const admin = getSupabaseAdmin();

  // Get subscription details
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Get quota status
  const quotaStatus = await getQuotaStatus(userId);

  // Get today's API usage (if Pro/Enterprise)
  let apiCallsToday = 0;
  if (userTier === 'pro' || userTier === 'enterprise') {
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await admin
      .from('api_usage')
      .select('api_calls, ai_calls')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    apiCallsToday = usage?.api_calls || 0;
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
  const admin = getSupabaseAdmin();

  const { data, error } = await admin
    .from('api_keys')
    .select('id, name, key_prefix, scopes, last_used_at, created_at, expires_at, is_active')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Users] List API keys error:', error);
    throw Errors.database('list API keys');
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
    const admin = getSupabaseAdmin();

    // Generate API key
    const keyId = nanoid(12);
    const keySecret = nanoid(32);
    const fullKey = `qmav_live_${keySecret}`;
    const keyPrefix = keySecret.substring(0, 8);

    // Hash the key
    const keyHash = await bcrypt.hash(fullKey, 12);

    // Calculate expiry if specified
    const expiresAt = body.expiresInDays
      ? new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { error } = await admin.from('api_keys').insert({
      id: keyId,
      user_id: userId,
      name: body.name,
      key_prefix: keyPrefix,
      key_hash: keyHash,
      scopes: body.scopes || ['*'],
      expires_at: expiresAt,
      is_active: true,
    });

    if (error) {
      console.error('[Users] Create API key error:', error);
      throw Errors.database('create API key');
    }

    // Return full key - only shown once!
    return c.json(
      {
        data: {
          id: keyId,
          key: fullKey, // IMPORTANT: This is the only time the full key is shown
          name: body.name,
          scopes: body.scopes || ['*'],
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
  const admin = getSupabaseAdmin();

  const { error } = await admin
    .from('api_keys')
    .update({ is_active: false })
    .eq('id', keyId)
    .eq('user_id', userId);

  if (error) {
    console.error('[Users] Revoke API key error:', error);
    throw Errors.database('revoke API key');
  }

  return c.body(null, 204);
});

// PATCH /v1/me/api-keys/:keyId - Update API key (name, scopes)
router.patch('/api-keys/:keyId', requireTier('pro', 'enterprise'), async (c) => {
  const userId = c.get('userId');
  const keyId = c.req.param('keyId');
  const body = await c.req.json();
  const admin = getSupabaseAdmin();

  const updates: Record<string, unknown> = {};
  if (body.name) updates.name = body.name;
  if (body.scopes) updates.scopes = body.scopes;

  if (Object.keys(updates).length === 0) {
    throw Errors.validation('No fields to update');
  }

  const { data, error } = await admin
    .from('api_keys')
    .update(updates)
    .eq('id', keyId)
    .eq('user_id', userId)
    .select('id, name, key_prefix, scopes, last_used_at, created_at, expires_at, is_active')
    .single();

  if (error || !data) {
    console.error('[Users] Update API key error:', error);
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
