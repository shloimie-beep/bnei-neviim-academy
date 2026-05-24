/**
 * Build a compact, fresh snapshot of family state for the chat model to read
 * each turn.
 *
 * Source: the copied family-accountability Supabase project only. This is the
 * reusable data layer we are carrying into the new BNA workspace as a base.
 */

import { supabaseAdmin } from '@/lib/supabase/admin';

export async function buildFamilyContext(): Promise<string> {
  const sb = supabaseAdmin;
  const today = new Date().toISOString().slice(0, 10);

  const { data: kids } = await sb
    .from('users')
    .select('id, name, frozen, language')
    .eq('role', 'kid')
    .order('name');

  if (!kids || kids.length === 0) {
    return `<family-context>\nNo kids configured yet.\n</family-context>`;
  }

  const lines: string[] = [`<family-context date="${today}">`];

  for (const kid of kids as Array<{ id: string; name: string; frozen: boolean; language: string }>) {
    lines.push('');
    lines.push(`## ${kid.name}${kid.frozen ? ' (PAUSED)' : ''}`);

    const { data: meeting } = await sb
      .from('meetings')
      .select('id, date, notes, recording_url')
      .eq('kid_id', kid.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!meeting) {
      lines.push('No active meeting. No goals set.');
      continue;
    }

    lines.push(`Active meeting from ${meeting.date}.`);
    if (meeting.notes) lines.push(`Notes: ${meeting.notes}`);

    const { data: goals } = await sb
      .from('goals')
      .select('id, title, description, display_order')
      .eq('meeting_id', meeting.id)
      .order('display_order');

    if (!goals || goals.length === 0) {
      lines.push('No goals on the active meeting.');
      continue;
    }

    lines.push('Goals:');
    for (const goal of goals as Array<{ id: string; title: string; description: string | null }>) {
      lines.push(`  - ${goal.title}${goal.description ? ` - ${goal.description}` : ''}`);
    }

    const { data: todayCheckins } = await sb
      .from('checkins')
      .select('id, goal_id, completed, approved, proof_note, goals(title)')
      .eq('kid_id', kid.id)
      .eq('date', today);

    const todayDone = (todayCheckins ?? []).filter((checkin) => checkin.completed).length;
    lines.push(`Today: ${todayDone}/${goals.length} checked off.`);
    for (const checkin of (todayCheckins ?? []) as Array<{
      completed: boolean;
      approved: boolean | null;
      proof_note: string | null;
      goals: { title: string } | { title: string }[] | null;
    }>) {
      const title = Array.isArray(checkin.goals) ? checkin.goals[0]?.title : checkin.goals?.title;
      const status =
        checkin.approved === true ? 'approved' : checkin.approved === false ? 'rejected' : 'pending review';
      const note = checkin.proof_note ? ` - note: ${checkin.proof_note}` : '';
      lines.push(`  * ${title}: ${status}${note}`);
    }

    try {
      const { data: streakData } = await sb.rpc('get_streak', { p_kid_id: kid.id });
      const streak = typeof streakData === 'number' ? streakData : 0;
      lines.push(`Current streak: ${streak} day${streak === 1 ? '' : 's'}.`);
    } catch {
      // Ignore optional RPC failures and keep the rest of the context usable.
    }

    const sevenAgo = new Date();
    sevenAgo.setDate(sevenAgo.getDate() - 6);
    const days: string[] = [];
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(sevenAgo);
      day.setDate(sevenAgo.getDate() + i);
      days.push(day.toISOString().slice(0, 10));
    }

    const { data: weekCheckins } = await sb
      .from('checkins')
      .select('date, completed')
      .eq('kid_id', kid.id)
      .in('date', days)
      .eq('completed', true);

    const counts = new Map<string, number>();
    for (const checkin of weekCheckins ?? []) {
      const date = (checkin as { date: string }).date;
      counts.set(date, (counts.get(date) ?? 0) + 1);
    }

    const weekSummary = days
      .map((day) => `${day.slice(5)}=${counts.get(day) ?? 0}/${goals.length}`)
      .join(', ');
    lines.push(`Last 7 days: ${weekSummary}`);
  }

  const { data: parentNotes } = await sb
    .from('parent_notes')
    .select('author_name, body, created_at')
    .order('created_at', { ascending: false })
    .limit(8);

  if (parentNotes && parentNotes.length > 0) {
    lines.push('');
    lines.push('## Recent parent notes (shared wall)');
    for (const note of parentNotes as Array<{ author_name: string; body: string; created_at: string }>) {
      lines.push(`  - [${note.author_name}, ${note.created_at.slice(0, 10)}] ${note.body}`);
    }
  }

  const { data: recentMeetings } = await sb
    .from('meetings')
    .select('date, kid_id, notes, users:kid_id(name), goals(count)')
    .order('date', { ascending: false })
    .limit(3);

  if (recentMeetings && recentMeetings.length > 0) {
    lines.push('');
    lines.push('## Recent meetings');
    for (const meeting of recentMeetings as Array<any>) {
      const name = Array.isArray(meeting.users) ? meeting.users[0]?.name : meeting.users?.name;
      const goalCount = Array.isArray(meeting.goals)
        ? Number(meeting.goals[0]?.count ?? 0)
        : Number(meeting.goals?.count ?? 0);
      const note = meeting.notes ? ` - ${meeting.notes}` : '';
      lines.push(`  - ${meeting.date} * ${name} * ${goalCount} goals${note}`);
    }
  }

  lines.push('</family-context>');
  return lines.join('\n');
}
