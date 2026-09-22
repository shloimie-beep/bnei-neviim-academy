/**
 * Daily summary cron endpoint — GET.
 *
 * Triggered by Railway cron at 22:00 Asia/Jerusalem. Authenticates via
 * `Authorization: Bearer <CRON_SECRET>`. Pulls today's goals/checkins/streaks
 * for every non-frozen kid, signs proof-photo URLs, renders the React Email
 * template, sends via Resend, and (best-effort) also pushes a Telegram digest
 * to both parents.
 *
 * Never logs the rendered body. Only logs subject + recipient + ok/err.
 *
 * Time zone: all date math is Asia/Jerusalem. The "today" used in DB queries
 * is the Israel calendar date, not the server's local date.
 */

import { NextResponse, type NextRequest } from 'next/server';

import { sendEmail } from '@/lib/email/client';
import { renderDailySummary } from '@/lib/email/render';
import type {
  DailySummaryKid,
  DailySummaryProps,
} from '@/lib/email/templates/DailySummary';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
// Cron POSTs/GETs should never be statically cached.
export const dynamic = 'force-dynamic';

const ISRAEL_TZ = 'Asia/Jerusalem';
const PROOFS_BUCKET = 'proofs';
const SIGNED_URL_TTL_SECONDS = 60 * 60 * 24; // 24h

// ---------- auth ----------
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

// ---------- date helpers (Asia/Jerusalem) ----------

/** Returns the Israel calendar date as YYYY-MM-DD. */
export function israelDateString(d: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ISRAEL_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

/** "Tuesday, May 12" in Israel time. */
function formatDateLong(dateIso: string): string {
  // Parse YYYY-MM-DD as a date-only value, then format under Asia/Jerusalem.
  const [y, m, d] = dateIso.split('-').map((n) => parseInt(n, 10));
  // Use 12:00 UTC so the Israel-tz formatter never lands on the previous day
  // due to a midnight UTC shift.
  const dt = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0));
  return new Intl.DateTimeFormat('en-US', {
    timeZone: ISRAEL_TZ,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(dt);
}

// ---------- data shapes from DB ----------

type KidRow = {
  id: string;
  name: string;
  frozen: boolean;
};

type GoalRow = {
  id: string;
  title: string;
  display_order: number;
};

type CheckinRow = {
  goal_id: string;
  completed: boolean;
  proof_note: string | null;
  proof_photo_path: string | null;
  approved: boolean | null;
};

// ---------- core: build props ----------

async function buildSummaryForDate(dateIso: string): Promise<DailySummaryProps> {
  const supabase = getSupabaseAdminClient();

  // All non-frozen kids.
  const { data: kidRows, error: kidsErr } = await supabase
    .from('users')
    .select('id, name, frozen')
    .eq('role', 'kid')
    .eq('frozen', false)
    .order('name', { ascending: true });

  if (kidsErr) {
    // Surface to the route — but still build something so the email goes out
    // with whatever we did get.
    // eslint-disable-next-line no-console
    console.error('[daily-summary] kids query failed', kidsErr.message);
  }

  const kids: DailySummaryKid[] = [];

  for (const kid of (kidRows ?? []) as KidRow[]) {
    // Active meeting for this kid.
    const { data: meetingRow } = await supabase
      .from('meetings')
      .select('id')
      .eq('kid_id', kid.id)
      .eq('is_active', true)
      .maybeSingle();

    let goals: GoalRow[] = [];
    if (meetingRow?.id) {
      const { data: goalRows } = await supabase
        .from('goals')
        .select('id, title, display_order')
        .eq('meeting_id', meetingRow.id)
        .order('display_order', { ascending: true });
      goals = (goalRows ?? []) as GoalRow[];
    }

    // Today's checkins for this kid.
    const { data: checkinRows } = await supabase
      .from('checkins')
      .select('goal_id, completed, proof_note, proof_photo_path, approved')
      .eq('kid_id', kid.id)
      .eq('date', dateIso);
    const checkinsByGoal = new Map<string, CheckinRow>();
    for (const c of (checkinRows ?? []) as CheckinRow[]) {
      checkinsByGoal.set(c.goal_id, c);
    }

    // Streak via DB function.
    let streak = 0;
    const { data: streakData, error: streakErr } = await supabase.rpc(
      'get_streak',
      { p_kid_id: kid.id },
    );
    if (!streakErr && typeof streakData === 'number') {
      streak = streakData;
    }

    // Assemble goal lines.
    const summaryGoals = await Promise.all(
      goals.map(async (g) => {
        const c = checkinsByGoal.get(g.id);
        const completed = Boolean(c?.completed);

        let proofPhotoUrl: string | undefined;
        if (c?.proof_photo_path) {
          const { data: signed } = await supabase.storage
            .from(PROOFS_BUCKET)
            .createSignedUrl(c.proof_photo_path, SIGNED_URL_TTL_SECONDS);
          if (signed?.signedUrl) {
            proofPhotoUrl = signed.signedUrl;
          }
        }

        return {
          title: g.title,
          completed,
          proofNote: c?.proof_note ?? undefined,
          proofPhotoUrl,
          // If no checkin row exists at all, we list it as missed (✗), not
          // pending. Only an actual completed-but-unreviewed checkin is
          // "pending parent approval".
          approved: c ? c.approved : false,
        };
      }),
    );

    kids.push({
      name: kid.name,
      streak,
      goals: summaryGoals,
    });
  }

  return {
    date: formatDateLong(dateIso),
    kids,
    parentDashboardUrl: process.env.PARENT_DASHBOARD_URL ?? '',
  };
}

// ---------- core: send ----------

export type DailySummaryRunResult = {
  ok: boolean;
  sentAt: string;
  email: { ok: boolean; error?: string };
  telegram: { ok: boolean; error?: string };
};

export async function runDailySummary(
  dateIso: string,
): Promise<DailySummaryRunResult> {
  const props = await buildSummaryForDate(dateIso);
  const { html, text } = await renderDailySummary(props);
  const subject = `Family Accountability — ${props.date}`;

  const to = process.env.EMAIL_TO_AHUVA ?? 'ahuvadratler@gmail.com';
  const cc = process.env.EMAIL_CC_SHLOIMIE ?? undefined;

  // Resend is optional. If no API key configured, skip email entirely —
  // the Telegram digest below covers both parents on their own bots and
  // is enough for V1. Result is reported as "ok, skipped".
  const emailResult = process.env.RESEND_API_KEY
    ? await sendEmail({ to, cc, subject, html, text })
    : ({ ok: true, error: 'skipped: RESEND_API_KEY not set' } as const);

  // Telegram digest — same content, fans out to BOTH parents on their own
  // bots (post per-parent refactor). Best effort; never blocks email path.
  let telegramOk = true;
  let telegramErr: string | undefined;
  try {
    const { broadcastToParents } = await import('@/lib/telegram/notify');
    const results = await broadcastToParents(text);
    if (results.length === 0) {
      telegramOk = false;
      telegramErr = 'no parent bots configured';
    } else {
      for (const r of results) {
        if (!r.ok) {
          telegramOk = false;
          telegramErr = r.error;
        }
      }
    }
  } catch (err) {
    telegramOk = false;
    telegramErr = err instanceof Error ? err.message : String(err);
  }

  // Overall ok if AT LEAST ONE channel delivered. Telegram alone is fine.
  return {
    ok: emailResult.ok || telegramOk,
    sentAt: new Date().toISOString(),
    email: emailResult.ok
      ? { ok: true }
      : { ok: false, error: emailResult.error },
    telegram: telegramOk
      ? { ok: true }
      : { ok: false, error: telegramErr },
  };
}

// ---------- handler ----------

export async function GET(req: NextRequest) {
  const auth = checkAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.reason }, { status: 401 });
  }

  const today = israelDateString();
  try {
    const result = await runDailySummary(today);
    return NextResponse.json(result, { status: result.ok ? 200 : 500 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // No body content leaked here — only the error message.
    // eslint-disable-next-line no-console
    console.error('[daily-summary] handler failed', message);
    return NextResponse.json(
      { ok: false, error: message, sentAt: new Date().toISOString() },
      { status: 500 },
    );
  }
}
