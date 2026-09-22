// Kid session — cookie-based, signed with HMAC-SHA256.
//
// V1 trade-off: PIN hashes are read from env vars
// (`KID_PINS_HASH_MENACHEM`, `KID_PINS_HASH_ESTHER`), NOT from the
// `users.pin_hash` DB column. Schema keeps the column for V2 when we'll
// migrate to per-user hashes managed by parents. For now, env vars are
// simpler to rotate and don't require a DB round-trip on every login.
//
// Rate limit: 5 failed attempts per kidName per 15 minutes, stored in an
// in-memory `Map`. This resets on cold start, which is acceptable for a
// single-family low-traffic deploy — restarts are rare and a sibling
// trying to brute-force would still hit hundreds of failed attempts
// before a restart helped them. Not suitable for multi-tenant.
//
// Secret reuse: signs with `CRON_SECRET` — Shloimie authorized sharing
// secrets across same-project boundaries to keep V1 simple. If we ever
// add more secret-using surfaces, split into a dedicated `SESSION_SECRET`.

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const COOKIE_NAME = 'family-acc-kid';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

export interface KidSessionPayload {
  kidId: string;
  kidName: string;
  iat: number; // seconds since epoch
  exp: number; // seconds since epoch
}

export interface KidIdentity {
  kidId: string;
  kidName: string;
}

// ---------------------------------------------------------------------------
// HMAC sign / verify
// ---------------------------------------------------------------------------

function getSigningSecret(): string {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw new Error('CRON_SECRET is not set (used to sign kid sessions)');
  }
  return secret;
}

function b64urlEncode(buf: Buffer | string): string {
  const b = typeof buf === 'string' ? Buffer.from(buf, 'utf8') : buf;
  return b
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function b64urlDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const normalized = s.replace(/-/g, '+').replace(/_/g, '/') + pad;
  return Buffer.from(normalized, 'base64');
}

function hmac(payload: string): Buffer {
  return crypto.createHmac('sha256', getSigningSecret()).update(payload).digest();
}

/** Sign a cookie value `base64url(payload).base64url(hmac)`. */
export function signKidCookie(kidId: string, kidName: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: KidSessionPayload = {
    kidId,
    kidName,
    iat: now,
    exp: now + COOKIE_MAX_AGE_SECONDS,
  };
  const payloadB64 = b64urlEncode(JSON.stringify(payload));
  const sigB64 = b64urlEncode(hmac(payloadB64));
  return `${payloadB64}.${sigB64}`;
}

/** Verify signature + expiry. Returns `{kidId, kidName}` or `null`. */
export function verifyKidCookie(cookieValue: string | undefined | null): KidIdentity | null {
  if (!cookieValue) return null;

  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;

  const expectedSig = hmac(payloadB64);
  let providedSig: Buffer;
  try {
    providedSig = b64urlDecode(sigB64);
  } catch {
    return null;
  }
  if (providedSig.length !== expectedSig.length) return null;
  if (!crypto.timingSafeEqual(providedSig, expectedSig)) return null;

  let payload: KidSessionPayload;
  try {
    payload = JSON.parse(b64urlDecode(payloadB64).toString('utf8'));
  } catch {
    return null;
  }

  if (
    typeof payload.kidId !== 'string' ||
    typeof payload.kidName !== 'string' ||
    typeof payload.exp !== 'number'
  ) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) return null;

  return { kidId: payload.kidId, kidName: payload.kidName };
}

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

function isProd(): boolean {
  return process.env.NODE_ENV === 'production';
}

/** Set the kid session cookie on a `NextResponse`. */
export function setKidSessionCookie(
  response: NextResponse,
  kidId: string,
  kidName: string
): void {
  const value = signKidCookie(kidId, kidName);
  response.cookies.set({
    name: COOKIE_NAME,
    value,
    httpOnly: true,
    secure: isProd(),
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

/** Clear the kid session cookie on a `NextResponse`. */
export function clearKidCookie(response: NextResponse): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isProd(),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/** Server-component / route-handler helper: read + verify the cookie. */
export function getKidFromCookies(): KidIdentity | null {
  const raw = cookies().get(COOKIE_NAME)?.value;
  return verifyKidCookie(raw);
}

export const KID_COOKIE_NAME = COOKIE_NAME;

// ---------------------------------------------------------------------------
// Rate limit (in-memory)
// ---------------------------------------------------------------------------

interface RateBucket {
  count: number;
  resetAt: number; // ms epoch
}

const rateBuckets = new Map<string, RateBucket>();

function rateKey(kidName: string): string {
  return kidName.trim().toLowerCase();
}

function checkRateLimit(kidName: string): { ok: true } | { ok: false; retryAfterMs: number } {
  const key = rateKey(kidName);
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    return { ok: true };
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return { ok: false, retryAfterMs: bucket.resetAt - now };
  }
  return { ok: true };
}

function recordFailedAttempt(kidName: string): void {
  const key = rateKey(kidName);
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }
  bucket.count += 1;
}

function clearRateLimit(kidName: string): void {
  rateBuckets.delete(rateKey(kidName));
}

// ---------------------------------------------------------------------------
// PIN verification
// ---------------------------------------------------------------------------

export type VerifyPinResult =
  | { ok: true; kidId: string; kidName: string }
  | { ok: false; reason: 'invalid' | 'rate_limited'; retryAfterMs?: number };

/**
 * Look up a kid by name (case-insensitive) and compare the supplied PIN
 * against the env-var hash. Updates the in-memory rate-limit bucket on
 * failure.
 *
 * NEVER log `pin` or include it in error responses.
 */
export async function verifyKidPin(
  kidName: string,
  pin: string
): Promise<VerifyPinResult> {
  const limit = checkRateLimit(kidName);
  if (!limit.ok) {
    return { ok: false, reason: 'rate_limited', retryAfterMs: limit.retryAfterMs };
  }

  const normalized = kidName.trim();
  if (!normalized || !pin) {
    recordFailedAttempt(kidName);
    return { ok: false, reason: 'invalid' };
  }

  const hash = pinHashForName(normalized);
  if (!hash) {
    // Don't reveal whether the kid exists; still penalize the attempt.
    recordFailedAttempt(kidName);
    return { ok: false, reason: 'invalid' };
  }

  let matches = false;
  try {
    matches = await bcrypt.compare(pin, hash);
  } catch {
    matches = false;
  }

  if (!matches) {
    recordFailedAttempt(kidName);
    return { ok: false, reason: 'invalid' };
  }

  // PIN ok — look up kid_id from DB (case-insensitive on `name`).
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, name, role, frozen')
    .ilike('name', normalized)
    .eq('role', 'kid')
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    recordFailedAttempt(kidName);
    return { ok: false, reason: 'invalid' };
  }

  clearRateLimit(kidName);
  return { ok: true, kidId: data.id as string, kidName: data.name as string };
}

/**
 * Look up the bcrypt hash for a kid name from env. Returns `null` if
 * the kid is not configured.
 */
function pinHashForName(name: string): string | null {
  const upper = name.trim().toUpperCase();
  // V1 supports the two seeded kids. Adding more = add an env var and
  // extend this map.
  const map: Record<string, string | undefined> = {
    MENACHEM: process.env.KID_PINS_HASH_MENACHEM,
    ESTHER: process.env.KID_PINS_HASH_ESTHER,
  };
  return map[upper] ?? null;
}
