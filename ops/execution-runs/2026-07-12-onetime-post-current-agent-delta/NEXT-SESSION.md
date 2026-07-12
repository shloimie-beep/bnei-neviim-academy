# Next Session

Current worktree:
`C:\Users\User\BNA-onetime-post-agent-delta-20260712`

Current branch:
`codex/onetime-post-agent-delta-20260712-v3`

Current run:
`ops/execution-runs/2026-07-12-onetime-post-current-agent-delta/`

Current bounded batch:

- `REQ-20260712-803`: locally done. Commit/push the runner branch after
  validation/rebase.

Next requirements:

- `REQ-20260712-804`: create/deploy/read back the separate
  `one-time-delivery-cron` Railway service, prove two redacted executions,
  verify no class-reminders job ran, then disable/delete the old Codex
  dispatcher automation only after no-overlap proof.
- `REQ-20260712-802`: deploy/live-smoke the locally verified ramble-to-done
  hardening before marking it terminal.
- `REQ-20260712-805`: create the canonical One Time CRM Contacts/Inbox
  blueprint and gap matrix before any CRM UI/product edits.

Resume commands:

```bash
git status --short --branch
npm run bna:run:validate
npm run bna:run:next
node --check scripts/run-one-time-delivery-outbox-cron.mjs
node --test tests/one-time-delivery-outbox-cron.test.js
node --test tests/one-time-delivery-outbox.test.js
node --test tests/ingestion/operator-ramble-service.test.js tests/ingestion/ramble-regression-suite.test.js tests/ingestion/w3-intake-service.test.js
```

Do not resume
`C:\Users\User\BNA-onetime-p0p1-corrective-20260711`.

Do not send messages, enqueue separate class reminders, import production
contacts, charge/refund, grant access, mutate DNS/accounts/credentials, expose
secrets, or write external providers outside the exact approved release/cutover
scope.
