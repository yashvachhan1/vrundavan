import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '../../../../utils/supabase/server';

const dataFilePath = path.join(process.cwd(), 'data', 'advance_rules.json');

const DEFAULT_RULES = [
  {
    id: 'rule-std-50k',
    min_amount: 0,
    max_amount: 99999,
    advance_amount: 5000,
    label: 'Standard Plan (< ₹1,00,000)',
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'rule-grand-100k',
    min_amount: 100000,
    max_amount: null,
    advance_amount: 10000,
    label: 'Grand Event (≥ ₹1,00,000)',
    is_active: true,
    sort_order: 2,
    created_at: new Date().toISOString()
  }
];

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Initialize the local JSON storage if it doesn't exist
const initData = () => {
  const dir = path.dirname(dataFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify(DEFAULT_RULES, null, 2));
  }
};

const readLocalRules = () => {
  initData();
  try {
    const raw = fs.readFileSync(dataFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_RULES;
  } catch {
    return DEFAULT_RULES;
  }
};

const writeLocalRules = (rules: any[]) => {
  initData();
  fs.writeFileSync(dataFilePath, JSON.stringify(rules, null, 2));
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function GET() {
  try {
    // Try fetching from Supabase first
    try {
      const supabase = await createClient();
      if (supabase) {
        const { data, error } = await supabase
          .from('custom_plan_advance_rules')
          .select('*')
          .order('min_amount', { ascending: true });
        if (data && data.length > 0 && !error) {
          writeLocalRules(data);
          return NextResponse.json(data, { headers: corsHeaders });
        }
      }
    } catch {
      // Supabase connection or table not ready, continue to file
    }

    const rules = readLocalRules();
    return NextResponse.json(rules, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch advance rules' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rules = readLocalRules();

    const minAmount = Number(body.min_amount) || 0;
    const maxAmount = body.max_amount !== null && body.max_amount !== undefined && body.max_amount !== ''
      ? Number(body.max_amount)
      : null;
    const advanceAmount = Number(body.advance_amount) || 5000;
    const label = body.label?.trim() || (maxAmount ? `Orders up to ₹${maxAmount.toLocaleString('en-IN')}` : `Orders ₹${minAmount.toLocaleString('en-IN')}+`);

    const newRule = {
      id: body.id || 'rule_' + Math.random().toString(36).substring(2, 9),
      min_amount: minAmount,
      max_amount: maxAmount,
      advance_amount: advanceAmount,
      label,
      is_active: body.is_active !== false,
      sort_order: Number(body.sort_order) || (rules.length + 1),
      created_at: new Date().toISOString()
    };

    // Try Supabase insert
    try {
      const supabase = await createClient();
      if (supabase) {
        await supabase.from('custom_plan_advance_rules').insert([newRule]);
      }
    } catch {
      // Ignore Supabase errors
    }

    rules.push(newRule);
    rules.sort((a, b) => (Number(a.min_amount) || 0) - (Number(b.min_amount) || 0));
    writeLocalRules(rules);

    return NextResponse.json(newRule, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to save advance rule' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Rule ID is required' }, { status: 400, headers: corsHeaders });
    }

    const rules = readLocalRules();
    const index = rules.findIndex((r: any) => r.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: 'Rule not found' }, { status: 404, headers: corsHeaders });
    }

    const updatedRule = {
      ...rules[index],
      min_amount: body.min_amount !== undefined ? Number(body.min_amount) : rules[index].min_amount,
      max_amount: body.max_amount !== undefined ? (body.max_amount === null || body.max_amount === '' ? null : Number(body.max_amount)) : rules[index].max_amount,
      advance_amount: body.advance_amount !== undefined ? Number(body.advance_amount) : rules[index].advance_amount,
      label: body.label !== undefined ? body.label.trim() : rules[index].label,
      is_active: body.is_active !== undefined ? Boolean(body.is_active) : rules[index].is_active,
      sort_order: body.sort_order !== undefined ? Number(body.sort_order) : rules[index].sort_order
    };

    // Try Supabase update
    try {
      const supabase = await createClient();
      if (supabase) {
        await supabase.from('custom_plan_advance_rules').update(updatedRule).eq('id', body.id);
      }
    } catch {
      // Ignore Supabase errors
    }

    rules[index] = updatedRule;
    rules.sort((a, b) => (Number(a.min_amount) || 0) - (Number(b.min_amount) || 0));
    writeLocalRules(rules);

    return NextResponse.json(updatedRule, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update advance rule' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400, headers: corsHeaders });
    }

    // Try Supabase delete
    try {
      const supabase = await createClient();
      if (supabase) {
        await supabase.from('custom_plan_advance_rules').delete().eq('id', id);
      }
    } catch {
      // Ignore Supabase errors
    }

    let rules = readLocalRules();
    rules = rules.filter((r: any) => r.id !== id);
    writeLocalRules(rules);

    return NextResponse.json({ success: true }, { headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete advance rule' },
      { status: 500, headers: corsHeaders }
    );
  }
}
