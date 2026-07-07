# Status

Current status: `blocked_external`; validation passes, launch cleanup commits
are pushed to `master`, and the active run is reconciled to the latest
evidence.

- `REQ-20260702-101`: done. Clean branch created from `origin/master`; clean
  PR #63 commits cherry-picked without force-merging PR #62.
- `REQ-20260702-102`: done. Agent fleet readiness is verified; the supervisor
  is running, readiness returned Overall OK, and duplicate once-run startup was
  correctly refused by the supervisor lock.
- `REQ-20260702-103`: done. Newest Drive recording/content job `101` is
  reconciled against later apply evidence: parser dry-run and repair/rerun are
  complete, scoped private Drive transcript docs were created/updated under the
  recorded approval phrase, Drive connector search/readability passed, and no
  raw transcript body was committed.
- `REQ-20260702-104`: done. UI correction packet DAG exists, but
  child implementation packets wait for parsed recording corrections or an
  explicit visual-audit source.
- `REQ-20260702-105`: done. TEST/mock UI-review seed
  and cleanup scripts exist and dry-run passed; DB apply waits for a safe One
  Time DB runtime/alias.
- `REQ-20260702-106`: done. Guarded Railway apply reused/verified
  `one-time-production`, `one-time-web`, `one-time-postgres`, non-secret
  variables, and `DATABASE_URL` service reference.
- `REQ-20260702-107`: done. Railway custom domain attachment and GoDaddy DNS
  verification for `join.onetimeonetime.com` are complete.
- `REQ-20260702-108`: blocked. Current read-only setup check still needs the
  Zoom session/join alias, One Time Drive drop-folder alias, Rabbi Stripe
  sandbox/test key status plus `$67/month` product/price alias, Whapi/WAPI
  instance/phone, campaign copy/list/suppression proof, and seed approval
  packet. No provider mutation or send occurred.
- `REQ-20260702-109`: done. Top visible task is now GoDaddy DNS for
  `join.onetimeonetime.com`.
- `REQ-20260702-110`: blocked. Current closeout work is pushed to `master`,
  BNA production deploy/live smoke passed, and One Time setup tooling now
  blocks stale historical provisioning proof. Current Railway auth reads BNA
  project `skillful-motivation` and cannot see target service `one-time-web`.
  Deploy, DB bootstrap, and live smoke remain blocked until Railway auth/target
  context can see `one-time-production` / `one-time-web` / `production`.

PR: https://github.com/shloimie-beep/bnei-neviim-academy/pull/64

Guardrails held: no bulk campaign, live payment, WhatsApp broadcast, apex/root
DNS mutation, hard delete, paid-user cancellation, GHL runtime, secret exposure,
or private-data evidence leak.
