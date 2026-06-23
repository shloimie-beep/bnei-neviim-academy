// Parent → per-kid detail. Sticky header with freeze toggle + new-meeting
// CTA + ad-hoc task button. Active meeting expanded with day-by-day grid.
// Pending kid-proposed consequences + locked-in consequences shown below.

import { redirect, notFound } from 'next/navigation';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getParentFromSupabase } from '@/lib/auth/parent-session';
import { Card } from '@/components/ui/Card';
import { ParentHeader } from '@/components/parent/Header';
import { FreezeToggle } from '@/components/parent/FreezeToggle';
import { AdHocTaskButton } from '@/components/parent/AdHocTaskButton';
import { ConsequenceList, type Consequence } from '@/components/parent/ConsequenceList';
import { NewMeetingModal } from './NewMeetingModal';

export const dynamic = 'force-dynamic';

type GoalLite = {
  id: string;
  title: string;
  description: string | null;
  display_order: number;
  source?: 'meeting' | 'ad_hoc';
};
type MeetingLite = {
  id: string;
  date: string;
  recording_url: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  goals: GoalLite[] | null;
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function ParentKidDetail({ params }: { params: { kid: string } }) {
  const parent = await getParentFromSupabase();
  if (!parent) redirect('/parent/login');

  const supabase = getSupabaseAdminClient();

  const { data: kid } = await supabase
    .from('users')
    .select('id, name, frozen')
    .ilike('name', params.kid)
    .eq('role', 'kid')
    .single();

  if (!kid) notFound();

  const { data: meetings } = await supabase
    .from('meetings')
    .select('id, date, recording_url, notes, is_active, created_at, goals(id, title, description, display_order, source)')
    .eq('kid_id', kid.id)
    .order('date', { ascending: false })
    .limit(20);

  const list = (meetings ?? []) as MeetingLite[];
  const active = list.find((m) => m.is_active);
  const history = list.filter((m) => !m.is_active);

  type DayCell = { date: string; total: number; done: number };
  let grid: DayCell[] = [];
  if (active && active.goals && active.goals.length > 0) {
    const startDate = new Date(active.date);
    const todayDate = new Date();
    const days: string[] = [];
    const cur = new Date(startDate);
    while (cur <= todayDate) {
      days.push(cur.toISOString().slice(0, 10));
      cur.setDate(cur.getDate() + 1);
    }
    const { data: completions } = await supabase
      .from('checkins')
      .select('date, completed')
      .eq('kid_id', kid.id)
      .in('date', days)
      .eq('completed', true);
    const counts = new Map<string, number>();
    for (const c of completions ?? []) {
      counts.set(c.date as string, (counts.get(c.date as string) ?? 0) + 1);
    }
    grid = days.map((d) => ({
      date: d,
      total: active.goals!.length,
      done: counts.get(d) ?? 0,
    }));
  }

  // Consequences across this kid's active-meeting goals.
  let consequences: Consequence[] = [];
  if (active && active.goals && active.goals.length > 0) {
    const goalIds = active.goals.map((g) => g.id);
    const { data: rows } = await supabase
      .from('goal_consequences')
      .select('id, goal_id, body, proposed_by_kid, approved_by_parent, overridden, override_reason')
      .in('goal_id', goalIds);
    const goalTitleById = new Map(active.goals.map((g) => [g.id, g.title]));
    consequences = ((rows ?? []) as Consequence[]).map((c) => ({
      ...c,
      goal_title: goalTitleById.get(c.goal_id) ?? null,
    }));
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 pb-12 sm:px-6">
      <ParentHeader
        title={kid.name}
        backHref="/parent"
        right={<FreezeToggle kidId={kid.id} kidName={kid.name} frozen={kid.frozen} />}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <NewMeetingModal kidId={kid.id} kidName={kid.name} />
        <AdHocTaskButton kidId={kid.id} kidName={kid.name} />
      </div>

      {!active && history.length === 0 && (
        <Card>
          <p className="font-display text-card mb-2">No meetings yet</p>
          <p className="ink-soft text-sm">
            Start your first family meeting with {kid.name}. Decide what {kid.name} will work on
            until your next meeting — those become the daily goals on {kid.name}&apos;s tablet.
          </p>
        </Card>
      )}

      {active && (
        <Card className="mb-6 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-card">Active meeting</h2>
            <span className="bg-gold-soft text-ink rounded-full px-2 py-0.5 text-xs">
              {fmtDate(active.date)}
            </span>
          </div>
          {active.notes && <p className="ink-soft text-sm whitespace-pre-wrap">{active.notes}</p>}
          {active.recording_url && (
            <a
              href={active.recording_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent inline-block text-sm hover:underline"
            >
              Recording →
            </a>
          )}

          <ul className="space-y-2">
            {(active.goals ?? [])
              .sort((a, b) => a.display_order - b.display_order)
              .map((g) => (
                <li key={g.id} className="border-line border-b pb-2 last:border-b-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-base">{g.title}</p>
                    {g.source === 'ad_hoc' && (
                      <span className="ink-soft text-[10px] uppercase tracking-wide">ad-hoc</span>
                    )}
                  </div>
                  {g.description && <p className="ink-soft text-sm">{g.description}</p>}
                </li>
              ))}
          </ul>

          {grid.length > 0 && (
            <div>
              <p className="ink-soft mb-2 text-xs uppercase tracking-wide">Completion so far</p>
              <div className="flex flex-wrap gap-1">
                {grid.map((cell) => {
                  const ratio = cell.total > 0 ? cell.done / cell.total : 0;
                  const cls =
                    ratio >= 1 ? 'bg-gold' : ratio > 0 ? 'bg-gold-soft' : 'bg-line';
                  return (
                    <span
                      key={cell.date}
                      title={`${cell.date}: ${cell.done}/${cell.total}`}
                      className={`h-5 w-5 rounded-sm ${cls}`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      )}

      {consequences.length > 0 && (
        <Card className="mb-6">
          <h2 className="font-display text-card mb-3">Consequences</h2>
          <ConsequenceList consequences={consequences} />
        </Card>
      )}

      {history.length > 0 && (
        <section>
          <h2 className="font-display text-card mb-3">History</h2>
          <div className="space-y-3">
            {history.map((m) => (
              <Card key={m.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-base">{fmtDate(m.date)}</h3>
                  <span className="ink-soft text-xs">{m.goals?.length ?? 0} goals</span>
                </div>
                {m.notes && <p className="ink-soft mt-1 text-sm">{m.notes}</p>}
                <ul className="mt-2 space-y-0.5 text-sm">
                  {(m.goals ?? [])
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((g) => (
                      <li key={g.id} className="ink-soft">
                        • {g.title}
                      </li>
                    ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
