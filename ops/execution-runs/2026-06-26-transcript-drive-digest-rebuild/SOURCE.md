# Source

- Raw ID: `RAW-20260626-004`
- Addendum raw ID: `RAW-20260626-006`
- Approval raw ID: `RAW-20260626-007`
- Source channel: Codex chat attachment; GitHub issue #41 comment; Codex chat owner approval
- Raw text path:
  `raw-input/RAW-20260626-004-transcript-drive-digest-rebuild-source.txt`
- Register:
  `tasks-pending/2026-06-26-transcript-drive-digest-rebuild.md`
- Issue addendum:
  `https://github.com/shloimie-beep/bnei-neviim-academy/issues/41#issuecomment-4808518537`
- Addendum raw text:
  `raw-input/RAW-20260626-006-issue-41-drive-transcript-library-addendum.md`
- Targeted approval raw text:
  `raw-input/RAW-20260626-007-owner-approval-job-83-drive-sync.md`
- Related prior audit: `RAW-20260626-002`
- Related blocker: `DEC-20260626-101`

Shloimie provided a goal-mode packet to rebuild class/transcript/Drive intake
around the selected policy: raw transcript bodies stay in private Drive/app
storage, while GitHub receives sanitized digests, manifests, indexes,
categories, parse gaps, and repair plans.

Issue #41 comment `4808518537` added a Drive-side verification note:
`01 Transcript Library` should exist, older docs in the `#65`-`#70` range
should exist, no transcript docs should have been created after
`2026-06-25T00:00:00Z`, and `content_job:83` should be treated as not yet
confirmed in the Drive transcript library.

Shloimie then approved one non-dry-run private Drive transcript-library sync
for content job #83 only, using:

```powershell
npm run content:sync-drive-library -- --no-ai --verify --job-id 83
```

Hard guardrails for this run: no raw transcript-body GitHub export, no stale
transcript deletion, no production DB mutation, no Drive move/delete, no paid
retranscription, no worker retry, no class backfill, no sends, no deploy, and
no credential/DNS/billing actions. The only approved exception is the completed
private Drive transcript doc create/update for job #83.
