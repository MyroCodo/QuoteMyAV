import { createMiddleware } from 'hono/factory';
import { getSupabaseAdmin } from '../lib/supabase.js';
import { Errors } from '../lib/errors.js';
import { QUOTA_LIMITS, type SubscriptionTier } from '../lib/types.js';
import type { Variables } from '../index.js';

interface QuotaStatus {
  used: number;
  limit: number | 'unlimited';
  remaining: number | 'unlimited';
  resetDate: string;
  canCreate: boolean;
}

// Get quota status for a user
export async function getQuotaStatus(userId: string): Promise<QuotaStatus> {
  const admin = getSupabaseAdmin();

  // Get subscription
  const { data: subscription, error } = await admin
    .from('subscriptions')
    .select('plan, quotes_used, quotes_limit, current_period_end')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('[Quota] Error fetching subscription:', error);
    // Return default free tier limits on error
    return {
      used: 0,
      limit: QUOTA_LIMITS.free as number,
      remaining: QUOTA_LIMITS.free as number,
      resetDate: getNextMonthStart(),
      canCreate: true,
    };
  }

  const tier = (subscription?.plan || 'free') as SubscriptionTier;
  const limit = QUOTA_LIMITS[tier];
  const used = subscription?.quotes_used || 0;
  const resetDate = subscription?.current_period_end || getNextMonthStart();

  if (limit === 'unlimited') {
    return {
      used,
      limit: 'unlimited',
      remaining: 'unlimited',
      resetDate,
      canCreate: true,
    };
  }

  const remaining = Math.max(0, limit - used);

  return {
    used,
    limit,
    remaining,
    resetDate,
    canCreate: remaining > 0,
  };
}

// Increment quota usage
export async function incrementQuotaUsage(userId: string): Promise<void> {
  const admin = getSupabaseAdmin();

  // Get current subscription
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('id, quotes_used')
    .eq('user_id', userId)
    .single();

  if (subscription) {
    // Increment usage
    await admin
      .from('subscriptions')
      .update({ quotes_used: (subscription.quotes_used || 0) + 1 })
      .eq('id', subscription.id);
  } else {
    // Create default subscription with 1 quote used
    await admin.from('subscriptions').insert({
      user_id: userId,
      plan: 'free',
      quotes_used: 1,
      quotes_limit: QUOTA_LIMITS.free as number,
      current_period_start: new Date().toISOString(),
      current_period_end: getNextMonthStart(),
    });
  }
}

// Get next month start date
function getNextMonthStart(): string {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth.toISOString();
}

// Middleware to check quota before quote creation
export const quotaCheckMiddleware = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const userId = c.get('userId');

    const status = await getQuotaStatus(userId);

    // Set quota headers
    if (status.limit === 'unlimited') {
      c.header('X-Quota-Limit', 'unlimited');
      c.header('X-Quota-Used', status.used.toString());
      c.header('X-Quota-Remaining', 'unlimited');
    } else {
      c.header('X-Quota-Limit', status.limit.toString());
      c.header('X-Quota-Used', status.used.toString());
      c.header('X-Quota-Remaining', (status.remaining as number).toString());
    }
    c.header('X-Quota-Reset', status.resetDate);

    if (!status.canCreate) {
      throw Errors.quotaExceeded(
        status.used,
        status.limit as number,
        status.resetDate
      );
    }

    return next();
  }
);

// Middleware to add quota info to response headers (read-only, no blocking)
export const quotaInfoMiddleware = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const userId = c.get('userId');

    // Run the route handler first
    await next();

    // Add quota info to response headers
    try {
      const status = await getQuotaStatus(userId);

      if (status.limit === 'unlimited') {
        c.header('X-Quota-Limit', 'unlimited');
        c.header('X-Quota-Used', status.used.toString());
        c.header('X-Quota-Remaining', 'unlimited');
      } else {
        c.header('X-Quota-Limit', status.limit.toString());
        c.header('X-Quota-Used', status.used.toString());
        c.header('X-Quota-Remaining', (status.remaining as number).toString());
      }
      c.header('X-Quota-Reset', status.resetDate);
    } catch (err) {
      console.error('[Quota] Error adding quota headers:', err);
    }
  }
);
