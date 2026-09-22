# Generated Artifact Retention Policy - 2026-07-07

Generated for `RAW-20260707-016` / `REQ-20260707-160` through
`REQ-20260707-162`.

## Decision

Recurring collector, watchdog, queue, and local visual-audit receipts should
stay on disk for local debugging but should not appear as default Git worktree
noise. Durable proof must be intentionally curated, cited from a requirement
register, and staged explicitly.

## Ignored By Default

- `ops/chatgpt-ramble-dropoff/comment-pickups/`
- `ops/chatgpt-ramble-dropoff/pickups/`
- `ops/queue-audits/`
- recurring timestamped raw-intake/action/security watchdog reports
- local visual-audit iterations and generic closeout/live-after-deploy folders
- generated `test-*` helper/navigation audit reports
- timestamped integration-smoke and release-captain receipts

## Still Commit When Needed

Use `git add -f <path>` for evidence that is explicitly cited by a requirement
register, changelog, execution run, or release proof. Good commit candidates
include final live-smoke folders, named release evidence, PQC validation
reports, and tightly scoped audit reports.

## Not Cleaned Automatically

Tracked dirty files are not reverted by this policy. They must be inspected and
either committed, regenerated, or explicitly left as another actor's local
work. This preserves the repository rule against discarding user or agent work
without approval.

## Deployment

This policy changes repo hygiene only. It does not change app runtime behavior,
so no app deployment is required unless a separate runtime file is changed in
the same batch.
