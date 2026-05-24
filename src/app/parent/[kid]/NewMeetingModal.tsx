'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';

type GoalDraft = { title: string; description: string };

export function NewMeetingModal({ kidId, kidName }: { kidId: string; kidName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [recordingUrl, setRecordingUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [goals, setGoals] = useState<GoalDraft[]>([{ title: '', description: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setDate(new Date().toISOString().slice(0, 10));
    setRecordingUrl('');
    setNotes('');
    setGoals([{ title: '', description: '' }]);
    setError(null);
  }

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const cleaned = goals
        .map((g) => ({ title: g.title.trim(), description: g.description.trim() || null }))
        .filter((g) => g.title.length > 0);
      if (cleaned.length === 0) {
        setError('Add at least one goal.');
        return;
      }
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kidId,
          date,
          recordingUrl: recordingUrl.trim() || null,
          notes: notes.trim() || null,
          goals: cleaned,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setError(body.error ?? 'Save failed');
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus size={18} strokeWidth={1.75} className="inline me-1" />
        Start new meeting
      </Button>

      <Sheet open={open} onClose={() => setOpen(false)} title={`New meeting — ${kidName}`}>
        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="ink-soft text-sm">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-card border border-line bg-surface px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="ink-soft text-sm">Recording URL (optional)</span>
            <input
              type="url"
              value={recordingUrl}
              onChange={(e) => setRecordingUrl(e.target.value)}
              placeholder="https://..."
              className="mt-1 w-full rounded-card border border-line bg-surface px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="ink-soft text-sm">Notes (optional)</span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-card border border-line bg-surface px-3 py-2"
            />
          </label>

          <div>
            <span className="ink-soft text-sm">Goals</span>
            <div className="mt-2 flex flex-col gap-2">
              {goals.map((g, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={g.title}
                    onChange={(e) =>
                      setGoals((prev) => prev.map((x, idx) => (idx === i ? { ...x, title: e.target.value } : x)))
                    }
                    placeholder="Goal title"
                    className="flex-1 rounded-card border border-line bg-surface px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setGoals((prev) => prev.filter((_, idx) => idx !== i))}
                    className="ink-soft hover:text-rose"
                    aria-label="Remove goal"
                  >
                    <X size={18} strokeWidth={1.75} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setGoals((prev) => [...prev, { title: '', description: '' }])}
                className="ink-soft inline-flex items-center gap-1 self-start text-sm hover:text-ink"
              >
                <Plus size={14} strokeWidth={1.75} /> Add goal
              </button>
            </div>
          </div>

          {error && <p className="text-rose text-sm">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button onClick={submit} disabled={submitting} size="lg">
              {submitting ? 'Saving…' : 'Save meeting'}
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
