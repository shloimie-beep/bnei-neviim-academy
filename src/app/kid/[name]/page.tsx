import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getKidFromCookies } from '@/lib/auth/kid-session';
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n';
import { LocaleToggle } from '@/components/locale/LocaleToggle';
import { StreakBadge } from '@/components/ui/StreakBadge';
import { KidNotesDisplay } from '@/components/kid/KidNotesDisplay';
import { KidGoalList } from './KidGoalList';

export const dynamic = 'force-dynamic';

export default async function KidDashboard({ params }: { params: { name: string } }) {
  const kid = getKidFromCookies();
  if (!kid || kid.kidName.toLowerCase() !== params.name.toLowerCase()) {
    redirect(`/kid/${params.name}/pin`);
  }

  const locale = (cookies().get('locale')?.value as Locale) ?? DEFAULT_LOCALE;
  const supabase = getSupabaseAdminClient();

  const { data: kidRow } = await supabase
    .from('users')
    .select('id, name, frozen, language')
    .eq('id', kid.kidId)
    .single();

  if (kidRow?.frozen) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-10">
        <h1 className="font-display text-hero mb-4">{kid.kidName}</h1>
        <p className="ink-soft text-center text-lg">{t('frozen', locale)}</p>
      </main>
    );
  }

  const { data: meeting } = await supabase
    .from('meetings')
    .select('id')
    .eq('kid_id', kid.kidId)
    .eq('is_active', true)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  const today = new Date().toISOString().slice(0, 10);

  const { data: goals } = meeting
    ? await supabase
        .from('goals')
        .select('id, title, description, display_order, source')
        .eq('meeting_id', meeting.id)
        .order('display_order', { ascending: true })
    : { data: [] };

  const goalIds = (goals ?? []).map((g) => (g as { id: string }).id);

  const [{ data: checkins }, { data: consequences }, { data: notes }] = await Promise.all([
    meeting
      ? supabase
          .from('checkins')
          .select('id, goal_id, completed, proof_note, proof_photo_path, approved, rejection_reason')
          .eq('kid_id', kid.kidId)
          .eq('date', today)
      : Promise.resolve({ data: [] }),
    goalIds.length > 0
      ? supabase
          .from('goal_consequences')
          .select('id, goal_id, body, approved_by_parent, overridden')
          .in('goal_id', goalIds)
          .eq('approved_by_parent', true)
      : Promise.resolve({ data: [] }),
    supabase
      .from('parent_notes')
      .select('id, author_name, body, created_at')
      .eq('visible_to_kids', true)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const { data: streakData } = await supabase.rpc('get_streak', { p_kid_id: kid.kidId });
  const streak = typeof streakData === 'number' ? streakData : 0;

  return (
    <main
      className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-8"
      style={{ maxWidth: '640px' }}
    >
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-display text-hero">{kid.kidName}</h1>
          <p className="ink-soft mt-1 text-base">
            {new Date().toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <LocaleToggle current={locale} />
          <StreakBadge count={streak} locale={locale} />
        </div>
      </header>

      <KidNotesDisplay notes={(notes ?? []) as any} locale={locale} />

      <KidGoalList
        goals={(goals ?? []) as any}
        checkins={(checkins ?? []) as any}
        consequences={(consequences ?? []) as any}
        locale={locale}
      />
    </main>
  );
}
