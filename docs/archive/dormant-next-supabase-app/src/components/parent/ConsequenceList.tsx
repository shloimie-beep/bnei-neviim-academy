'use client';

// Per-kid view: kid-proposed consequences awaiting approval, plus approved
// consequences (with an Override button). One parent suffices to override.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X, Edit3 } from 'lucide-react';

import { Button } from '@/components/ui/Button';

export type Consequence = {
  id: string;
  goal_id: string;
  body: string;
  proposed_by_kid: boolean;
  approved_by_parent: boolean;
  overridden: boolean;
  override_reason: string | null;
  goal_title?: string | null;
};

type Props = { consequences: Consequence[] };

export function ConsequenceList({ consequences }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState('');

  if (consequences.length === 0) return null;

  const pending = consequences.filter((c) => !c.approved_by_parent && !c.overridden);
  const active = consequences.filter((c) => c.approved_by_parent && !c.overridden);
  const past = consequences.filter((c) => c.overridden);

  async function approve(id: string) {
    setBusyId(id);
    try {
      await fetch(`/api/consequences/${id}/approve`, { method: 'POST' });
      startTransition(() => router.refresh());
    } finally {
      setBusyId(null);
    }
  }

  async function override(id: string) {
    const reason = overrideReason.trim();
    if (!reason) return;
    setBusyId(id);
    try {
      await fetch(`/api/consequences/${id}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      setOverrideId(null);
      setOverrideReason('');
      startTransition(() => router.refresh());
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="space-y-3">
      {pending.length > 0 && (
        <div>
          <h3 className="font-display mb-2 text-base">Awaiting your okay</h3>
          <ul className="space-y-2">
            {pending.map((c) => (
              <li key={c.id} className="border-line flex items-start gap-3 border-b pb-2 last:border-b-0">
                <div className="min-w-0 flex-1">
                  {c.goal_title && (
                    <p className="ink-soft text-xs uppercase tracking-wide">{c.goal_title}</p>
                  )}
                  <p>{c.body}</p>
                </div>
                <button
                  onClick={() => approve(c.id)}
                  disabled={busyId === c.id}
                  aria-label="Approve consequence"
                  className="bg-gold text-ink inline-flex h-9 w-9 items-center justify-center rounded-full disabled:opacity-50"
                >
                  <Check size={16} strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {active.length > 0 && (
        <div>
          <h3 className="font-display mb-2 text-base">Locked-in consequences</h3>
          <ul className="space-y-2">
            {active.map((c) => (
              <li key={c.id} className="border-line border-b pb-2 last:border-b-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {c.goal_title && (
                      <p className="ink-soft text-xs uppercase tracking-wide">{c.goal_title}</p>
                    )}
                    <p>{c.body}</p>
                  </div>
                  {overrideId === c.id ? null : (
                    <button
                      onClick={() => {
                        setOverrideId(c.id);
                        setOverrideReason('');
                      }}
                      className="ink-soft text-xs hover:text-ink inline-flex items-center gap-1"
                    >
                      <Edit3 size={12} strokeWidth={1.75} /> Override
                    </button>
                  )}
                </div>
                {overrideId === c.id && (
                  <div className="mt-2 flex gap-2">
                    <input
                      autoFocus
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="Why are you overriding this?"
                      className="border-line bg-surface focus:border-accent flex-1 rounded-card border px-3 py-2 text-sm outline-none"
                    />
                    <Button
                      onClick={() => override(c.id)}
                      disabled={busyId === c.id || !overrideReason.trim()}
                    >
                      Save
                    </Button>
                    <button
                      onClick={() => setOverrideId(null)}
                      aria-label="Cancel override"
                      className="ink-soft"
                    >
                      <X size={16} strokeWidth={1.75} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <h3 className="font-display mb-2 text-base ink-soft">Overridden</h3>
          <ul className="space-y-1 text-sm">
            {past.map((c) => (
              <li key={c.id} className="ink-soft">
                <span className="line-through">{c.body}</span>
                {c.override_reason && <span> — {c.override_reason}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
