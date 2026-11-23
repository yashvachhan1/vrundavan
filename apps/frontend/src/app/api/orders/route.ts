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

  // Helper to identify and purge any static mock orders
  const isMock = (o: any) => {
    if (!o) return true;
    const id = String(o.id || '');
    const quoteId = String(o.quote_id || '');
    const customer = String(o.customer || '').toLowerCase();
    const email = String(o.email || '').toLowerCase();
    return (
      id.startsWith('ORD-10') ||
      id === 'ORD-001' ||
      id === 'ORD-002' ||
      customer.includes('rahul verma') ||
      customer.includes('sneha patel') ||
      customer.includes('amit & riya') ||
      email.includes('example.com')
    );
  };

  // If query is provided, find matching order
  if (q) {
    const cleanQ = q.replace(/^vrun-?/i, '');
    const memoryMatch = (global as any).ordersStore.find((o: any) => 
      !isMock(o) && (
        o.id?.toLowerCase() === q ||
        o.quote_id?.toLowerCase() === q ||
        o.quote_id?.toLowerCase() === cleanQ ||
        o.email?.toLowerCase() === q ||
        o.phone?.replace(/\s+/g, '') === q.replace(/\s+/g, '')
      )
    );

    if (memoryMatch) {
      return NextResponse.json({ order: memoryMatch }, { headers: corsHeaders });
    }

    try {
      const supabase = await createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .or(`quote_id.ilike.%${cleanQ}%,email.ilike.%${q}%,phone.ilike.%${q}%,id.eq.${q}`)
          .limit(1);

        if (!error && data && data.length > 0 && !isMock(data[0])) {
          return NextResponse.json({ order: data[0] }, { headers: corsHeaders });
        }
      }
    } catch (err) {
      console.warn("Supabase lookup fallback error:", err);
    }

    return NextResponse.json({ error: 'Order not found' }, { status: 404, headers: corsHeaders });
  }

  // If no query, return all real orders merged from Supabase and memory store
  let allOrders: any[] = [...((global as any).ordersStore || [])];

  try {
    const supabase = await createClient();
    if (supabase) {
      const { data: dbOrders, error: dbErr } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!dbErr && Array.isArray(dbOrders) && dbOrders.length > 0) {
        const existingKeys = new Set(allOrders.map((o: any) => o.quote_id || o.id));
        const newFromDb = dbOrders.filter((o: any) => !existingKeys.has(o.quote_id || o.id));
        allOrders = [...allOrders, ...newFromDb];
      }
    }
  } catch (err) {
    console.warn("Supabase GET orders error:", err);
  }

  // Purge any mock orders
  allOrders = allOrders.filter((o: any) => !isMock(o));

  return NextResponse.json(allOrders, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const defaultQuoteId = data.quote_id || `VRUN-${shortId}`;
    const orderId = `ORD-${String(((global as any).ordersStore?.length || 0) + 1).padStart(3, '0')}`;

    // Format package to embed individual ceremony dates if provided
    let packageText = data.package || '';
    if (data.event_dates && typeof data.event_dates === 'object' && Object.keys(data.event_dates).length > 0) {
      const formattedDates = Object.entries(data.event_dates)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      if (!packageText.includes(formattedDates)) {
        packageText = `${packageText} [Dates: ${formattedDates}]`;
      }
    }

    const newOrder = {
      id: orderId,
      quote_id: defaultQuoteId,
      customer: data.customer || data.name,
      phone: data.phone,
      email: data.email,
      package: packageText,
      total_amount: data.total_amount || 0,
      location: data.location || 'Junagadh',
      date: data.date,
      event_dates: data.event_dates || null,
      status: data.status || 'pending_payment',
      amountPaid: String(data.amountPaid || '0'),
      payment_screenshot_url: data.payment_screenshot_url || null,
      assignedTeam: data.assignedTeam || [],
      created_at: new Date().toISOString()
    };
    
    // Always store in memory store
    (global as any).ordersStore.unshift(newOrder);

    // Persist in Supabase
    // NOTE: In Supabase, 'quote_id' is a generated column and cannot be explicitly inserted.
    // 'event_dates' column does not exist on orders table, so dates are embedded in packageText.
    try {
      const supabase = await createClient();
      if (supabase) {
        const dbPayload: any = {
          customer: newOrder.customer,
          phone: newOrder.phone,
          email: newOrder.email,
          package: newOrder.package,
          date: newOrder.date,
          status: newOrder.status,
          amountPaid: String(newOrder.amountPaid),
          total_amount: newOrder.total_amount,
          location: newOrder.location,
          payment_screenshot_url: newOrder.payment_screenshot_url,
          assignedTeam: newOrder.assignedTeam
        };

        const { data: dbOrder, error: dbError } = await supabase
          .from('orders')
          .insert([dbPayload])
          .select()
          .single();

        if (dbError) {
          console.error("Supabase insert error:", dbError);
        } else if (dbOrder) {
          newOrder.id = dbOrder.id;
          newOrder.quote_id = dbOrder.quote_id || newOrder.quote_id;
          newOrder.created_at = dbOrder.created_at || newOrder.created_at;
          (global as any).ordersStore[0] = { ...newOrder, ...dbOrder };
        }
      }
    } catch (dbErr) {
      console.warn("Supabase insert fallback (using memory store):", dbErr);
    }
    
    return NextResponse.json({ success: true, order: (global as any).ordersStore[0] }, { headers: corsHeaders });
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
    } else {
      (global as any).ordersStore[orderIndex] = { ...(global as any).ordersStore[orderIndex], ...updates };
    }

    // Try updating Supabase with whitelisted columns only
    try {
      const supabase = await createClient();
      if (supabase && updates) {
        const allowedColumns = ['customer', 'phone', 'email', 'package', 'date', 'status', 'amountPaid', 'total_amount', 'location', 'payment_screenshot_url', 'assignedTeam'];
        const dbUpdates: any = {};
        for (const key of allowedColumns) {
          if (updates[key] !== undefined) {
            dbUpdates[key] = key === 'amountPaid' ? String(updates[key]) : updates[key];
          }
        }

        if (updates.event_dates && typeof updates.event_dates === 'object') {
          const formattedDates = Object.entries(updates.event_dates)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
          if (dbUpdates.package && !dbUpdates.package.includes(formattedDates)) {
            dbUpdates.package = `${dbUpdates.package} [Dates: ${formattedDates}]`;
          }
        }

        if (Object.keys(dbUpdates).length > 0) {
          const cleanId = String(id).replace(/^vrun-?/i, '');
          const { error: updateErr } = await supabase
            .from('orders')
            .update(dbUpdates)
            .or(`id.eq.${id},quote_id.ilike.%${cleanId}%`);
          
          if (updateErr) {
            console.error("Supabase update error:", updateErr);
          }
        }
      }
    } catch (dbErr) {
      console.warn("Supabase update fallback:", dbErr);
    }
    
    const updatedOrder = (global as any).ordersStore.find((o: any) => o.id === id || o.quote_id === id) || { id, ...updates };
    return NextResponse.json({ success: true, order: updatedOrder }, { headers: corsHeaders });
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
        const cleanId = String(id).replace(/^vrun-?/i, '');
        const { error: delErr } = await supabase
          .from('orders')
          .delete()
          .or(`id.eq.${id},quote_id.ilike.%${cleanId}%`);
        
        if (delErr) {
          console.error("Supabase delete error:", delErr);
        }
      }
    } catch (dbErr) {
      console.warn("Supabase delete fallback:", dbErr);
    }

    return NextResponse.json({ success: true, deletedId: id }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete order' }, { status: 400, headers: corsHeaders });
  }
}


