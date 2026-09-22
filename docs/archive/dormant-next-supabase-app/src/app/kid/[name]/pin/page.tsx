import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n';
import { PinForm } from './PinForm';

const KID_DISPLAY: Record<string, { he: string; en: string }> = {
  menachem: { he: 'מנחם', en: 'Menachem' },
  esther: { he: 'אסתר', en: 'Esther' },
};

export default function KidPinPage({ params }: { params: { name: string } }) {
  const locale = (cookies().get('locale')?.value as Locale) ?? DEFAULT_LOCALE;
  const display = KID_DISPLAY[params.name.toLowerCase()];
  if (!display) {
    return (
      <main className="mx-auto max-w-md p-8">
        <p className="ink-soft">Unknown kid.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-10">
      <h1 className="font-display text-hero mb-2">{display[locale]}</h1>
      <p className="ink-soft mb-8">{t('enterPin', locale)}</p>
      <PinForm kidName={params.name} locale={locale} />
    </main>
  );
}
