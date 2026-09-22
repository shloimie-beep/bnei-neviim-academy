# RAW-20260626-007 - Owner Approval For Job 83 Drive Transcript Sync

- Source channel: codex_chat
- Created at: 2026-06-26T13:34:00+03:00
- Parse status: registered
- Privacy classification: owner approval for targeted private Drive write
- Requirement register: `tasks-pending/2026-06-26-transcript-drive-digest-rebuild.md`
- Execution run: `ops/execution-runs/2026-06-26-transcript-drive-digest-rebuild`
- Related decision: `DEC-20260626-101`

## Raw Operator Approval

OWNER APPROVAL - TARGETED DRIVE TRANSCRIPT LIBRARY SYNC

I approve a non-dry-run Drive transcript library sync for the missing private
Drive transcript doc for content job #83 only.

Allowed command:

```powershell
npm run content:sync-drive-library -- --no-ai --verify --job-id 83
```

Allowed result:

- create or update the private Drive transcript-library Google Doc for content
  job #83;
- verify Drive readback;
- update sanitized repo evidence with Drive doc status/link or redacted pointer;
- rerun the privacy-safe digest export and audits.

Still forbidden:

- no production DB mutation;
- no class backfill;
- no Drive source file move/delete;
- no paid retranscription;
- no AI call;
- no raw transcript-body export into tracked GitHub;
- no stale transcript deletion;
- no sends;
- no charges/access grants;
- no credential/account/DNS changes;
- no broad Drive sync beyond job #83 unless a new dry-run plan and approval are
  recorded.

## Parsed Result

- This approval resolves `DEC-20260626-101` only for a targeted private Drive
  transcript-library create/update for content job #83.
- Broader raw export, Drive sync, production mutation, class backfill, paid
  retranscription, source-file move/delete, stale deletion, sends, charges,
  access grants, credential/account/DNS changes, and broad Drive sync remain
  blocked.
- Approved implementation requirement: `REQ-20260626-128`.
