-- QuoteMyAV API Infrastructure Tables
-- Migration: 003_api_infrastructure.sql
-- Description: Creates tables for API keys, usage tracking, webhooks, AI jobs, and related infrastructure

-- ============================================
-- Quotes Table (if not exists from earlier migration)
-- ============================================
CREATE TABLE IF NOT EXISTS public.quotes (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    event_name TEXT NOT NULL,
    event_date TEXT NOT NULL,
    venue TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT valid_status CHECK (status IN ('draft', 'pending_review', 'approved', 'sent', 'accepted', 'rejected', 'expired', 'revision_requested'))
);

CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at DESC);

-- ============================================
-- Subscriptions Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    plan TEXT NOT NULL DEFAULT 'free',
    quotes_used INTEGER NOT NULL DEFAULT 0,
    quotes_limit INTEGER NOT NULL DEFAULT 3,
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_plan CHECK (plan IN ('free', 'starter', 'pro', 'enterprise'))
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);

-- ============================================
-- Quote Versions Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.quote_versions (
    id TEXT PRIMARY KEY,
    quote_id TEXT NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    trigger TEXT NOT NULL DEFAULT 'auto',
    description TEXT NOT NULL DEFAULT '',
    change_type TEXT NOT NULL,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_trigger CHECK (trigger IN ('auto', 'manual')),
    CONSTRAINT valid_change_type CHECK (change_type IN ('created', 'items_added', 'items_removed', 'items_modified', 'status_changed', 'ai_edit_applied', 'manual_snapshot'))
);

CREATE INDEX IF NOT EXISTS idx_quote_versions_quote_id ON public.quote_versions(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_versions_version_number ON public.quote_versions(quote_id, version_number DESC);

-- ============================================
-- API Keys Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.api_keys (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_prefix TEXT NOT NULL, -- First 8 chars for identification
    key_hash TEXT NOT NULL, -- bcrypt hash of full key
    scopes TEXT[] NOT NULL DEFAULT ARRAY['*'],
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON public.api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON public.api_keys(is_active) WHERE is_active = true;

-- ============================================
-- API Usage Table (Daily tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS public.api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    api_calls INTEGER NOT NULL DEFAULT 0,
    ai_calls INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_api_usage_user_date ON public.api_usage(user_id, date);

-- ============================================
-- Webhook Endpoints Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_delivery_at TIMESTAMPTZ,
    failure_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_user_id ON public.webhook_endpoints(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_active ON public.webhook_endpoints(is_active) WHERE is_active = true;

-- ============================================
-- Webhook Deliveries Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
    id TEXT PRIMARY KEY,
    endpoint_id TEXT NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    response_code INTEGER,
    response_body TEXT,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    CONSTRAINT valid_delivery_status CHECK (status IN ('pending', 'delivered', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_endpoint_id ON public.webhook_deliveries(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_created_at ON public.webhook_deliveries(created_at DESC);

-- Cleanup old deliveries (keep last 30 days)
-- CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_cleanup ON public.webhook_deliveries(created_at) WHERE created_at < NOW() - INTERVAL '30 days';

-- ============================================
-- AI Jobs Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.ai_jobs (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'processing',
    input JSONB NOT NULL,
    result JSONB,
    error JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT valid_job_type CHECK (type IN ('generate', 'edit')),
    CONSTRAINT valid_job_status CHECK (status IN ('processing', 'completed', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_ai_jobs_user_id ON public.ai_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON public.ai_jobs(status) WHERE status = 'processing';
CREATE INDEX IF NOT EXISTS idx_ai_jobs_created_at ON public.ai_jobs(created_at DESC);

-- ============================================
-- Idempotency Keys Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.idempotency_keys (
    key TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    response JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (key, user_id)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires_at ON public.idempotency_keys(expires_at);

-- Cleanup expired idempotency keys (run periodically)
-- DELETE FROM public.idempotency_keys WHERE expires_at < NOW();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;

-- Quotes: Users can only access their own quotes
CREATE POLICY "Users can view own quotes" ON public.quotes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quotes" ON public.quotes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes" ON public.quotes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes" ON public.quotes
    FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions: Users can only view own subscription
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Quote Versions: Users can access versions of their quotes
CREATE POLICY "Users can view own quote versions" ON public.quote_versions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.quotes WHERE quotes.id = quote_versions.quote_id AND quotes.user_id = auth.uid())
    );

-- API Keys: Users can manage their own keys
CREATE POLICY "Users can view own api keys" ON public.api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own api keys" ON public.api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys" ON public.api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys" ON public.api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- API Usage: Users can view own usage
CREATE POLICY "Users can view own api usage" ON public.api_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Webhook Endpoints: Users can manage their own webhooks
CREATE POLICY "Users can view own webhooks" ON public.webhook_endpoints
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own webhooks" ON public.webhook_endpoints
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own webhooks" ON public.webhook_endpoints
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own webhooks" ON public.webhook_endpoints
    FOR DELETE USING (auth.uid() = user_id);

-- Webhook Deliveries: Users can view deliveries for their webhooks
CREATE POLICY "Users can view own webhook deliveries" ON public.webhook_deliveries
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.webhook_endpoints WHERE webhook_endpoints.id = webhook_deliveries.endpoint_id AND webhook_endpoints.user_id = auth.uid())
    );

-- AI Jobs: Users can view their own jobs
CREATE POLICY "Users can view own ai jobs" ON public.ai_jobs
    FOR SELECT USING (auth.uid() = user_id);

-- Idempotency Keys: Users can only access their own keys
CREATE POLICY "Users can view own idempotency keys" ON public.idempotency_keys
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- Functions for automated tasks
-- ============================================

-- Function to reset monthly quotas
CREATE OR REPLACE FUNCTION public.reset_monthly_quotas()
RETURNS void AS $$
BEGIN
    UPDATE public.subscriptions
    SET
        quotes_used = 0,
        current_period_start = NOW(),
        current_period_end = NOW() + INTERVAL '1 month'
    WHERE current_period_end < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to expire old quotes
CREATE OR REPLACE FUNCTION public.expire_old_quotes()
RETURNS void AS $$
BEGIN
    UPDATE public.quotes
    SET status = 'expired'
    WHERE status = 'sent'
      AND expires_at < NOW()
      AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired idempotency keys
CREATE OR REPLACE FUNCTION public.cleanup_expired_idempotency_keys()
RETURNS void AS $$
BEGIN
    DELETE FROM public.idempotency_keys WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old webhook deliveries (keep 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_webhook_deliveries()
RETURNS void AS $$
BEGIN
    DELETE FROM public.webhook_deliveries WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Comments
-- ============================================
COMMENT ON TABLE public.api_keys IS 'API keys for programmatic access (Pro/Enterprise tiers)';
COMMENT ON TABLE public.api_usage IS 'Daily API usage tracking for rate limiting';
COMMENT ON TABLE public.webhook_endpoints IS 'User-configured webhook endpoints (Enterprise tier)';
COMMENT ON TABLE public.webhook_deliveries IS 'Webhook delivery history and status';
COMMENT ON TABLE public.ai_jobs IS 'Async AI generation and edit jobs';
COMMENT ON TABLE public.idempotency_keys IS 'Idempotency keys for safe request retries';
