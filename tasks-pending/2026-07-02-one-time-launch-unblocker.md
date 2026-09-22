# One Time Launch Unblocker

Raw input: `RAW-20260702-002`
Active run: `ops/execution-runs/2026-07-01-one-time-separate-instance-launch-funnel`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## What This Packet Changed

This packet does not authorize live sends, payments, DNS mutation, provider
account writes, hard deletes, or privacy-sensitive exports. It converts the
latest operator decisions into execution-run evidence and continues safe local
validation despite `npm run bna:run:next` reporting no unblocked batch.

## Requirement Status Updates

| ID | Result |
| --- | --- |
| `REQ-20260701-705` | Locally verified: no-card 30-day signup/trial/access preview and scoped first-party contracts pass. Final launch remains blocked on deploy/live smoke and separate DB/target. |
| `REQ-20260701-706` | Locally verified: member/admin workspace, community/private question, class/course/video, role/portal, and parent/student scope contracts pass. Final launch remains blocked on deploy/live smoke and real content/session details. |
| `REQ-20260701-707` | Locally verified: attendance/progress/link-click contract evidence passes through local progress/media/class-link smokes. Final launch remains blocked on deploy/live smoke. |
| `REQ-20260701-708` | Still needs operator/Rabbi input: final Zoom/session details. Public pages remain free of raw Zoom links. |
| `REQ-20260701-709` | Locally verified: confirmation/reminder/campaign/outbox previews are draft-only/no-send with suppression/consent checks. Real seed/campaign remains blocked until final live link and explicit campaign packet. |
| `REQ-20260701-717` | Partial verification complete: focused tests, `pqc:all`, run validators, source coverage, stale evidence, Railway no-write checks, and local smoke passed. Deploy/live smoke remains blocked by separate Railway/custom-domain/DB setup. |

## Evidence

- `ops/one-time-mishnah/launch-unblocker/2026-07-02-launch-unblocker-readiness.md`
- `ops/one-time-mishnah/launch-unblocker/2026-07-02-operator-external-setup-checklist.md`
- `ops/one-time-mishnah/launch-unblocker/2026-07-02-external-setup-readiness-check.md`
- `ops/prompt-packets/2026-07-02-one-time-post-setup-live-closeout/00-railway-db-join-domain-deploy-live-smoke.md`
- `ops/local-smokes/2026-07-02T06-47-35-826Z-one-time-launch-safe-local-smoke.md`
- `ops/one-time-mishnah/provisioning/2026-07-01-separate-railway-db-readiness.md`

## Validation

- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:status`.
- PASS `npm run bna:run:source-coverage` with 31 source statements and 0
  unmapped executable statements.
- PASS `npm run bna:run:stale-evidence`.
- PASS `npm run bna:run:next`; no unblocked executable batch remains.
- EXPECTED BLOCKED `npm run one-time:setup:check`; no-secret readiness checker
  reports 0/8 external setup areas ready.
- PASS `npm run secrets:audit`.
- PASS `npm run pqc:all`.
- PASS `git diff --check`; only line-ending warnings were emitted.

## Exact Remaining Operator Actions

1. Create/confirm separate One Time Railway project/service/environment and
   provide the exact labels. Recommended target domain remains
   `join.onetimeonetime.com`; apex/root `onetimeonetime.com` remains untouched.
2. Create/confirm separate One Time database and provide the keyholder/Railway
   alias for `ONE_TIME_DATABASE_URL` or `DATABASE_URL_ONE_TIME`; do not paste
   secret values.
3. Set these One Time service env values in the separate service:
   `PUBLIC_SITE_MODE=one_time`,
   `DEFAULT_WORKSPACE_KEY=rabbi_sheller_provider`,
   `DEFAULT_PROJECT_KEY=one_time_mishnah_class`,
   `ONE_TIME_PUBLIC_DOMAIN=join.onetimeonetime.com`.
4. Provide final Zoom session/class details in the keyholder or private setup
   path, not tracked files.
5. Confirm Vimeo token alias/path in keyholder and safe test-upload decisions.
6. Confirm Rabbi Stripe test credential alias/path and $67/month product/price
   setup; sandbox/test only.
7. Provide final campaign copy, exact recipient segment/list, suppression proof,
   final links, and explicit seed/send packet after join link is live.
8. Provide Rabbi Whapi/WAPI account/number/token/instance/webhook details before
   any safe WhatsApp test-send packet.
