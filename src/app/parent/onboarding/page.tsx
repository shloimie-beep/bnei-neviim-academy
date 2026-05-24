// First-run parent onboarding. Bounces to /parent/login if not signed in.
// Reads the kid list once on the server so the wizard always has the
// canonical names from the DB (not hard-coded). Wizard state lives in
// the client component.

import { redirect } from 'next/navigation';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getParentFromSupabase } from '@/lib/auth/parent-session';

import { OnboardingWizard } from './OnboardingWizard';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const parent = await getParentFromSupabase();
  if (!parent) redirect('/parent/login');

  const supabase = getSupabaseAdminClient();
  const { data: kids } = await supabase
    .from('users')
    .select('id, name')
    .eq('role', 'kid')
    .order('name');

  return (
    <main className="mx-auto min-h-screen max-w-md px-4 py-8 sm:py-12">
      <OnboardingWizard
        parentEmail={parent.email}
        kids={(kids ?? []).map((k) => ({ id: k.id as string, name: k.name as string }))}
      />
    </main>
  );
}
