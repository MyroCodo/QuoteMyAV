import pg from 'pg';
import { getDatabaseCredentials } from './secrets.js';

const { Pool } = pg;

// Connection pool (lazy initialized)
let pool: pg.Pool | null = null;

/**
 * Get or create the database connection pool
 */
async function getPool(): Promise<pg.Pool> {
  if (pool) return pool;

  const credentials = await getDatabaseCredentials();

  pool = new Pool({
    host: credentials.host,
    port: credentials.port,
    database: credentials.database,
    user: credentials.username,
    password: credentials.password,
    // Connection pool settings optimized for Lambda
    max: 5, // Maximum connections per Lambda instance
    min: 0, // Allow pool to shrink to 0
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 10000, // Timeout after 10s
    // SSL for RDS
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Handle pool errors
  pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err);
  });

  return pool;
}

/**
 * Execute a query with automatic connection handling
 */
export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  values?: unknown[]
): Promise<pg.QueryResult<T>> {
  const pool = await getPool();
  const start = Date.now();

  try {
    const result = await pool.query<T>(text, values);
    const duration = Date.now() - start;

    // Log slow queries in development
    if (process.env.NODE_ENV !== 'production' && duration > 100) {
      console.log(`Slow query (${duration}ms):`, text.substring(0, 100));
    }

    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get a single row or null
 */
export async function queryOne<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  values?: unknown[]
): Promise<T | null> {
  const result = await query<T>(text, values);
  return result.rows[0] || null;
}

/**
 * Get all rows
 */
export async function queryAll<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  values?: unknown[]
): Promise<T[]> {
  const result = await query<T>(text, values);
  return result.rows;
}

/**
 * Execute a transaction
 */
export async function transaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const pool = await getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close the pool (for cleanup)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// ============================================================
// Table-specific query helpers
// ============================================================

/**
 * Quote row type
 */
export interface QuoteRow {
  id: string;
  user_id: string;
  quote_number: string;
  client_name: string;
  client_email: string | null;
  client_company: string | null;
  event_name: string;
  event_date: string;
  venue: string;
  venue_address: string | null;
  status: string;
  line_items: unknown; // JSONB
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  internal_notes: string | null;
  valid_until: string | null;
  sent_at: string | null;
  sent_to_email: string | null;
  tracking_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/**
 * Get quotes for a user with pagination
 */
export async function getQuotes(
  userId: string,
  options: {
    status?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<{ quotes: QuoteRow[]; total: number }> {
  const {
    status,
    limit = 20,
    offset = 0,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = options;

  // Build WHERE clause
  const conditions = ['user_id = $1', 'deleted_at IS NULL'];
  const values: unknown[] = [userId];

  if (status) {
    conditions.push(`status = $${values.length + 1}`);
    values.push(status);
  }

  const whereClause = conditions.join(' AND ');

  // Get total count
  const countResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM quotes WHERE ${whereClause}`,
    values
  );
  const total = parseInt(countResult?.count || '0');

  // Get quotes with pagination
  // Note: sortBy should be validated to prevent SQL injection
  const allowedSortColumns = ['created_at', 'updated_at', 'event_date', 'total_amount', 'client_name'];
  const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const safeSortOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const quotes = await queryAll<QuoteRow>(
    `SELECT * FROM quotes
     WHERE ${whereClause}
     ORDER BY ${safeSortBy} ${safeSortOrder}
     LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset]
  );

  return { quotes, total };
}

/**
 * Get a single quote by ID
 */
export async function getQuoteById(
  quoteId: string,
  userId: string
): Promise<QuoteRow | null> {
  return queryOne<QuoteRow>(
    'SELECT * FROM quotes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    [quoteId, userId]
  );
}

/**
 * Create a new quote
 */
export async function createQuote(
  userId: string,
  data: Partial<QuoteRow>
): Promise<QuoteRow> {
  const result = await queryOne<QuoteRow>(
    `INSERT INTO quotes (
      user_id, quote_number, client_name, client_email, client_company,
      event_name, event_date, venue, venue_address, status,
      line_items, subtotal, tax_rate, tax_amount, total_amount,
      notes, internal_notes, valid_until
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18
    ) RETURNING *`,
    [
      userId,
      data.quote_number || `QMA-${Date.now()}`,
      data.client_name,
      data.client_email || null,
      data.client_company || null,
      data.event_name,
      data.event_date,
      data.venue,
      data.venue_address || null,
      data.status || 'draft',
      JSON.stringify(data.line_items || []),
      data.subtotal || 0,
      data.tax_rate || 0.0875, // Default 8.75% tax
      data.tax_amount || 0,
      data.total_amount || 0,
      data.notes || null,
      data.internal_notes || null,
      data.valid_until || null,
    ]
  );

  if (!result) {
    throw new Error('Failed to create quote');
  }

  return result;
}

/**
 * Update a quote
 */
export async function updateQuote(
  quoteId: string,
  userId: string,
  data: Partial<QuoteRow>
): Promise<QuoteRow | null> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  // Build dynamic UPDATE clause
  const allowedFields = [
    'client_name', 'client_email', 'client_company',
    'event_name', 'event_date', 'venue', 'venue_address',
    'status', 'line_items', 'subtotal', 'tax_rate', 'tax_amount',
    'total_amount', 'notes', 'internal_notes', 'valid_until',
    'sent_at', 'sent_to_email', 'tracking_id',
  ];

  for (const field of allowedFields) {
    if (field in data) {
      let value = data[field as keyof QuoteRow];
      if (field === 'line_items' && value) {
        value = JSON.stringify(value);
      }
      updates.push(`${field} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (updates.length === 0) {
    return getQuoteById(quoteId, userId);
  }

  // Add updated_at
  updates.push(`updated_at = NOW()`);

  // Add WHERE conditions
  values.push(quoteId, userId);

  return queryOne<QuoteRow>(
    `UPDATE quotes SET ${updates.join(', ')}
     WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} AND deleted_at IS NULL
     RETURNING *`,
    values
  );
}

/**
 * Soft delete a quote
 */
export async function deleteQuote(
  quoteId: string,
  userId: string
): Promise<boolean> {
  const result = await query(
    'UPDATE quotes SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    [quoteId, userId]
  );

  return (result.rowCount || 0) > 0;
}
