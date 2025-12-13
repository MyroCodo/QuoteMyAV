import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { nanoid } from 'nanoid';
import { queryOne, queryAll, query } from '../lib/database.js';
import { Errors } from '../lib/errors.js';
import { sendQuoteEmail, isSESConfigured } from '../lib/email.js';
import {
  quoteCreateSchema,
  quoteUpdateSchema,
  quoteListQuerySchema,
  quoteSendSchema,
  lineItemCreateSchema,
  lineItemUpdateSchema,
  versionCompareSchema,
  VALID_STATUS_TRANSITIONS,
} from '../lib/validators.js';
import { quotaCheckMiddleware, incrementQuotaUsage } from '../middleware/quota.js';
import type { Variables } from '../../api/index.js';

// Fallback to Supabase during migration
let supabaseAvailable = false;
let getSupabaseAdmin: (() => unknown) | null = null;

try {
  const supabaseModule = await import('../lib/supabase.js');
  getSupabaseAdmin = supabaseModule.getSupabaseAdmin;
  supabaseAvailable = true;
} catch {
  console.log('[Quotes] Supabase not available, using RDS only');
}

const router = new Hono<{ Variables: Variables }>();

// Helper to generate quote ID
function generateQuoteId(): string {
  return `QM-${Date.now()}-${nanoid(6)}`;
}

// Helper to calculate total from line items
function calculateTotal(lineItems: Array<{ quantity: number; unitPrice: number }>): number {
  return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

// Helper: Transform quote from DB (snake_case to camelCase)
function transformQuoteFromDb(quote: Record<string, unknown>) {
  return {
    id: quote.id,
    userId: quote.user_id,
    clientName: quote.client_name,
    clientEmail: quote.client_email,
    eventName: quote.event_name,
    eventDate: quote.event_date,
    venue: quote.venue,
    status: quote.status,
    totalAmount: quote.total_amount,
    lineItems: quote.line_items,
    createdAt: quote.created_at,
    updatedAt: quote.updated_at,
    expiresAt: quote.expires_at,
  };
}

// Helper: Transform version from DB
function transformVersionFromDb(version: Record<string, unknown>) {
  return {
    id: version.id,
    quoteId: version.quote_id,
    versionNumber: version.version_number,
    trigger: version.trigger,
    description: version.description,
    changeType: version.change_type,
    snapshot: version.snapshot,
    createdAt: version.created_at,
  };
}

// GET /v1/quotes - List quotes
router.get('/', zValidator('query', quoteListQuerySchema), async (c) => {
  const userId = c.get('userId');
  const queryParams = c.req.valid('query');

  try {
    // Build WHERE clause
    const conditions = ['user_id = $1', 'deleted_at IS NULL'];
    const values: unknown[] = [userId];
    let paramIndex = 2;

    if (queryParams.status) {
      conditions.push(`status = $${paramIndex}`);
      values.push(queryParams.status);
      paramIndex++;
    }

    if (queryParams.search) {
      conditions.push(`(client_name ILIKE $${paramIndex} OR event_name ILIKE $${paramIndex} OR venue ILIKE $${paramIndex})`);
      values.push(`%${queryParams.search}%`);
      paramIndex++;
    }

    if (queryParams.fromDate) {
      conditions.push(`created_at >= $${paramIndex}`);
      values.push(queryParams.fromDate);
      paramIndex++;
    }

    if (queryParams.toDate) {
      conditions.push(`created_at <= $${paramIndex}`);
      values.push(queryParams.toDate);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Sorting
    const sortField = queryParams.sort.startsWith('-') ? queryParams.sort.slice(1) : queryParams.sort;
    const sortOrder = queryParams.sort.startsWith('-') ? 'DESC' : 'ASC';
    const sortFieldMap: Record<string, string> = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      totalAmount: 'total_amount',
    };
    const safeSortField = sortFieldMap[sortField] || sortField;

    // Count query
    const countResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM quotes WHERE ${whereClause}`,
      values
    );
    const total = parseInt(countResult?.count || '0');

    // Data query
    values.push(queryParams.limit, queryParams.offset);
    const data = await queryAll<Record<string, unknown>>(
      `SELECT * FROM quotes WHERE ${whereClause} ORDER BY ${safeSortField} ${sortOrder} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      values
    );

    const quotes = data.map(transformQuoteFromDb);

    return c.json({
      data: quotes,
      meta: {
        total,
        limit: queryParams.limit,
        offset: queryParams.offset,
        hasMore: (queryParams.offset + quotes.length) < total,
      },
    });
  } catch (err) {
    console.error('[Quotes] RDS list error:', err);

    // Fallback to Supabase
    if (supabaseAvailable && getSupabaseAdmin) {
      return listQuotesSupabase(c, userId, queryParams);
    }
    throw Errors.database('list quotes');
  }
});

// Supabase fallback for list quotes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function listQuotesSupabase(c: any, userId: string, queryParams: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getSupabaseAdmin!() as any;

  const sortField = (queryParams.sort as string).startsWith('-') ? (queryParams.sort as string).slice(1) : queryParams.sort as string;
  const sortOrder = (queryParams.sort as string).startsWith('-') ? 'desc' : 'asc';
  const sortFieldMap: Record<string, string> = { createdAt: 'created_at', updatedAt: 'updated_at', totalAmount: 'total_amount' };

  const limit = queryParams.limit as number;
  const offset = queryParams.offset as number;

  const { data, count, error } = await admin
    .from('quotes')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order(sortFieldMap[sortField] || sortField, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1);

  if (error) {
    throw Errors.database('list quotes');
  }

  const quotes = (data || []).map(transformQuoteFromDb);

  return c.json({
    data: quotes,
    meta: {
      total: count || 0,
      limit,
      offset,
      hasMore: (offset + quotes.length) < (count || 0),
    },
  });
}

// GET /v1/quotes/:quoteId - Get single quote
router.get('/:quoteId', async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');

  try {
    const data = await queryOne<Record<string, unknown>>(
      'SELECT * FROM quotes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [quoteId, userId]
    );

    if (!data) {
      throw Errors.quoteNotFound(quoteId);
    }

    return c.json({ data: transformQuoteFromDb(data) });
  } catch (err) {
    if ((err as { code?: string }).code === 'QUOTE_NOT_FOUND') throw err;
    console.error('[Quotes] RDS get error:', err);

    // Fallback to Supabase
    if (supabaseAvailable && getSupabaseAdmin) {
      const admin = getSupabaseAdmin() as { from: (t: string) => { select: (c: string) => { eq: (c: string, v: unknown) => { eq: (c: string, v: unknown) => { is: (c: string, v: unknown) => { single: () => Promise<{ data: unknown; error: unknown }> } } } } } };
      const { data, error } = await admin.from('quotes').select('*').eq('id', quoteId).eq('user_id', userId).is('deleted_at', null).single();
      if (error || !data) throw Errors.quoteNotFound(quoteId);
      return c.json({ data: transformQuoteFromDb(data as Record<string, unknown>) });
    }
    throw Errors.database('get quote');
  }
});

// POST /v1/quotes - Create quote
router.post('/', quotaCheckMiddleware, zValidator('json', quoteCreateSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');

  // Check idempotency key
  const idempotencyKey = c.req.header('Idempotency-Key');
  if (idempotencyKey) {
    try {
      const existing = await queryOne<{ response: unknown }>(
        'SELECT response FROM idempotency_keys WHERE key = $1 AND user_id = $2',
        [idempotencyKey, userId]
      );
      if (existing) {
        return c.json(existing.response as { data: unknown }, 201);
      }
    } catch {
      // Ignore idempotency check errors
    }
  }

  // Process line items
  const lineItems = (body.lineItems || []).map((item) => ({
    ...item,
    id: item.id || `item-${nanoid(8)}`,
    total: item.quantity * item.unitPrice,
  }));

  const totalAmount = calculateTotal(lineItems);
  const expiresAt = body.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const quoteId = generateQuoteId();

  try {
    const data = await queryOne<Record<string, unknown>>(
      `INSERT INTO quotes (
        id, user_id, client_name, client_email, event_name, event_date, venue,
        status, total_amount, line_items, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        quoteId, userId, body.clientName, body.clientEmail, body.eventName,
        body.eventDate, body.venue, body.status || 'draft', totalAmount,
        JSON.stringify(lineItems), expiresAt,
      ]
    );

    if (!data) throw new Error('Insert returned no data');

    // Increment quota
    await incrementQuotaUsage(userId);

    // Create initial version
    await query(
      `INSERT INTO quote_versions (id, quote_id, version_number, trigger, description, change_type, snapshot)
       VALUES ($1, $2, 1, 'auto', 'Quote created', 'created', $3)`,
      [
        `ver-${nanoid(12)}`,
        quoteId,
        JSON.stringify({
          eventName: body.eventName,
          eventDate: body.eventDate,
          venue: body.venue,
          status: body.status || 'draft',
          totalAmount,
          lineItems,
        }),
      ]
    );

    const response = { data: transformQuoteFromDb(data) };

    // Store idempotency key
    if (idempotencyKey) {
      await query(
        `INSERT INTO idempotency_keys (key, user_id, response, expires_at) VALUES ($1, $2, $3, $4)`,
        [idempotencyKey, userId, JSON.stringify(response), new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()]
      ).catch(() => {});
    }

    return c.json(response, 201);
  } catch (err) {
    console.error('[Quotes] RDS create error:', err);

    // Fallback to Supabase
    if (supabaseAvailable && getSupabaseAdmin) {
      const admin = getSupabaseAdmin() as { from: (t: string) => { insert: (d: unknown) => { select: () => { single: () => Promise<{ data: unknown; error: unknown }> } } } };
      const { data, error } = await admin.from('quotes').insert({
        id: quoteId, user_id: userId, client_name: body.clientName, client_email: body.clientEmail,
        event_name: body.eventName, event_date: body.eventDate, venue: body.venue,
        status: body.status || 'draft', total_amount: totalAmount, line_items: lineItems, expires_at: expiresAt,
      }).select().single();
      if (error) throw Errors.database('create quote');
      await incrementQuotaUsage(userId);
      return c.json({ data: transformQuoteFromDb(data as Record<string, unknown>) }, 201);
    }
    throw Errors.database('create quote');
  }
});

// PATCH /v1/quotes/:quoteId - Update quote
router.patch('/:quoteId', zValidator('json', quoteUpdateSchema), async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const body = c.req.valid('json');

  try {
    // Get current quote
    const current = await queryOne<Record<string, unknown>>(
      'SELECT * FROM quotes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [quoteId, userId]
    );

    if (!current) {
      throw Errors.quoteNotFound(quoteId);
    }

    // Check if editable
    const readOnlyStatuses = ['sent', 'accepted', 'rejected', 'expired'];
    if (readOnlyStatuses.includes(current.status as string) && !body.status) {
      throw Errors.quoteReadOnly(current.status as string);
    }

    // Validate status transition
    if (body.status && body.status !== current.status) {
      const allowed = VALID_STATUS_TRANSITIONS[current.status as string] || [];
      if (!allowed.includes(body.status)) {
        throw Errors.invalidStatusTransition(current.status as string, body.status, allowed);
      }
    }

    // Build update
    const updates: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let paramIndex = 1;

    const fieldMap: Record<string, string> = {
      clientName: 'client_name',
      clientEmail: 'client_email',
      eventName: 'event_name',
      eventDate: 'event_date',
      venue: 'venue',
      status: 'status',
      expiresAt: 'expires_at',
    };

    for (const [jsField, dbField] of Object.entries(fieldMap)) {
      if ((body as Record<string, unknown>)[jsField] !== undefined) {
        updates.push(`${dbField} = $${paramIndex}`);
        values.push((body as Record<string, unknown>)[jsField]);
        paramIndex++;
      }
    }

    // Handle line items
    if (body.lineItems !== undefined) {
      const lineItems = body.lineItems.map((item) => ({
        ...item,
        id: item.id || `item-${nanoid(8)}`,
        total: item.quantity * item.unitPrice,
      }));
      updates.push(`line_items = $${paramIndex}`);
      values.push(JSON.stringify(lineItems));
      paramIndex++;
      updates.push(`total_amount = $${paramIndex}`);
      values.push(calculateTotal(lineItems));
      paramIndex++;
    }

    values.push(quoteId, userId);

    const data = await queryOne<Record<string, unknown>>(
      `UPDATE quotes SET ${updates.join(', ')} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`,
      values
    );

    if (!data) throw Errors.database('update quote');

    // Create version
    const latestVersion = await queryOne<{ version_number: number }>(
      'SELECT version_number FROM quote_versions WHERE quote_id = $1 ORDER BY version_number DESC LIMIT 1',
      [quoteId]
    );

    let changeType = 'items_modified';
    if (body.status && body.status !== current.status) changeType = 'status_changed';

    await query(
      `INSERT INTO quote_versions (id, quote_id, version_number, trigger, description, change_type, snapshot)
       VALUES ($1, $2, $3, 'auto', $4, $5, $6)`,
      [
        `ver-${nanoid(12)}`,
        quoteId,
        (latestVersion?.version_number || 0) + 1,
        `Quote updated (${changeType})`,
        changeType,
        JSON.stringify({
          eventName: data.event_name,
          eventDate: data.event_date,
          venue: data.venue,
          status: data.status,
          totalAmount: data.total_amount,
          lineItems: data.line_items,
        }),
      ]
    );

    return c.json({ data: transformQuoteFromDb(data) });
  } catch (err) {
    if ((err as { code?: string }).code) throw err;
    console.error('[Quotes] RDS update error:', err);
    throw Errors.database('update quote');
  }
});

// DELETE /v1/quotes/:quoteId - Soft delete quote
router.delete('/:quoteId', async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');

  try {
    const result = await query(
      'UPDATE quotes SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [quoteId, userId]
    );

    if ((result.rowCount || 0) === 0) {
      throw Errors.quoteNotFound(quoteId);
    }

    return c.body(null, 204);
  } catch (err) {
    if ((err as { code?: string }).code === 'QUOTE_NOT_FOUND') throw err;
    console.error('[Quotes] RDS delete error:', err);
    throw Errors.database('delete quote');
  }
});

// POST /v1/quotes/:quoteId/clone - Clone quote
router.post('/:quoteId/clone', quotaCheckMiddleware, async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');

  try {
    // Get original
    const original = await queryOne<Record<string, unknown>>(
      'SELECT * FROM quotes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [quoteId, userId]
    );

    if (!original) {
      throw Errors.quoteNotFound(quoteId);
    }

    const newQuoteId = generateQuoteId();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const data = await queryOne<Record<string, unknown>>(
      `INSERT INTO quotes (
        id, user_id, client_name, client_email, event_name, event_date, venue,
        status, total_amount, line_items, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft', $8, $9, $10)
      RETURNING *`,
      [
        newQuoteId, userId, original.client_name, original.client_email,
        `${original.event_name} (Copy)`, original.event_date, original.venue,
        original.total_amount, JSON.stringify(original.line_items), expiresAt,
      ]
    );

    if (!data) throw Errors.database('clone quote');

    await incrementQuotaUsage(userId);

    return c.json({ data: transformQuoteFromDb(data) }, 201);
  } catch (err) {
    if ((err as { code?: string }).code) throw err;
    console.error('[Quotes] RDS clone error:', err);
    throw Errors.database('clone quote');
  }
});

// POST /v1/quotes/:quoteId/send - Send quote to client
router.post('/:quoteId/send', zValidator('json', quoteSendSchema), async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const body = c.req.valid('json');

  try {
    // Get quote
    const quote = await queryOne<Record<string, unknown>>(
      'SELECT * FROM quotes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [quoteId, userId]
    );

    if (!quote) {
      throw Errors.quoteNotFound(quoteId);
    }

    // Validate status
    const sendableStatuses = ['draft', 'approved', 'pending_review'];
    if (!sendableStatuses.includes(quote.status as string)) {
      throw Errors.invalidStatusTransition(quote.status as string, 'sent', sendableStatuses);
    }

    const recipientEmail = body.recipientEmail || quote.client_email as string;
    const trackingId = nanoid(16);
    const sentAt = new Date().toISOString();
    const expiresAt = quote.expires_at as string || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const appUrl = process.env.VITE_APP_URL || process.env.APP_URL || 'https://quotemyav.com';
    const viewQuoteUrl = `${appUrl}/quotes/${quoteId}/view?t=${trackingId}`;

    // Send email
    let emailMessageId: string | null = null;
    if (isSESConfigured()) {
      try {
        const lineItems = (quote.line_items as Array<{
          category: string;
          description: string;
          quantity: number;
          unitPrice: number;
          total: number;
        }>) || [];

        const result = await sendQuoteEmail({
          quoteId,
          clientName: quote.client_name as string,
          clientEmail: recipientEmail,
          eventName: quote.event_name as string,
          eventDate: quote.event_date as string,
          venue: quote.venue as string,
          totalAmount: quote.total_amount as number,
          lineItems,
          expiresAt,
          customMessage: body.message,
          viewQuoteUrl,
        });

        emailMessageId = result.messageId;
      } catch (emailError) {
        console.error('[Quotes] Email sending failed:', emailError);
      }
    }

    // Update quote
    await query(
      `UPDATE quotes SET status = 'sent', sent_at = $1, sent_to = $2, tracking_id = $3, expires_at = $4, updated_at = $1
       WHERE id = $5`,
      [sentAt, recipientEmail, trackingId, expiresAt, quoteId]
    );

    // Create version
    const latestVersion = await queryOne<{ version_number: number }>(
      'SELECT version_number FROM quote_versions WHERE quote_id = $1 ORDER BY version_number DESC LIMIT 1',
      [quoteId]
    );

    await query(
      `INSERT INTO quote_versions (id, quote_id, version_number, trigger, description, change_type, snapshot)
       VALUES ($1, $2, $3, 'auto', $4, 'status_changed', $5)`,
      [
        `ver-${nanoid(12)}`,
        quoteId,
        (latestVersion?.version_number || 0) + 1,
        `Quote sent to ${recipientEmail}`,
        JSON.stringify({
          eventName: quote.event_name,
          eventDate: quote.event_date,
          venue: quote.venue,
          status: 'sent',
          totalAmount: quote.total_amount,
          lineItems: quote.line_items,
        }),
      ]
    );

    return c.json({
      data: {
        sentAt,
        trackingId,
        recipientEmail,
        expiresAt,
        viewQuoteUrl,
        emailSent: Boolean(emailMessageId),
        emailMessageId,
      },
    });
  } catch (err) {
    if ((err as { code?: string }).code) throw err;
    console.error('[Quotes] RDS send error:', err);
    throw Errors.database('send quote');
  }
});

// GET /v1/quotes/:quoteId/pdf - Export quote as PDF
router.get('/:quoteId/pdf', async (c) => {
  return c.json({
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'PDF generation endpoint - use frontend PDF export for now',
    },
  }, 501);
});

// ===== Line Items Sub-Routes =====

// POST /v1/quotes/:quoteId/items - Add line item
router.post('/:quoteId/items', zValidator('json', lineItemCreateSchema), async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const body = c.req.valid('json');

  try {
    const quote = await queryOne<Record<string, unknown>>(
      'SELECT * FROM quotes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [quoteId, userId]
    );

    if (!quote) throw Errors.quoteNotFound(quoteId);

    const readOnlyStatuses = ['sent', 'accepted', 'rejected', 'expired'];
    if (readOnlyStatuses.includes(quote.status as string)) {
      throw Errors.quoteReadOnly(quote.status as string);
    }

    const newItem = {
      id: `item-${nanoid(8)}`,
      ...body,
      total: body.quantity * body.unitPrice,
    };

    const lineItems = [...((quote.line_items as unknown[]) || []), newItem];
    const totalAmount = calculateTotal(lineItems as Array<{ quantity: number; unitPrice: number }>);

    await query(
      'UPDATE quotes SET line_items = $1, total_amount = $2, updated_at = NOW() WHERE id = $3',
      [JSON.stringify(lineItems), totalAmount, quoteId]
    );

    return c.json({ data: newItem }, 201);
  } catch (err) {
    if ((err as { code?: string }).code) throw err;
    throw Errors.database('add line item');
  }
});

// PATCH /v1/quotes/:quoteId/items/:itemId - Update line item
router.patch('/:quoteId/items/:itemId', zValidator('json', lineItemUpdateSchema), async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const itemId = c.req.param('itemId');
  const body = c.req.valid('json');

  try {
    const quote = await queryOne<Record<string, unknown>>(
      'SELECT * FROM quotes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [quoteId, userId]
    );

    if (!quote) throw Errors.quoteNotFound(quoteId);

    const readOnlyStatuses = ['sent', 'accepted', 'rejected', 'expired'];
    if (readOnlyStatuses.includes(quote.status as string)) {
      throw Errors.quoteReadOnly(quote.status as string);
    }

    const lineItems = quote.line_items as Array<Record<string, unknown>>;
    const itemIndex = lineItems.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) throw Errors.notFound('Line item', itemId);

    const updatedItem: Record<string, unknown> = { ...lineItems[itemIndex], ...body };
    if (body.quantity !== undefined || body.unitPrice !== undefined) {
      updatedItem.total = ((updatedItem.quantity as number) || 0) * ((updatedItem.unitPrice as number) || 0);
    }

    lineItems[itemIndex] = updatedItem;
    const totalAmount = calculateTotal(lineItems as Array<{ quantity: number; unitPrice: number }>);

    await query(
      'UPDATE quotes SET line_items = $1, total_amount = $2, updated_at = NOW() WHERE id = $3',
      [JSON.stringify(lineItems), totalAmount, quoteId]
    );

    return c.json({ data: updatedItem });
  } catch (err) {
    if ((err as { code?: string }).code) throw err;
    throw Errors.database('update line item');
  }
});

// DELETE /v1/quotes/:quoteId/items/:itemId - Delete line item
router.delete('/:quoteId/items/:itemId', async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const itemId = c.req.param('itemId');

  try {
    const quote = await queryOne<Record<string, unknown>>(
      'SELECT * FROM quotes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [quoteId, userId]
    );

    if (!quote) throw Errors.quoteNotFound(quoteId);

    const readOnlyStatuses = ['sent', 'accepted', 'rejected', 'expired'];
    if (readOnlyStatuses.includes(quote.status as string)) {
      throw Errors.quoteReadOnly(quote.status as string);
    }

    const lineItems = (quote.line_items as Array<Record<string, unknown>>).filter(
      (item) => item.id !== itemId
    );
    const totalAmount = calculateTotal(lineItems as Array<{ quantity: number; unitPrice: number }>);

    await query(
      'UPDATE quotes SET line_items = $1, total_amount = $2, updated_at = NOW() WHERE id = $3',
      [JSON.stringify(lineItems), totalAmount, quoteId]
    );

    return c.body(null, 204);
  } catch (err) {
    if ((err as { code?: string }).code) throw err;
    throw Errors.database('delete line item');
  }
});

// ===== Versions Sub-Routes =====

// GET /v1/quotes/:quoteId/versions - List quote versions
router.get('/:quoteId/versions', async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');

  try {
    // Verify ownership
    const quote = await queryOne<{ id: string }>(
      'SELECT id FROM quotes WHERE id = $1 AND user_id = $2',
      [quoteId, userId]
    );

    if (!quote) throw Errors.quoteNotFound(quoteId);

    const data = await queryAll<Record<string, unknown>>(
      'SELECT * FROM quote_versions WHERE quote_id = $1 ORDER BY version_number DESC',
      [quoteId]
    );

    return c.json({ data: data.map(transformVersionFromDb) });
  } catch (err) {
    if ((err as { code?: string }).code) throw err;
    throw Errors.database('list versions');
  }
});

// GET /v1/quotes/:quoteId/versions/:versionId - Get specific version
router.get('/:quoteId/versions/:versionId', async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const versionId = c.req.param('versionId');

  try {
    const quote = await queryOne<{ id: string }>(
      'SELECT id FROM quotes WHERE id = $1 AND user_id = $2',
      [quoteId, userId]
    );

    if (!quote) throw Errors.quoteNotFound(quoteId);

    const data = await queryOne<Record<string, unknown>>(
      'SELECT * FROM quote_versions WHERE id = $1 AND quote_id = $2',
      [versionId, quoteId]
    );

    if (!data) throw Errors.versionNotFound(versionId);

    return c.json({ data: transformVersionFromDb(data) });
  } catch (err) {
    if ((err as { code?: string }).code) throw err;
    throw Errors.database('get version');
  }
});

// GET /v1/quotes/:quoteId/versions/compare - Compare two versions
router.get('/:quoteId/versions/compare', zValidator('query', versionCompareSchema), async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const { a, b } = c.req.valid('query');

  try {
    const quote = await queryOne<{ id: string }>(
      'SELECT id FROM quotes WHERE id = $1 AND user_id = $2',
      [quoteId, userId]
    );

    if (!quote) throw Errors.quoteNotFound(quoteId);

    const versions = await queryAll<Record<string, unknown>>(
      'SELECT * FROM quote_versions WHERE quote_id = $1 AND id IN ($2, $3)',
      [quoteId, a, b]
    );

    if (versions.length !== 2) throw Errors.validation('Both version IDs must exist');

    const versionA = versions.find((v) => v.id === a);
    const versionB = versions.find((v) => v.id === b);

    if (!versionA || !versionB) throw Errors.validation('Version not found');

    const snapshotA = versionA.snapshot as { lineItems: Array<Record<string, unknown>>; totalAmount: number };
    const snapshotB = versionB.snapshot as { lineItems: Array<Record<string, unknown>>; totalAmount: number };

    const itemsA = snapshotA.lineItems || [];
    const itemsB = snapshotB.lineItems || [];

    const changes: Array<Record<string, unknown>> = [];

    for (const itemB of itemsB) {
      const itemA = itemsA.find((i) => i.id === itemB.id);
      if (!itemA) {
        changes.push({ type: 'added', ...itemB, priceDelta: itemB.total as number });
      } else if (itemA.quantity !== itemB.quantity || itemA.unitPrice !== itemB.unitPrice) {
        changes.push({
          type: 'modified',
          category: itemB.category,
          description: itemB.description,
          oldValue: { quantity: itemA.quantity, unitPrice: itemA.unitPrice, total: itemA.total },
          newValue: { quantity: itemB.quantity, unitPrice: itemB.unitPrice, total: itemB.total },
          priceDelta: (itemB.total as number) - (itemA.total as number),
        });
      }
    }

    for (const itemA of itemsA) {
      if (!itemsB.find((i) => i.id === itemA.id)) {
        changes.push({ type: 'removed', ...itemA, priceDelta: -(itemA.total as number) });
      }
    }

    const totalDelta = snapshotB.totalAmount - snapshotA.totalAmount;

    return c.json({
      data: {
        versionA: transformVersionFromDb(versionA),
        versionB: transformVersionFromDb(versionB),
        changes,
        summary: {
          itemsAdded: changes.filter((ch) => ch.type === 'added').length,
          itemsRemoved: changes.filter((ch) => ch.type === 'removed').length,
          itemsModified: changes.filter((ch) => ch.type === 'modified').length,
          totalAmountDelta: totalDelta,
          percentageChange: snapshotA.totalAmount ? (totalDelta / snapshotA.totalAmount) * 100 : 0,
        },
      },
    });
  } catch (err) {
    if ((err as { code?: string }).code) throw err;
    throw Errors.database('compare versions');
  }
});

// POST /v1/quotes/:quoteId/versions/:versionId/revert - Revert to version
router.post('/:quoteId/versions/:versionId/revert', async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const versionId = c.req.param('versionId');

  try {
    const quote = await queryOne<Record<string, unknown>>(
      'SELECT * FROM quotes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
      [quoteId, userId]
    );

    if (!quote) throw Errors.quoteNotFound(quoteId);

    const version = await queryOne<Record<string, unknown>>(
      'SELECT * FROM quote_versions WHERE id = $1 AND quote_id = $2',
      [versionId, quoteId]
    );

    if (!version) throw Errors.versionNotFound(versionId);

    const snapshot = version.snapshot as {
      eventName: string;
      eventDate: string;
      venue: string;
      lineItems: unknown[];
      totalAmount: number;
    };

    const data = await queryOne<Record<string, unknown>>(
      `UPDATE quotes SET
        event_name = $1, event_date = $2, venue = $3, line_items = $4, total_amount = $5,
        status = 'draft', updated_at = NOW()
       WHERE id = $6 RETURNING *`,
      [snapshot.eventName, snapshot.eventDate, snapshot.venue, JSON.stringify(snapshot.lineItems), snapshot.totalAmount, quoteId]
    );

    if (!data) throw Errors.database('revert quote');

    // Create revert version
    const latestVersion = await queryOne<{ version_number: number }>(
      'SELECT version_number FROM quote_versions WHERE quote_id = $1 ORDER BY version_number DESC LIMIT 1',
      [quoteId]
    );

    await query(
      `INSERT INTO quote_versions (id, quote_id, version_number, trigger, description, change_type, snapshot)
       VALUES ($1, $2, $3, 'manual', $4, 'manual_snapshot', $5)`,
      [
        `ver-${nanoid(12)}`,
        quoteId,
        (latestVersion?.version_number || 0) + 1,
        `Reverted to version ${version.version_number}`,
        JSON.stringify(snapshot),
      ]
    );

    return c.json({ data: transformQuoteFromDb(data) });
  } catch (err) {
    if ((err as { code?: string }).code) throw err;
    throw Errors.database('revert quote');
  }
});

export default router;
