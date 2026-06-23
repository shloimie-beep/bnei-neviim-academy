import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseRamble } from '@/lib/bna/task-pipeline';

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

// GET /api/bna/tasks - List tasks with filters
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const stage = searchParams.get('stage');
  const category = searchParams.get('category');
  const urgency = searchParams.get('urgency');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = supabase
    .from('bna_tasks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (stage) query = query.eq('stage', stage);
  if (category) query = query.eq('category', category);
  if (urgency) query = query.eq('urgency', urgency);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tasks: data });
}

// POST /api/bna/tasks - Create task (or from ramble)
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // If ramble text provided, parse it
  if (body.ramble) {
    const parsed = parseRamble(body.ramble);
    
    if (parsed.length === 0) {
      return NextResponse.json({ 
        error: 'Could not parse task from ramble' 
      }, { status: 400 });
    }

    const created = [];
    for (const taskInput of parsed) {
      const { data, error } = await supabase
        .from('bna_tasks')
        .insert({
          ...taskInput,
          source: body.source || 'manual',
          source_context: body.ramble,
          created_by: body.created_by || 'api'
        })
        .select()
        .single();
      
      if (!error && data) created.push(data);
    }

    return NextResponse.json({ 
      success: true, 
      tasks_created: created.length,
      tasks: created 
    });
  }

  // Direct task creation
  const { data, error } = await supabase
    .from('bna_tasks')
    .insert({
      title: body.title,
      notes: body.notes,
      stage: body.stage || 'inbox',
      category: body.category || 'operations',
      urgency: body.urgency || 'this_week',
      energy_required: body.energy_required,
      estimated_minutes: body.estimated_minutes,
      due_date: body.due_date,
      source: body.source || 'manual',
      created_by: body.created_by || 'api'
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, task: data });
}

// PATCH /api/bna/tasks - Bulk update (move stage, etc)
export async function PATCH(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { ids, stage, updates } = body;

  if (!ids || !Array.isArray(ids)) {
    return NextResponse.json({ error: 'ids array required' }, { status: 400 });
  }

  const updateData: any = { ...updates, updated_at: new Date().toISOString() };
  
  if (stage) {
    updateData.stage = stage;
    
    // Set timestamps based on stage
    if (stage === 'execute') updateData.started_at = new Date().toISOString();
    if (stage === 'complete') updateData.completed_at = new Date().toISOString();
    if (stage === 'archive') updateData.archived_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('bna_tasks')
    .update(updateData)
    .in('id', ids)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, updated: data });
}
