// GET /api/auth/parent-callback
// Supabase magic-link callback. Exchanges `?code=...` for a session
// (cookies set by @supabase/ssr), then redirects to `/parent`.
//
// NEVER log the `code` query param.

import { NextResponse, type NextRequest } from 'next/server';

import { getSupabaseServerClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const code = req.nextUrl.searchParams.get('code');
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') ??
    req.nextUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${base}/parent/login?error=missing_code`);
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error('[parent-callback] exchangeCodeForSession failed');
    return NextResponse.redirect(`${base}/parent/login?error=exchange_failed`);
  }

  return NextResponse.redirect(`${base}/parent`);
}
