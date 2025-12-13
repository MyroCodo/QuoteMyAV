import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { getSupabaseAdmin } from '../lib/supabase';
import { Errors } from '../lib/errors';
import { webhookCreateSchema, webhookUpdateSchema } from '../lib/validators';
import { requireTier } from '../middleware/auth';
import type { Variables } from '../index';
import type { WebhookEventType, WebhookPayload } from '../lib/types';

const router = new Hono<{ Variables: Variables }>();

// All webhook endpoints require Enterprise tier
router.use('*', requireTier('enterprise'));

// GET /v1/webhooks - List webhook endpoints
router.get('/', async (c) => {
  const userId = c.get('userId');
  const admin = getSupabaseAdmin();

  const { data, error } = await admin
    .from('webhook_endpoints')
    .select('id, url, events, is_active, created_at, last_delivery_at, failure_count')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Webhooks] List error:', error);
    throw Errors.database('list webhooks');
  }

  const endpoints = (data || []).map((endpoint) => ({
    id: endpoint.id,
    url: endpoint.url,
    events: endpoint.events,
    isActive: endpoint.is_active,
    createdAt: endpoint.created_at,
    lastDeliveryAt: endpoint.last_delivery_at,
    failureCount: endpoint.failure_count,
  }));

  return c.json({ data: endpoints });
});

// POST /v1/webhooks - Create webhook endpoint
router.post('/', zValidator('json', webhookCreateSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const admin = getSupabaseAdmin();

  // Generate or hash secret
  const secret = body.secret || nanoid(32);
  const secretHash = await bcrypt.hash(secret, 12);

  const webhookId = nanoid(12);

  const { error } = await admin.from('webhook_endpoints').insert({
    id: webhookId,
    user_id: userId,
    url: body.url,
    events: body.events,
    secret_hash: secretHash,
    is_active: true,
    failure_count: 0,
  });

  if (error) {
    console.error('[Webhooks] Create error:', error);
    throw Errors.database('create webhook');
  }

  return c.json(
    {
      data: {
        id: webhookId,
        url: body.url,
        events: body.events,
        secret: body.secret ? undefined : secret, // Only show generated secret
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      warning: body.secret ? undefined : 'Store this webhook secret securely. It will not be shown again.',
    },
    201
  );
});

// GET /v1/webhooks/:webhookId - Get webhook details
router.get('/:webhookId', async (c) => {
  const userId = c.get('userId');
  const webhookId = c.req.param('webhookId');
  const admin = getSupabaseAdmin();

  const { data, error } = await admin
    .from('webhook_endpoints')
    .select('id, url, events, is_active, created_at, last_delivery_at, failure_count')
    .eq('id', webhookId)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw Errors.webhookNotFound(webhookId);
  }

  return c.json({
    data: {
      id: data.id,
      url: data.url,
      events: data.events,
      isActive: data.is_active,
      createdAt: data.created_at,
      lastDeliveryAt: data.last_delivery_at,
      failureCount: data.failure_count,
    },
  });
});

// PATCH /v1/webhooks/:webhookId - Update webhook
router.patch('/:webhookId', zValidator('json', webhookUpdateSchema), async (c) => {
  const userId = c.get('userId');
  const webhookId = c.req.param('webhookId');
  const body = c.req.valid('json');
  const admin = getSupabaseAdmin();

  const updates: Record<string, unknown> = {};
  if (body.url !== undefined) updates.url = body.url;
  if (body.events !== undefined) updates.events = body.events;
  if (body.isActive !== undefined) updates.is_active = body.isActive;

  if (Object.keys(updates).length === 0) {
    throw Errors.validation('No fields to update');
  }

  const { data, error } = await admin
    .from('webhook_endpoints')
    .update(updates)
    .eq('id', webhookId)
    .eq('user_id', userId)
    .select('id, url, events, is_active, created_at, last_delivery_at, failure_count')
    .single();

  if (error || !data) {
    console.error('[Webhooks] Update error:', error);
    throw Errors.webhookNotFound(webhookId);
  }

  return c.json({
    data: {
      id: data.id,
      url: data.url,
      events: data.events,
      isActive: data.is_active,
      createdAt: data.created_at,
      lastDeliveryAt: data.last_delivery_at,
      failureCount: data.failure_count,
    },
  });
});

// DELETE /v1/webhooks/:webhookId - Delete webhook
router.delete('/:webhookId', async (c) => {
  const userId = c.get('userId');
  const webhookId = c.req.param('webhookId');
  const admin = getSupabaseAdmin();

  const { error } = await admin
    .from('webhook_endpoints')
    .delete()
    .eq('id', webhookId)
    .eq('user_id', userId);

  if (error) {
    console.error('[Webhooks] Delete error:', error);
    throw Errors.database('delete webhook');
  }

  return c.body(null, 204);
});

// GET /v1/webhooks/:webhookId/deliveries - Get recent deliveries
router.get('/:webhookId/deliveries', async (c) => {
  const userId = c.get('userId');
  const webhookId = c.req.param('webhookId');
  const admin = getSupabaseAdmin();

  // Verify webhook ownership
  const { data: webhook, error: webhookError } = await admin
    .from('webhook_endpoints')
    .select('id')
    .eq('id', webhookId)
    .eq('user_id', userId)
    .single();

  if (webhookError || !webhook) {
    throw Errors.webhookNotFound(webhookId);
  }

  const { data, error } = await admin
    .from('webhook_deliveries')
    .select('id, event_type, status, response_code, attempts, created_at, delivered_at')
    .eq('endpoint_id', webhookId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[Webhooks] List deliveries error:', error);
    throw Errors.database('list deliveries');
  }

  const deliveries = (data || []).map((d) => ({
    id: d.id,
    eventType: d.event_type,
    status: d.status,
    responseCode: d.response_code,
    attempts: d.attempts,
    createdAt: d.created_at,
    deliveredAt: d.delivered_at,
  }));

  return c.json({ data: deliveries });
});

// POST /v1/webhooks/:webhookId/test - Send test webhook
router.post('/:webhookId/test', async (c) => {
  const userId = c.get('userId');
  const webhookId = c.req.param('webhookId');
  const admin = getSupabaseAdmin();

  // Get webhook
  const { data: webhook, error: webhookError } = await admin
    .from('webhook_endpoints')
    .select('url, secret_hash')
    .eq('id', webhookId)
    .eq('user_id', userId)
    .single();

  if (webhookError || !webhook) {
    throw Errors.webhookNotFound(webhookId);
  }

  // Create test payload
  const testPayload: WebhookPayload = {
    id: `evt_test_${nanoid(16)}`,
    type: 'quote.created',
    apiVersion: '2024-01-01',
    createdAt: new Date().toISOString(),
    data: {
      quote: {
        id: 'QM-TEST-123',
        eventName: 'Test Event',
        status: 'draft',
        totalAmount: 1000,
      },
    },
  };

  // Attempt delivery
  try {
    const signature = await generateSignature(JSON.stringify(testPayload), webhook.secret_hash);

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-QuoteMyAV-Signature': signature,
        'X-QuoteMyAV-Event': testPayload.type,
        'X-QuoteMyAV-Delivery': testPayload.id,
      },
      body: JSON.stringify(testPayload),
    });

    return c.json({
      data: {
        success: response.ok,
        statusCode: response.status,
        message: response.ok ? 'Test webhook delivered successfully' : 'Webhook delivery failed',
      },
    });
  } catch (err) {
    return c.json({
      data: {
        success: false,
        statusCode: null,
        message: err instanceof Error ? err.message : 'Failed to deliver test webhook',
      },
    });
  }
});

// Helper: Generate HMAC signature
async function generateSignature(payload: string, secretHash: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secretHash),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Export webhook dispatch function for use by other routes
export async function dispatchWebhook(
  userId: string,
  eventType: WebhookEventType,
  data: Record<string, unknown>
) {
  const admin = getSupabaseAdmin();

  // Get active webhooks for this user and event
  const { data: endpoints } = await admin
    .from('webhook_endpoints')
    .select('id, url, secret_hash')
    .eq('user_id', userId)
    .eq('is_active', true)
    .contains('events', [eventType]);

  if (!endpoints || endpoints.length === 0) {
    return;
  }

  const payload: WebhookPayload = {
    id: `evt_${nanoid(16)}`,
    type: eventType,
    apiVersion: '2024-01-01',
    createdAt: new Date().toISOString(),
    data,
  };

  // Dispatch to all matching endpoints
  for (const endpoint of endpoints) {
    // Create delivery record
    const deliveryId = nanoid(12);
    await admin.from('webhook_deliveries').insert({
      id: deliveryId,
      endpoint_id: endpoint.id,
      event_type: eventType,
      payload,
      status: 'pending',
      attempts: 0,
    });

    // Attempt delivery (fire and forget)
    deliverWebhook(deliveryId, endpoint, payload).catch((err) => {
      console.error('[Webhooks] Delivery error:', err);
    });
  }
}

// Webhook delivery with retry
async function deliverWebhook(
  deliveryId: string,
  endpoint: { id: string; url: string; secret_hash: string },
  payload: WebhookPayload
) {
  const admin = getSupabaseAdmin();
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const signature = await generateSignature(JSON.stringify(payload), endpoint.secret_hash);

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-QuoteMyAV-Signature': signature,
          'X-QuoteMyAV-Event': payload.type,
          'X-QuoteMyAV-Delivery': payload.id,
        },
        body: JSON.stringify(payload),
      });

      // Update delivery record
      await admin
        .from('webhook_deliveries')
        .update({
          status: response.ok ? 'delivered' : 'failed',
          response_code: response.status,
          response_body: await response.text().catch(() => null),
          attempts: attempt,
          delivered_at: response.ok ? new Date().toISOString() : null,
        })
        .eq('id', deliveryId);

      // Update endpoint stats
      await admin
        .from('webhook_endpoints')
        .update({
          last_delivery_at: new Date().toISOString(),
          failure_count: response.ok ? 0 : (await admin.from('webhook_endpoints').select('failure_count').eq('id', endpoint.id).single()).data?.failure_count || 0 + 1,
        })
        .eq('id', endpoint.id);

      if (response.ok) {
        return; // Success, exit retry loop
      }
    } catch (err) {
      console.error(`[Webhooks] Delivery attempt ${attempt} failed:`, err);

      await admin
        .from('webhook_deliveries')
        .update({
          status: 'failed',
          attempts: attempt,
        })
        .eq('id', deliveryId);
    }

    // Wait before retry (exponential backoff)
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

export default router;
