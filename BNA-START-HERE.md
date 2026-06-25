# BNA Start Here

Every new GitHub-connected ChatGPT or Codex session for this repo starts here.

## Current Handoff

As of 2026-06-25, the latest execution run is closed:
`ops/execution-runs/2026-06-24-issue-20-parent-run/`.

Verified baseline:

- Issue #20 PR #22 merged to `master` at
  `378cc562a7dd4ffc8f2cc81a7341502df42d0295`.
- Railway deployment `4e4f38c5-73f3-49a4-b399-2dcc647bb7fa` deployed that
  commit to the canonical BNA service.
- Live health, app smoke, public/privacy smoke, visual/UI verification,
  helper/bot destination verification, agent-browser readiness, agent-fleet
  readiness, Operations queue readback, and owner walkthrough verification
  passed for Issue #20.
- Issue #18 PR #21 was merged as read-only evidence only. Its verdict remains
  `NOT SAFE TO APPLY`; do not apply class backfill.
- Owner walkthrough:
  `/issue-20-owner-walkthrough.html` and
  `ops/execution-runs/2026-06-24-issue-20-parent-run/OWNER-WALKTHROUGH.md`.
- Next-session truth:
  `ops/execution-runs/2026-06-24-issue-20-parent-run/NEXT-SESSION.md`.

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
