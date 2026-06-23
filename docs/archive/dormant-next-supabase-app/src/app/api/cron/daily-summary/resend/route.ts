/**
 * Manual-resend route for the daily summary — POST.
 *
 * Same auth and same send logic as the cron GET. Accepts an optional
 * `{ date: "YYYY-MM-DD" }` in the JSON body so the parent dashboard can
 * trigger a re-send for an earlier day (e.g. yesterday). When `date` is
 * omitted, defaults to today in Asia/Jerusalem.
 *
 * The parent dashboard's "Resend today's summary" button hits this route
 * from a server action (so CRON_SECRET stays server-side).
 */

import { NextResponse, type NextRequest } from 'next/server';

import { israelDateString, runDailySummary } from '../route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function checkAuth(req: NextRequest): { ok: true } | { ok: false; reason: string } {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return { ok: false, reason: 'CRON_SECRET not configured' };
  }
  const header = req.headers.get('authorization') ?? '';
  const prefix = 'Bearer ';
  if (!header.startsWith(prefix)) {
    return { ok: false, reason: 'missing bearer token' };
  }
  const token = header.slice(prefix.length).trim();
  if (token !== expected) {
    return { ok: false, reason: 'bad token' };
  }
  return { ok: true };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.reason }, { status: 401 });
  }

  let date: string = israelDateString();
  try {
    // Body is optional. If missing or empty, default to today.
    const text = await req.text();
    if (text.trim().length > 0) {
      const parsed = JSON.parse(text) as { date?: unknown };
      if (typeof parsed.date === 'string' && parsed.date.length > 0) {
        if (!DATE_RE.test(parsed.date)) {
          return NextResponse.json(
            { ok: false, error: 'date must be YYYY-MM-DD' },
            { status: 400 },
          );
        }
        date = parsed.date;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: `invalid json body: ${message}` },
      { status: 400 },
    );
  }

  try {
    const result = await runDailySummary(date);
    return NextResponse.json(
      { ...result, date },
      { status: result.ok ? 200 : 500 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error('[daily-summary/resend] handler failed', message);
    return NextResponse.json(
      { ok: false, error: message, sentAt: new Date().toISOString(), date },
      { status: 500 },
    );
  }
}
