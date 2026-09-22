import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function checkAuth(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const expectedAuth = 'Basic ' + Buffer.from(
    `${process.env.OPS_USERNAME}:${process.env.OPS_PASSWORD}`
  ).toString('base64');
  return authHeader === expectedAuth;
}

// GET /api/bna/signups - List signups
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const paymentStatus = searchParams.get('payment_status');
  const tag = searchParams.get('tag');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = supabase
    .from('bna_signups')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) query = query.eq('status', status);
  if (paymentStatus) query = query.eq('payment_status', paymentStatus);
  if (tag) query = query.contains('tags', [tag]);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ signups: data });
}

// POST /api/bna/signups - Create signup
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // Auto-tag based on data
  const tags: string[] = body.tags || [];
  if (!tags.includes('parent')) tags.push('parent');
  if (body.student_name && !tags.includes('student')) tags.push('student');
  if (body.payment_method === 'cash' && !tags.includes('cash_payer')) tags.push('cash_payer');

  const { data, error } = await supabase
    .from('bna_signups')
    .insert({
      parent_name: body.parent_name,
      parent_email: body.parent_email,
      parent_phone: body.parent_phone,
      student_name: body.student_name,
      student_age: body.student_age,
      student_grade: body.student_grade,
      previous_school: body.previous_school,
      reason_applying: body.reason_applying,
      special_needs: body.special_needs,
      payment_method: body.payment_method,
      payment_amount: body.payment_amount,
      tags,
      notes: body.notes,
      status: body.status || 'new'
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, signup: data });
}

// PATCH /api/bna/signups - Bulk update
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { ids, updates } = body;

  if (!ids || !Array.isArray(ids)) {
    return NextResponse.json({ error: 'ids array required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('bna_signups')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .in('id', ids)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, updated: data });
}
