'use client';

// PendingCheckinRow — one line per pending check-in on the parent dashboard
// with inline approve / reject. Optimistic update: hides immediately on
// click; if the request fails the row reappears with an error tag.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Image as ImageIcon } from 'lucide-react';

type Props = {
  checkinId: string;
  goalTitle: string;
  proofNote: string | null;
  proofPhotoPath: string | null;
};

export function PendingCheckinRow({ checkinId, goalTitle, proofNote, proofPhotoPath }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(decision: 'approve' | 'reject') {
    setBusy(decision);
    setError(null);
    setHidden(true);
    try {
      const res = await fetch('/api/checkins/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkinIds: [checkinId], decision }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setHidden(false);
        setError(body.error ?? 'Save failed');
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setHidden(false);
      setError('Network error');
    } finally {
      setBusy(null);
    }
  }

  if (hidden) return null;

  return (
    <li className="border-line flex items-center gap-3 border-b py-3 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="text-base leading-tight font-medium">{goalTitle}</p>
        {proofNote && <p className="ink-soft mt-1 text-sm">{proofNote}</p>}
        {proofPhotoPath && (
          <p className="ink-soft mt-1 inline-flex items-center gap-1 text-xs">
            <ImageIcon size={12} strokeWidth={1.75} /> photo attached
          </p>
        )}
        {error && <p className="text-rose mt-1 text-xs">{error}</p>}
      </div>
      <button
        onClick={() => decide('reject')}
        disabled={!!busy}
        aria-label="Reject"
        className="border-line text-rose hover:bg-rose/10 inline-flex h-10 w-10 items-center justify-center rounded-full border disabled:opacity-50"
      >
        <X size={18} strokeWidth={1.75} />
      </button>
      <button
        onClick={() => decide('approve')}
        disabled={!!busy}
        aria-label="Approve"
        className="bg-gold text-ink hover:bg-gold-soft inline-flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-50"
      >
        <Check size={18} strokeWidth={1.75} />
      </button>
    </li>
  );
}
