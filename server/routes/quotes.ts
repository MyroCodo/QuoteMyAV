import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { nanoid } from 'nanoid';
import { getSupabaseAdmin } from '../lib/supabase.js';
import { Errors } from '../lib/errors.js';
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

const router = new Hono<{ Variables: Variables }>();

// Helper to generate quote ID
function generateQuoteId(): string {
  return `QM-${Date.now()}-${nanoid(6)}`;
}

// Helper to calculate total from line items
function calculateTotal(lineItems: Array<{ quantity: number; unitPrice: number }>): number {
  return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

// GET /v1/quotes - List quotes
router.get('/', zValidator('query', quoteListQuerySchema), async (c) => {
  const userId = c.get('userId');
  const query = c.req.valid('query');
  const admin = getSupabaseAdmin();

  let dbQuery = admin
    .from('quotes')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .is('deleted_at', null);

  // Apply filters
  if (query.status) {
    dbQuery = dbQuery.eq('status', query.status);
  }

  if (query.search) {
    dbQuery = dbQuery.or(
      `client_name.ilike.%${query.search}%,event_name.ilike.%${query.search}%,venue.ilike.%${query.search}%`
    );
  }

  if (query.fromDate) {
    dbQuery = dbQuery.gte('created_at', query.fromDate);
  }

  if (query.toDate) {
    dbQuery = dbQuery.lte('created_at', query.toDate);
  }

  // Apply sorting
  const sortField = query.sort.startsWith('-') ? query.sort.slice(1) : query.sort;
  const sortOrder = query.sort.startsWith('-') ? 'desc' : 'asc';

  // Map camelCase to snake_case
  const sortFieldMap: Record<string, string> = {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    totalAmount: 'total_amount',
  };

  dbQuery = dbQuery.order(sortFieldMap[sortField] || sortField, { ascending: sortOrder === 'asc' });

  // Apply pagination
  dbQuery = dbQuery.range(query.offset, query.offset + query.limit - 1);

  const { data, count, error } = await dbQuery;

  if (error) {
    console.error('[Quotes] List error:', error);
    throw Errors.database('list quotes');
  }

  // Transform snake_case to camelCase
  const quotes = (data || []).map(transformQuoteFromDb);

  return c.json({
    data: quotes,
    meta: {
      total: count || 0,
      limit: query.limit,
      offset: query.offset,
      hasMore: (query.offset + quotes.length) < (count || 0),
    },
  });
});

// GET /v1/quotes/:quoteId - Get single quote
router.get('/:quoteId', async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const admin = getSupabaseAdmin();

  const { data, error } = await admin
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (error || !data) {
    throw Errors.quoteNotFound(quoteId);
  }

  return c.json({ data: transformQuoteFromDb(data) });
});

// POST /v1/quotes - Create quote
router.post('/', quotaCheckMiddleware, zValidator('json', quoteCreateSchema), async (c) => {
  const userId = c.get('userId');
  const body = c.req.valid('json');
  const admin = getSupabaseAdmin();

  // Check idempotency key
  const idempotencyKey = c.req.header('Idempotency-Key');
  if (idempotencyKey) {
    const { data: existing } = await admin
      .from('idempotency_keys')
      .select('response')
      .eq('key', idempotencyKey)
      .eq('user_id', userId)
      .single();

    if (existing) {
      return c.json(existing.response as { data: unknown }, 201);
    }
  }

  // Process line items
  const lineItems = (body.lineItems || []).map((item) => ({
    ...item,
    id: item.id || `item-${nanoid(8)}`,
    total: item.quantity * item.unitPrice,
  }));

  const totalAmount = calculateTotal(lineItems);

  // Calculate expiry (30 days from now if not specified)
  const expiresAt = body.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const quoteId = generateQuoteId();

  const { data, error } = await admin
    .from('quotes')
    .insert({
      id: quoteId,
      user_id: userId,
      client_name: body.clientName,
      client_email: body.clientEmail,
      event_name: body.eventName,
      event_date: body.eventDate,
      venue: body.venue,
      status: body.status || 'draft',
      total_amount: totalAmount,
      line_items: lineItems,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    console.error('[Quotes] Create error:', error);
    throw Errors.database('create quote');
  }

  // Increment quota usage
  await incrementQuotaUsage(userId);

  // Create initial version
  await admin.from('quote_versions').insert({
    id: `ver-${nanoid(12)}`,
    quote_id: quoteId,
    version_number: 1,
    trigger: 'auto',
    description: 'Quote created',
    change_type: 'created',
    snapshot: {
      eventName: body.eventName,
      eventDate: body.eventDate,
      venue: body.venue,
      status: body.status || 'draft',
      totalAmount,
      lineItems,
    },
  });

  const response = { data: transformQuoteFromDb(data) };

  // Store idempotency key result
  if (idempotencyKey) {
    await admin.from('idempotency_keys').insert({
      key: idempotencyKey,
      user_id: userId,
      response,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
    });
  }

  return c.json(response, 201);
});

// PATCH /v1/quotes/:quoteId - Update quote
router.patch('/:quoteId', zValidator('json', quoteUpdateSchema), async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const body = c.req.valid('json');
  const admin = getSupabaseAdmin();

  // Get current quote
  const { data: current, error: fetchError } = await admin
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !current) {
    throw Errors.quoteNotFound(quoteId);
  }

  // Check if quote is editable
  const readOnlyStatuses = ['sent', 'accepted', 'rejected', 'expired'];
  if (readOnlyStatuses.includes(current.status) && !body.status) {
    throw Errors.quoteReadOnly(current.status);
  }

  // Validate status transition
  if (body.status && body.status !== current.status) {
    const allowed = VALID_STATUS_TRANSITIONS[current.status] || [];
    if (!allowed.includes(body.status)) {
      throw Errors.invalidStatusTransition(current.status, body.status, allowed);
    }
  }

  // Build update object
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.clientName !== undefined) updates.client_name = body.clientName;
  if (body.clientEmail !== undefined) updates.client_email = body.clientEmail;
  if (body.eventName !== undefined) updates.event_name = body.eventName;
  if (body.eventDate !== undefined) updates.event_date = body.eventDate;
  if (body.venue !== undefined) updates.venue = body.venue;
  if (body.status !== undefined) updates.status = body.status;
  if (body.expiresAt !== undefined) updates.expires_at = body.expiresAt;

  // Handle line items update
  if (body.lineItems !== undefined) {
    const lineItems = body.lineItems.map((item) => ({
      ...item,
      id: item.id || `item-${nanoid(8)}`,
      total: item.quantity * item.unitPrice,
    }));
    updates.line_items = lineItems;
    updates.total_amount = calculateTotal(lineItems);
  }

  const { data, error } = await admin
    .from('quotes')
    .update(updates)
    .eq('id', quoteId)
    .select()
    .single();

  if (error) {
    console.error('[Quotes] Update error:', error);
    throw Errors.database('update quote');
  }

  // Determine change type for versioning
  let changeType = 'items_modified';
  if (body.status && body.status !== current.status) {
    changeType = 'status_changed';
  } else if (body.lineItems) {
    const oldCount = (current.line_items as unknown[])?.length || 0;
    const newCount = body.lineItems.length;
    if (newCount > oldCount) changeType = 'items_added';
    else if (newCount < oldCount) changeType = 'items_removed';
  }

  // Get latest version number
  const { data: latestVersion } = await admin
    .from('quote_versions')
    .select('version_number')
    .eq('quote_id', quoteId)
    .order('version_number', { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (latestVersion?.version_number || 0) + 1;

  // Create version snapshot
  await admin.from('quote_versions').insert({
    id: `ver-${nanoid(12)}`,
    quote_id: quoteId,
    version_number: nextVersion,
    trigger: 'auto',
    description: `Quote updated (${changeType})`,
    change_type: changeType,
    snapshot: {
      eventName: data.event_name,
      eventDate: data.event_date,
      venue: data.venue,
      status: data.status,
      totalAmount: data.total_amount,
      lineItems: data.line_items,
    },
  });

  return c.json({ data: transformQuoteFromDb(data) });
});

// DELETE /v1/quotes/:quoteId - Soft delete quote
router.delete('/:quoteId', async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const admin = getSupabaseAdmin();

  const { error } = await admin
    .from('quotes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', quoteId)
    .eq('user_id', userId)
    .is('deleted_at', null);

  if (error) {
    console.error('[Quotes] Delete error:', error);
    throw Errors.database('delete quote');
  }

  return c.body(null, 204);
});

// POST /v1/quotes/:quoteId/clone - Clone quote
router.post('/:quoteId/clone', quotaCheckMiddleware, async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const admin = getSupabaseAdmin();

  // Get original quote
  const { data: original, error: fetchError } = await admin
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !original) {
    throw Errors.quoteNotFound(quoteId);
  }

  const newQuoteId = generateQuoteId();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await admin
    .from('quotes')
    .insert({
      id: newQuoteId,
      user_id: userId,
      client_name: original.client_name,
      client_email: original.client_email,
      event_name: `${original.event_name} (Copy)`,
      event_date: original.event_date,
      venue: original.venue,
      status: 'draft',
      total_amount: original.total_amount,
      line_items: original.line_items,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (error) {
    console.error('[Quotes] Clone error:', error);
    throw Errors.database('clone quote');
  }

  // Increment quota usage
  await incrementQuotaUsage(userId);

  return c.json({ data: transformQuoteFromDb(data) }, 201);
});

// POST /v1/quotes/:quoteId/send - Send quote to client
router.post('/:quoteId/send', zValidator('json', quoteSendSchema), async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const body = c.req.valid('json');
  const admin = getSupabaseAdmin();

  // Get quote
  const { data: quote, error: fetchError } = await admin
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !quote) {
    throw Errors.quoteNotFound(quoteId);
  }

  // Validate status allows sending
  const sendableStatuses = ['draft', 'approved', 'pending_review'];
  if (!sendableStatuses.includes(quote.status)) {
    throw Errors.invalidStatusTransition(quote.status, 'sent', sendableStatuses);
  }

  // Update quote status
  const { error: updateError } = await admin
    .from('quotes')
    .update({
      status: 'sent',
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId);

  if (updateError) {
    console.error('[Quotes] Send error:', updateError);
    throw Errors.database('send quote');
  }

  // TODO: Trigger email sending via n8n webhook
  // For now, just return success
  const trackingId = nanoid(16);

  return c.json({
    data: {
      sentAt: new Date().toISOString(),
      trackingId,
      recipientEmail: body.recipientEmail || quote.client_email,
    },
  });
});

// GET /v1/quotes/:quoteId/pdf - Export quote as PDF
router.get('/:quoteId/pdf', async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const admin = getSupabaseAdmin();

  const { data: quote, error } = await admin
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (error || !quote) {
    throw Errors.quoteNotFound(quoteId);
  }

  // TODO: Generate PDF (could use n8n or a PDF service)
  // For now, return quote data as JSON with PDF content type hint
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
  const admin = getSupabaseAdmin();

  // Get quote
  const { data: quote, error: fetchError } = await admin
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !quote) {
    throw Errors.quoteNotFound(quoteId);
  }

  // Check if editable
  const readOnlyStatuses = ['sent', 'accepted', 'rejected', 'expired'];
  if (readOnlyStatuses.includes(quote.status)) {
    throw Errors.quoteReadOnly(quote.status);
  }

  const newItem = {
    id: `item-${nanoid(8)}`,
    ...body,
    total: body.quantity * body.unitPrice,
  };

  const lineItems = [...(quote.line_items as unknown[] || []), newItem];
  const totalAmount = calculateTotal(lineItems as Array<{ quantity: number; unitPrice: number }>);

  const { error: updateError } = await admin
    .from('quotes')
    .update({
      line_items: lineItems,
      total_amount: totalAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId);

  if (updateError) {
    console.error('[Quotes] Add item error:', updateError);
    throw Errors.database('add line item');
  }

  return c.json({ data: newItem }, 201);
});

// PATCH /v1/quotes/:quoteId/items/:itemId - Update line item
router.patch('/:quoteId/items/:itemId', zValidator('json', lineItemUpdateSchema), async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const itemId = c.req.param('itemId');
  const body = c.req.valid('json');
  const admin = getSupabaseAdmin();

  // Get quote
  const { data: quote, error: fetchError } = await admin
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !quote) {
    throw Errors.quoteNotFound(quoteId);
  }

  // Check if editable
  const readOnlyStatuses = ['sent', 'accepted', 'rejected', 'expired'];
  if (readOnlyStatuses.includes(quote.status)) {
    throw Errors.quoteReadOnly(quote.status);
  }

  const lineItems = quote.line_items as Array<Record<string, unknown>>;
  const itemIndex = lineItems.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    throw Errors.notFound('Line item', itemId);
  }

  // Update item
  const updatedItem = {
    ...lineItems[itemIndex],
    ...body,
  };

  // Recalculate total if quantity or price changed
  if (body.quantity !== undefined || body.unitPrice !== undefined) {
    const qty = (updatedItem.quantity as number) || 0;
    const price = (updatedItem.unitPrice as number) || 0;
    (updatedItem as Record<string, unknown>).total = qty * price;
  }

  lineItems[itemIndex] = updatedItem;
  const totalAmount = calculateTotal(lineItems as Array<{ quantity: number; unitPrice: number }>);

  const { error: updateError } = await admin
    .from('quotes')
    .update({
      line_items: lineItems,
      total_amount: totalAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId);

  if (updateError) {
    console.error('[Quotes] Update item error:', updateError);
    throw Errors.database('update line item');
  }

  return c.json({ data: updatedItem });
});

// DELETE /v1/quotes/:quoteId/items/:itemId - Delete line item
router.delete('/:quoteId/items/:itemId', async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const itemId = c.req.param('itemId');
  const admin = getSupabaseAdmin();

  // Get quote
  const { data: quote, error: fetchError } = await admin
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (fetchError || !quote) {
    throw Errors.quoteNotFound(quoteId);
  }

  // Check if editable
  const readOnlyStatuses = ['sent', 'accepted', 'rejected', 'expired'];
  if (readOnlyStatuses.includes(quote.status)) {
    throw Errors.quoteReadOnly(quote.status);
  }

  const lineItems = (quote.line_items as Array<Record<string, unknown>>).filter(
    (item) => item.id !== itemId
  );

  const totalAmount = calculateTotal(lineItems as Array<{ quantity: number; unitPrice: number }>);

  const { error: updateError } = await admin
    .from('quotes')
    .update({
      line_items: lineItems,
      total_amount: totalAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId);

  if (updateError) {
    console.error('[Quotes] Delete item error:', updateError);
    throw Errors.database('delete line item');
  }

  return c.body(null, 204);
});

// ===== Versions Sub-Routes =====

// GET /v1/quotes/:quoteId/versions - List quote versions
router.get('/:quoteId/versions', async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const admin = getSupabaseAdmin();

  // Verify quote ownership
  const { data: quote, error: quoteError } = await admin
    .from('quotes')
    .select('id')
    .eq('id', quoteId)
    .eq('user_id', userId)
    .single();

  if (quoteError || !quote) {
    throw Errors.quoteNotFound(quoteId);
  }

  const { data, error } = await admin
    .from('quote_versions')
    .select('*')
    .eq('quote_id', quoteId)
    .order('version_number', { ascending: false });

  if (error) {
    console.error('[Quotes] List versions error:', error);
    throw Errors.database('list versions');
  }

  const versions = (data || []).map(transformVersionFromDb);

  return c.json({ data: versions });
});

// GET /v1/quotes/:quoteId/versions/:versionId - Get specific version
router.get('/:quoteId/versions/:versionId', async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const versionId = c.req.param('versionId');
  const admin = getSupabaseAdmin();

  // Verify quote ownership
  const { data: quote, error: quoteError } = await admin
    .from('quotes')
    .select('id')
    .eq('id', quoteId)
    .eq('user_id', userId)
    .single();

  if (quoteError || !quote) {
    throw Errors.quoteNotFound(quoteId);
  }

  const { data, error } = await admin
    .from('quote_versions')
    .select('*')
    .eq('id', versionId)
    .eq('quote_id', quoteId)
    .single();

  if (error || !data) {
    throw Errors.versionNotFound(versionId);
  }

  return c.json({ data: transformVersionFromDb(data) });
});

// GET /v1/quotes/:quoteId/versions/compare - Compare two versions
router.get('/:quoteId/versions/compare', zValidator('query', versionCompareSchema), async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const { a, b } = c.req.valid('query');
  const admin = getSupabaseAdmin();

  // Verify quote ownership
  const { data: quote, error: quoteError } = await admin
    .from('quotes')
    .select('id')
    .eq('id', quoteId)
    .eq('user_id', userId)
    .single();

  if (quoteError || !quote) {
    throw Errors.quoteNotFound(quoteId);
  }

  // Get both versions
  const { data: versions, error } = await admin
    .from('quote_versions')
    .select('*')
    .eq('quote_id', quoteId)
    .in('id', [a, b]);

  if (error || !versions || versions.length !== 2) {
    throw Errors.validation('Both version IDs must exist');
  }

  const versionA = versions.find((v) => v.id === a);
  const versionB = versions.find((v) => v.id === b);

  if (!versionA || !versionB) {
    throw Errors.validation('Version not found');
  }

  // Calculate diff
  const snapshotA = versionA.snapshot as { lineItems: Array<Record<string, unknown>>; totalAmount: number };
  const snapshotB = versionB.snapshot as { lineItems: Array<Record<string, unknown>>; totalAmount: number };

  const itemsA = snapshotA.lineItems || [];
  const itemsB = snapshotB.lineItems || [];

  const changes: Array<Record<string, unknown>> = [];

  // Find added and modified items
  for (const itemB of itemsB) {
    const itemA = itemsA.find((i) => i.id === itemB.id);
    if (!itemA) {
      changes.push({ type: 'added', ...itemB, priceDelta: itemB.total as number });
    } else if (
      itemA.quantity !== itemB.quantity ||
      itemA.unitPrice !== itemB.unitPrice
    ) {
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

  // Find removed items
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
        itemsAdded: changes.filter((c) => c.type === 'added').length,
        itemsRemoved: changes.filter((c) => c.type === 'removed').length,
        itemsModified: changes.filter((c) => c.type === 'modified').length,
        totalAmountDelta: totalDelta,
        percentageChange: snapshotA.totalAmount ? (totalDelta / snapshotA.totalAmount) * 100 : 0,
      },
    },
  });
});

// POST /v1/quotes/:quoteId/versions/:versionId/revert - Revert to version
router.post('/:quoteId/versions/:versionId/revert', async (c) => {
  const userId = c.get('userId');
  const quoteId = c.req.param('quoteId');
  const versionId = c.req.param('versionId');
  const admin = getSupabaseAdmin();

  // Verify quote ownership and get current quote
  const { data: quote, error: quoteError } = await admin
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (quoteError || !quote) {
    throw Errors.quoteNotFound(quoteId);
  }

  // Get version to revert to
  const { data: version, error: versionError } = await admin
    .from('quote_versions')
    .select('*')
    .eq('id', versionId)
    .eq('quote_id', quoteId)
    .single();

  if (versionError || !version) {
    throw Errors.versionNotFound(versionId);
  }

  const snapshot = version.snapshot as {
    eventName: string;
    eventDate: string;
    venue: string;
    lineItems: unknown[];
    totalAmount: number;
  };

  // Update quote with snapshot data
  const { data, error } = await admin
    .from('quotes')
    .update({
      event_name: snapshot.eventName,
      event_date: snapshot.eventDate,
      venue: snapshot.venue,
      line_items: snapshot.lineItems,
      total_amount: snapshot.totalAmount,
      status: 'draft', // Always revert to draft
      updated_at: new Date().toISOString(),
    })
    .eq('id', quoteId)
    .select()
    .single();

  if (error) {
    console.error('[Quotes] Revert error:', error);
    throw Errors.database('revert quote');
  }

  // Create revert version
  const { data: latestVersion } = await admin
    .from('quote_versions')
    .select('version_number')
    .eq('quote_id', quoteId)
    .order('version_number', { ascending: false })
    .limit(1)
    .single();

  await admin.from('quote_versions').insert({
    id: `ver-${nanoid(12)}`,
    quote_id: quoteId,
    version_number: (latestVersion?.version_number || 0) + 1,
    trigger: 'manual',
    description: `Reverted to version ${version.version_number}`,
    change_type: 'manual_snapshot',
    snapshot: snapshot,
  });

  return c.json({ data: transformQuoteFromDb(data) });
});

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

export default router;
