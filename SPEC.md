# Functional Spec — Family Accountability App

## Who

- **Shloimie** (Tatty) — admin, primary parent user.
- **Ahuva** (Mommy) — admin, receives daily email at `ahuvadratler@gmail.com`.
- **Menachem** — kid, his own tablet, his own PIN.
- **Esther** — kid, her own tablet, her own PIN. One tablet is Android, one is iOS — the app must work identically on both. Hebrew/English toggle on the kid side.

## Core concept

Goals are not a fixed template. They are set fresh at each family meeting. The parents and the kid sit together, decide what the kid will do, and those goals get entered into the system. The kid then checks them off across the days until the next meeting.

## Meetings

A meeting is a parent action. Fields:
- Date (defaults to today)
- Optional recording URL (Loom, Google Drive link, whatever — just a text field)
- Optional notes (free text)
- Attached kid (Menachem or Esther — meetings are per-kid, not joint)
- Set of goals

When a new meeting is created for a kid, it becomes the "active meeting" for that kid. The previous meeting's goals are archived (still visible in history). Only goals from the active meeting show on the kid's daily dashboard.

## Goals

Each goal belongs to a meeting and a kid. Fields:
- Title (free text — could be "Learn Gemara 30 min", "Practice piano", "Run a mile", anything)
- Optional description
- Frequency: daily by default (V1 only supports daily; weekly/custom is V2)

## Check-ins

A check-in is a kid action — one per goal per day. Fields:
- Goal reference
- Date
- Completed (boolean)
- Proof note (optional text)
- Proof photo (optional, uploaded to Supabase Storage)
- Timestamp
- Approved by parent (nullable: null = pending, true = approved, false = rejected)
- Rejection reason (optional, shown to kid on next load)

## Kid dashboard

- Header: kid's name in their preferred language. Streak counter ("7 day streak 🔥" / "רצף של 7 ימים 🔥"). Language toggle.
- Today's date prominently.
- List of today's goals, each as a tappable card showing title, completed/not, proof if added.
- Tapping a card opens a sheet: checkbox, proof note input, "Upload photo" button.
- When all goals checked: confetti animation + a small celebratory line ("All done! Mommy and Tatty are kvelling.").
- When a goal was rejected by a parent: red border on that card, rejection reason shown, can re-submit.
- Past days (read-only): swipe back or tap a date strip to see history. Cannot retroactively check off — only today is editable.

## Parent dashboard (web)

`/parent` — both kids visible side by side.

Per kid:
- Name
- Today's goals: count completed / total
- Current streak
- Last 3 proof items as thumbnails (photo or note snippet)
- Quick actions: "Approve all pending", "Start new meeting"

Drill into a kid → see meeting history (collapsible list), each meeting expandable to show its goals and per-day completion grid for that meeting period.

## Telegram bot

Single bot, name suggestion: `dratler_family_bot` (or whatever BotFather allows). Both parents added by their chat_id in env vars.

**Triggers:**
- Kid checks off a goal → bot sends: "Menachem just checked off 'Learn Gemara 30 min'. Proof: [photo or note]. [Approve] [Reject] [Skip]"
- Daily summary at 10pm

**Commands:**
- `/today` — both kids' progress today
- `/streak` — both kids' current streaks
- `/meetings` — last 5 meetings, both kids
- `/addgoal <kid> "title"` — adds a goal to the kid's active meeting
- `/freeze <kid>` — kid's dashboard shows "Paused — talk to Tatty" until `/unfreeze <kid>`
- `/help` — list of commands

## Daily email (10pm Israel time)

Sent to `ahuvadratler@gmail.com`, CC to Shloimie.

Subject: "Family Accountability — [Date]"

Body:
- For each kid:
  - Goals completed today: N of M
  - Streak: X days
  - Each goal: title, ✓ or ✗, proof note if any, link to proof photo if any
  - Any items still pending parent approval
- Footer: link to parent dashboard.

## Language

- Kid side: Hebrew default, English toggle. Layout flips RTL ↔ LTR cleanly.
- Parent side: English only (V1). Hebrew V2 if Ahuva wants it.
- Telegram bot: English.
- Email: English (Ahuva confirmed comfortable with English summaries).

## Out of scope for V1

- Joint goals (multiple kids on one goal)
- Weekly/monthly goals (only daily for now)
- Reward mechanics tied to Qustodio (handled separately by Shloimie manually)
- Parental web app on mobile (responsive web is enough; Telegram is the mobile parent UX)
- Multi-tenant — this is one family

## V2 ideas (not now)

- Qustodio integration (auto-unlock on completion)
- Loom integration for meeting recordings
- More kids
- Weekly review cycle
- AI summarization of meeting recordings into goal suggestions
