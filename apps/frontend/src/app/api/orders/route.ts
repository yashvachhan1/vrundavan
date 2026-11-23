import { NextResponse } from 'next/server';
import { createClient } from '../../../../utils/supabase/server';

// In-memory store for real customer orders
if (!(global as any).ordersStore) {
  (global as any).ordersStore = [];
} else {
  // Purge any legacy static mock data
  (global as any).ordersStore = (global as any).ordersStore.filter(
    (o: any) => o.id !== 'ORD-001' && o.id !== 'ORD-002' && o.email !== 'rahul@example.com' && o.email !== 'sneha@example.com'
  );
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim().toLowerCase();

  // If query is provided, find matching order
  if (q) {
    const memoryMatch = (global as any).ordersStore.find((o: any) => 
      o.id?.toLowerCase() === q ||
      o.quote_id?.toLowerCase() === q ||
      o.email?.toLowerCase() === q ||
      o.phone?.replace(/\s+/g, '') === q.replace(/\s+/g, '')
    );

    if (memoryMatch) {
      return NextResponse.json({ order: memoryMatch }, { headers: corsHeaders });
    }

    try {
      const supabase = await createClient();
      if (supabase) {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .or(`quote_id.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,id.eq.${q}`)
          .limit(1);

        if (data && data.length > 0) {
          return NextResponse.json({ order: data[0] }, { headers: corsHeaders });
        }
      }
    } catch (err) {
      console.warn("Supabase lookup fallback error:", err);
    }

    return NextResponse.json({ error: 'Order not found' }, { status: 404, headers: corsHeaders });
  }

  // Return full store
  return NextResponse.json((global as any).ordersStore, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const quoteId = data.quote_id || `VRUN-${shortId}`;
    const orderId = `ORD-${String((global as any).ordersStore.length + 1).padStart(3, '0')}`;

    const newOrder = {
      id: orderId,
      quote_id: quoteId,
      customer: data.customer || data.name,
      phone: data.phone,
      email: data.email,
      package: data.package,
      total_amount: data.total_amount || 0,
      location: data.location || '',
      date: data.date,
      event_dates: data.event_dates || null,
      status: data.status || 'pending_payment',
      amountPaid: data.amountPaid || '0',
      payment_screenshot_url: data.payment_screenshot_url || null,
      assignedTeam: [],
      created_at: new Date().toISOString()
    };
    
    // Always store in memory store
    (global as any).ordersStore.unshift(newOrder);

    // Attempt to persist in Supabase if reachable
    try {
      const supabase = await createClient();
      if (supabase) {
        const { data: dbOrder, error: dbError } = await supabase.from('orders').insert([{
          customer: newOrder.customer,
          phone: newOrder.phone,
          email: newOrder.email,
          package: newOrder.package,
          date: newOrder.date,
          status: newOrder.status,
          amountPaid: String(newOrder.amountPaid),
          total_amount: newOrder.total_amount,
          quote_id: newOrder.quote_id,
          location: newOrder.location,
          payment_screenshot_url: newOrder.payment_screenshot_url,
          event_dates: newOrder.event_dates,
          assignedTeam: []
        }]).select().single();

        if (!dbError && dbOrder) {
          newOrder.id = dbOrder.id;
          (global as any).ordersStore[0] = { ...newOrder, ...dbOrder };
        }
      }
    } catch (dbErr) {
      console.warn("Supabase insert fallback (using memory store):", dbErr);
    }
    
    return NextResponse.json({ success: true, order: newOrder }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create order' }, { status: 400, headers: corsHeaders });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, updates } = data;
    
    const orderIndex = (global as any).ordersStore.findIndex((o: any) => o.id === id || o.quote_id === id);
    if (orderIndex === -1) {
      const fallbackOrder = {
        id,
        quote_id: id,
        ...updates,
        created_at: new Date().toISOString()
      };
      (global as any).ordersStore.unshift(fallbackOrder);
      return NextResponse.json({ success: true, order: fallbackOrder }, { headers: corsHeaders });
    }
    
    (global as any).ordersStore[orderIndex] = { ...(global as any).ordersStore[orderIndex], ...updates };

    // Try updating Supabase
    try {
      const supabase = await createClient();
      if (supabase) {
        await supabase.from('orders').update(updates).or(`id.eq.${id},quote_id.eq.${id}`);
      }
    } catch (dbErr) {
      console.warn("Supabase update fallback:", dbErr);
    }
    
    return NextResponse.json({ success: true, order: (global as any).ordersStore[orderIndex] }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update order' }, { status: 400, headers: corsHeaders });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id || body?.quote_id;
      } catch {
        // body might be empty
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Order ID or Quote ID is required' }, { status: 400, headers: corsHeaders });
    }

    // 1. Remove from in-memory global store
    if ((global as any).ordersStore) {
      (global as any).ordersStore = (global as any).ordersStore.filter(
        (o: any) => o.id !== id && o.quote_id !== id
      );
    }

    // 2. Remove from Supabase
    try {
      const supabase = await createClient();
      if (supabase) {
        await supabase.from('orders').delete().or(`id.eq.${id},quote_id.eq.${id}`);
      }
    } catch (dbErr) {
      console.warn("Supabase delete fallback:", dbErr);
    }

    return NextResponse.json({ success: true, deletedId: id }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete order' }, { status: 400, headers: corsHeaders });
  }
}


