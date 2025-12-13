import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { nanoid } from 'nanoid';
import { query, queryOne } from '../lib/database.js';
import { generateQuote, editQuote } from '../lib/claude.js';
import type { GenerateQuoteRequest, EditQuoteRequest, QuoteLineItem } from '../lib/claude.js';
import { Errors } from '../lib/errors.js';
import { aiGenerateSchema, aiEditSchema } from '../lib/validators.js';
import { aiRateLimitMiddleware } from '../middleware/rateLimit.js';
import { quotaCheckMiddleware } from '../middleware/quota.js';
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
  // Supabase not available - using RDS only
  console.log('[AI] Supabase not available, using RDS only');
}

// Helper to create job in RDS
async function createJobInRDS(
  jobId: string,
  userId: string,
  type: string,
  input: unknown
): Promise<boolean> {
  try {
    await query(
      `INSERT INTO ai_jobs (id, user_id, type, status, input, result, error, created_at)
       VALUES ($1, $2, $3, 'processing', $4, NULL, NULL, NOW())`,
      [jobId, userId, type, JSON.stringify(input)]
    );
    return true;
  } catch (err) {
    console.error('[AI] RDS job insert error:', err);
    return false;
  }
}

// Helper to create job in Supabase (fallback)
async function createJobInSupabase(
  jobId: string,
  userId: string,
  type: string,
  input: unknown
): Promise<boolean> {
  if (!supabaseAvailable || !getSupabaseAdmin) return false;

  try {
    const admin = getSupabaseAdmin() as {
      from: (table: string) => {
        insert: (data: unknown) => Promise<{ error: Error | null }>;
      };
    };

    const { error } = await admin.from('ai_jobs').insert({
      id: jobId,
      user_id: userId,
      type: type,
      status: 'processing',
      input: input,
      result: null,
      error: null,
    });

    return !error;
  } catch (err) {
    console.error('[AI] Supabase job insert error:', err);
    return false;
  }
}

// POST /v1/ai/generate - Generate quote with AI (async)
router.post(
  '/generate',
  aiRateLimitMiddleware,
  quotaCheckMiddleware,
  zValidator('json', aiGenerateSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');

    // Create job record
    const jobId = `job-${nanoid(16)}`;

    // Try RDS first, fallback to Supabase
    const rdsSuccess = await createJobInRDS(jobId, userId, 'generate', body);
    if (!rdsSuccess) {
      const supabaseSuccess = await createJobInSupabase(jobId, userId, 'generate', body);
      if (!supabaseSuccess) {
        throw Errors.serverError('Failed to create AI job');
      }
    }

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

// Quote row interface for RDS
interface QuoteRow {
  id: string;
  user_id: string;
  status: string;
  event_name: string;
  venue: string;
  line_items: QuoteLineItem[];
  total_amount: number;
  deleted_at: string | null;
}

// Helper to get quote from RDS
async function getQuoteFromRDS(
  quoteId: string,
  userId: string
): Promise<QuoteRow | null> {
  try {
    return await queryOne<QuoteRow>(
      `SELECT id, user_id, status, event_name, venue, line_items, total_amount, deleted_at
       FROM quotes
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [quoteId, userId]
    );
  } catch (err) {
    console.error('[AI] RDS quote lookup error:', err);
    return null;
  }
}

// Helper to get quote from Supabase (fallback)
async function getQuoteFromSupabase(
  quoteId: string,
  userId: string
): Promise<QuoteRow | null> {
  if (!supabaseAvailable || !getSupabaseAdmin) return null;

  try {
    const admin = getSupabaseAdmin() as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: string) => {
              is: (col: string, val: null) => {
                single: () => Promise<{ data: QuoteRow | null; error: Error | null }>;
              };
            };
          };
        };
      };
    };

    const { data, error } = await admin
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error) return null;
    return data;
  } catch (err) {
    console.error('[AI] Supabase quote lookup error:', err);
    return null;
  }
}

// POST /v1/ai/edit - Edit quote with AI
router.post(
  '/edit',
  aiRateLimitMiddleware,
  zValidator('json', aiEditSchema),
  async (c) => {
    const userId = c.get('userId');
    const body = c.req.valid('json');

    // Verify quote ownership - try RDS first, fallback to Supabase
    let quote = await getQuoteFromRDS(body.quoteId, userId);
    if (!quote) {
      quote = await getQuoteFromSupabase(body.quoteId, userId);
    }

    if (!quote) {
      throw Errors.quoteNotFound(body.quoteId);
    }

    // Check if quote is editable
    const readOnlyStatuses = ['sent', 'accepted', 'rejected', 'expired'];
    if (readOnlyStatuses.includes(quote.status)) {
      throw Errors.quoteReadOnly(quote.status);
    }

    // Create job record
    const jobId = `job-${nanoid(16)}`;

    // Try RDS first, fallback to Supabase
    const jobInput = { ...body, currentLineItems: quote.line_items };
    const rdsSuccess = await createJobInRDS(jobId, userId, 'edit', jobInput);
    if (!rdsSuccess) {
      const supabaseSuccess = await createJobInSupabase(jobId, userId, 'edit', jobInput);
      if (!supabaseSuccess) {
        throw Errors.serverError('Failed to create AI job');
      }
    }

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

// Job row interface for RDS
interface JobRow {
  id: string;
  user_id: string;
  type: string;
  status: string;
  input: unknown;
  result: unknown;
  error: unknown;
  created_at: string;
  completed_at: string | null;
}

// Helper to get job from RDS
async function getJobFromRDS(jobId: string, userId: string): Promise<JobRow | null> {
  try {
    return await queryOne<JobRow>(
      `SELECT id, user_id, type, status, input, result, error, created_at, completed_at
       FROM ai_jobs
       WHERE id = $1 AND user_id = $2`,
      [jobId, userId]
    );
  } catch (err) {
    console.error('[AI] RDS job lookup error:', err);
    return null;
  }
}

// Helper to get job from Supabase (fallback)
async function getJobFromSupabase(jobId: string, userId: string): Promise<JobRow | null> {
  if (!supabaseAvailable || !getSupabaseAdmin) return null;

  try {
    const admin = getSupabaseAdmin() as {
      from: (table: string) => {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            eq: (col: string, val: string) => {
              single: () => Promise<{ data: JobRow | null; error: Error | null }>;
            };
          };
        };
      };
    };

    const { data, error } = await admin
      .from('ai_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', userId)
      .single();

    if (error) return null;
    return data;
  } catch (err) {
    console.error('[AI] Supabase job lookup error:', err);
    return null;
  }
}

// GET /v1/ai/jobs/:jobId - Get AI job status
router.get('/jobs/:jobId', async (c) => {
  const userId = c.get('userId');
  const jobId = c.req.param('jobId');

  // Try RDS first, fallback to Supabase
  let job = await getJobFromRDS(jobId, userId);
  if (!job) {
    job = await getJobFromSupabase(jobId, userId);
  }

  if (!job) {
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

// Helper to update job status in RDS
async function updateJobInRDS(
  jobId: string,
  status: string,
  result: unknown,
  error: unknown
): Promise<boolean> {
  try {
    await query(
      `UPDATE ai_jobs
       SET status = $1, result = $2, error = $3, completed_at = NOW()
       WHERE id = $4`,
      [status, result ? JSON.stringify(result) : null, error ? JSON.stringify(error) : null, jobId]
    );
    return true;
  } catch (err) {
    console.error('[AI] RDS job update error:', err);
    return false;
  }
}

// Helper to update job status in Supabase (fallback)
async function updateJobInSupabase(
  jobId: string,
  status: string,
  result: unknown,
  error: unknown
): Promise<boolean> {
  if (!supabaseAvailable || !getSupabaseAdmin) return false;

  try {
    const admin = getSupabaseAdmin() as {
      from: (table: string) => {
        update: (data: unknown) => {
          eq: (col: string, val: string) => Promise<{ error: Error | null }>;
        };
      };
    };

    await admin
      .from('ai_jobs')
      .update({
        status,
        result,
        error,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    return true;
  } catch (err) {
    console.error('[AI] Supabase job update error:', err);
    return false;
  }
}

// Helper to update job (tries RDS first, then Supabase)
async function updateJob(
  jobId: string,
  status: string,
  result: unknown,
  error: unknown
): Promise<void> {
  const rdsSuccess = await updateJobInRDS(jobId, status, result, error);
  if (!rdsSuccess) {
    await updateJobInSupabase(jobId, status, result, error);
  }
}

// Async AI generation processor - uses direct Claude API
async function processAIGeneration(
  jobId: string,
  _userId: string,
  input: { eventDetails: Record<string, unknown>; equipment: Record<string, unknown> }
) {
  try {
    // Build the request for Claude
    const request: GenerateQuoteRequest = {
      eventDetails: {
        eventName: String(input.eventDetails.eventName || ''),
        eventType: String(input.eventDetails.eventType || ''),
        venueSize: String(input.eventDetails.venueSize || ''),
        venueName: String(input.eventDetails.venueName || ''),
        dates: String(input.eventDetails.dates || ''),
        guestCount: input.eventDetails.guestCount as number | undefined,
        indoorOutdoor: input.eventDetails.indoorOutdoor as string | undefined,
      },
      equipment: {
        categories: (input.equipment.categories as string[]) || [],
        budgetRange: input.equipment.budgetRange as string | undefined,
        specificRequests: input.equipment.specificRequests as string | undefined,
      },
    };

    // Call Claude directly
    const result = await generateQuote(request);

    // Update job with successful result
    await updateJob(jobId, 'completed', result, null);

  } catch (err) {
    console.error('[AI] Generation failed:', err);

    // Update job with error
    await updateJob(jobId, 'failed', null, {
      code: 'AI_GENERATION_FAILED',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

// Async AI edit processor - uses direct Claude API
async function processAIEdit(
  jobId: string,
  _userId: string,
  input: { quoteId: string; command?: string; quickAction?: string; targetBudget?: number },
  quote: QuoteRow
) {
  try {
    // Build the request for Claude
    const request: EditQuoteRequest = {
      currentQuote: {
        lineItems: quote.line_items || [],
        totalAmount: quote.total_amount || 0,
      },
      command: input.command || (input.targetBudget
        ? `Adjust the quote to meet a target budget of $${input.targetBudget}`
        : 'Optimize this quote'),
      quickAction: input.quickAction,
    };

    // Call Claude directly
    const result = await editQuote(request);

    // Update job with successful result
    await updateJob(jobId, 'completed', result, null);

  } catch (err) {
    console.error('[AI] Edit failed:', err);

    // Update job with error
    await updateJob(jobId, 'failed', null, {
      code: 'AI_EDIT_FAILED',
      message: err instanceof Error ? err.message : 'Unknown error',
    });
  }
}

export default router;
