'use client';

// PWA install prompt — shows a calm bottom banner on first parent visit if
// the app isn't already installed. Two paths:
//   Android/Chrome → uses the `beforeinstallprompt` event for one-tap install.
//   iOS Safari      → that event doesn't fire; we show a short instruction
//                     sheet (Share → Add to Home Screen).
//
// Dismissal is persisted in localStorage so the banner doesn't nag.

import { useEffect, useState } from 'react';
import { Share, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';

const STORAGE_KEY = 'family-acc-install-dismissed';

type DeferredPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<DeferredPrompt | null>(null);
  const [iosSheet, setIosSheet] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY) === '1') return;

    // Already installed (PWA display-mode).
    const installed =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari standalone flag
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (installed) return;

    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    setIsIOS(iOS);

    if (iOS) {
      setVisible(true);
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as DeferredPrompt);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  async function install() {
    if (isIOS) {
      setIosSheet(true);
      return;
    }
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[env(safe-area-inset-bottom,16px)] pt-3">
        <div className="surface mx-auto flex max-w-md items-center gap-3 rounded-card px-4 py-3 shadow-lg">
          <div className="flex-1 min-w-0">
            <p className="font-display text-card leading-tight">Install on this phone</p>
            <p className="ink-soft text-sm">One tap. Works offline. No app store.</p>
          </div>
          <Button onClick={install} size="md">
            Install
          </Button>
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="ink-soft -mx-1 p-2 hover:text-ink"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <Sheet open={iosSheet} onClose={() => setIosSheet(false)} title="Install on iPhone">
        <ol className="space-y-4 text-base">
          <li className="flex items-start gap-3">
            <span className="bg-gold-soft text-ink rounded-full w-7 h-7 inline-flex items-center justify-center font-display text-sm shrink-0">
              1
            </span>
            <span>
              Tap the <Share size={16} strokeWidth={1.75} className="inline -mt-1" /> Share
              button in Safari&apos;s toolbar.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-gold-soft text-ink rounded-full w-7 h-7 inline-flex items-center justify-center font-display text-sm shrink-0">
              2
            </span>
            <span>
              Scroll and tap{' '}
              <span className="inline-flex items-center gap-1">
                <Plus size={16} strokeWidth={1.75} /> Add to Home Screen
              </span>
              .
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="bg-gold-soft text-ink rounded-full w-7 h-7 inline-flex items-center justify-center font-display text-sm shrink-0">
              3
            </span>
            <span>Tap Add. The app opens from your home screen, full-screen, just like a native app.</span>
          </li>
        </ol>
        <div className="mt-6 flex gap-2">
          <Button onClick={() => { setIosSheet(false); dismiss(); }} size="lg">
            Got it
          </Button>
        </div>
      </Sheet>
    </>
  );
}
