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
('addon', 'Standard Canvera Album', 15000, 'Premium printed 40-page photobook', 'book');


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
('FLAT5000', 'flat', 5000, true);
