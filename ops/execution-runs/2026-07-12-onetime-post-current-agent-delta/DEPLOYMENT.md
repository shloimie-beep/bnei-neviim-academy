# Deployment

Updated: 2026-07-13T06:43:00+03:00.

`REQ-20260712-806` and `REQ-20260712-807` have now been deployed to the
canonical One Time Railway web service.

Latest CRM deployment proof:

- Target: `one-time-production / production / one-time-web`
- Domain: `https://join.onetimeonetime.com`
- Branch: `codex/onetime-post-agent-delta-20260712-v3`
- Commit: `467ff7f25aa0a2fa9931cdb4fde6cd264cf4eeb8`
- Railway deployment:
  `3ea1e251-67aa-4137-85cc-82d38437ab8d`
- Railway status: `SUCCESS`

Latest live proof:

- PASS `npm run one-time:target:guard`
- PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 467ff7f25aa0a2fa9931cdb4fde6cd264cf4eeb8`
- PASS `npm run app:smoke:onetime-operations-crm-workbench`
- Live CRM report:
  `ops/live-smokes/2026-07-13T03-42-40-981Z-one-time-operations-crm-workbench-live-smoke.md`

The CRM live smoke was read-only. It logged into Operations, verified deployed
CRM workbench markers, verified the scoped One Time CRM contacts API returned
only the expected workspace/project, and verified a selected timeline readback
without external-write flags. It did not save contact data, raw message bodies,
screenshots, sends, payments, access grants, or external CRM writes.

`REQ-20260712-802` has been deployed to the canonical One Time Railway web
service.

Deployment proof:

- Target: `one-time-production / production / one-time-web`
- Domain: `https://join.onetimeonetime.com`
- Branch: `codex/onetime-post-agent-delta-20260712-v3`
- Commit: `f0376e4539c31d80f917c90241bbffd91ee9c57c`
- Railway deployment:
  `fc4c5c45-89d4-4a99-a6f6-f3a9f58213c8`
- Railway status: `SUCCESS`

Live proof:

- PASS `npm run one-time:target:guard`
- PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`
- PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha f0376e4539c31d80f917c90241bbffd91ee9c57c`

The SHA-pinned smoke confirmed `/api/deploy-info` reports the deployed commit
and the One Time health, instance-config, public, signup, operations-login,
parent, student, provider, and classroom routes are reachable.

No live parse/intake mutation was performed as proof for `REQ-20260712-802`;
the functional behavior is covered by local tests, while deploy-info plus
no-write route smokes prove the hardened code is live. A direct production
parse would create raw-intake rows and should be a separate approved/no-write
live-intake packet.

`npm run app:smoke:rabbi-onetime-landing` against the default BNA domain failed
only on public WhatsApp readiness. That is a separate provider-readiness gate
for the BNA `/rabbi` surface, not a blocker for this `join.onetimeonetime.com`
deployment.

`REQ-20260712-804` has been cut over to a separate Railway cron service.

Cron deployment proof:

- Service: `one-time-delivery-cron`
- Service id: `742f60ed-dc2f-4321-85d0-019003d4e9b9`
- Deployment: `df89ade6-86bc-4d2e-8384-54957fb7fada`
- Deployment status: `SUCCESS`
- Manifest start command:
  `node scripts/run-one-time-delivery-outbox-cron.mjs`
- Manifest cron schedule: `*/5 * * * *`
- Manifest restart policy: `NEVER`
- Variable readback: `CRON_SECRET` present and
  `ONE_TIME_DELIVERY_OUTBOX_URL` present; no secret values recorded.

Cron execution proof:

- Pre-cutover dry-run preview returned `due_count: 0`,
  `would_send_count: 0`, and `external_send_performed: false`.
- Railway logs for `one-time-delivery-cron` showed two redacted executions:
  `status: 200`, `success: true`, `processed_count: 0`, `sent_count: 0`,
  `failed_count: 0`, `dead_lettered_count: 0`, `due_count: 0`, and
  `external_send_performed: false`.
- One Time web HTTP logs showed delivery-outbox POSTs returning 200.
- One Time web HTTP logs showed no POST entries for
  `/api/cron/one-time/class-reminders` in the verification window.

Scheduler overlap proof:

- Codex automation `one-time-delivery-outbox-dispatcher` was updated through
  `automation_update` and read back from
  `C:\Users\User\.codex\automations\one-time-delivery-outbox-dispatcher\automation.toml`
  with `status = "PAUSED"`.
- The separate daily class-reminder enqueue-and-dispatch automation remains
  active because it owns a different class-reminder workflow, not the
  every-five-minute delivery dispatcher replaced by this cron service.

`REQ-20260712-803` supplied the local runner/config/test artifact.
`REQ-20260712-804` performed the live Railway service creation, redacted
execution proof, scheduler overlap check, and old Codex dispatcher pause.

`REQ-20260712-802` changes the server-side ramble-to-done ingestion service.
It is now deployed and live-smoked for the One Time web service.

Current live One Time readback history:

- URL: `https://join.onetimeonetime.com`
- deploy-info SHA before this run: `48c52797b2b8354de31f29aa87c1b95307967900`
- deploy-info SHA after the REQ802 deployment:
  `f0376e4539c31d80f917c90241bbffd91ee9c57c`
- deploy-info SHA after the REQ806/REQ807 deployment:
  `467ff7f25aa0a2fa9931cdb4fde6cd264cf4eeb8`
- Railway target: `one-time-production / production / one-time-web`

Current repo head at baseline was newer:

- `origin/master`: `593b85c7ffe975dc5eff6f38b684f375385952dc`

After this run opened, `origin/master` advanced to
`22cc6b88b Enable production response compression`. The runner branch should
be rebased before push so it includes that active-agent commit.

Deployment is authorized for normal scoped work by `RAW-20260712-013`, but the
following remain unauthorized: production contact imports, unapproved sends,
separate class-reminder enqueueing, payments, access grants, historical CRM
imports, DNS/account/credential changes, and secret exposure.

CRM deployment gate result:

- `REQ-20260712-806` changed server/API and split-shell client code, so it was
  held until `node scripts/smoke-onetime-crm-journey-local-db.mjs` passed
  against an approved isolated Railway `crm-test` Postgres service.
- After that proof, the CRM delta was deployed as Railway deployment
  `3ea1e251-67aa-4137-85cc-82d38437ab8d` and live-smoked read-only.
- No production contact import, send, payment, access grant, external CRM write,
  DNS/account/credential mutation, or secret exposure was performed.
