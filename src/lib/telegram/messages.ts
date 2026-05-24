/**
 * Telegram message builders — pure functions, no I/O.
 *
 * All output uses HTML parse mode (per client.ts default). Any user-supplied
 * string MUST be passed through escapeHtml() before interpolation; do not use
 * Markdown anywhere — Telegram's MarkdownV2 has too many footguns.
 *
 * Messages are English (per SPEC.md "Telegram bot: English").
 */

import type { InlineKeyboardMarkup } from 'node-telegram-bot-api';

// ---------- types (mirroring supabase-schema.sql) ----------

export type Kid = {
  id: string;
  name: string;
  language?: 'he' | 'en';
  frozen?: boolean;
};

export type Goal = {
  id: string;
  title: string;
  description?: string | null;
};

export type Checkin = {
  id: string;
  goal_id: string;
  kid_id: string;
  date: string;
  completed: boolean;
  proof_note?: string | null;
  proof_photo_path?: string | null;
  approved?: boolean | null;
};

export type KidProgress = {
  kid: Pick<Kid, 'id' | 'name'>;
  completed: number;
  total: number;
  streak?: number;
};

export type MeetingSummary = {
  id: string;
  kid_name: string;
  date: string;
  notes?: string | null;
  goal_count: number;
};

export type BuiltMessage = {
  text: string;
  reply_markup?: InlineKeyboardMarkup;
};

// ---------- helpers ----------

/**
 * Escape the five HTML entities Telegram cares about. Used for any
 * user-supplied string before interpolating into an HTML message.
 */
export function escapeHtml(input: string | null | undefined): string {
  if (input == null) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(s: string, max = 200): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1) + '…';
}

// ---------- builders ----------

/**
 * Notification fired when a kid checks off a goal. Parents see Approve /
 * Reject / Skip inline buttons. Callback data format is the prefix:checkinId
 * convention parsed in handlers.ts.
 */
export function buildCheckinNotification(
  kid: Pick<Kid, 'name'>,
  goal: Pick<Goal, 'title'>,
  checkin: Pick<Checkin, 'id' | 'proof_note' | 'proof_photo_path'>,
): BuiltMessage {
  const kidName = escapeHtml(kid.name);
  const goalTitle = escapeHtml(goal.title);

  const lines: string[] = [];
  lines.push(`<b>${kidName}</b> just checked off:`);
  lines.push(`“${goalTitle}”`);

  if (checkin.proof_note) {
    lines.push('');
    lines.push(`<i>Proof note:</i> ${escapeHtml(truncate(checkin.proof_note))}`);
  }
  if (checkin.proof_photo_path) {
    lines.push('');
    lines.push('<i>Proof photo attached.</i>');
  }

  const reply_markup: InlineKeyboardMarkup = {
    inline_keyboard: [
      [
        { text: 'Approve', callback_data: `approve:${checkin.id}` },
        { text: 'Reject', callback_data: `reject:${checkin.id}` },
        { text: 'Skip', callback_data: `skip:${checkin.id}` },
      ],
    ],
  };

  return { text: lines.join('\n'), reply_markup };
}

/**
 * /today — both kids' progress for today.
 */
export function buildTodayDigest(progress: KidProgress[]): BuiltMessage {
  if (progress.length === 0) {
    return { text: '<b>Today</b>\nNo kids configured.' };
  }
  const lines: string[] = ['<b>Today</b>'];
  for (const p of progress) {
    const name = escapeHtml(p.kid.name);
    const ratio = `${p.completed}/${p.total}`;
    const streak =
      typeof p.streak === 'number' ? ` · streak ${p.streak}` : '';
    lines.push(`• ${name}: ${ratio} done${streak}`);
  }
  return { text: lines.join('\n') };
}

/**
 * /streak — current streaks for both kids.
 */
export function buildStreakDigest(
  streaks: { kid: Pick<Kid, 'name'>; streak: number }[],
): BuiltMessage {
  if (streaks.length === 0) {
    return { text: '<b>Streaks</b>\nNo kids configured.' };
  }
  const lines: string[] = ['<b>Streaks</b>'];
  for (const s of streaks) {
    const name = escapeHtml(s.kid.name);
    const flame = s.streak >= 3 ? ' 🔥' : '';
    lines.push(`• ${name}: ${s.streak} day${s.streak === 1 ? '' : 's'}${flame}`);
  }
  return { text: lines.join('\n') };
}

/**
 * /meetings — most recent five meetings across both kids, newest first.
 */
export function buildMeetingsDigest(
  meetings: MeetingSummary[],
): BuiltMessage {
  if (meetings.length === 0) {
    return { text: '<b>Recent meetings</b>\nNo meetings yet.' };
  }
  const lines: string[] = ['<b>Recent meetings (last 5)</b>'];
  for (const m of meetings.slice(0, 5)) {
    const name = escapeHtml(m.kid_name);
    const date = escapeHtml(m.date);
    const goals = m.goal_count;
    const noteFragment = m.notes
      ? ` — ${escapeHtml(truncate(m.notes, 80))}`
      : '';
    lines.push(`• ${date} · ${name} · ${goals} goal${goals === 1 ? '' : 's'}${noteFragment}`);
  }
  return { text: lines.join('\n') };
}

/**
 * /help — list of supported commands.
 */
export function buildHelp(): BuiltMessage {
  const text = [
    '<b>Family Accountability Bot</b>',
    '',
    '/today — both kids’ progress today',
    '/streak — current streaks',
    '/meetings — last 5 meetings',
    '/addgoal &lt;kid&gt; "title" — add a goal to the kid’s active meeting',
    '/freeze &lt;kid&gt; — pause a kid’s dashboard',
    '/unfreeze &lt;kid&gt; — resume a kid’s dashboard',
    '/dashboard — open the parent web app',
    '/help — this message',
    '',
    'Anything you send that is not a slash command goes to Kimi first, with OpenAI as fallback. Ask things like "How did Menachem do this week?" or "What goals were rejected and why?"',
  ].join('\n');
  return { text };
}

/**
 * /dashboard — small message with an inline button that opens the parent
 * web app. Telegram renders the button as a tap target above the keyboard.
 */
export function buildDashboardLink(url: string): BuiltMessage {
  return {
    text: 'Open the family dashboard:',
    reply_markup: {
      inline_keyboard: [[{ text: 'Open Dashboard', url }]],
    },
  };
}

/**
 * Confirmation shown after a parent taps Approve / Reject / Skip.
 */
export function buildCallbackConfirmation(
  decision: 'approved' | 'rejected' | 'skipped',
  parentName: string,
): BuiltMessage {
  const who = escapeHtml(parentName);
  const verb =
    decision === 'approved'
      ? 'Approved'
      : decision === 'rejected'
        ? 'Rejected'
        : 'Skipped';
  return { text: `<i>${verb} by ${who}.</i>` };
}
