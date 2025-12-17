-- QuoteMyAV RDS PostgreSQL Schema
-- Migration: 003_add_profile_picture
-- Description: Add profile_picture_url column to users table (if exists) or create users table

-- Create users table if it doesn't exist
-- This table stores additional user metadata beyond what's in Cognito
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,  -- Should match Cognito user ID
    profile_picture_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- If the table already exists, add the column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'profile_picture_url'
    ) THEN
        ALTER TABLE users ADD COLUMN profile_picture_url TEXT;
    END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
