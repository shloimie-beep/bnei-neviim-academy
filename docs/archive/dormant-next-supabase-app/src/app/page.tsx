import Link from 'next/link';
import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n';
import { LocaleToggle } from '@/components/locale/LocaleToggle';

const KIDS = [
  { slug: 'menachem', display: { he: 'מנחם', en: 'Menachem' } },
  { slug: 'esther', display: { he: 'אסתר', en: 'Esther' } },
];

export default function Landing() {
  const locale = (cookies().get('locale')?.value as Locale) ?? DEFAULT_LOCALE;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-10">
      <header className="mb-12 flex items-start justify-between">
        <h1 className="font-display text-section">
          {t('appName', locale)}
        </h1>
        <LocaleToggle current={locale} />
      </header>

      <section className="flex flex-1 flex-col gap-4">
        {KIDS.map((kid) => (
          <Link
            key={kid.slug}
            href={`/kid/${kid.slug}/pin`}
            className="surface rounded-card px-6 py-10 text-center transition-colors hover:border-accent/40 active:bg-gold-soft/40"
          >
            <span className="font-display text-hero">
              {kid.display[locale]}
            </span>
          </Link>
        ))}
      </section>

      <footer className="mt-12 flex justify-center">
        <Link
          href="/parent/login"
          className="ink-soft inline-flex items-center gap-2 text-sm underline-offset-4 hover:underline"
        >
          {t('parents', locale)}
        </Link>
      </footer>
    </main>
  );
}
