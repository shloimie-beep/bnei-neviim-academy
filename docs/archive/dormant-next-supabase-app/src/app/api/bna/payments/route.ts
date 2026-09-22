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

// GET /api/bna/payments - List payments
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const signupId = searchParams.get('signup_id');
  const method = searchParams.get('method');
  const status = searchParams.get('status');

  let query = supabase
    .from('bna_payment_log')
    .select('*, signup:bna_signups(parent_name, student_name)')
    .order('created_at', { ascending: false });

  if (signupId) query = query.eq('signup_id', signupId);
  if (method) query = query.eq('method', method);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ payments: data });
}

// POST /api/bna/payments - Create payment
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // Create payment log entry
  const { data: payment, error: paymentError } = await supabase
    .from('bna_payment_log')
    .insert({
      signup_id: body.signup_id,
      payment_type: body.payment_type || 'registration',
      amount: body.amount,
      currency: body.currency || 'ILS',
      method: body.method,
      green_invoice_id: body.green_invoice_id,
      green_invoice_url: body.green_invoice_url,
      receipt_photo_url: body.receipt_photo_url,
      received_by: body.received_by || 'system',
      received_at: body.received_at || new Date().toISOString(),
      notes: body.notes,
      status: body.status || 'completed'
    })
    .select()
    .single();

  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  // Update signup payment status
  const { data: signup } = await supabase
    .from('bna_signups')
    .select('payment_amount, payment_status')
    .eq('id', body.signup_id)
    .single();

  if (signup) {
    const totalPaid = (signup.payment_amount || 0) + body.amount;
    const newStatus = totalPaid >= 500 ? 'paid' : 'partial'; // Assuming 500 is full registration

    await supabase
      .from('bna_signups')
      .update({
        payment_status: newStatus,
        payment_amount: totalPaid,
        cash_receipt_photo_url: body.method === 'cash' ? body.receipt_photo_url : undefined,
        cash_received_at: body.method === 'cash' ? (body.received_at || new Date().toISOString()) : undefined,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.signup_id);
  }

  return NextResponse.json({ success: true, payment });
}

// POST /api/bna/payments/cash-receipt - Handle cash receipt photo
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  
  // Update payment with receipt photo
  const { data, error } = await supabase
    .from('bna_payment_log')
    .update({
      receipt_photo_url: body.receipt_photo_url,
      notes: body.notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', body.payment_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also update signup if this is the latest cash payment
  if (body.update_signup) {
    await supabase
      .from('bna_signups')
      .update({
        cash_receipt_photo_url: body.receipt_photo_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.signup_id);
  }

  return NextResponse.json({ success: true, payment: data });
}
