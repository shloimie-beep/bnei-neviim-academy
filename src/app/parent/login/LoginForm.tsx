'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function LoginForm({
  initialError,
  sent: initialSent,
}: {
  initialError?: string;
  sent: boolean;
}) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(initialSent);
  const [error, setError] = useState<string | null>(initialError ?? null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/parent-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError('Something went wrong. Try again.');
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <p className="text-center text-ink">
        Check your email for the magic link.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col gap-3">
      <input
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="rounded-card border border-line bg-surface px-4 py-3 outline-none focus:border-accent"
      />
      {error && <p className="text-rose text-sm">{error}</p>}
      <Button type="submit" variant="primary" size="lg" disabled={submitting}>
        {submitting ? '…' : 'Send magic link'}
      </Button>
    </form>
  );
}
