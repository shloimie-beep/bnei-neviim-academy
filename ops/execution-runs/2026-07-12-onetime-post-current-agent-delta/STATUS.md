# Status

As of 2026-07-12T23:58:00+03:00:

- Goal-mode packet captured as `RAW-20260712-013`.
- Fresh execution run initialized and `latest.json` points here.
- Scoped isolated worktree:
  `C:\Users\User\BNA-onetime-post-agent-delta-20260712`.
- Branch: `codex/onetime-post-agent-delta-20260712-v3`.
- Baseline local/remote SHA when this run was opened:
  `593b85c7ffe975dc5eff6f38b684f375385952dc`.
- `origin/master` later advanced to
  `22cc6b88b Enable production response compression`; this branch will be
  rebased before push.
- Live One Time deploy-info SHA after this deployment:
  `f0376e4539c31d80f917c90241bbffd91ee9c57c`.
- Railway deployment:
  `fc4c5c45-89d4-4a99-a6f6-f3a9f58213c8` on
  `one-time-production / production / one-time-web`, status `SUCCESS`.
- Railway delivery cron service:
  `one-time-delivery-cron` id
  `742f60ed-dc2f-4321-85d0-019003d4e9b9`, deployment
  `df89ade6-86bc-4d2e-8384-54957fb7fada`, manifest schedule
  `*/5 * * * *`, two redacted zero-due executions, old dispatcher automation
  `one-time-delivery-outbox-dispatcher` paused.
- Stale approval-only deployment blockers are superseded by the new packet, but
  evidence, release gates, no-send/no-import/no-payment/no-DNS/no-secret
  constraints remain in force.

Current implementation focus:

`REQ-20260712-803` is locally done. The branch now contains the bounded
delivery outbox Railway cron runner, separate Railway config, package command,
env example, and focused tests.

`REQ-20260712-802` is done. The branch hardens the shared ramble-to-done service so
nontrivial operator rambles cannot become implementation jobs from a generic
heuristic fallback when structured compilation is missing or invalid. It also
adds Telegram/raw part reconstruction, source reconstruction receipts, and
honest status receipt states. The change was deployed and live-smoked on the
canonical One Time web target with SHA-pinned proof.

`REQ-20260712-804` is done. The separate Railway cron service now owns the
five-minute delivery-outbox dispatcher, and the old Codex dispatcher automation
is paused to avoid overlap.

`REQ-20260712-805` is done. The canonical One Time CRM Contacts/Inbox
blueprint now exists at
`ops/product-specs/one-time/crm/contacts-inbox.v1.json`, with a focused
surface map under `ops/surface-maps/` and an OT-CRM gap matrix aligned to the
raw C9 sequence: DTO/list/performance, workspace/mutations, inbox/composer,
tasks/lifecycle/access, and canonical-route proof/deploy.

Current CRM implementation status:

- `REQ-20260712-806` is blocked after a safe implementation slice. The branch
  now adds the missing local-only CRM contact create/detail/note/task/task
  update/thread/read/draft endpoints, split-shell API client methods, action
  and route registry coverage, and canonical `/operations` browser proof.
  Remaining acceptance proof is blocked until
  `BNA_ONETIME_CRM_TEST_DATABASE_URL` points at a local/test Postgres database;
  the local DB journey intentionally refuses production DB URLs.

Next implementation/cutover focus:

- `REQ-20260712-807`: commit/push the scoped branch changes, then deploy/live
  smoke only after the isolated DB blocker is cleared or a scoped owner
  decision accepts this as a local-only blocked closeout.
