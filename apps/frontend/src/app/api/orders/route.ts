import { NextResponse } from 'next/server';

// In-memory store for orders to allow local testing while database is unreachable
// In production, this would be a Supabase table.
const mockOrders = [
  {
    id: 'ORD-001',
    customer: 'Rahul Verma',
    phone: '+91 98765 43210',
    email: 'rahul@example.com',
    package: 'Complete Wedding Package',
    date: '2026-08-15',
    status: 'pending',
    amountPaid: '₹5,000'
  },
  {
    id: 'ORD-002',
    customer: 'Sneha Patel',
    phone: '+91 87654 32109',
    email: 'sneha@example.com',
    package: 'Pre-Wedding Shoot',
    date: '2026-08-12',
    status: 'confirmed',
    assignedTeam: [],
    amountPaid: '₹5,000'
  }
];

if (!(global as any).ordersStore) {
  (global as any).ordersStore = [...mockOrders];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json((global as any).ordersStore, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newOrder = {
      id: `ORD-${String((global as any).ordersStore.length + 1).padStart(3, '0')}`,
      customer: data.name,
      phone: data.phone,
      email: data.email,
      package: data.package,
      date: data.date,
      status: 'pending',
      amountPaid: '₹5,000', // Hardcoded advance amount for now
      assignedTeam: [],
      createdAt: new Date().toISOString()
    };
    
    (global as any).ordersStore.push(newOrder);
    
    return NextResponse.json({ success: true, order: newOrder }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 400, headers: corsHeaders });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, updates } = data;
    
    const orderIndex = (global as any).ordersStore.findIndex((o: any) => o.id === id);
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404, headers: corsHeaders });
    }
    
    (global as any).ordersStore[orderIndex] = { ...(global as any).ordersStore[orderIndex], ...updates };
    
    return NextResponse.json({ success: true, order: (global as any).ordersStore[orderIndex] }, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 400, headers: corsHeaders });
  }
}
