'use client';

// Drop an ad-hoc task on a kid without waiting for the next meeting.
// Title-only by default; expand for description / expiry if needed.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';

type Props = { kidId: string; kidName: string };

export function AdHocTaskButton({ kidId, kidName }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const t = title.trim();
    if (!t) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/ad-hoc-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kidId, title: t }),
      });
      const out = await res.json();
      if (!res.ok || !out.ok) {
        setError(
          out.error === 'no_active_meeting'
            ? 'Start a meeting first — ad-hoc tasks attach to the active meeting.'
            : out.error ?? 'Could not add'
        );
        return;
      }
      setTitle('');
      setOpen(false);
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
        onClick={() => setOpen(true)}
        className="border-line hover:bg-line/40 inline-flex items-center gap-1 rounded-card border px-3 py-1.5 text-sm"
      >
        <Plus size={14} strokeWidth={1.75} /> Task
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={`Drop a task on ${kidName}`}>
        <div className="space-y-3">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Take the trash out before 5"
            maxLength={200}
            className="border-line bg-surface focus:border-accent w-full rounded-card border px-4 py-3 outline-none"
          />
          {error && <p className="text-rose text-sm">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={submit} size="lg" disabled={busy || !title.trim()}>
              {busy ? 'Adding…' : `Add to ${kidName}`}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
}
