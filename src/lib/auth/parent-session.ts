// Parent session — Supabase magic-link, gated by an env whitelist.
//
// `PARENT_EMAILS` is a comma-separated list. We check the whitelist
// BEFORE asking Supabase to send a magic link, and AGAIN when reading
// the session back (defense in depth — if a row is ever created outside
// our flow, the app still won't treat it as a parent).
//
// NEVER log the magic-link token or email body.

import { getSupabaseServerClient } from '@/lib/supabase/server';

export interface ParentIdentity {
  email: string;
  userId: string;
}

export type RequestLinkResult =
  | { ok: true }
  | { ok: false; reason: 'not_whitelisted' | 'supabase_error' };

function parseWhitelist(): string[] {
  const raw = process.env.PARENT_EMAILS ?? '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isParentEmailWhitelisted(email: string): boolean {
  const list = parseWhitelist();
  return list.includes(email.trim().toLowerCase());
}

/** Build the absolute URL the magic-link should redirect back to. */
function buildRedirectUrl(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  // Strip any trailing slash so we don't end up with `//api/...`.
  const trimmed = base.replace(/\/+$/, '');
  return `${trimmed}/api/auth/parent-callback`;
}

/**
 * Trigger a Supabase magic-link email. Always returns the same shape
 * regardless of whitelist status at the API boundary — the route should
 * not leak whether an email is allowed.
 */
export async function requestParentMagicLink(email: string): Promise<RequestLinkResult> {
  const trimmed = email.trim().toLowerCase();
  if (!isParentEmailWhitelisted(trimmed)) {
    return { ok: false, reason: 'not_whitelisted' };
  }

  const supabase = getSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: trimmed,
    options: {
      emailRedirectTo: buildRedirectUrl(),
    },
  });

  if (error) {
    return { ok: false, reason: 'supabase_error' };
  }
  return { ok: true };
}

/**
 * Read the current Supabase session via the server client and confirm
 * the email is still in the whitelist. Returns `null` for unauth or
 * non-whitelisted sessions.
 */
export async function getParentFromSupabase(): Promise<ParentIdentity | null> {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) return null;

  const email = data.user.email?.toLowerCase();
  if (!email) return null;
  if (!isParentEmailWhitelisted(email)) return null;

  return { email, userId: data.user.id };
}
