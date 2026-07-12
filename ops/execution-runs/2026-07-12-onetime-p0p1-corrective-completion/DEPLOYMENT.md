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
  `8e61628ad3e3db7cd65fbbf5ebefbb34e39f9435` WAPI readiness setup.

## Railway

- Target: `one-time-production / production / one-time-web`
- Public URL: https://join.onetimeonetime.com
- Final deployment id: `079c53ca-cb65-4cf9-af06-286a7705e7a1`
- Deployment status: `SUCCESS`
- Live deployed SHA from `/api/deploy-info`:
  `8e61628ad3e3db7cd65fbbf5ebefbb34e39f9435`

## Live Smoke

Passed after deployment:

- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 8e61628ad3e3db7cd65fbbf5ebefbb34e39f9435`
- `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`
- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`
- `npm run app:smoke:one-time-interest-dry-run`

The live smoke checked the exact deployed SHA, One Time instance config,
landing/signup routes, direct signup fields, Operations login route, portal
routes, provider route, and One Time classroom route.

The direct signup dry-run smoke now checks `/one-time/signup`, required red
markers, the required location/reminder acknowledgement checkbox, no
customer-facing phone-optional copy, no preselected reminder choice, and a
dry-run `.invalid` email signup with no phone number. The API response stayed
`dry_run=true` and `external_write_performed=false`.

The protected delivery dispatcher route is deployed. A no-secret live request
to `POST /api/cron/one-time/delivery-outbox` returned HTTP 503, which proves
the route exists and refuses to run without hosted cron/provider readiness. No
delivery was attempted.

## Not Performed

No email, WhatsApp, Telegram, campaign send, payment/charge/refund, access
grant, historical import, DNS/account mutation, credential mutation, or
external-provider write was performed.

## Remaining Release Blockers

- `REQ-20260712-002`: `.github/workflows/onetime-corrective.yml` still needs a
  GitHub credential or maintainer action with `workflow` scope.
- `REQ-20260712-005` / `REQ-20260712-006`: the required real local/test
  Postgres persistence journey still needs `BNA_ONETIME_CRM_TEST_DATABASE_URL`.
- `REQ-20260712-022`: operator personal deployed signup and hosted reminder
  provider readiness remain open; no external sends were performed. The
  handoff guard now marks deployment complete from live smoke but still
  suppresses the ready message because CI, live-send approval, Telegram, and
  scheduler/`CRON_SECRET` readiness are not green. One Time WAPI provider
  setup itself is configured and deployed.
- `REQ-20260712-008` / `REQ-20260712-009`: production intake/dropoff
  write-smoke was not performed because it would create live raw/parse records
  without a separately scoped production test packet.
