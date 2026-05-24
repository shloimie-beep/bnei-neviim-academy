// Server-side Supabase client. Use this in server components, route
// handlers, and server actions where you need the *user's* Supabase
// session (parent magic-link auth). For service-role writes use
// `src/lib/supabase/admin.ts` instead.

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { SupabaseClient } from '@supabase/supabase-js';

export function getSupabaseServerClient(): SupabaseClient {
  const cookieStore = cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // `cookies().set` throws inside server components — guard so the
        // same client works in both server-component reads and route
        // handler writes. Route handlers/middleware can still call this.
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          /* read-only context (server component) — ignore */
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options });
        } catch {
          /* read-only context — ignore */
        }
      },
    },
  });
}
