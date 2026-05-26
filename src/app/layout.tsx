import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { fontDisplay, fontBody } from '@/lib/fonts';
import { DEFAULT_LOCALE, type Locale, dirFor } from '@/lib/i18n';
import './globals.css';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'BNA Operations',
  description: 'Simple task control for the academy',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon-192.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#1A1A1A',
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
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then((registration) => {
                    console.log('SW registered:', registration.scope);
                  })
                  .catch((error) => {
                    console.log('SW registration failed:', error);
                  });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
