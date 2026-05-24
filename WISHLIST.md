# Family Accountability — Planned Work

Captured as Shlomo asks for them; not yet built. Ordered by likely build sequence.

## 1. Kid dashboard polish (Hebrew, kid-friendly)

Goal: big-bold-button kid UX. Hebrew copy already filled in `src/lib/i18n.ts`.
Still to do:
- Goal cards bumped to ~72px height with large title type (28–32px), large
  check target (full card tap).
- Tap → big checkmark + warm haptic-style scale animation (Motion already
  installed).
- Optional proof: a single floating "+ photo" or "+ note" button, not a sheet
  that the kid has to navigate.
- Date in Hebrew long form at top: "יום ראשון, ה־12 במאי".
- Streak counter rendered as `Number + 🔥` (already there) but bumped to
  display-section weight.

## 2. Parent-to-parent shared notes ("for-the-kids" wall)

A short message wall both parents can write to and the kids can see on their
dashboard between goals and history. Tatty and Mommy each post short notes
("Tatty's not home tonight — pizza for dinner"). Kids can read; can't reply.

Data: new table `parent_notes (id, author_user_id, body, visible_from,
visible_until, created_at)`. Surface on kid dashboard at top, dismissible.
Parent-side: simple compose box on `/parent`.

## 3. Parent ad-hoc tasks (outside the meeting cycle)

Parents drop a one-off task on a kid: "take the trash out before 5". Lives
on the active meeting's goal list but flagged as `source = 'ad_hoc'`. Same
check-off / approval flow.

Data: extend `goals` with `source text default 'meeting' check (source in
('meeting','ad_hoc'))` and `expires_at timestamptz nullable`. UI: small "+
task" button on each kid card on `/parent`, and `/addtask <kid> <title>` on
the bot.

## 4. Natural consequences (kid-chosen, parent-overridable)

When a kid sets a goal, they propose a natural consequence for missing it
("no tablet for an hour"). Stored alongside the goal. Once approved by the
parent in-app, it locks — can only be overridden by a parent tap, never by
the kid.

Data: new `goal_consequences (id, goal_id, body, proposed_by_kid bool,
approved_by_parent bool, approved_at, overridden_by_user_id, overridden_at,
override_reason)`.
Logic: when a check-in rolls into "rejected" or a day passes with no
check-in and the consequence is approved, generate a `consequence_event`
row and ping both bots. Parent can tap "Override" inline.

## 5. Reminders schedule wiring (cron)

`/api/cron/reminders?type=morning` and `?type=afternoon` already exist.
Need to wire them into Railway cron:
- Morning: `0 5 * * *` UTC (8 AM Israel summer / 7 AM winter)
- Afternoon: `0 14 * * *` UTC (5 PM / 4 PM Israel)

Command for each:
`curl -H "Authorization: Bearer $CRON_SECRET" "$NEXT_PUBLIC_APP_URL/api/cron/reminders?type=morning"`

## 6. Multi-turn Claude chat memory

V1 is single-turn (each user message answered fresh from current family
state). Add a `bot_conversations` table to store last ~5 turns per parent
chat so follow-ups like "and what about Esther?" work.

## 7. Ahuva-side notes (parent's name on approvals)

Currently approvals show "Approved by Parent." in the bot if `users` parent
row doesn't exist by name. Add: on first Supabase magic-link sign-in,
upsert a `users` row with role='parent', name='Shloimie'|'Ahuva'.

## 8. Proof photo display in parent dashboard

`PendingCheckinRow` shows a "photo attached" indicator but no thumbnail.
Add a small signed-URL thumbnail; tap to open full size.

## 9. PWA install prompt on the kid landing page

`InstallPrompt` only renders on `/parent`. Add it to `/` so kid tablets
get the same one-tap install prompt.
