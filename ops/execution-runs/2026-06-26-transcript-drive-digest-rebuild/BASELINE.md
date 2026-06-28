# Baseline

Current git truth at start of run:

- Branch: `codex/closeout-vimeo-media-20260624`
- HEAD: `6f57d91037d559faa171c71565e6403e62126407`
- Remote: `origin https://github.com/shloimie-beep/bnei-neviim-academy.git`
- Remote HEAD: `origin/master`
- `origin/HEAD` commit: `d297fc45fe0e11bc1a24e302ad46e11f44e6f839`

Active run truth:

- `ops/execution-runs/latest.json` now points to
  `2026-06-26-transcript-drive-digest-rebuild`.
- The previous One Time run remains in place with its requirements/evidence,
  but `run.json.active` is false so the validator sees one active run.

Existing class-drive audit baseline:

- Folder exists:
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/`
- Final verdict: `PARTIAL`
- Counts: 18 Drive recordings, 29 content jobs, 13 deduped student-question
  rows, 24 raw GitHub transcript export gaps, 10 dry-run repair candidates.
- No backfill, production mutation, Drive write/move, paid retranscription,
  send, or transcript-body export was performed in the prior audit.
