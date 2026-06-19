# BNA Start Here

Every new GitHub-connected ChatGPT or Codex session for this repo starts here.

1. Read `AGENTS.md`, then `docs/BNA-RAMBLE-TO-DONE.md`.
2. Inspect the active execution run:
   - `ops/execution-runs/latest.json`
   - the run folder it points to
   - `NEXT-SESSION.md` inside that run
3. Run `npm run bna:run:status` before choosing implementation work.
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

The durable protocol is `docs/BNA-RAMBLE-TO-DONE.md`.
