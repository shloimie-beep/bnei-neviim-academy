'use client';

// Kid goal list — big buttons. Single tap on a goal card = immediate
// complete (optimistic update, POST in the background, no sheet). A small
// camera button on the right opens the proof sheet for an optional photo /
// note. Approved consequences show under each goal; if no consequence
// exists yet, kid can propose one in a single text field.

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Camera, MessageCircle, X } from 'lucide-react';
import { motion } from 'motion/react';

import { Button } from '@/components/ui/Button';
import { Sheet } from '@/components/ui/Sheet';
import { fireConfetti } from '@/components/ui/Confetti';
import { t, type Locale } from '@/lib/i18n';

type Goal = {
  id: string;
  title: string;
  description: string | null;
  display_order: number;
  source?: 'meeting' | 'ad_hoc';
};
type Checkin = {
  id: string;
  goal_id: string;
  completed: boolean;
  proof_note: string | null;
  proof_photo_path: string | null;
  approved: boolean | null;
  rejection_reason: string | null;
};
type Consequence = {
  id: string;
  goal_id: string;
  body: string;
  approved_by_parent: boolean;
  overridden: boolean;
};

type Props = {
  goals: Goal[];
  checkins: Checkin[];
  consequences: Consequence[];
  locale: Locale;
};

export function KidGoalList({ goals, checkins, consequences, locale }: Props) {
  const router = useRouter();
  const [optimistic, setOptimistic] = useState<Record<string, Checkin>>({});
  const [proofGoal, setProofGoal] = useState<string | null>(null);
  const [consequenceGoal, setConsequenceGoal] = useState<string | null>(null);
  const [confettiShown, setConfettiShown] = useState(false);

  const byGoal = useMemo(() => {
    const out: Record<string, Checkin | undefined> = {};
    for (const c of checkins) out[c.goal_id] = c;
    for (const [gid, c] of Object.entries(optimistic)) out[gid] = c;
    return out;
  }, [checkins, optimistic]);

  const consequenceByGoal = useMemo(() => {
    const out: Record<string, Consequence | undefined> = {};
    for (const c of consequences) if (!c.overridden) out[c.goal_id] = c;
    return out;
  }, [consequences]);

  const allDone = useMemo(() => {
    if (goals.length === 0) return false;
    return goals.every((g) => byGoal[g.id]?.completed === true);
  }, [goals, byGoal]);

  useEffect(() => {
    if (allDone && !confettiShown) {
      fireConfetti();
      setConfettiShown(true);
    }
  }, [allDone, confettiShown]);

  if (goals.length === 0) {
    return <p className="ink-soft text-center mt-12 text-lg">{t('noGoals', locale)}</p>;
  }

  async function toggle(goalId: string) {
    const existing = byGoal[goalId];
    if (existing?.completed) return; // can't uncheck in V1
    const tempId = `tmp-${goalId}`;
    setOptimistic((prev) => ({
      ...prev,
      [goalId]: {
        id: tempId,
        goal_id: goalId,
        completed: true,
        proof_note: existing?.proof_note ?? null,
        proof_photo_path: existing?.proof_photo_path ?? null,
        approved: null,
        rejection_reason: null,
      },
    }));
    try {
      await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId, completed: true }),
      });
      router.refresh();
    } catch {
      setOptimistic((prev) => {
        const n = { ...prev };
        delete n[goalId];
        return n;
      });
    }
  }

  return (
    <>
      <ul className="flex flex-col gap-4">
        {goals.map((g) => {
          const c = byGoal[g.id];
          const isChecked = c?.completed === true;
          const isRejected = c?.approved === false;
          const cq = consequenceByGoal[g.id];

          return (
            <li key={g.id}>
              <motion.button
                type="button"
                onClick={() => toggle(g.id)}
                whileTap={{ scale: 0.985 }}
                className={`group block w-full text-start rounded-card border p-5 transition-colors ${
                  isRejected
                    ? 'border-rose border-s-4 bg-surface'
                    : isChecked
                      ? 'border-gold/30 border-s-4 border-s-gold bg-gold-soft'
                      : 'border-line bg-surface hover:border-accent/30'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div
                      className="font-display leading-tight"
                      style={{ fontSize: '28px' }}
                    >
                      {g.title}
                    </div>
                    {g.description && (
                      <p className="ink-soft mt-1 text-base">{g.description}</p>
                    )}
                    {isRejected && c?.rejection_reason && (
                      <p className="text-rose mt-2 italic">{c.rejection_reason}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-full border-2 transition-colors ${
                        isChecked
                          ? 'border-gold bg-gold text-white'
                          : 'border-line group-hover:border-accent/40 bg-surface'
                      }`}
                      aria-label={isChecked ? 'Done' : 'Mark complete'}
                    >
                      <Check
                        size={28}
                        strokeWidth={2.25}
                        color={isChecked ? '#FFF' : '#E8E1D1'}
                      />
                    </span>
                  </div>
                </div>

                {(cq || c?.proof_note || c?.proof_photo_path) && (
                  <div className="border-line mt-3 border-t pt-3 space-y-1 text-sm">
                    {cq && (
                      <p className="ink-soft">
                        <span className="text-ink">If not done:</span> {cq.body}
                      </p>
                    )}
                    {c?.proof_note && (
                      <p className="ink-soft italic">“{c.proof_note}”</p>
                    )}
                    {c?.proof_photo_path && (
                      <p className="ink-soft text-xs">📷 photo attached</p>
                    )}
                  </div>
                )}
              </motion.button>

              <div className="ink-soft mt-2 flex gap-4 text-xs ps-1">
                <button
                  type="button"
                  onClick={() => setProofGoal(g.id)}
                  className="inline-flex items-center gap-1 hover:text-ink"
                >
                  <Camera size={14} strokeWidth={1.75} />
                  {c?.proof_photo_path ? 'change photo' : 'add photo'}
                </button>
                {!cq && (
                  <button
                    type="button"
                    onClick={() => setConsequenceGoal(g.id)}
                    className="inline-flex items-center gap-1 hover:text-ink"
                  >
                    <MessageCircle size={14} strokeWidth={1.75} />
                    add a consequence
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {allDone && (
        <p className="font-display text-section text-accent text-center mt-10">
          {t('allDone', locale)}
        </p>
      )}

      <ProofSheet
        open={proofGoal !== null}
        goalId={proofGoal}
        existing={proofGoal ? byGoal[proofGoal] : undefined}
        onClose={() => setProofGoal(null)}
        locale={locale}
        onSaved={() => {
          setProofGoal(null);
          router.refresh();
        }}
      />
      <ConsequenceSheet
        open={consequenceGoal !== null}
        goalId={consequenceGoal}
        onClose={() => setConsequenceGoal(null)}
        locale={locale}
        onSaved={() => {
          setConsequenceGoal(null);
          router.refresh();
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Proof sheet — add/change a photo or note on a checked-off goal.
// ---------------------------------------------------------------------------
function ProofSheet({
  open,
  goalId,
  existing,
  onClose,
  onSaved,
  locale,
}: {
  open: boolean;
  goalId: string | null;
  existing?: Checkin;
  onClose: () => void;
  onSaved: () => void;
  locale: Locale;
}) {
  const [note, setNote] = useState(existing?.proof_note ?? '');
  const [photoPath, setPhotoPath] = useState<string | undefined>(
    existing?.proof_photo_path ?? undefined,
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setNote(existing?.proof_note ?? '');
      setPhotoPath(existing?.proof_photo_path ?? undefined);
    }
  }, [open, existing]);

  async function pickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const init = await fetch('/api/proof-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });
      const initBody = await init.json();
      if (!init.ok || !initBody.ok) throw new Error('upload init failed');
      await fetch(initBody.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      setPhotoPath(initBody.path);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    if (!goalId) return;
    setSaving(true);
    try {
      await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalId,
          completed: true,
          proofNote: note.trim() || undefined,
          proofPhotoPath: photoPath,
        }),
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label className="block">
          <span className="ink-soft text-sm mb-1 block">{t('proofNote', locale)}</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="border-line bg-surface focus:border-accent w-full rounded-card border px-3 py-2 outline-none"
          />
        </label>

        <label className="inline-flex items-center gap-2 self-start cursor-pointer">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={pickPhoto}
            disabled={uploading}
          />
          <span className="surface rounded-card inline-flex items-center gap-2 px-4 py-2">
            <Camera size={18} strokeWidth={1.75} />
            {uploading ? '…' : t('uploadPhoto', locale)}
          </span>
        </label>

        {photoPath && <p className="ink-soft text-xs break-all">{photoPath}</p>}

        <div className="mt-2 flex gap-2">
          <Button onClick={save} size="lg" disabled={uploading || saving || !goalId}>
            <Check size={20} strokeWidth={1.75} className="inline me-2" />
            {saving ? '…' : t('checkOff', locale)}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            <X size={18} strokeWidth={1.75} />
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Consequence sheet — kid proposes a natural consequence for a goal.
// ---------------------------------------------------------------------------
function ConsequenceSheet({
  open,
  goalId,
  onClose,
  onSaved,
  locale,
}: {
  open: boolean;
  goalId: string | null;
  onClose: () => void;
  onSaved: () => void;
  locale: Locale;
}) {
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setBody('');
      setError(null);
    }
  }, [open]);

  async function save() {
    if (!goalId) return;
    const text = body.trim();
    if (!text) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/consequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId, body: text }),
      });
      const out = await res.json();
      if (!res.ok || !out.ok) {
        setError(out.error ?? 'Could not save');
        return;
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={locale === 'he' ? 'מה יקרה אם לא תעשה?' : 'What happens if you don’t?'}>
      <div className="flex flex-col gap-3">
        <p className="ink-soft text-sm leading-relaxed">
          {locale === 'he'
            ? 'תכתוב מה אתה מסכים שיקרה. אבא או אמא צריכים לאשר.'
            : 'Write what you agree should happen. Tatty or Mommy has to approve it before it counts.'}
        </p>
        <textarea
          autoFocus
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder={locale === 'he' ? 'בלי טאבלט שעה' : 'No tablet for an hour'}
          className="border-line bg-surface focus:border-accent w-full rounded-card border px-3 py-2 outline-none"
        />
        {error && <p className="text-rose text-sm">{error}</p>}
        <div className="mt-2 flex gap-2">
          <Button onClick={save} size="lg" disabled={saving || !body.trim()}>
            {saving ? '…' : locale === 'he' ? 'שלח לאישור' : 'Send for approval'}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {locale === 'he' ? 'ביטול' : 'Cancel'}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
