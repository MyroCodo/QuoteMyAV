import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Row types for all tables
export interface QuoteRow {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  event_name: string;
  event_date: string;
  venue: string;
  status: string;
  total_amount: number;
  line_items: unknown;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  deleted_at: string | null;
}

export interface ApiKeyRow {
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

export interface ApiUsageRow {
  id: string;
  user_id: string;
  date: string;
  api_calls: number;
  ai_calls: number;
}

export interface SubscriptionRow {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  quotes_used: number;
  quotes_limit: number;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

export interface QuoteVersionRow {
  id: string;
  quote_id: string;
  version_number: number;
  trigger: 'auto' | 'manual';
  description: string;
  change_type: string;
  snapshot: unknown;
  created_at: string;
}

export interface WebhookEndpointRow {
  id: string;
  user_id: string;
  url: string;
  events: string[];
  secret_hash: string;
  is_active: boolean;
  created_at: string;
  last_delivery_at: string | null;
  failure_count: number;
}

export interface WebhookDeliveryRow {
  id: string;
  endpoint_id: string;
  event_type: string;
  payload: unknown;
  status: 'pending' | 'delivered' | 'failed';
  response_code: number | null;
  response_body: string | null;
  attempts: number;
  created_at: string;
  delivered_at: string | null;
}

export interface AiJobRow {
  id: string;
  user_id: string;
  type: 'generate' | 'edit';
  status: 'processing' | 'completed' | 'failed';
  input: unknown;
  result: unknown | null;
  error: unknown | null;
  created_at: string;
  completed_at: string | null;
}

export interface IdempotencyKeyRow {
  key: string;
  user_id: string;
  response: unknown;
  created_at: string;
  expires_at: string;
}

// Supabase client type (using any for flexibility with untyped operations)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAdminClient = SupabaseClient<any, 'public', any>;

// Environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// Server-side client with service role (full access)
let supabaseAdmin: SupabaseAdminClient | null = null;

export function getSupabaseAdmin(): SupabaseAdminClient {
  if (!supabaseAdmin) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
    }
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabaseAdmin;
}

// Client with anon key (for verifying JWTs)
let supabaseAnon: SupabaseAdminClient | null = null;

export function getSupabaseAnon(): SupabaseAdminClient {
  if (!supabaseAnon) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
    }
    supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseAnon;
}

// Helper to create a client with a specific JWT (for user context)
export function getSupabaseWithJwt(jwt: string): SupabaseAdminClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
  });
}
