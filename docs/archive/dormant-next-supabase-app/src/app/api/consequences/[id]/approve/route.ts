// POST /api/consequences/<id>/approve — parent approves a kid-proposed
// consequence, locking it in. Future overrides require an explicit override.

import { NextResponse } from 'next/server';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getParentFromSupabase } from '@/lib/auth/parent-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const parent = await getParentFromSupabase();
  if (!parent) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const sb = getSupabaseAdminClient();
  const { error } = await sb
    .from('goal_consequences')
    .update({
      approved_by_parent: true,
      approved_at: new Date().toISOString(),
      approved_by_user_id: parent.userId,
    })
    .eq('id', params.id);
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
