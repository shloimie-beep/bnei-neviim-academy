# BNA Execution Runs

Execution runs are durable, resumable records for broad rambles, correction
packets, and goal-mode implementation work.

Use them when a prompt contains many requirements or when work needs to survive
across ChatGPT/Codex sessions.

## Commands

- `npm run bna:run:init -- --id <run-id>` creates a run skeleton and points
  `latest.json` to it.
- `npm run bna:run:status` prints the active run summary.
- `npm run bna:run:validate` checks the active run for durable closeout rules.
- `npm run bna:run:resume` prints the active `NEXT-SESSION.md` and open
  requirement IDs.

## Required Files

Each run folder must contain:

- `SOURCE.md`
- `REQUIREMENTS.md`
- `requirements.json`
- `BASELINE.md`
- `PLAN.md`
- `STATUS.md`
- `EVIDENCE.md`
- `TEST-RESULTS.md`
- `DEPLOYMENT.md`
- `NEXT-SESSION.md`
- `run.json`

`requirements.json` is the machine-readable source. The markdown files are for
human inspection and handoff.

For broad source packets, `requirements.json` may also include `sources`,
`source_statements`, `source_statement_matrices`, and `git_refs`. Validation
fails when captured statements are unmapped, source metadata is incomplete,
repo evidence paths are missing, live-required closed rows only contain
withheld deployment text, blocker rows lack owner/next action, multiple runs are
active, or `NEXT-SESSION.md` does not name open work.
