# Baseline

Captured: 2026-07-12T22:10:00+03:00

## Git State

- Isolated worktree: `C:\Users\User\BNA-onetime-post-agent-delta-20260712`
- Starting branch: `codex/onetime-post-agent-delta-20260712-v3`
- Actual current `HEAD`: `593b85c7ffe975dc5eff6f38b684f375385952dc`
- `origin/master`: `593b85c7ffe975dc5eff6f38b684f375385952dc`
- Earlier fetched SHA before active-agent commits landed:
  `b61db37a4e232023f745b568e3456536048a114a`
- Active-agent changes preserved: `6ffbb0a55 Record launch control tower delta`
  and `593b85c7f Update One Time landing live smoke` are included in this base.
- Worktree at scoped branch start: clean before this run/register work began.

Unsafe stale worktree explicitly not resumed:
`C:\Users\User\BNA-onetime-p0p1-corrective-20260711`

## Live Readback

Read-only deploy-info check:
`https://join.onetimeonetime.com/api/deploy-info`

- status: `ok`
- live commit SHA:
  `48c52797b2b8354de31f29aa87c1b95307967900`
- source branch: `master`
- generated_at: `2026-07-12T18:58:13.0948875Z`
- deployment source: `railway:redeploy`
- target app/project/service: `one-time` / `one-time-production` / `one-time-web`

Current `origin/master` is newer than the live One Time deployed SHA. Any
server-visible or app-visible delta must be deployed and live-smoked before
being called Done.

## Existing Requirement State

- July 11 `REQ-20260711-003` through `REQ-20260711-009` were review/deploy
  gated in their original register, but later One Time P0/P1 work was merged
  and deployed in `ops/execution-runs/2026-07-12-onetime-p0p1-corrective-completion/`.
- Current CRM portal run
  `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/`
  has local CRM/portal work done and `REQ-20260712-112` blocked only on release
  approval/live closeout. `RAW-20260712-013` supersedes approval-only blocking
  language but not the evidence requirements.
- Workstream B dispatcher route/library exists:
  `src/lib/bna/one-time-delivery-outbox.js` and
  `POST /api/cron/one-time/delivery-outbox`.
- The requested short-lived Railway cron runner/config/test command is missing
  at this baseline.
