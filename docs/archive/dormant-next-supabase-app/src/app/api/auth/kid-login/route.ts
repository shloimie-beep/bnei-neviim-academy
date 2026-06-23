// POST /api/auth/kid-login
// Body: { name: string, pin: string }
//
// Validates with zod, verifies the PIN, sets the kid session cookie on
// success. NEVER logs `pin`. Returns a generic 401 on failure so we
// don't leak whether the kid exists.

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { setKidSessionCookie, verifyKidPin } from '@/lib/auth/kid-session';

export const runtime = 'nodejs';

const Body = z.object({
  name: z.string().min(1).max(64),
  pin: z.string().min(1).max(32),
});

export async function POST(req: Request): Promise<NextResponse> {
  let parsed: z.infer<typeof Body>;
  try {
    const json = await req.json();
    parsed = Body.parse(json);
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid request' },
      { status: 400 }
    );
  }

  const result = await verifyKidPin(parsed.name, parsed.pin);

  if (!result.ok) {
    if (result.reason === 'rate_limited') {
      return NextResponse.json(
        { ok: false, error: 'Too many attempts. Try again later.' },
        {
          status: 429,
          headers: result.retryAfterMs
            ? { 'Retry-After': String(Math.ceil(result.retryAfterMs / 1000)) }
            : undefined,
        }
      );
    }
    return NextResponse.json(
      { ok: false, error: 'Incorrect PIN' },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    redirect: `/kid/${encodeURIComponent(result.kidName)}`,
  });
  setKidSessionCookie(response, result.kidId, result.kidName);
  return response;
}
