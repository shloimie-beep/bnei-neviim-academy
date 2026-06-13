// POST /api/auth/kid-logout
// Clears the kid session cookie.

import { NextResponse } from 'next/server';

import { clearKidCookie } from '@/lib/auth/kid-session';

export const runtime = 'nodejs';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ ok: true });
  clearKidCookie(response);
  return response;
}
