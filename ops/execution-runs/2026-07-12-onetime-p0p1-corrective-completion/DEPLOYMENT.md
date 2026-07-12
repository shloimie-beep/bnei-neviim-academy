# Deployment

Release authorization was given in the July 12 Codex conversation:
`I approvw everything continue`.

PR #129 was merged and the One Time production service was deployed and
live-smoked.

## GitHub

- PR: https://github.com/shloimie-beep/bnei-neviim-academy/pull/129
- PR state: merged
- PR head at merge: `598f66238f68293575d5f9e6195bb6b032ebb156`
- Merge commit: `8e22e5d79844e994e94c4f3ed92ac51422649b8c`
- Merged at: `2026-07-12T10:26:51Z`
- Post-merge release trail:
  `4a6951643eebb341dcc495d5f306417e1621a07a` smoke-harness fix,
  `63243c915b2774c59faf980e027efc8e546a3f1e` delivery outbox dispatcher,
  `fc147ded1ee0e12325111382fa8e460134a8ce3d` release-proof commit,
  `8e61628ad3e3db7cd65fbbf5ebefbb34e39f9435` WAPI readiness setup,
  `f84d8010702a40e8c3fe7c4efcdc2af4b39ce13c` CRM live edit fix,
  `5bf521c539e608543c6a54028cccdc8903667081` personal-continuation
  proof/evidence closeout.

## Railway

- Target: `one-time-production / production / one-time-web`
- Public URL: https://join.onetimeonetime.com
- Final deployment id: `bc45a0fa-76b1-4170-80d2-cf18dbca70c9`
- Deployment status: `SUCCESS`
- Live deployed runtime source SHA from `/api/deploy-info`:
  `5bf521c539e608543c6a54028cccdc8903667081`

## Live Smoke

Passed after deployment:

- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 5bf521c539e608543c6a54028cccdc8903667081`
- `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`
- `npm run app:smoke:one-time-interest-crm-e2e`
- `npm run app:smoke:one-time-personal-continuation`
- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`
- `npm run app:smoke:one-time-interest-dry-run`

The live smoke checked the exact deployed SHA, One Time instance config,
landing/signup routes, direct signup fields, Operations login route, portal
routes, provider route, and One Time classroom route.

The final deployment was a proof/evidence closeout deployment. Runtime app
behavior from the CRM/personal continuation proof remained unchanged; Railway
release metadata was refreshed so `/api/deploy-info` reports the final pushed
master SHA exactly.

The direct signup dry-run smoke now checks `/one-time/signup`, required red
markers, the required location/reminder acknowledgement checkbox, no
customer-facing phone-optional copy, no preselected reminder choice, and a
dry-run `.invalid` email signup with no phone number. The API response stayed
`dry_run=true` and `external_write_performed=false`.

The protected delivery dispatcher route is deployed. A no-secret live request
to `POST /api/cron/one-time/delivery-outbox` returned HTTP 503, which proves
the route exists and refuses to run without hosted cron/provider readiness. No
delivery was attempted.

The personal continuation live smoke used the operator-approved personal
contact only as runtime input and wrote redacted evidence. It verified Family
and School direct signup to continuation linkage, then cancelled queued
test outbox rows, archived product/CRM leads, deleted generated onboarding
tasks, and closed support tickets.

## Not Performed

No email, WhatsApp, Telegram, campaign send, payment/charge/refund, access
grant, historical import, DNS/account mutation, credential mutation, or
external-provider write was performed.

## Remaining Release Blockers

- `REQ-20260712-002`: `.github/workflows/onetime-corrective.yml` still needs a
  GitHub credential or maintainer action with `workflow` scope.
- `REQ-20260712-022`: exact live-send behavior/copy and hosted reminder
  provider readiness remain open; no external sends were performed. The
  handoff guard now marks deployment complete from live smoke but still
  suppresses the ready message because CI, live-send approval, Telegram, and
  scheduler/`CRON_SECRET` readiness are not green. One Time WAPI provider
  setup itself is configured and deployed.
- `REQ-20260712-008` / `REQ-20260712-009`: production intake/dropoff
  write-smoke was not performed because it would create live raw/parse records
  without a separately scoped production test packet.
