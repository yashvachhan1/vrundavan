-- Create the custom_plan_items table
CREATE TABLE IF NOT EXISTS public.custom_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('event', 'service', 'addon')),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    description TEXT,
    icon TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default mock data for testing
INSERT INTO public.custom_plan_items (type, name, price, description, icon) VALUES
('event', 'Haldi', 15000, 'Bright & colorful haldi ceremony coverage', 'sun'),
('event', 'Mehendi', 20000, 'Intimate mehendi evening with family', 'flower'),
('event', 'Wedding', 50000, 'Full traditional wedding day coverage', 'ring'),
('service', 'Cinematic Video', 80000, '4K cinematic film with drone shots', 'video'),
('service', 'Candid Photography', 40000, 'Natural unposed moments captured', 'camera'),
('addon', 'Same Day Edit Video', 25000, 'Quick highlight video shown at reception', 'zap'),
('addon', 'Standard Canvera Album', 15000, 'Premium printed 40-page photobook', 'book')
ON CONFLICT DO NOTHING;


-- Create the discount_coupons table
CREATE TABLE IF NOT EXISTS public.discount_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
    discount_value NUMERIC NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a default testing coupon
INSERT INTO public.discount_coupons (code, discount_type, discount_value, is_active) VALUES
('SUMMER20', 'percentage', 20, true),
('FLAT5000', 'flat', 5000, true)
ON CONFLICT (code) DO NOTHING;

-- Create the instagram_reels table
CREATE TABLE IF NOT EXISTS public.instagram_reels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default reels
INSERT INTO public.instagram_reels (url, sort_order) VALUES
('https://www.instagram.com/reel/DA29kPvyN_N/', 1),
('https://www.instagram.com/reel/C_q8oG8S22y/', 2),
('https://www.instagram.com/reel/C_s5jUQS14t/', 3),
('https://www.instagram.com/reel/C_15p7fyeR_/', 4),
('https://www.instagram.com/reel/DA_0MhXyrO8/', 5),
('https://www.instagram.com/reel/DBM_MhRyA_v/', 6)
ON CONFLICT DO NOTHING;

-- ========================================================
-- ORDERS & BOOKINGS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY DEFAULT ('ORD-' || substring(md5(random()::text), 1, 6)),
    quote_id TEXT,
    customer TEXT,
    phone TEXT,
    email TEXT,
    package TEXT,
    date TEXT,
    location TEXT,
    status TEXT DEFAULT 'pending_payment',
    total_amount NUMERIC DEFAULT 0,
    amountPaid TEXT DEFAULT '0',
    payment_screenshot_url TEXT,
    assignedTeam JSONB DEFAULT '[]'::jsonb,
    event_dates JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on orders to allow frontend client bookings & admin sync
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- ========================================================
-- TEAM MEMBERS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.team_members (
    id TEXT PRIMARY KEY DEFAULT ('TM-' || substring(md5(random()::text), 1, 4)),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    daily_rate NUMERIC DEFAULT 3000,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;

-- ========================================================
-- TEAM PAYOUTS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.team_payouts (
    id TEXT PRIMARY KEY DEFAULT ('PO-' || substring(md5(random()::text), 1, 6)),
    order_id TEXT,
    member_id TEXT,
    amount NUMERIC DEFAULT 0,
    date TEXT,
    status TEXT DEFAULT 'paid',
    note TEXT,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.team_payouts DISABLE ROW LEVEL SECURITY;

-- ========================================================
-- BUNDLED PACKAGES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.bundled_packages (
    id TEXT PRIMARY KEY DEFAULT ('PKG-' || substring(md5(random()::text), 1, 6)),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    period TEXT,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    is_popular BOOLEAN DEFAULT false,
    badge_text TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.bundled_packages DISABLE ROW LEVEL SECURITY;

-- ========================================================
-- ADVANCE RULES TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.advance_rules (
    id TEXT PRIMARY KEY DEFAULT ('ADV-' || substring(md5(random()::text), 1, 6)),
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    value NUMERIC NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.advance_rules DISABLE ROW LEVEL SECURITY;
