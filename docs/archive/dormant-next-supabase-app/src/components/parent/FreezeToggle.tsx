'use client';

// FreezeToggle — pause / resume a kid's dashboard. Used in the parent
// per-kid header. Confirms before freezing (rare action, easy to misclick),
// no confirm to unfreeze (always safe).

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Play } from 'lucide-react';

type Props = {
  kidId: string;
  kidName: string;
  frozen: boolean;
};

export function FreezeToggle({ kidId, kidName, frozen }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = !frozen;
    if (next && !window.confirm(`Pause ${kidName}'s dashboard? They will see "Paused — talk to Tatty" until you unpause.`)) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/users/freeze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kidId, frozen: next }),
      });
      if (res.ok) startTransition(() => router.refresh());
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`border-line inline-flex items-center gap-1.5 rounded-card border px-3 py-1.5 text-sm transition-colors disabled:opacity-50 ${
        frozen ? 'bg-rose/10 text-rose' : 'hover:bg-line/40'
      }`}
    >
      {frozen ? (
        <>
          <Play size={14} strokeWidth={1.75} />
          Resume
        </>
      ) : (
        <>
          <Lock size={14} strokeWidth={1.75} />
          Pause
        </>
      )}
    </button>
  );
}
