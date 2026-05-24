// Read-only display of recent parent notes on the kid's dashboard.

type Note = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

import type { Locale } from '@/lib/i18n';

export function KidNotesDisplay({ notes, locale }: { notes: Note[]; locale: Locale }) {
  if (notes.length === 0) return null;
  return (
    <section
      className="bg-gold-soft border-line rounded-card border p-4 mb-6"
      dir={locale === 'he' ? 'rtl' : 'ltr'}
    >
      <ul className="space-y-3">
        {notes.map((n) => (
          <li key={n.id} className="leading-snug">
            <p className="text-base">{n.body}</p>
            <p className="ink-soft mt-1 text-xs">{n.author_name}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
