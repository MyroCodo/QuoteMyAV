-- QuoteMyAV RDS PostgreSQL Schema
-- Migration: 001_initial_schema
-- Description: Initial database schema migrated from Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================
-- SUBSCRIPTIONS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    plan VARCHAR(50) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- ====================
-- QUOTES TABLE
-- ====================
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,

    -- Quote identification
    quote_number VARCHAR(50) NOT NULL,
    revision INTEGER DEFAULT 1,
    parent_quote_id UUID REFERENCES quotes(id),

    -- Client information
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    client_company VARCHAR(255),

    -- Event details
    event_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(100),
    venue VARCHAR(255),
    venue_size VARCHAR(100),
    guest_count INTEGER,
    indoor_outdoor VARCHAR(50),
    event_dates JSONB, -- Array of date ranges

    -- Quote content
    line_items JSONB NOT NULL DEFAULT '[]', -- Array of line item objects
    notes TEXT,
    terms TEXT,

    -- Financials
    subtotal DECIMAL(12, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 4) DEFAULT 0,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) DEFAULT 0,

    -- Status
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'archived')),
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    responded_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    tags JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT quotes_quote_number_unique UNIQUE (user_id, quote_number)
);

CREATE INDEX idx_quotes_user_id ON quotes(user_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_client_email ON quotes(client_email);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX idx_quotes_deleted_at ON quotes(deleted_at);

-- ====================
-- API KEYS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS api_keys (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    key_hash VARCHAR(255) NOT NULL,
    scopes JSONB DEFAULT '["*"]',
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_prefix ON api_keys(key_prefix);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- ====================
-- AI JOBS TABLE
-- ====================
CREATE TABLE IF NOT EXISTS ai_jobs (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('generate', 'edit', 'analyze')),
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    input JSONB,
    result JSONB,
    error JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ai_jobs_user_id ON ai_jobs(user_id);
CREATE INDEX idx_ai_jobs_status ON ai_jobs(status);
CREATE INDEX idx_ai_jobs_created_at ON ai_jobs(created_at DESC);

-- ====================
-- API USAGE TABLE
-- ====================
CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    api_calls INTEGER DEFAULT 0,
    ai_calls INTEGER DEFAULT 0,
    quotes_created INTEGER DEFAULT 0,
    quotes_sent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT api_usage_user_date_unique UNIQUE (user_id, date)
);

CREATE INDEX idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX idx_api_usage_date ON api_usage(date DESC);

-- ====================
-- QUOTE HISTORY TABLE (for audit trail)
-- ====================
CREATE TABLE IF NOT EXISTS quote_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'updated', 'sent', 'viewed', 'accepted', 'rejected', 'revised', 'deleted')),
    changes JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quote_history_quote_id ON quote_history(quote_id);
CREATE INDEX idx_quote_history_user_id ON quote_history(user_id);
CREATE INDEX idx_quote_history_created_at ON quote_history(created_at DESC);

-- ====================
-- FUNCTIONS
-- ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_usage_updated_at
    BEFORE UPDATE ON api_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate quote number
CREATE OR REPLACE FUNCTION generate_quote_number(p_user_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    v_count INTEGER;
    v_year TEXT;
    v_number VARCHAR(50);
BEGIN
    v_year := TO_CHAR(NOW(), 'YYYY');

    SELECT COUNT(*) + 1 INTO v_count
    FROM quotes
    WHERE user_id = p_user_id
    AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());

    v_number := 'Q-' || v_year || '-' || LPAD(v_count::TEXT, 4, '0');

    RETURN v_number;
END;
$$ LANGUAGE plpgsql;

-- Function to increment usage counters
CREATE OR REPLACE FUNCTION increment_usage(
    p_user_id UUID,
    p_api_calls INTEGER DEFAULT 0,
    p_ai_calls INTEGER DEFAULT 0,
    p_quotes_created INTEGER DEFAULT 0,
    p_quotes_sent INTEGER DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO api_usage (user_id, date, api_calls, ai_calls, quotes_created, quotes_sent)
    VALUES (p_user_id, CURRENT_DATE, p_api_calls, p_ai_calls, p_quotes_created, p_quotes_sent)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        api_calls = api_usage.api_calls + p_api_calls,
        ai_calls = api_usage.ai_calls + p_ai_calls,
        quotes_created = api_usage.quotes_created + p_quotes_created,
        quotes_sent = api_usage.quotes_sent + p_quotes_sent,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ====================
-- COMMENTS
-- ====================
COMMENT ON TABLE subscriptions IS 'User subscription plans linked to Stripe';
COMMENT ON TABLE quotes IS 'AV equipment quotes with line items stored as JSONB';
COMMENT ON TABLE api_keys IS 'API keys for Pro/Enterprise users';
COMMENT ON TABLE ai_jobs IS 'Async AI job queue for quote generation/editing';
COMMENT ON TABLE api_usage IS 'Daily usage tracking for quota enforcement';
COMMENT ON TABLE quote_history IS 'Audit trail for quote changes';

-- ====================
-- GRANTS (adjust as needed for your RDS user)
-- ====================
-- These will be executed with the appropriate user after table creation
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO quotemyav_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO quotemyav_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO quotemyav_app;
