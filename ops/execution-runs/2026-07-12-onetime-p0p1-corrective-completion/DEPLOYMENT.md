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
- Post-merge smoke-harness fix on master:
  `4a6951643eebb341dcc495d5f306417e1621a07a`

## Railway

- Target: `one-time-production / production / one-time-web`
- Public URL: https://join.onetimeonetime.com
- Final deployment id: `0ff5498b-1116-479e-87ca-afe8d2fc6f7b`
- Deployment status: `SUCCESS`
- Live deployed SHA from `/api/deploy-info`:
  `4a6951643eebb341dcc495d5f306417e1621a07a`

## Live Smoke

Passed after deployment:

- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 4a6951643eebb341dcc495d5f306417e1621a07a`
- `npm run app:smoke:rabbi-onetime-landing -- https://join.onetimeonetime.com`

The live smoke checked the exact deployed SHA, One Time instance config,
landing/signup routes, direct signup fields, Operations login route, portal
routes, provider route, and One Time classroom route.

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
  provider readiness remain open; no external sends were performed.
- `REQ-20260712-008` / `REQ-20260712-009`: production intake/dropoff
  write-smoke was not performed because it would create live raw/parse records
  without a separately scoped production test packet.
