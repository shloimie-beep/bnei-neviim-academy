'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { t, type Locale } from '@/lib/i18n';

type Props = { kidName: string; locale: Locale };

export function PinForm({ kidName, locale }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function submit(value: string) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/kid-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: kidName, pin: value }),
      });
      const body = await res.json();
      if (res.ok && body.ok) {
        router.push(body.redirect ?? `/kid/${kidName}`);
        router.refresh();
      } else if (res.status === 429) {
        setError('Too many attempts. Try again in a few minutes.');
        setPin('');
      } else {
        setError(t('wrongPin', locale));
        setPin('');
      }
    } catch {
      setError(t('loadError', locale));
      setPin('');
    } finally {
      setSubmitting(false);
    }
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, '').slice(0, 4);
    setPin(v);
    if (v.length === 4) submit(v);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        autoComplete="off"
        pattern="\d*"
        maxLength={4}
        value={pin}
        onChange={onChange}
        disabled={submitting}
        className="w-48 rounded-card border border-line bg-surface px-5 py-4 text-center text-3xl tracking-[0.6em] outline-none focus:border-accent disabled:opacity-50"
        aria-label={t('enterPin', locale)}
      />
      {error && <p className="text-rose text-sm">{error}</p>}
    </div>
  );
}
