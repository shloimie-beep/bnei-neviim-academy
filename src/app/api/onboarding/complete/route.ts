// POST /api/onboarding/complete
// Marks the current parent's onboarding as complete by setting a cookie.
// Per-parent (cookie scoped to this browser/device), not stored in DB.

import { NextResponse } from 'next/server';

import { getParentFromSupabase } from '@/lib/auth/parent-session';
import { ONBOARDING_COOKIE } from '@/lib/onboarding';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  const parent = await getParentFromSupabase();
  if (!parent) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: ONBOARDING_COOKIE,
    value: '1',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}
