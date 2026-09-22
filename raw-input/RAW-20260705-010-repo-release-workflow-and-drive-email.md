# RAW-20260705-010 - Repo Release Workflow And Rabbi Drive Email Reminder

Source: codex_chat
Captured at: 2026-07-05T20:30:00+03:00
Parse status: registered

## Raw text

Shloimie asked for the current repo/release truth: whether everything is pushed
and live, whether the repo is clean and organized, what the next step is for
getting changes pushed/deployed/functioning properly, and how to strengthen the
workflow so he can continue rambling corrections while Codex handles the
grinding.

He also asked that when the Rabbi loads a new file, especially a PowerPoint,
into the Drive folder, the reminder email should go to `sdratler@gmail.com`.

## Parsed summary

- One Time public canonical target work is pushed, merged, deployed, and
  live-smoked on `https://join.onetimeonetime.com`.
- The whole repo/release system is not fully clean yet: stale draft dirty PRs
  remain, the active execution run still has blockers, and logged-in One Time
  Operations visual proof is blocked by invalid stored credentials.
- The Drive drop-off email notifier exists and watches the Rabbi-facing video
  and source-material folders. The scheduled Windows task existed but was
  pointing at a missing branch-era script, so it failed until repaired.
- The requested recipient is `sdratler@gmail.com`; this is the default in the
  scheduler wrapper and was used for the repaired task.

## Guardrails

- No live email was sent during intake/repair because the dry run found no
  current files and the verification run reported `email_sent=false`.
- No Drive file was moved, deleted, shared, exported, or mutated.
- No payment, access, DNS, provider-account, external CRM, database cleanup, or
  credential mutation was performed.
