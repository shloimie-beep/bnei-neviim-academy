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

// GET /api/bna/tasks/[id] - Get single task
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('bna_tasks')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ task: data });
}

// PATCH /api/bna/tasks/[id] - Update task
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  
  const updateData: any = {
    ...body,
    updated_at: new Date().toISOString()
  };

  // Handle stage transitions
  if (body.stage) {
    if (body.stage === 'execute' && !body.started_at) {
      updateData.started_at = new Date().toISOString();
    }
    if (body.stage === 'complete' && !body.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }
    if (body.stage === 'archive' && !body.archived_at) {
      updateData.archived_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from('bna_tasks')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, task: data });
}

// DELETE /api/bna/tasks/[id] - Delete task
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('bna_tasks')
    .delete()
    .eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
