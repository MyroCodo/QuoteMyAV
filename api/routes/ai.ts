import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { nanoid } from 'nanoid';
import { getSupabaseAdmin } from '../lib/supabase';
import { Errors } from '../lib/errors';
import { aiGenerateSchema, aiEditSchema } from '../lib/validators';
import { aiRateLimitMiddleware } from '../middleware/rateLimit';
import { quotaCheckMiddleware } from '../middleware/quota';
import type { Variables } from '../index';

const router = new Hono<{ Variables: Variables }>();

// n8n AI webhook URL (for Claude calls)
const N8N_AI_WEBHOOK_URL = process.env.N8N_AI_WEBHOOK_URL || process.env.VITE_N8N_AI_WEBHOOK_URL || '';

// POST /v1/ai/generate - Generate quote with AI (async)
router.post(
  '/generate',
  aiRateLimitMiddleware,
  quotaCheckMiddleware,
  zValidator('json', aiGenerateSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const admin = getSupabaseAdmin();

    // Create job record
    const jobId = `job-${nanoid(16)}`;

    await admin.from('ai_jobs').insert({
      id: jobId,
      user_id: userId,
      type: 'generate',
      status: 'processing',
      input: body,
      result: null,
      error: null,
    });

    // Trigger async AI generation (fire and forget)
    processAIGeneration(jobId, userId, body).catch((err) => {
      console.error('[AI] Generation error:', err);
    });

    return c.json({
      data: {
        jobId,
        status: 'processing',
        message: 'AI generation started. Poll /v1/ai/jobs/:jobId for status.',
      },
    }, 202);
  }
);

// POST /v1/ai/edit - Edit quote with AI
router.post(
  '/edit',
  aiRateLimitMiddleware,
  zValidator('json', aiEditSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');
    const admin = getSupabaseAdmin();

    // Verify quote ownership
    const { data: quote, error: quoteError } = await admin
      .from('quotes')
      .select('*')
      .eq('id', body.quoteId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (quoteError || !quote) {
      throw Errors.quoteNotFound(body.quoteId);
    }

    // Check if quote is editable
    const readOnlyStatuses = ['sent', 'accepted', 'rejected', 'expired'];
    if (readOnlyStatuses.includes(quote.status)) {
      throw Errors.quoteReadOnly(quote.status);
    }

    // Create job record
    const jobId = `job-${nanoid(16)}`;

    await admin.from('ai_jobs').insert({
      id: jobId,
      user_id: userId,
      type: 'edit',
      status: 'processing',
      input: { ...body, currentLineItems: quote.line_items },
      result: null,
      error: null,
    });

    // Trigger async AI edit (fire and forget)
    processAIEdit(jobId, userId, body, quote).catch((err) => {
      console.error('[AI] Edit error:', err);
    });

    return c.json({
      data: {
        jobId,
        status: 'processing',
        message: 'AI edit started. Poll /v1/ai/jobs/:jobId for status.',
      },
    }, 202);
  }
);

// GET /v1/ai/jobs/:jobId - Get AI job status
router.get('/jobs/:jobId', async (c) => {
  const userId = c.get('userId');
  const jobId = c.req.param('jobId');
  const admin = getSupabaseAdmin();

  const { data: job, error } = await admin
    .from('ai_jobs')
    .select('*')
    .eq('id', jobId)
    .eq('user_id', userId)
    .single();

  if (error || !job) {
    throw Errors.jobNotFound(jobId);
  }

  return c.json({
    data: {
      jobId: job.id,
      type: job.type,
      status: job.status,
      result: job.result,
      error: job.error,
      createdAt: job.created_at,
      completedAt: job.completed_at,
    },
  });
});

// Async AI generation processor
async function processAIGeneration(
  jobId: string,
  _userId: string,
  input: { eventDetails: Record<string, unknown>; equipment: Record<string, unknown> }
) {
  const admin = getSupabaseAdmin();

  try {
    if (!N8N_AI_WEBHOOK_URL) {
      throw new Error('N8N_AI_WEBHOOK_URL not configured');
    }

    // Call n8n webhook for AI generation
    const response = await fetch(N8N_AI_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'generate',
        eventDetails: input.eventDetails,
        equipment: input.equipment,
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Update job with result
    await admin
      .from('ai_jobs')
      .update({
        status: 'completed',
        result: result,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

  } catch (err) {
    console.error('[AI] Generation failed:', err);

    // Update job with error
    await admin
      .from('ai_jobs')
      .update({
        status: 'failed',
        error: {
          code: 'AI_GENERATION_FAILED',
          message: err instanceof Error ? err.message : 'Unknown error',
        },
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  }
}

// Async AI edit processor
async function processAIEdit(
  jobId: string,
  _userId: string,
  input: { quoteId: string; command?: string; quickAction?: string; targetBudget?: number },
  quote: Record<string, unknown>
) {
  const admin = getSupabaseAdmin();

  try {
    if (!N8N_AI_WEBHOOK_URL) {
      throw new Error('N8N_AI_WEBHOOK_URL not configured');
    }

    // Call n8n webhook for AI edit
    const response = await fetch(N8N_AI_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'edit',
        command: input.command,
        quickAction: input.quickAction,
        targetBudget: input.targetBudget,
        currentLineItems: quote.line_items,
        eventContext: {
          eventName: quote.event_name,
          venue: quote.venue,
          totalAmount: quote.total_amount,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Update job with result
    await admin
      .from('ai_jobs')
      .update({
        status: 'completed',
        result: result,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

  } catch (err) {
    console.error('[AI] Edit failed:', err);

    // Update job with error
    await admin
      .from('ai_jobs')
      .update({
        status: 'failed',
        error: {
          code: 'AI_EDIT_FAILED',
          message: err instanceof Error ? err.message : 'Unknown error',
        },
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);
  }
}

export default router;
