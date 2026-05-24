// Parent home — mobile-first, both kids stacked on phone. Notes wall at
// top, then each kid card with progress + inline pending approvals + ad-hoc
// task button. PWA install prompt floats at bottom on first visit. First-
// run parents are bounced to /parent/onboarding.

import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getParentFromSupabase } from '@/lib/auth/parent-session';

import { Card } from '@/components/ui/Card';
import { ParentHeader } from '@/components/parent/Header';
import { PendingCheckinRow } from '@/components/parent/PendingCheckinRow';
import { ApproveAllButton } from '@/components/parent/ApproveAllButton';
import { AdHocTaskButton } from '@/components/parent/AdHocTaskButton';
import { NotesWall } from '@/components/parent/NotesWall';
import { InstallPrompt } from '@/components/install/InstallPrompt';
import { ONBOARDING_COOKIE } from '@/lib/onboarding';

export const dynamic = 'force-dynamic';

type Checkin = {
  id: string;
  goal_id: string;
  proof_note: string | null;
  proof_photo_path: string | null;
  approved: boolean | null;
  completed: boolean;
  goals: { title: string } | { title: string }[] | null;
};

function goalTitle(c: Checkin): string {
  if (!c.goals) return 'Goal';
  return Array.isArray(c.goals) ? c.goals[0]?.title ?? 'Goal' : c.goals.title;
}

export default async function ParentHome() {
  const parent = await getParentFromSupabase();
  if (!parent) redirect('/parent/login');

  const onboarded = cookies().get(ONBOARDING_COOKIE)?.value === '1';
  if (!onboarded) redirect('/parent/onboarding');

  const supabase = getSupabaseAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: kids }, { data: progress }, { data: notes }] = await Promise.all([
    supabase.from('users').select('id, name, frozen').eq('role', 'kid').order('name'),
    supabase.from('v_today_progress').select('*'),
    supabase
      .from('parent_notes')
      .select('id, author_name, body, visible_to_kids, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  const cards = await Promise.all(
    (kids ?? []).map(async (kid) => {
      const [{ data: streakData }, { data: pending }, { data: recent }] = await Promise.all([
        supabase.rpc('get_streak', { p_kid_id: kid.id }),
        supabase
          .from('checkins')
          .select('id, goal_id, proof_note, proof_photo_path, approved, completed, goals(title)')
          .eq('kid_id', kid.id)
          .eq('date', today)
          .is('approved', null)
          .eq('completed', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('checkins')
          .select('id, goal_id, proof_note, proof_photo_path, approved, completed, goals(title)')
          .eq('kid_id', kid.id)
          .eq('date', today)
          .not('approved', 'is', null)
          .order('created_at', { ascending: false })
          .limit(3),
      ]);
      const streak = typeof streakData === 'number' ? streakData : 0;
      const p = progress?.find((row: { kid_id: string }) => row.kid_id === kid.id);
      return {
        kid,
        streak,
        progress: p,
        pending: (pending ?? []) as Checkin[],
        recent: (recent ?? []) as Checkin[],
      };
    })
  );

  const totalPending = cards.reduce((s, c) => s + c.pending.length, 0);

  return (
    <>
      <main className="mx-auto min-h-screen max-w-3xl px-4 pb-32 sm:px-6">
        <ParentHeader
          title="Family"
          right={
            <Link href="/parent/login?signout=1" className="ink-soft text-sm hover:text-ink">
              {parent.email.split('@')[0]}
            </Link>
          }
        />

        <div className="mb-4">
          <NotesWall initial={(notes ?? []) as any} />
        </div>

        {cards.length === 0 && (
          <Card className="text-center">
            <p className="ink-soft">No kids configured yet.</p>
          </Card>
        )}

        {totalPending > 0 && (
          <p className="ink-soft mb-3 text-sm">
            {totalPending} check-{totalPending === 1 ? 'in' : 'ins'} waiting for you.
          </p>
        )}

        <section className="space-y-4 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
          {cards.map(({ kid, streak, progress, pending, recent }) => {
            const completed = Number((progress as { completed_goals?: number })?.completed_goals ?? 0);
            const total = Number((progress as { total_goals?: number })?.total_goals ?? 0);
            return (
              <Card key={kid.id} className="space-y-4">
                <div className="flex items-baseline justify-between">
                  <Link
                    href={`/parent/${encodeURIComponent(kid.name.toLowerCase())}`}
                    className="font-display text-card hover:text-accent"
                  >
                    {kid.name}
                  </Link>
                  {kid.frozen && (
                    <span className="bg-rose/10 text-rose rounded-full px-2 py-0.5 text-xs">
                      Paused
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-6">
                  <div>
                    <div className="font-display text-section">
                      {completed}
                      <span className="ink-soft">/{total}</span>
                    </div>
                    <p className="ink-soft text-xs">goals today</p>
                  </div>
                  <div>
                    <div className="font-display text-section">{streak}</div>
                    <p className="ink-soft text-xs">day streak</p>
                  </div>
                </div>

                {pending.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-baseline justify-between">
                      <p className="text-sm font-medium">Pending</p>
                      <ApproveAllButton checkinIds={pending.map((c) => c.id)} />
                    </div>
                    <ul>
                      {pending.map((c) => (
                        <PendingCheckinRow
                          key={c.id}
                          checkinId={c.id}
                          goalTitle={goalTitle(c)}
                          proofNote={c.proof_note}
                          proofPhotoPath={c.proof_photo_path}
                        />
                      ))}
                    </ul>
                  </div>
                )}

                {pending.length === 0 && recent.length === 0 && total > 0 && (
                  <p className="ink-soft text-sm">No check-ins yet today.</p>
                )}

                {recent.length > 0 && (
                  <div className="border-line border-t pt-3">
                    <p className="ink-soft mb-2 text-xs uppercase tracking-wide">Recent</p>
                    <ul className="space-y-1">
                      {recent.map((c) => (
                        <li key={c.id} className="text-sm">
                          <span>{goalTitle(c)}</span>
                          {c.approved === true && <span className="text-gold ms-2">✓</span>}
                          {c.approved === false && <span className="text-rose ms-2">rejected</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-line flex items-center justify-between border-t pt-3">
                  <Link
                    href={`/parent/${encodeURIComponent(kid.name.toLowerCase())}`}
                    className="text-accent text-sm hover:underline"
                  >
                    Open {kid.name} →
                  </Link>
                  <AdHocTaskButton kidId={kid.id} kidName={kid.name} />
                </div>
              </Card>
            );
          })}
        </section>
      </main>
      <InstallPrompt />
    </>
  );
}
