// POST /api/users/pin-hash
// Onboarding helper: hash a PIN with bcrypt so the parent can paste the
// hash into KID_PINS_HASH_* environment variables. The hash is returned
// to the client and NEVER stored server-side in V1 (PINs live in env vars,
// not the DB, per kid-session.ts).
//
// Why this endpoint exists: the spec ships with a `npm run hash-pin` CLI,
// but Shloimie's onboarding flow runs in the browser (mobile-first). We
// need an in-app way to get the hash without him SSHing into anything.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

import { getParentFromSupabase } from '@/lib/auth/parent-session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const Body = z.object({
  pin: z.string().regex(/^\d{4}$/, '4-digit numeric PIN required'),
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

  const hash = await bcrypt.hash(parsed.data.pin, 10);
  return NextResponse.json({ ok: true, hash });
}
