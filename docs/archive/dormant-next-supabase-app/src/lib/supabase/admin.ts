// Service-role Supabase client. Bypasses RLS. NEVER import this from a
// `'use client'` file — it would leak `SUPABASE_SERVICE_ROLE_KEY` into
// the browser bundle.
//
// We throw at *call time*, not module load, because Next.js evaluates
// some files during build (when secrets may not be present).

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function getSupabaseAdminClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error(
      'getSupabaseAdminClient: NEXT_PUBLIC_SUPABASE_URL is not set'
    );
  }
  if (!serviceKey) {
    throw new Error(
      'getSupabaseAdminClient: SUPABASE_SERVICE_ROLE_KEY is not set'
    );
  }

  cached = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return cached;
}

// Convenience proxy so callers can `import { supabaseAdmin }` and use it like
// a normal client. Each property access resolves through the factory so env
// is still only read at call time, not at module load.
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdminClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
