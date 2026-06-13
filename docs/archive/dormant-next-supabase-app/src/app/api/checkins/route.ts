import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getKidFromCookies } from '@/lib/auth/kid-session';
import { notifyCheckinPending } from '@/lib/telegram/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  goalId: z.string().uuid(),
  completed: z.boolean().default(true),
  proofNote: z.string().max(2000).optional(),
  proofPhotoPath: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const kid = await getKidFromCookies();
  if (!kid) {
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

  const { data: goal, error: goalErr } = await supabase
    .from('goals')
    .select('id, kid_id, title')
    .eq('id', parsed.data.goalId)
    .single();

  if (goalErr || !goal) {
    return NextResponse.json({ ok: false, error: 'goal_not_found' }, { status: 404 });
  }
  if (goal.kid_id !== kid.kidId) {
    return NextResponse.json({ ok: false, error: 'goal_not_yours' }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data: checkin, error: upsertErr } = await supabase
    .from('checkins')
    .upsert(
      {
        goal_id: goal.id,
        kid_id: kid.kidId,
        date: today,
        completed: parsed.data.completed,
        proof_note: parsed.data.proofNote ?? null,
        proof_photo_path: parsed.data.proofPhotoPath ?? null,
        approved: null,
      },
      { onConflict: 'goal_id,date' }
    )
    .select()
    .single();

  if (upsertErr || !checkin) {
    return NextResponse.json(
      { ok: false, error: 'db_error', detail: upsertErr?.message },
      { status: 500 }
    );
  }

  const { data: kidRow } = await supabase
    .from('users')
    .select('id, name, language')
    .eq('id', kid.kidId)
    .single();

  if (kidRow) {
    notifyCheckinPending(checkin, goal, kidRow).catch((err) => {
      console.error('telegram notify failed (non-fatal):', err);
    });
  }

  return NextResponse.json({ ok: true, checkin });
}
