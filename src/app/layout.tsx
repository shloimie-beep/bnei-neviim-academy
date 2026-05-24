import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { fontDisplay, fontBody } from '@/lib/fonts';
import { DEFAULT_LOCALE, type Locale, dirFor } from '@/lib/i18n';
import './globals.css';

export const metadata: Metadata = {
  title: 'Family Accountability',
  description: 'A small, warm tracker for the Dratler family.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon-192.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#FAF6EE',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (cookies().get('locale')?.value as Locale) ?? DEFAULT_LOCALE;
  const dir = dirFor(locale);

  return (
    <html lang={locale} dir={dir} className={`${fontDisplay.variable} ${fontBody.variable}`}>
      <body className="min-h-screen bg-bg text-ink font-body antialiased">
        {children}
      </body>
    </html>
  );
}
