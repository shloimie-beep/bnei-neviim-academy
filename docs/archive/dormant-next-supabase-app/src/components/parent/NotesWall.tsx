'use client';

// Shared parent + kid wall. Both parents post; both they and the kids see.
// Kept deliberately spare — short notes only, no rich text, no replies.

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type Note = {
  id: string;
  author_name: string;
  body: string;
  visible_to_kids: boolean;
  created_at: string;
};

export function NotesWall({ initial }: { initial: Note[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [notes, setNotes] = useState<Note[]>(initial);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post() {
    const body = draft.trim();
    if (!body) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch('/api/parent-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, visibleToKids: true }),
      });
      const out = await res.json();
      if (!res.ok || !out.ok) {
        setError(out.error ?? 'Could not post');
        return;
      }
      setNotes((prev) => [out.note as Note, ...prev]);
      setDraft('');
      startTransition(() => router.refresh());
    } catch {
      setError('Network error');
    } finally {
      setPosting(false);
    }
  }

  async function remove(id: string) {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    await fetch(`/api/parent-notes/${id}`, { method: 'DELETE' });
    startTransition(() => router.refresh());
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-card">Notes</h2>
        <span className="ink-soft text-xs">Both parents post. Kids see.</span>
      </div>

      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              post();
            }
          }}
          placeholder="Leave a note for the kids or your spouse…"
          maxLength={1000}
          className="border-line bg-surface focus:border-accent flex-1 rounded-card border px-3 py-2 outline-none"
        />
        <Button onClick={post} disabled={posting || !draft.trim()}>
          <Send size={16} strokeWidth={1.75} />
        </Button>
      </div>
      {error && <p className="text-rose text-sm">{error}</p>}

      {notes.length === 0 && <p className="ink-soft text-sm">No notes yet.</p>}

      {notes.length > 0 && (
        <ul className="space-y-2">
          {notes.map((n) => (
            <li
              key={n.id}
              className="border-line group flex items-start gap-3 border-t pt-2 first:border-t-0 first:pt-0"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">{n.body}</p>
                <p className="ink-soft mt-0.5 text-xs">
                  {n.author_name} · {new Date(n.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                onClick={() => remove(n.id)}
                aria-label="Delete note"
                className="ink-soft opacity-0 transition-opacity hover:text-rose group-hover:opacity-100"
              >
                <Trash2 size={14} strokeWidth={1.75} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
