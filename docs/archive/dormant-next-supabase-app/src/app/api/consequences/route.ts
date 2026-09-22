// POST /api/consequences  — propose a consequence for a goal.
//
// Called from the kid dashboard (kid proposes) or parent dashboard (parent
// drops one directly — also marks approved). Logic:
//   - kid session present → proposed_by_kid=true, approved_by_parent=false
//   - parent session present → proposed_by_kid=false, approved_by_parent=true
//
// Body: { goalId: string, body: string }

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getParentFromSupabase } from '@/lib/auth/parent-session';
import { getKidFromCookies } from '@/lib/auth/kid-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  goalId: z.string().uuid(),
  body: z.string().min(1).max(500),
});

export async function POST(req: NextRequest) {
  const parent = await getParentFromSupabase();
  const kid = parent ? null : getKidFromCookies();
  if (!parent && !kid) {
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

  // If a kid is proposing, the goal must belong to them.
  if (kid) {
    const { data: goal } = await sb
      .from('goals')
      .select('id, kid_id')
      .eq('id', parsed.data.goalId)
      .maybeSingle();
    if (!goal) {
      return NextResponse.json({ ok: false, error: 'goal_not_found' }, { status: 404 });
    }
    if ((goal as { kid_id: string }).kid_id !== kid.kidId) {
      return NextResponse.json({ ok: false, error: 'goal_not_yours' }, { status: 403 });
    }
  }

  const proposedByKid = !parent;
  const approvedByParent = !!parent;

  const { data, error } = await sb
    .from('goal_consequences')
    .insert({
      goal_id: parsed.data.goalId,
      body: parsed.data.body.trim(),
      proposed_by_kid: proposedByKid,
      approved_by_parent: approvedByParent,
      approved_at: approvedByParent ? new Date().toISOString() : null,
      approved_by_user_id: approvedByParent ? parent!.userId : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, consequence: data });
}
