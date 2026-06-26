# Next Session

Open terminal blocker:

- `REQ-20260626-126` / `DEC-20260626-101`

Latest addendum proof:

- `REQ-20260626-127` is Done for GitHub issue #41 comment `4808518537`.
- `01 Transcript Library` exists, jobs #65-#70 exist, no docs were created
  since `2026-06-25T00:00:00Z`, and job #83 is absent from the Drive
  transcript library.
- Evidence:
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/DRIVE-TRANSCRIPT-LIBRARY-READONLY-AUDIT.md`

Completed targeted approval:

- `REQ-20260626-128` is Done for `RAW-20260626-007`.
- The approved command created the private Drive transcript doc for #83 and
  verified readback.
- Sanitized proof:
  `ops/class-drive-intake/2026-06-26-two-week-class-intake-audit/DRIVE-TRANSCRIPT-LIBRARY-JOB-83-SYNC.md`

Exact next safe command:

```powershell
npm run content:export-digests -- --privacy-scan
```

Owner approval required before any of these commands/actions:

- `npm run content:export-transcripts -- --include-raw-transcript`
- `npm run content:sync-drive-library` without `--dry-run`
  except the already-completed `--no-ai --verify --job-id 83` run
- any production reparse/canonical write
- any worker retry
- any paid retranscription
- any Drive create/update/delete/move
- `APPLY_GUARDED_CLASS_BACKFILL`

If Shloimie approves a next step, create a new requirement or update
`REQ-20260626-126` with the exact approved action, owner, consequences, and
verification plan before running it.
