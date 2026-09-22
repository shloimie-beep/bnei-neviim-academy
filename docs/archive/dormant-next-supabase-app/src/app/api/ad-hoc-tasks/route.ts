// POST /api/ad-hoc-tasks
// Parent drops a one-off task on a kid outside the meeting cycle. Stored
// on the kid's active meeting as a goal with source='ad_hoc'. Same
// check-off / approval flow applies.
//
// Body: { kidId: string, title: string, description?: string, expiresAt?: ISO }

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
  expiresAt: z.string().datetime().optional().nullable(),
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

  const sb = getSupabaseAdminClient();
  const { data: meeting } = await sb
    .from('meetings')
    .select('id')
    .eq('kid_id', parsed.data.kidId)
    .eq('is_active', true)
    .maybeSingle();

  if (!meeting) {
    return NextResponse.json(
      { ok: false, error: 'no_active_meeting' },
      { status: 400 }
    );
  }

  // Place after existing goals.
  const { count } = await sb
    .from('goals')
    .select('id', { count: 'exact', head: true })
    .eq('meeting_id', (meeting as { id: string }).id);

  const { data, error } = await sb
    .from('goals')
    .insert({
      meeting_id: (meeting as { id: string }).id,
      kid_id: parsed.data.kidId,
      title: parsed.data.title.trim(),
      description: parsed.data.description?.trim() || null,
      display_order: (count ?? 0) + 100, // ad-hoc sorts below meeting goals by default
      source: 'ad_hoc',
      expires_at: parsed.data.expiresAt ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, goal: data });
}
