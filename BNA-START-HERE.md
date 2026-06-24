# BNA Start Here

Every new GitHub-connected ChatGPT or Codex session for this repo starts here.

## Current Clean-Slate Handoff

As of 2026-06-24, the current handoff is
`ops/execution-runs/2026-06-24-clean-slate-acceptance/`.

Verified baseline:

- PR #16 is merged to `master` at
  `c14507ab121daa221689ba285c203605bf2d64bf`.
- Current deployed Railway SHA is
  `116fea3339a922b045857f7ece8cc9a64e7cda64` in deployment
  `c0aafbc5-a6fa-42ca-828e-38ac8ee02cc7`.
- Live health and public/privacy smokes passed in the clean-slate acceptance
  evidence.
- `REQ-20260624-028` remains active blocked safety work for read-only class
  intake reconciliation; use GitHub issue #18 and do not apply class backfill.
- Owner walkthrough:
  `ops/acceptance/2026-06-24-clean-slate/owner-walkthrough.md`.
- Final handoff:
  `ops/acceptance/2026-06-24-clean-slate/final-handoff.md`.

1. Read `AGENTS.md`, then `docs/BNA-RAMBLE-TO-DONE.md`.
2. Inspect the active execution run:
   - `ops/execution-runs/latest.json`
   - the run folder it points to
   - `NEXT-SESSION.md` inside that run
3. Run `npm run bna:run:status` and `npm run bna:run:next` before choosing
   implementation work.
4. Resume existing open requirements before inventing a new queue.
5. Do not trust task labels, checklist checkmarks, or broad "done" language
   without implementation files, verification output, and evidence recorded in
   the execution run.
6. If an audit ZIP or audit output is required, do not start screenshot-based
   UI remediation until the package/path exists.
7. For broad packets, confirm every registered source has metadata and every
   captured statement maps to a requirement or explicit exclusion before
   implementation closeout.
8. Treat withheld deployment text, missing evidence paths, stale branch/PR
   references, multiple active runs, and blocker rows without owner/next action
   as validation failures.
9. A blocked integration blocks only its dependent requirement. Record one
   concise Decision/blocker with owner, recommended next action, alternatives,
   and consequences, then continue the next unblocked executable batch.
10. Never convert internal handoff files, raw prompt titles, audit reports, or
    duplicate parser fan-out into default visible user Tasks. They belong in
    Codex/Agent work, evidence, or archived provenance unless distilled into a
    canonical human action.

The durable protocol is `docs/BNA-RAMBLE-TO-DONE.md`.
