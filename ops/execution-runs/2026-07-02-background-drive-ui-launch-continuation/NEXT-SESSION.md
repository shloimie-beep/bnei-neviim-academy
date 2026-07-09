# Next Session

Current state:

1. PR #64 branch is the clean launch continuation branch.
2. `join.onetimeonetime.com` DNS is verified:
   - CNAME `join` -> `awaz36ln.up.railway.app`
   - TXT `_railway-verify.join` ->
     `railway-verify=73e92e55cb07e5a0abdb0a72f204d437d915c3134e844af12f419407632a97d6`
3. Separate One Time Railway target exists and `one-time-web` has a non-empty
   `DATABASE_URL` service reference.
   - 2026-07-09 target-context recheck passed:
     `npm run one-time:railway-target:guard` read `one-time-web` /
     `production`, found 52 Railway variables, found usable `DATABASE_URL`,
     and verified `ONE_TIME_PUBLIC_DOMAIN`,
     `DEFAULT_WORKSPACE_KEY`, and `DEFAULT_PROJECT_KEY`.
4. Safe provider env values for Resend, Zoom credentials, and Vimeo client
   credentials were pushed to `one-time-web` with deploy skipped and verified
   by fingerprint.
5. Agent fleet readiness is current as of 2026-07-09: the supervisor is
   running as PID 36560, `npm run agent:fleet:readiness -- --no-write --json`
   returned OK on current `master`, and Kimi fallback is configured as
   `quota_only / kimi-k2.7-code-highspeed`.
6. Newest Drive recording/content job `101` trace is reconciled: parser
   dry-run and repair/rerun are done, scoped private Drive transcript docs were
   created/updated under the recorded approval phrase, Drive connector
   search/readability passed, and no raw transcript body is committed.

Top Codex task:

1. No active-run batch is currently unblocked: `npm run bna:run:next` reports
   8 done / 2 blocked and no next executable batch. Keep the deployed public
   OneTime lead-capture/free-class lane live and use
   `tasks-pending/2026-07-09-onetime-lead-capture-free-zoom-ui-priority.md` as
   evidence; full portal/payment/broadcast launch remains blocked until the
   operator supplies the remaining setup values.
2. UI implementation should not be picked up from this run while the fleet
   still shows active UI job `#382` / task `#1859`.

Deployment caveat:

- Local DB bootstrap apply is blocked because Railway Postgres resolves to an
  internal host from this machine. After `one-time-web` is deployed, run the
  bootstrap from inside the Railway service via `railway ssh` if available.

Top provider/operator task:

1. Provide or label the remaining exact aliases:
   - Rabbi Stripe sandbox/test key and $67/month product/price aliases;
   - Whapi/WAPI instance and phone aliases.
   - final campaign copy, exact recipient segment/list, suppression/
     unsubscribe proof, and explicit seed approval.

Recently resolved:

1. `REQ-20260702-102` - agent-fleet readiness/status is verified. Keep the
   existing supervisor running; do not start a duplicate once-run while the
   lock is active.
2. `REQ-20260702-103` - newest Drive recording/content job `101` trace and
   parser/private transcript-doc visibility are reconciled from
   `ops/drive-transcript-visibility/2026-07-02/APPLY-CLOSEOUT.md` and
   `ops/drive-transcript-visibility/2026-07-02/JOB-101-REVIEW-TRIAGE.md`.

Still blocked:

1. `REQ-20260702-108` - provider setup remains blocked on Rabbi Stripe
   sandbox/test key status and `$67/month` product/price alias, Whapi/WAPI
   instance/phone, campaign copy/list/suppression proof, and explicit seed
   approval packet. Railway target context, database readback, join-domain,
   hosted Zoom/class link, and Drive/Vimeo readiness are no longer the blocker.
   No send/payment/provider mutation should run until the remaining values and
   scope are explicit.
2. `REQ-20260702-110` - final full-launch bootstrap/live smoke remains blocked
   by the remaining external setup items above, not by Railway target context.
   2026-07-09 `npm run one-time:railway-target:guard` passed for
   `one-time-web`; `npm run one-time:setup:check` now reports ready 5/8 and
   blocks only Stripe sandbox/price alias, Whapi/WAPI instance and phone, and
   campaign approval data. Hosted Zoom/class link is present by redacted
   readback. For the immediate public capture funnel, use the new
   RAW-20260709-008 register instead of waiting on full setup.
3. Campaign send remains blocked on final copy, exact segment/list,
   suppression/unsubscribe proof, seed pass, and exact real-send packet.
