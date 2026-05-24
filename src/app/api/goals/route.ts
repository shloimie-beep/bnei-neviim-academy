import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getParentFromSupabase } from '@/lib/auth/parent-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  kidId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
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
    return NextResponse.json({ ok: false, error: 'validation' }, { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  const { data: meeting, error: mErr } = await supabase
    .from('meetings')
    .select('id, kid_id')
    .eq('kid_id', parsed.data.kidId)
    .eq('is_active', true)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (mErr || !meeting) {
    return NextResponse.json(
      { ok: false, error: 'no_active_meeting' },
      { status: 404 }
    );
  }

  const { count: orderCount } = await supabase
    .from('goals')
    .select('id', { count: 'exact', head: true })
    .eq('meeting_id', meeting.id);

  const { data: goal, error: gErr } = await supabase
    .from('goals')
    .insert({
      meeting_id: meeting.id,
      kid_id: parsed.data.kidId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      display_order: orderCount ?? 0,
    })
    .select()
    .single();

  if (gErr || !goal) {
    return NextResponse.json(
      { ok: false, error: 'db_error', detail: gErr?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, goal });
}
