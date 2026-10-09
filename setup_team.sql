-- Create the team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the team_payouts table
CREATE TABLE IF NOT EXISTS public.team_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
    order_id TEXT NOT NULL,
    client TEXT NOT NULL,
    date TEXT NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default mock data for testing
INSERT INTO public.team_members (name, role, phone, icon) VALUES
('Rahul Sharma', 'Lead Photographer', '+91 98765 43210', 'Camera'),
('Sanjay Kumar', 'Drone Operator', '+91 76543 21098', 'User'),
('Priya Singh', 'Editor', '+91 65432 10987', 'User');
