// Client-side Supabase client. Singleton — `createBrowserClient` already
// handles re-use across renders, but we cache the instance to keep
// referential equality stable for hooks/contexts.

'use client';

import { createBrowserClient } from '@supabase/ssr';

import type { SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  cached = createBrowserClient(url, anonKey);
  return cached;
}
