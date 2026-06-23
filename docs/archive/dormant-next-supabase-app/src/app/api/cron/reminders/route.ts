/**
 * GET /api/cron/reminders
 *
 * Scheduled by Railway cron (recommended: morning + afternoon Israel time).
 * Sends a short "to-do for the kids today" digest to BOTH parents' bots and
 * — when there are still incomplete goals after a threshold — a gentle
 * follow-up later in the day.
 *
 * Auth: Bearer CRON_SECRET. Same secret as daily-summary.
 *
 * Behavior driven by `?type=`:
 *   morning       → list each kid's open goals for today
 *   afternoon     → list each kid's still-pending goals
 *   default       → morning
 */

import { NextResponse, type NextRequest } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { broadcastToParents } from '@/lib/telegram/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorized(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const got = req.headers.get('authorization');
  return got === `Bearer ${expected}`;
}

type Kind = 'morning' | 'afternoon';

function parseKind(req: NextRequest): Kind {
  const q = req.nextUrl.searchParams.get('type');
  return q === 'afternoon' ? 'afternoon' : 'morning';
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!authorized(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const kind = parseKind(req);
  const today = new Date().toISOString().slice(0, 10);
  const sb = supabaseAdmin;

  const { data: kids } = await sb
    .from('users')
    .select('id, name, frozen')
    .eq('role', 'kid')
    .order('name');

  if (!kids || kids.length === 0) {
    return NextResponse.json({ ok: true, kind, sent: 0, skipped: 'no_kids' });
  }

  const blocks: string[] = [];
  for (const kid of kids as Array<{ id: string; name: string; frozen: boolean }>) {
    if (kid.frozen) continue;

    const { data: meeting } = await sb
      .from('meetings')
      .select('id')
      .eq('kid_id', kid.id)
      .eq('is_active', true)
      .maybeSingle();
    if (!meeting) continue;

    const { data: goals } = await sb
      .from('goals')
      .select('id, title')
      .eq('meeting_id', (meeting as { id: string }).id);
    if (!goals || goals.length === 0) continue;

    const { data: doneToday } = await sb
      .from('checkins')
      .select('goal_id')
      .eq('kid_id', kid.id)
      .eq('date', today)
      .eq('completed', true);
    const doneIds = new Set((doneToday ?? []).map((c) => (c as { goal_id: string }).goal_id));
    const open = (goals as Array<{ id: string; title: string }>).filter((g) => !doneIds.has(g.id));

    // Afternoon: only ping if there are still open items.
    if (kind === 'afternoon' && open.length === 0) continue;
    if (open.length === 0) {
      blocks.push(`<b>${kid.name}</b>: all done already.`);
      continue;
    }

    const lines = open.map((g) => `  • ${g.title}`);
    blocks.push(`<b>${kid.name}</b> — ${open.length} open:\n${lines.join('\n')}`);
  }

  if (blocks.length === 0) {
    return NextResponse.json({ ok: true, kind, sent: 0, skipped: 'nothing_open' });
  }

  const heading =
    kind === 'morning' ? '<b>Today’s to-dos</b>' : '<b>Still open</b>';
  const text = [heading, '', ...blocks].join('\n');
  const results = await broadcastToParents(text);

  return NextResponse.json({
    ok: true,
    kind,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
  });
}
