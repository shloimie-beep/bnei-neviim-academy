// POST /api/users/freeze
// Parent freezes / unfreezes a kid's dashboard from the web app.
// Body: { kidId: string, frozen: boolean }

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getParentFromSupabase } from '@/lib/auth/parent-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  kidId: z.string().uuid(),
  frozen: z.boolean(),
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
  const { error } = await supabase
    .from('users')
    .update({ frozen: parsed.data.frozen })
    .eq('id', parsed.data.kidId)
    .eq('role', 'kid');

  if (error) {
    return NextResponse.json(
      { ok: false, error: 'db_error', detail: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
