// POST /api/consequences/<id>/override
// One parent can override a locked-in consequence. Records who and why.
// Body: { reason: string }

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getParentFromSupabase } from '@/lib/auth/parent-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  reason: z.string().min(1).max(500),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
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
  const { error } = await sb
    .from('goal_consequences')
    .update({
      overridden: true,
      overridden_at: new Date().toISOString(),
      overridden_by_user_id: parent.userId,
      override_reason: parsed.data.reason.trim(),
    })
    .eq('id', params.id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
