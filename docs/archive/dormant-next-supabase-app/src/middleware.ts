// Middleware — gates `/kid/[name]` (excluding `/pin`) and `/parent/*`.
//
// Kid auth: signed cookie verified via HMAC. Must match the `[name]`
// in the path so siblings can't peek at each other's dashboards by
// editing the URL.
//
// Parent auth: Supabase session, must be in the `PARENT_EMAILS`
// whitelist. The whitelist is checked again in `getParentFromSupabase`.
//
// `SKIP_AUTH=true` bypasses all gates in non-production only. Logs a
// loud warning so this never silently runs in prod.

import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

import { verifyKidCookie, KID_COOKIE_NAME } from '@/lib/auth/kid-session';

const PUBLIC_PREFIXES: ReadonlyArray<string> = [
  '/api/auth/',
  '/api/telegram/webhook',
  '/api/cron/',
  '/parent/login',
];

function isPublicPath(pathname: string): boolean {
  if (pathname === '/') return true;
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(prefix)) return true;
  }
  // `/kid/[name]/pin` is the PIN entry page — must stay public.
  if (/^\/kid\/[^/]+\/pin\/?$/.test(pathname)) return true;
  return false;
}

function decodeNameSegment(seg: string): string {
  try {
    return decodeURIComponent(seg);
  } catch {
    return seg;
  }
}

function namesMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  // Dev bypass — non-prod only.
  if (process.env.SKIP_AUTH === 'true') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[middleware] SKIP_AUTH=true — bypassing auth (non-prod only)');
      return NextResponse.next();
    }
    console.error('[middleware] SKIP_AUTH=true ignored in production');
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // ---- Kid routes ---------------------------------------------------------
  const kidMatch = pathname.match(/^\/kid\/([^/]+)(?:\/|$)/);
  if (kidMatch) {
    const requestedName = decodeNameSegment(kidMatch[1]);
    const cookieValue = req.cookies.get(KID_COOKIE_NAME)?.value;
    const identity = verifyKidCookie(cookieValue);

    if (!identity || !namesMatch(identity.kidName, requestedName)) {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      url.search = '';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ---- Parent routes ------------------------------------------------------
  if (pathname === '/parent' || pathname.startsWith('/parent/')) {
    const response = NextResponse.next();

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      // Misconfigured — fail closed.
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/parent/login';
      loginUrl.search = '';
      return NextResponse.redirect(loginUrl);
    }

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    });

    const { data, error } = await supabase.auth.getUser();
    const email = data?.user?.email?.toLowerCase() ?? null;

    const whitelist = (process.env.PARENT_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    if (error || !email || !whitelist.includes(email)) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = '/parent/login';
      loginUrl.search = '';
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Exclude static assets and PWA files. Everything else runs through
  // `middleware` and is filtered by `isPublicPath` above.
  matcher: [
    '/((?!_next/|favicon\\.ico|manifest\\.json|sw\\.js|icons/|proofs/).*)',
  ],
};
