-- QuoteMyAV Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'starter', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'company'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- QUOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Client info
  client_name TEXT,
  client_email TEXT,
  client_company TEXT,
  client_phone TEXT,

  -- Event info
  event_name TEXT NOT NULL,
  event_type TEXT,
  event_date DATE,
  event_end_date DATE,
  venue_name TEXT,
  venue_address TEXT,
  venue_size TEXT,
  setup_days INTEGER DEFAULT 1,
  strike_days INTEGER DEFAULT 1,

  -- Quote info
  quote_type TEXT DEFAULT 'rental' CHECK (quote_type IN ('rental', 'install', 'production')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_review', 'approved', 'sent',
    'accepted', 'rejected', 'expired', 'revision_requested'
  )),

  -- Financials
  subtotal DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 4) DEFAULT 0.0825,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) DEFAULT 0,

  -- Notes
  internal_notes TEXT,
  client_notes TEXT,
  terms_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  accepted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Quotes policies
CREATE POLICY "Users can view own quotes" ON quotes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quotes" ON quotes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes" ON quotes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes" ON quotes
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS quotes_user_id_idx ON quotes(user_id);
CREATE INDEX IF NOT EXISTS quotes_status_idx ON quotes(status);
CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON quotes(created_at DESC);

-- ============================================
-- LINE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,

  category TEXT NOT NULL CHECK (category IN (
    'audio', 'video', 'lighting', 'staging', 'rigging',
    'cables', 'signal', 'decor', 'power', 'comms', 'labor', 'other'
  )),
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,

  -- Optional fields
  notes TEXT,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE line_items ENABLE ROW LEVEL SECURITY;

-- Line items policies (users can manage line items for their own quotes)
CREATE POLICY "Users can view line items for own quotes" ON line_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM quotes WHERE quotes.id = line_items.quote_id AND quotes.user_id = auth.uid())
  );

CREATE POLICY "Users can create line items for own quotes" ON line_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM quotes WHERE quotes.id = line_items.quote_id AND quotes.user_id = auth.uid())
  );

CREATE POLICY "Users can update line items for own quotes" ON line_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM quotes WHERE quotes.id = line_items.quote_id AND quotes.user_id = auth.uid())
  );

CREATE POLICY "Users can delete line items for own quotes" ON line_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM quotes WHERE quotes.id = line_items.quote_id AND quotes.user_id = auth.uid())
  );

-- Indexes
CREATE INDEX IF NOT EXISTS line_items_quote_id_idx ON line_items(quote_id);
CREATE INDEX IF NOT EXISTS line_items_category_idx ON line_items(category);

-- ============================================
-- EQUIPMENT CATALOG TABLE (optional, for presets)
-- ============================================
CREATE TABLE IF NOT EXISTS equipment_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL = system default

  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  default_price DECIMAL(10, 2) NOT NULL DEFAULT 0,

  -- Metadata
  brand TEXT,
  model TEXT,
  sku TEXT,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE equipment_catalog ENABLE ROW LEVEL SECURITY;

-- Equipment catalog policies
CREATE POLICY "Users can view system equipment and own equipment" ON equipment_catalog
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can create own equipment" ON equipment_catalog
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own equipment" ON equipment_catalog
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own equipment" ON equipment_catalog
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS equipment_catalog_category_idx ON equipment_catalog(category);
CREATE INDEX IF NOT EXISTS equipment_catalog_user_id_idx ON equipment_catalog(user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update quote totals when line items change
CREATE OR REPLACE FUNCTION update_quote_totals()
RETURNS TRIGGER AS $$
DECLARE
  new_subtotal DECIMAL(12, 2);
  quote_tax_rate DECIMAL(5, 4);
  new_tax DECIMAL(12, 2);
BEGIN
  -- Calculate new subtotal
  SELECT COALESCE(SUM(total), 0) INTO new_subtotal
  FROM line_items
  WHERE quote_id = COALESCE(NEW.quote_id, OLD.quote_id);

  -- Get tax rate
  SELECT tax_rate INTO quote_tax_rate
  FROM quotes
  WHERE id = COALESCE(NEW.quote_id, OLD.quote_id);

  -- Calculate tax
  new_tax := new_subtotal * quote_tax_rate;

  -- Update quote
  UPDATE quotes
  SET
    subtotal = new_subtotal,
    tax_amount = new_tax,
    total_amount = new_subtotal + new_tax,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.quote_id, OLD.quote_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for line item changes
DROP TRIGGER IF EXISTS on_line_item_change ON line_items;
CREATE TRIGGER on_line_item_change
  AFTER INSERT OR UPDATE OR DELETE ON line_items
  FOR EACH ROW EXECUTE FUNCTION update_quote_totals();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_line_items_updated_at ON line_items;
CREATE TRIGGER update_line_items_updated_at
  BEFORE UPDATE ON line_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_equipment_catalog_updated_at ON equipment_catalog;
CREATE TRIGGER update_equipment_catalog_updated_at
  BEFORE UPDATE ON equipment_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
