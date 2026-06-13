/**
 * Telegram command + callback handlers. Now per-parent: every handler gets
 * a `parent` config so it can render dashboard links that point to the
 * right place and (optionally) reply with parent-personalized wording.
 *
 * Pure-ish: takes ({chatId, args, supabase, parent}) and returns a
 * BuiltMessage. The webhook route is the only thing that talks to Telegram.
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import type { ParentConfig } from './auth';
import {
  buildCallbackConfirmation,
  buildDashboardLink,
  buildHelp,
  buildMeetingsDigest,
  buildStreakDigest,
  buildTodayDigest,
  escapeHtml,
  type BuiltMessage,
  type KidProgress,
  type MeetingSummary,
} from './messages';

export type SupabaseAdminClient = SupabaseClient<any, 'public', any>;

export type HandlerInput = {
  chatId: number | string;
  args: string[];
  supabase: SupabaseAdminClient;
  parent: ParentConfig;
};

async function getKidByName(
  supabase: SupabaseAdminClient,
  name: string,
): Promise<{ id: string; name: string; frozen: boolean } | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, frozen')
    .eq('role', 'kid')
    .ilike('name', name)
    .maybeSingle();
  if (error || !data) return null;
  return data as { id: string; name: string; frozen: boolean };
}

async function getActiveMeetingId(
  supabase: SupabaseAdminClient,
  kidId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('meetings')
    .select('id')
    .eq('kid_id', kidId)
    .eq('is_active', true)
    .maybeSingle();
  if (error || !data) return null;
  return (data as { id: string }).id;
}

async function listKids(
  supabase: SupabaseAdminClient,
): Promise<{ id: string; name: string }[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, name')
    .eq('role', 'kid')
    .order('name');
  if (error || !data) return [];
  return data as { id: string; name: string }[];
}

// ============================================================
// Commands
// ============================================================

export async function handleToday(input: HandlerInput): Promise<BuiltMessage> {
  const { supabase } = input;
  const { data, error } = await supabase
    .from('v_today_progress')
    .select('kid_id, kid_name, total_goals, completed_goals');
  if (error || !data) return { text: '<i>Could not load today’s progress.</i>' };

  const rows = data as Array<{
    kid_id: string;
    kid_name: string;
    total_goals: number;
    completed_goals: number;
  }>;

  const progress: KidProgress[] = await Promise.all(
    rows.map(async (r) => {
      let streak = 0;
      try {
        const { data: s } = await supabase.rpc('get_streak', { p_kid_id: r.kid_id });
        if (typeof s === 'number') streak = s;
      } catch {
        /* default 0 */
      }
      return {
        kid: { id: r.kid_id, name: r.kid_name },
        completed: Number(r.completed_goals ?? 0),
        total: Number(r.total_goals ?? 0),
        streak,
      };
    }),
  );

  return buildTodayDigest(progress);
}

export async function handleStreak(input: HandlerInput): Promise<BuiltMessage> {
  const { supabase } = input;
  const kids = await listKids(supabase);
  const streaks = await Promise.all(
    kids.map(async (k) => {
      let streak = 0;
      try {
        const { data } = await supabase.rpc('get_streak', { p_kid_id: k.id });
        if (typeof data === 'number') streak = data;
      } catch {
        /* default 0 */
      }
      return { kid: { name: k.name }, streak };
    }),
  );
  return buildStreakDigest(streaks);
}

export async function handleMeetings(input: HandlerInput): Promise<BuiltMessage> {
  const { supabase } = input;
  const { data, error } = await supabase
    .from('meetings')
    .select('id, date, notes, kid_id, users:kid_id(name), goals(count)')
    .order('date', { ascending: false })
    .limit(5);
  if (error || !data) return { text: '<i>Could not load recent meetings.</i>' };

  const meetings: MeetingSummary[] = (data as Array<any>).map((m) => ({
    id: m.id,
    date: m.date,
    notes: m.notes ?? null,
    kid_name:
      (Array.isArray(m.users) ? m.users[0]?.name : m.users?.name) ?? 'Unknown',
    goal_count: Array.isArray(m.goals)
      ? Number(m.goals[0]?.count ?? 0)
      : Number(m.goals?.count ?? 0),
  }));

  return buildMeetingsDigest(meetings);
}

export async function handleAddGoal(input: HandlerInput): Promise<BuiltMessage> {
  const { args, supabase } = input;
  if (args.length < 2) {
    return { text: 'Usage: <code>/addgoal &lt;kid&gt; &lt;title&gt;</code>' };
  }
  const kidName = args[0];
  const rawTitle = args
    .slice(1)
    .join(' ')
    .trim()
    .replace(/^["“'](.*)["”']$/, '$1');
  if (!rawTitle) return { text: 'Goal title cannot be empty.' };

  const kid = await getKidByName(supabase, kidName);
  if (!kid) {
    return { text: `Could not find kid named <b>${escapeHtml(kidName)}</b>.` };
  }
  const meetingId = await getActiveMeetingId(supabase, kid.id);
  if (!meetingId) {
    return {
      text: `<b>${escapeHtml(kid.name)}</b> has no active meeting. Start one from the parent dashboard first.`,
    };
  }
  const { error } = await supabase.from('goals').insert({
    meeting_id: meetingId,
    kid_id: kid.id,
    title: rawTitle,
    frequency: 'daily',
  });
  if (error) return { text: `Failed to add goal: ${escapeHtml(error.message)}` };

  return {
    text: `Added goal “${escapeHtml(rawTitle)}” for <b>${escapeHtml(kid.name)}</b>.`,
  };
}

async function setFrozen(
  supabase: SupabaseAdminClient,
  kidName: string,
  frozen: boolean,
): Promise<BuiltMessage> {
  const kid = await getKidByName(supabase, kidName);
  if (!kid) {
    return { text: `Could not find kid named <b>${escapeHtml(kidName)}</b>.` };
  }
  const { error } = await supabase.from('users').update({ frozen }).eq('id', kid.id);
  if (error) {
    return {
      text: `Failed to ${frozen ? 'freeze' : 'unfreeze'}: ${escapeHtml(error.message)}`,
    };
  }
  return {
    text: frozen
      ? `<b>${escapeHtml(kid.name)}</b> is now <i>paused</i>. Their dashboard will say “Paused — talk to Tatty”.`
      : `<b>${escapeHtml(kid.name)}</b> is back in action.`,
  };
}

export async function handleFreeze(input: HandlerInput): Promise<BuiltMessage> {
  if (input.args.length === 0) {
    return { text: 'Usage: <code>/freeze &lt;kid&gt;</code>' };
  }
  return setFrozen(input.supabase, input.args[0], true);
}

export async function handleUnfreeze(input: HandlerInput): Promise<BuiltMessage> {
  if (input.args.length === 0) {
    return { text: 'Usage: <code>/unfreeze &lt;kid&gt;</code>' };
  }
  return setFrozen(input.supabase, input.args[0], false);
}

export async function handleHelp(_input: HandlerInput): Promise<BuiltMessage> {
  return buildHelp();
}

/** /dashboard — quick link back to the parent web app. */
export async function handleDashboard(_input: HandlerInput): Promise<BuiltMessage> {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') ?? 'http://localhost:3000';
  return buildDashboardLink(`${base}/parent`);
}

// ============================================================
// Callbacks
// ============================================================

async function findParentUserIdByName(
  supabase: SupabaseAdminClient,
  parentName: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'parent')
    .ilike('name', parentName)
    .maybeSingle();
  if (error || !data) return null;
  return (data as { id: string }).id;
}

export async function handleApproveCallback(
  supabase: SupabaseAdminClient,
  checkinId: string,
  parentTelegramName: string,
): Promise<BuiltMessage> {
  const approverId = await findParentUserIdByName(supabase, parentTelegramName);
  const { error } = await supabase
    .from('checkins')
    .update({
      approved: true,
      approved_at: new Date().toISOString(),
      approved_by: approverId,
      rejection_reason: null,
    })
    .eq('id', checkinId);
  if (error) return { text: `<i>Could not approve: ${escapeHtml(error.message)}.</i>` };
  return {
    ...buildCallbackConfirmation('approved', parentTelegramName),
    reply_markup: { inline_keyboard: [] },
  };
}

export async function handleRejectCallback(
  supabase: SupabaseAdminClient,
  checkinId: string,
  parentTelegramName: string,
): Promise<BuiltMessage> {
  const approverId = await findParentUserIdByName(supabase, parentTelegramName);
  const { error } = await supabase
    .from('checkins')
    .update({
      approved: false,
      approved_at: new Date().toISOString(),
      approved_by: approverId,
      rejection_reason: null,
    })
    .eq('id', checkinId);
  if (error) return { text: `<i>Could not reject: ${escapeHtml(error.message)}.</i>` };
  return {
    ...buildCallbackConfirmation('rejected', parentTelegramName),
    reply_markup: { inline_keyboard: [] },
  };
}

export async function handleSkipCallback(
  _supabase: SupabaseAdminClient,
  _checkinId: string,
  parentTelegramName: string = 'Parent',
): Promise<BuiltMessage> {
  return {
    ...buildCallbackConfirmation('skipped', parentTelegramName),
    reply_markup: { inline_keyboard: [] },
  };
}
