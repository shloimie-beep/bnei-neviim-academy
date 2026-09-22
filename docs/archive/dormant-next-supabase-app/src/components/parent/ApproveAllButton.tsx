'use client';

// "Approve all pending" quick action on a kid card.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

type Props = { checkinIds: string[] };

export function ApproveAllButton({ checkinIds }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (checkinIds.length === 0) return null;

  async function approveAll() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/checkins/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkinIds, decision: 'approve' }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setError(body.error ?? 'Save failed');
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError('Network error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={approveAll}
        disabled={busy}
        className="bg-gold-soft hover:bg-gold/30 text-ink inline-flex items-center gap-1 rounded-card px-3 py-1.5 text-sm disabled:opacity-50"
      >
        <Check size={14} strokeWidth={1.75} />
        {busy ? 'Approving…' : `Approve all (${checkinIds.length})`}
      </button>
      {error && <p className="text-rose text-xs">{error}</p>}
    </>
  );
}
