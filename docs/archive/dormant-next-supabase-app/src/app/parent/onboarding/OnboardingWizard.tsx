'use client';

// 5-step setup wizard. Mobile-first. Each step is a focused single-screen
// task — generous whitespace, one primary action, clear back/skip. Step
// state is local (resets on full reload) — completion is persisted via
// /api/onboarding/complete cookie at the end.
//
// Steps:
//   1. Welcome
//   2. Kid PINs       → generates bcrypt hashes for KID_PINS_HASH_* env vars
//   3. Install        → PWA "add to home screen" instructions
//   4. First meeting  → optional inline meeting setup for one kid
//   5. Spouse + bot   → magic link for Ahuva + BotFather pointer
// The final tap calls /api/onboarding/complete and routes to /parent.

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Copy, Heart, MessageCircle, Smartphone, KeyRound } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type Kid = { id: string; name: string };

type Props = {
  parentEmail: string;
  kids: Kid[];
};

const TOTAL_STEPS = 5;

export function OnboardingWizard({ parentEmail, kids }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // PIN state (step 2)
  const [pinsByKid, setPinsByKid] = useState<Record<string, string>>({});
  const [hashesByKid, setHashesByKid] = useState<Record<string, string>>({});
  const [hashing, setHashing] = useState(false);
  const [hashError, setHashError] = useState<string | null>(null);

  // First meeting state (step 4)
  const [meetingKidId, setMeetingKidId] = useState<string>(kids[0]?.id ?? '');
  const [meetingGoals, setMeetingGoals] = useState<string[]>(['', '', '']);
  const [meetingNotes, setMeetingNotes] = useState('');
  const [meetingSaving, setMeetingSaving] = useState(false);
  const [meetingError, setMeetingError] = useState<string | null>(null);
  const [meetingSaved, setMeetingSaved] = useState(false);

  // Spouse invite (step 5)
  const [spouseEmail, setSpouseEmail] = useState('');
  const [spouseSending, setSpouseSending] = useState(false);
  const [spouseSent, setSpouseSent] = useState(false);
  const [spouseError, setSpouseError] = useState<string | null>(null);

  // Finishing
  const [finishing, setFinishing] = useState(false);

  const allPinsValid = useMemo(
    () => kids.every((k) => /^\d{4}$/.test(pinsByKid[k.id] ?? '')),
    [kids, pinsByKid]
  );
  const allPinsHashed = useMemo(
    () => kids.length > 0 && kids.every((k) => !!hashesByKid[k.id]),
    [kids, hashesByKid]
  );

  async function generateHashes() {
    setHashing(true);
    setHashError(null);
    try {
      const out: Record<string, string> = {};
      for (const kid of kids) {
        const pin = pinsByKid[kid.id];
        const res = await fetch('/api/users/pin-hash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin }),
        });
        const body = await res.json();
        if (!res.ok || !body.ok) {
          setHashError(body.error ?? 'Failed to hash PIN');
          return;
        }
        out[kid.id] = body.hash;
      }
      setHashesByKid(out);
    } catch {
      setHashError('Network error');
    } finally {
      setHashing(false);
    }
  }

  async function saveFirstMeeting() {
    const cleaned = meetingGoals.map((g) => g.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      setMeetingError('Add at least one goal.');
      return;
    }
    setMeetingSaving(true);
    setMeetingError(null);
    try {
      const res = await fetch('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kidId: meetingKidId,
          notes: meetingNotes.trim() || null,
          goals: cleaned.map((title) => ({ title })),
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.ok) {
        setMeetingError(body.error ?? 'Save failed');
        return;
      }
      setMeetingSaved(true);
    } catch {
      setMeetingError('Network error');
    } finally {
      setMeetingSaving(false);
    }
  }

  async function sendSpouseLink() {
    setSpouseSending(true);
    setSpouseError(null);
    try {
      const res = await fetch('/api/auth/parent-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: spouseEmail.trim() }),
      });
      if (res.ok) setSpouseSent(true);
      else setSpouseError('Could not send. Is the email on the whitelist?');
    } catch {
      setSpouseError('Network error');
    } finally {
      setSpouseSending(false);
    }
  }

  async function finish() {
    setFinishing(true);
    try {
      await fetch('/api/onboarding/complete', { method: 'POST' });
      router.replace('/parent');
      router.refresh();
    } finally {
      setFinishing(false);
    }
  }

  return (
    <div>
      <ProgressBar current={step} total={TOTAL_STEPS} />

      {step === 1 && (
        <StepCard
          icon={<Heart size={28} strokeWidth={1.5} />}
          title="Welcome"
          subtitle={`Signed in as ${parentEmail}.`}
        >
          <p className="text-base leading-relaxed">
            This is your family&apos;s accountability app. Five minutes to set up —
            kids&apos; PINs, install on this phone, your first meeting, invite your spouse.
          </p>
          <p className="ink-soft mt-3 text-sm leading-relaxed">
            You can do this from your phone. Your spouse goes through the same on theirs.
            No paperwork, no shared logins.
          </p>
          <Continue onClick={() => setStep(2)} label="Start" />
        </StepCard>
      )}

      {step === 2 && (
        <StepCard
          icon={<KeyRound size={28} strokeWidth={1.5} />}
          title="Set each kid's PIN"
          subtitle="A 4-digit number they'll type to open their tablet."
        >
          <div className="space-y-4">
            {kids.map((kid) => (
              <label key={kid.id} className="block">
                <span className="font-display text-base">{kid.name}</span>
                <input
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  value={pinsByKid[kid.id] ?? ''}
                  onChange={(e) =>
                    setPinsByKid((p) => ({ ...p, [kid.id]: e.target.value.replace(/\D/g, '') }))
                  }
                  placeholder="••••"
                  className="border-line bg-surface focus:border-accent mt-1 w-full rounded-card border px-4 py-3 text-2xl tracking-[0.4em] outline-none"
                />
              </label>
            ))}
          </div>

          {!allPinsHashed && (
            <Button
              onClick={generateHashes}
              disabled={!allPinsValid || hashing}
              size="lg"
              className="mt-6 w-full"
            >
              {hashing ? 'Working…' : 'Generate setup codes'}
            </Button>
          )}
          {hashError && <p className="text-rose mt-2 text-sm">{hashError}</p>}

          {allPinsHashed && (
            <div className="mt-6 space-y-4">
              <p className="ink-soft text-sm">
                Paste these into Railway → Variables, then redeploy. (One-time, takes a minute.)
              </p>
              {kids.map((kid) => {
                const varName = `KID_PINS_HASH_${kid.name.toUpperCase()}`;
                const value = hashesByKid[kid.id];
                return (
                  <div key={kid.id}>
                    <p className="ink-soft mb-1 text-xs">{kid.name}</p>
                    <code className="bg-gold-soft border-line block break-all rounded-card border px-3 py-2 font-mono text-xs">
                      <span className="ink-soft">{varName}=</span>
                      {value}
                    </code>
                    <CopyButton text={`${varName}=${value}`} />
                  </div>
                );
              })}
              <Continue onClick={() => setStep(3)} label="Done copying" />
            </div>
          )}

          <SkipRow onSkip={() => setStep(3)} onBack={() => setStep(1)} />
        </StepCard>
      )}

      {step === 3 && (
        <StepCard
          icon={<Smartphone size={28} strokeWidth={1.5} />}
          title="Install on this phone"
          subtitle="Adds an icon to your home screen. Opens like a real app."
        >
          <div className="space-y-3 text-base">
            <Instruction n={1}>
              Tap the <strong>Share</strong> button in your browser&apos;s toolbar.
            </Instruction>
            <Instruction n={2}>
              Scroll and tap <strong>Add to Home Screen</strong>.
            </Instruction>
            <Instruction n={3}>
              Open the app from the new home-screen icon. Sign back in once — that&apos;s
              the last login for a long time.
            </Instruction>
          </div>
          <p className="ink-soft mt-4 text-sm">
            On Android Chrome, an Install banner usually appears at the bottom of the page instead.
          </p>
          <Continue onClick={() => setStep(4)} label="Installed" />
          <SkipRow onSkip={() => setStep(4)} onBack={() => setStep(2)} />
        </StepCard>
      )}

      {step === 4 && (
        <StepCard
          icon={<Check size={28} strokeWidth={1.5} />}
          title="Your first meeting"
          subtitle="Pick a kid and decide on 2–3 things they'll work on. These become their daily tasks."
        >
          {kids.length === 0 ? (
            <p className="ink-soft">No kids set up yet.</p>
          ) : meetingSaved ? (
            <div className="space-y-3">
              <p>Meeting saved. Goals are now live on {kids.find((k) => k.id === meetingKidId)?.name}&apos;s tablet.</p>
              <Continue onClick={() => setStep(5)} label="Next" />
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <label className="block">
                  <span className="ink-soft text-sm">Which kid</span>
                  <div className="mt-1 flex gap-2">
                    {kids.map((k) => (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => setMeetingKidId(k.id)}
                        className={`border-line rounded-card border px-4 py-2 text-base ${
                          meetingKidId === k.id ? 'bg-accent text-white' : 'hover:bg-line/40'
                        }`}
                      >
                        {k.name}
                      </button>
                    ))}
                  </div>
                </label>

                <div>
                  <span className="ink-soft text-sm">Goals (free-text, one per line)</span>
                  <div className="mt-1 space-y-2">
                    {meetingGoals.map((g, i) => (
                      <input
                        key={i}
                        value={g}
                        onChange={(e) =>
                          setMeetingGoals((prev) => prev.map((x, idx) => (idx === i ? e.target.value : x)))
                        }
                        placeholder={
                          i === 0
                            ? 'Learn Gemara 30 min'
                            : i === 1
                              ? 'Practice piano'
                              : 'Make bed'
                        }
                        className="border-line bg-surface focus:border-accent block w-full rounded-card border px-3 py-2 outline-none"
                      />
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="ink-soft text-sm">Notes (optional)</span>
                  <textarea
                    value={meetingNotes}
                    onChange={(e) => setMeetingNotes(e.target.value)}
                    rows={2}
                    placeholder="What you agreed on, what to revisit next meeting."
                    className="border-line bg-surface focus:border-accent mt-1 block w-full rounded-card border px-3 py-2 outline-none"
                  />
                </label>
              </div>

              {meetingError && <p className="text-rose mt-3 text-sm">{meetingError}</p>}

              <Button onClick={saveFirstMeeting} disabled={meetingSaving} size="lg" className="mt-6 w-full">
                {meetingSaving ? 'Saving…' : 'Save meeting'}
              </Button>
            </>
          )}
          <SkipRow onSkip={() => setStep(5)} onBack={() => setStep(3)} />
        </StepCard>
      )}

      {step === 5 && (
        <StepCard
          icon={<MessageCircle size={28} strokeWidth={1.5} />}
          title="Loop in your spouse"
          subtitle="They install the same app on their phone and get the same view."
        >
          <div className="space-y-3">
            <label className="block">
              <span className="ink-soft text-sm">Their email</span>
              <input
                type="email"
                value={spouseEmail}
                onChange={(e) => setSpouseEmail(e.target.value)}
                placeholder="ahuva@example.com"
                className="border-line bg-surface focus:border-accent mt-1 w-full rounded-card border px-4 py-3 outline-none"
              />
            </label>
            <p className="ink-soft text-xs">
              Their email must be in the <code>PARENT_EMAILS</code> env var on Railway. If
              you haven&apos;t added it yet, do that first, then come back.
            </p>
            {spouseSent ? (
              <p className="text-ink text-sm">Magic link sent. They tap it on their phone, sign in, and walk through this same setup.</p>
            ) : (
              <>
                <Button
                  onClick={sendSpouseLink}
                  disabled={spouseSending || !spouseEmail.trim()}
                  size="lg"
                  className="w-full"
                >
                  {spouseSending ? 'Sending…' : 'Send magic link'}
                </Button>
                {spouseError && <p className="text-rose text-sm">{spouseError}</p>}
              </>
            )}
          </div>

          <div className="border-line mt-6 border-t pt-4">
            <p className="font-display text-base">Telegram bot</p>
            <p className="ink-soft mt-1 text-sm">
              The bot pings both of you whenever a kid checks something off, so you can approve
              from the lock screen. Setup happens once: BotFather → new bot → put the token into{' '}
              <code>TELEGRAM_BOT_TOKEN</code>. Add your chat IDs to{' '}
              <code>TELEGRAM_PARENT_CHAT_IDS</code>. Full steps in <code>SETUP.md</code>.
            </p>
          </div>

          <Button onClick={finish} disabled={finishing} size="lg" className="mt-6 w-full">
            {finishing ? 'Opening…' : 'Open the app'}
            <ArrowRight size={18} strokeWidth={1.75} className="ms-2 inline" />
          </Button>
          <SkipRow onSkip={finish} onBack={() => setStep(4)} skipLabel="Skip for now" />
        </StepCard>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-6 flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => (
        <span
          key={n}
          className={`h-1 flex-1 rounded-full transition-colors ${
            n <= current ? 'bg-accent' : 'bg-line'
          }`}
        />
      ))}
    </div>
  );
}

function StepCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="space-y-1">
      <div className="text-accent mb-2">{icon}</div>
      <h1 className="font-display text-section leading-tight">{title}</h1>
      {subtitle && <p className="ink-soft mb-4 text-sm leading-relaxed">{subtitle}</p>}
      <div className="pt-2">{children}</div>
    </Card>
  );
}

function Continue({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button onClick={onClick} size="lg" className="mt-6 w-full">
      {label}
      <ArrowRight size={18} strokeWidth={1.75} className="ms-2 inline" />
    </Button>
  );
}

function SkipRow({
  onSkip,
  onBack,
  skipLabel = 'Skip',
}: {
  onSkip: () => void;
  onBack?: () => void;
  skipLabel?: string;
}) {
  return (
    <div className="ink-soft mt-4 flex justify-between text-sm">
      {onBack ? (
        <button onClick={onBack} className="hover:text-ink">
          ← Back
        </button>
      ) : (
        <span />
      )}
      <button onClick={onSkip} className="hover:text-ink">
        {skipLabel}
      </button>
    </div>
  );
}

function Instruction({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="bg-gold-soft text-ink font-display inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm">
        {n}
      </span>
      <span className="leading-relaxed">{children}</span>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }
  return (
    <button
      onClick={copy}
      className="text-accent mt-1 inline-flex items-center gap-1 text-xs hover:underline"
    >
      <Copy size={12} strokeWidth={1.75} />
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}
