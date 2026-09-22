'use client';

import { Languages } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Locale } from '@/lib/i18n';

type Props = { current: Locale };

export function LocaleToggle({ current }: Props) {
  const router = useRouter();
  const next: Locale = current === 'he' ? 'en' : 'he';

  const flip = () => {
    document.cookie = `locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={flip}
      className="inline-flex items-center gap-2 rounded-full bg-surface border border-line px-3 py-1.5 text-sm text-ink-soft hover:text-ink hover:border-ink/30 transition-colors"
      aria-label={`Switch to ${next === 'he' ? 'Hebrew' : 'English'}`}
    >
      <Languages size={16} strokeWidth={1.75} />
      <span className="font-medium">{next === 'he' ? 'עברית' : 'EN'}</span>
    </button>
  );
}
