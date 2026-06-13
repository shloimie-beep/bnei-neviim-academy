// POST /api/auth/parent-request
// Body: { email: string }
//
// Requests a Supabase magic link if the email is in the whitelist.
// Returns `{ok: true}` either way so we don't leak who is allowed.

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requestParentMagicLink } from '@/lib/auth/parent-session';

export const runtime = 'nodejs';

const Body = z.object({
  email: z.string().email().max(254),
});

export async function POST(req: Request): Promise<NextResponse> {
  let parsed: z.infer<typeof Body>;
  try {
    const json = await req.json();
    parsed = Body.parse(json);
  } catch {
    // Still don't leak — same response shape as the success path so a
    // probe can't tell malformed-vs-not-whitelisted apart.
    return NextResponse.json({ ok: true });
  }

  // Fire-and-forget from the client's perspective. We DO await so
  // Supabase errors get logged server-side, but we never surface
  // failure reasons. NEVER log the email body or token.
  const result = await requestParentMagicLink(parsed.email);
  if (!result.ok && result.reason === 'supabase_error') {
    console.error('[parent-request] Supabase signInWithOtp failed');
  }

  return NextResponse.json({ ok: true });
}
