-- QuoteMyAV RDS PostgreSQL Seed Data
-- Migration: 002_seed_data
-- Description: Optional seed data for development/testing

-- Note: In production, user data comes from Cognito and Supabase migration
-- This file is for development/testing only

-- Create a test subscription for development
-- (Replace UUID with actual Cognito user ID in production)
INSERT INTO subscriptions (user_id, plan, stripe_customer_id)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'pro', 'cus_test_001'),
    ('00000000-0000-0000-0000-000000000002', 'starter', 'cus_test_002'),
    ('00000000-0000-0000-0000-000000000003', 'free', NULL)
ON CONFLICT (user_id) DO NOTHING;

-- Create sample quotes for testing
INSERT INTO quotes (
    id,
    user_id,
    quote_number,
    client_name,
    client_email,
    client_company,
    event_name,
    event_type,
    venue,
    venue_size,
    guest_count,
    line_items,
    subtotal,
    tax_rate,
    tax_amount,
    total_amount,
    status,
    created_at
) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Q-2025-0001',
    'John Smith',
    'john@example.com',
    'Acme Corp',
    'Annual Conference 2025',
    'Corporate Conference',
    'Grand Ballroom - Hilton Downtown',
    'Large (500+ attendees)',
    750,
    '[
        {"id": "1", "category": "Audio", "description": "JBL VTX A12 Line Array (per side)", "quantity": 8, "unitPrice": 450, "total": 3600, "notes": "Main PA system"},
        {"id": "2", "category": "Audio", "description": "JBL VTX S28 Subwoofer", "quantity": 4, "unitPrice": 350, "total": 1400},
        {"id": "3", "category": "Audio", "description": "Shure ULXD Wireless Handheld", "quantity": 4, "unitPrice": 150, "total": 600},
        {"id": "4", "category": "Audio", "description": "Shure ULXD Wireless Lavalier", "quantity": 6, "unitPrice": 175, "total": 1050},
        {"id": "5", "category": "Video", "description": "Panasonic PT-RZ120 12K Projector", "quantity": 2, "unitPrice": 1200, "total": 2400},
        {"id": "6", "category": "Video", "description": "16x9 Fast-Fold Screen", "quantity": 2, "unitPrice": 400, "total": 800},
        {"id": "7", "category": "Lighting", "description": "Martin MAC Encore Performance", "quantity": 16, "unitPrice": 275, "total": 4400},
        {"id": "8", "category": "Lighting", "description": "ETC Source 4 LED Leko", "quantity": 12, "unitPrice": 85, "total": 1020},
        {"id": "9", "category": "Labor", "description": "Audio Engineer (10 hours)", "quantity": 2, "unitPrice": 650, "total": 1300},
        {"id": "10", "category": "Labor", "description": "Video Tech (10 hours)", "quantity": 1, "unitPrice": 550, "total": 550},
        {"id": "11", "category": "Labor", "description": "Lighting Tech (10 hours)", "quantity": 1, "unitPrice": 550, "total": 550}
    ]'::jsonb,
    17670.00,
    0.0875,
    1546.13,
    19216.13,
    'draft',
    NOW() - INTERVAL '2 days'
),
(
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'Q-2025-0002',
    'Sarah Johnson',
    'sarah@wedding.com',
    NULL,
    'Johnson-Williams Wedding',
    'Wedding',
    'Sunset Gardens Estate',
    'Medium (100-300 attendees)',
    200,
    '[
        {"id": "1", "category": "Audio", "description": "QSC KLA12 Speakers (pair)", "quantity": 2, "unitPrice": 250, "total": 500},
        {"id": "2", "category": "Audio", "description": "QSC KS118 Subwoofer", "quantity": 2, "unitPrice": 200, "total": 400},
        {"id": "3", "category": "Audio", "description": "Shure SM58 Wired Microphone", "quantity": 2, "unitPrice": 25, "total": 50},
        {"id": "4", "category": "Lighting", "description": "Chauvet COLORado 1-Quad", "quantity": 8, "unitPrice": 75, "total": 600},
        {"id": "5", "category": "Lighting", "description": "Par Can Uplights (warm white)", "quantity": 20, "unitPrice": 15, "total": 300},
        {"id": "6", "category": "Labor", "description": "DJ/Sound Tech (8 hours)", "quantity": 1, "unitPrice": 450, "total": 450}
    ]'::jsonb,
    2300.00,
    0.0875,
    201.25,
    2501.25,
    'sent',
    NOW() - INTERVAL '5 days'
),
(
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Q-2025-0003',
    'Mike Chen',
    'mike@techstartup.io',
    'TechStartup Inc',
    'Product Launch Event',
    'Product Launch',
    'Innovation Hub',
    'Small (under 100 attendees)',
    75,
    '[
        {"id": "1", "category": "Audio", "description": "Bose L1 Compact System", "quantity": 2, "unitPrice": 150, "total": 300},
        {"id": "2", "category": "Audio", "description": "Sennheiser EW 100 Wireless", "quantity": 2, "unitPrice": 125, "total": 250},
        {"id": "3", "category": "Video", "description": "65\" Samsung Display", "quantity": 2, "unitPrice": 200, "total": 400},
        {"id": "4", "category": "Video", "description": "PTZ Camera with Operator", "quantity": 1, "unitPrice": 500, "total": 500},
        {"id": "5", "category": "Staging", "description": "8x12 Stage Deck", "quantity": 1, "unitPrice": 600, "total": 600},
        {"id": "6", "category": "Labor", "description": "A/V Tech (6 hours)", "quantity": 1, "unitPrice": 350, "total": 350}
    ]'::jsonb,
    2400.00,
    0.0875,
    210.00,
    2610.00,
    'accepted',
    NOW() - INTERVAL '10 days'
)
ON CONFLICT DO NOTHING;

-- Create sample API key for testing (Pro user)
-- Key: qmav_live_testkey123456789012345678901234
INSERT INTO api_keys (id, user_id, name, key_prefix, key_hash, scopes, is_active, created_at)
VALUES (
    'testkey123',
    '00000000-0000-0000-0000-000000000001',
    'Development API Key',
    'testkey1',
    -- This is a bcrypt hash of 'qmav_live_testkey123456789012345678901234'
    '$2b$10$placeholder_hash_replace_with_real_hash',
    '["*"]'::jsonb,
    true,
    NOW()
)
ON CONFLICT DO NOTHING;

-- Initialize usage counters
INSERT INTO api_usage (user_id, date, api_calls, ai_calls, quotes_created, quotes_sent)
VALUES
    ('00000000-0000-0000-0000-000000000001', CURRENT_DATE, 15, 3, 2, 1),
    ('00000000-0000-0000-0000-000000000002', CURRENT_DATE, 5, 1, 1, 0)
ON CONFLICT (user_id, date) DO NOTHING;

-- Log the seed
DO $$
BEGIN
    RAISE NOTICE 'Seed data inserted successfully';
END $$;
