import { createMiddleware } from 'hono/factory';
import { getSupabaseAdmin } from '../lib/supabase.js';
import { Errors } from '../lib/errors.js';
import { RATE_LIMITS, type SubscriptionTier } from '../lib/types.js';
import type { Variables } from '../../api/index.js';

// In-memory rate limit store (for edge runtime)
// Note: In a serverless environment, this store is ephemeral per instance
// For production, use Redis or Upstash for persistent rate limiting
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries on access (lazy cleanup since setInterval doesn't work in Edge)
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Get today's date in YYYY-MM-DD format
function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

// Get current hour timestamp (for hourly AI limits)
function getCurrentHour(): number {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  return now.getTime();
}

// Check and update rate limit for API calls
async function checkApiRateLimit(
  userId: string,
  tier: SubscriptionTier
): Promise<{ allowed: boolean; limit: number; remaining: number; resetAt: number }> {
  const limits = RATE_LIMITS[tier];

  // No API access for free/starter tiers
  if (limits.apiCallsPerDay === 0) {
    return {
      allowed: false,
      limit: 0,
      remaining: 0,
      resetAt: getEndOfDay(),
    };
  }

  const today = getToday();
  const admin = getSupabaseAdmin();

  // Get or create usage record for today
  const { data: usage, error } = await admin
    .from('api_usage')
    .select('api_calls')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[RateLimit] Error fetching usage:', error);
    // Allow request on error to avoid blocking users
    return {
      allowed: true,
      limit: limits.apiCallsPerDay,
      remaining: limits.apiCallsPerDay,
      resetAt: getEndOfDay(),
    };
  }

  const currentCalls = usage?.api_calls || 0;
  const remaining = Math.max(0, limits.apiCallsPerDay - currentCalls);
  const resetAt = getEndOfDay();

  if (currentCalls >= limits.apiCallsPerDay) {
    return {
      allowed: false,
      limit: limits.apiCallsPerDay,
      remaining: 0,
      resetAt,
    };
  }

  // Increment usage (upsert)
  if (usage) {
    await admin
      .from('api_usage')
      .update({ api_calls: currentCalls + 1 })
      .eq('user_id', userId)
      .eq('date', today);
  } else {
    await admin.from('api_usage').insert({
      user_id: userId,
      date: today,
      api_calls: 1,
      ai_calls: 0,
    });
  }

  return {
    allowed: true,
    limit: limits.apiCallsPerDay,
    remaining: remaining - 1,
    resetAt,
  };
}

// Check and update rate limit for AI calls (hourly)
export async function checkAiRateLimit(
  userId: string,
  tier: SubscriptionTier
): Promise<{ allowed: boolean; limit: number; remaining: number; resetAt: number }> {
  // Lazy cleanup of expired entries
  cleanupExpiredEntries();

  const limits = RATE_LIMITS[tier];

  // No AI access for free/starter tiers via API
  if (limits.aiCallsPerHour === 0) {
    return {
      allowed: false,
      limit: 0,
      remaining: 0,
      resetAt: getEndOfHour(),
    };
  }

  // Use in-memory store for hourly AI limits (more granular)
  const hourKey = `ai:${userId}:${getCurrentHour()}`;
  const now = Date.now();
  const endOfHour = getEndOfHour();

  const current = rateLimitStore.get(hourKey);

  if (current && current.resetAt > now) {
    const remaining = Math.max(0, limits.aiCallsPerHour - current.count);

    if (current.count >= limits.aiCallsPerHour) {
      return {
        allowed: false,
        limit: limits.aiCallsPerHour,
        remaining: 0,
        resetAt: endOfHour,
      };
    }

    current.count++;
    return {
      allowed: true,
      limit: limits.aiCallsPerHour,
      remaining: remaining - 1,
      resetAt: endOfHour,
    };
  }

  // New hour window
  rateLimitStore.set(hourKey, { count: 1, resetAt: endOfHour });

  return {
    allowed: true,
    limit: limits.aiCallsPerHour,
    remaining: limits.aiCallsPerHour - 1,
    resetAt: endOfHour,
  };
}

// Get end of current day (midnight UTC)
function getEndOfDay(): number {
  const tomorrow = new Date();
  tomorrow.setUTCHours(24, 0, 0, 0);
  return tomorrow.getTime();
}

// Get end of current hour
function getEndOfHour(): number {
  const nextHour = new Date();
  nextHour.setMinutes(60, 0, 0);
  return nextHour.getTime();
}

// Rate limit middleware
export const rateLimitMiddleware = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const userId = c.get('userId');
    const tier = c.get('userTier');
    const isApiKey = c.get('isApiKey');

    // Only apply rate limiting for API key access
    // JWT access (web app) uses different quota system
    if (!isApiKey) {
      return next();
    }

    // Skip rate limiting for health check
    if (c.req.path === '/v1/health') {
      return next();
    }

    const { allowed, limit, remaining, resetAt } = await checkApiRateLimit(userId, tier);

    // Set rate limit headers
    c.header('X-RateLimit-Limit', limit.toString());
    c.header('X-RateLimit-Remaining', Math.max(0, remaining).toString());
    c.header('X-RateLimit-Reset', Math.floor(resetAt / 1000).toString());

    if (!allowed) {
      throw Errors.rateLimited(resetAt, limit, remaining);
    }

    return next();
  }
);

// Specific middleware for AI endpoints with hourly limits
export const aiRateLimitMiddleware = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const userId = c.get('userId');
    const tier = c.get('userTier');

    const { allowed, limit, remaining, resetAt } = await checkAiRateLimit(userId, tier);

    // Set AI-specific rate limit headers
    c.header('X-AI-RateLimit-Limit', limit.toString());
    c.header('X-AI-RateLimit-Remaining', Math.max(0, remaining).toString());
    c.header('X-AI-RateLimit-Reset', Math.floor(resetAt / 1000).toString());

    if (!allowed) {
      throw Errors.aiRateLimited(resetAt);
    }

    return next();
  }
);
