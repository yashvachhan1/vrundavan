-- Create table for custom plan advance payment rules / limits
CREATE TABLE IF NOT EXISTS public.custom_plan_advance_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    min_amount NUMERIC NOT NULL DEFAULT 0,
    max_amount NUMERIC, -- NULL means no upper limit (e.g. 100k and above)
    advance_amount NUMERIC NOT NULL DEFAULT 5000,
    label TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) policies if enabled, or grant permissions for anon and authenticated
ALTER TABLE public.custom_plan_advance_rules ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on custom_plan_advance_rules" 
ON public.custom_plan_advance_rules FOR SELECT USING (true);

-- Allow public / anon insert, update, delete for admin
CREATE POLICY "Allow full access on custom_plan_advance_rules" 
ON public.custom_plan_advance_rules FOR ALL USING (true);

-- Insert initial default rules matching existing logic:
-- Under 100k (e.g. 50k) -> 5k advance
-- 100k and above -> 10k advance
INSERT INTO public.custom_plan_advance_rules (min_amount, max_amount, advance_amount, label, is_active, sort_order)
SELECT 0, 99999, 5000, 'Standard Plan (< ₹1,00,000)', true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.custom_plan_advance_rules WHERE min_amount = 0 AND advance_amount = 5000);

INSERT INTO public.custom_plan_advance_rules (min_amount, max_amount, advance_amount, label, is_active, sort_order)
SELECT 100000, NULL, 10000, 'Grand Event (≥ ₹1,00,000)', true, 2
WHERE NOT EXISTS (SELECT 1 FROM public.custom_plan_advance_rules WHERE min_amount = 100000 AND advance_amount = 10000);
