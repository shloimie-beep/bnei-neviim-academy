import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getParentFromSupabase } from '@/lib/auth/parent-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  kidId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  recordingUrl: z.string().url().optional().nullable(),
  notes: z.string().max(4000).optional().nullable(),
  goals: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(2000).optional().nullable(),
      })
    )
    .min(1)
    .max(20),
});

export async function POST(req: NextRequest) {
  const parent = await getParentFromSupabase();
  if (!parent) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'validation', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdminClient();

  const { data: kidRow } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', parsed.data.kidId)
    .single();

  if (!kidRow || kidRow.role !== 'kid') {
    return NextResponse.json({ ok: false, error: 'kid_not_found' }, { status: 404 });
  }

  const { data: meeting, error: mErr } = await supabase
    .from('meetings')
    .insert({
      kid_id: parsed.data.kidId,
      date: parsed.data.date ?? new Date().toISOString().slice(0, 10),
      recording_url: parsed.data.recordingUrl ?? null,
      notes: parsed.data.notes ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (mErr || !meeting) {
    return NextResponse.json(
      { ok: false, error: 'db_error', detail: mErr?.message },
      { status: 500 }
    );
  }

  const goalRows = parsed.data.goals.map((g, idx) => ({
    meeting_id: meeting.id,
    kid_id: parsed.data.kidId,
    title: g.title,
    description: g.description ?? null,
    display_order: idx,
  }));

  const { data: goals, error: gErr } = await supabase
    .from('goals')
    .insert(goalRows)
    .select();

  if (gErr) {
    return NextResponse.json(
      { ok: false, error: 'db_error_goals', detail: gErr.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, meeting, goals });
}

export async function GET(req: NextRequest) {
  const parent = await getParentFromSupabase();
  if (!parent) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const kidId = req.nextUrl.searchParams.get('kidId');
  if (!kidId) {
    return NextResponse.json({ ok: false, error: 'kidId_required' }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('meetings')
    .select('id, kid_id, date, recording_url, notes, is_active, created_at, goals(id, title, description, display_order)')
    .eq('kid_id', kidId)
    .order('date', { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, meetings: data });
}
