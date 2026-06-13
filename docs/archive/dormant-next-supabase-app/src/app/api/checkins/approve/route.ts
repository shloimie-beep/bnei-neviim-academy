// POST /api/checkins/approve
// Parent in-app approve/reject for pending check-ins.
// Body: { checkinIds: string[], decision: 'approve' | 'reject', reason?: string }

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getParentFromSupabase } from '@/lib/auth/parent-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  checkinIds: z.array(z.string().uuid()).min(1).max(50),
  decision: z.enum(['approve', 'reject']),
  reason: z.string().max(500).optional(),
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

  const approved = parsed.data.decision === 'approve';
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('checkins')
    .update({
      approved,
      rejection_reason: approved ? null : parsed.data.reason ?? null,
      approved_at: new Date().toISOString(),
    })
    .in('id', parsed.data.checkinIds)
    .select('id, approved');

  if (error) {
    return NextResponse.json(
      { ok: false, error: 'db_error', detail: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, updated: data?.length ?? 0 });
}
