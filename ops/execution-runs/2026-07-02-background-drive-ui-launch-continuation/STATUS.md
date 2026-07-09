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
- `REQ-20260702-108`: blocked. Current read-only setup check still needs Rabbi
  Stripe sandbox/test key status plus `$67/month` product/price alias,
  Whapi/WAPI instance/phone, campaign copy/list/suppression proof, and seed
  approval packet. Railway target context, separate database readback,
  join-domain, hosted Zoom/class link, and Drive/Vimeo setup are no longer the
  blocker. No provider mutation or send occurred.
- `REQ-20260702-109`: done. Top visible task is now GoDaddy DNS for
  `join.onetimeonetime.com`.
- `REQ-20260702-110`: blocked for full launch only. Current closeout work is
  pushed to `master`, BNA production deploy/live smoke passed, and One Time
  setup tooling now blocks stale historical provisioning proof. 2026-07-09
  readback resolved the old Railway target-context blocker:
  `npm run one-time:railway-target:guard` uses an isolated temporary Railway
  link to read `one-time-web` / `production` from `one-time-production` and
  records only redacted booleans: 52 Railway variables, usable `DATABASE_URL`,
  matching `join.onetimeonetime.com`, `rabbi_sheller_provider`, and
  `one_time_mishnah_class`. `npm run one-time:setup:check` now reports ready
  5/8: Railway target, DB, join domain, hosted Zoom/class link, and Vimeo/Drive
  are ready. Stripe sandbox/price alias, Whapi/WAPI details, and campaign
  approval data are still missing. Immediate public lead capture is now tracked
  in `tasks-pending/2026-07-09-onetime-lead-capture-free-zoom-ui-priority.md`
  and does not wait on portal/payment/broadcast setup.

PR: https://github.com/shloimie-beep/bnei-neviim-academy/pull/64

Guardrails held: no bulk campaign, live payment, WhatsApp broadcast, apex/root
DNS mutation, hard delete, paid-user cancellation, GHL runtime, secret exposure,
or private-data evidence leak.
