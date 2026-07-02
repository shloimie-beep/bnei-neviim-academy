# One Time Campaign Domain Route Plan - 2026-07-01

Requirement: `REQ-20260701-601`
Raw source: `RAW-20260701-006`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

## Goal

Campaign traffic should use:

`https://onetimeonetime.com/?utm_source=email&utm_medium=launch&utm_campaign=free_mishnayos_class`

The campaign domain root should serve the One Time focused landing page, not
the academy homepage and not a direct Zoom/member link.

## Implemented Route Behavior

| Request | Behavior |
|---|---|
| `Host: onetimeonetime.com`, path `/` | Serve `public/one-time/index.html`. |
| `Host: www.onetimeonetime.com`, path `/` | Serve `public/one-time/index.html`. |
| BNA host, path `/` | Continue serving `public/index.html` through the existing static route. |
| `/one-time` and existing One Time aliases | Continue serving `public/one-time/index.html`. |
| `/rabbi`, `/rabbi-preview`, `/one-time-mishnayos` | Remain compatible legacy/preview aliases serving `public/rabbi.html`. |

## Guardrails

- DNS was not changed.
- No direct Zoom link was exposed.
- No private member/classroom data was exposed on the campaign root.
- No payment, Stripe, WhatsApp, Buffer, or external provider write occurred.
- The BNA public homepage remains separate from the One Time campaign root.

## Registry Coverage

`ops/route-registry.json` now includes `https://onetimeonetime.com/` with:

- hostnames: `onetimeonetime.com`, `www.onetimeonetime.com`
- canonical target: `/one-time`
- public anonymous behavior: One Time campaign landing without private data
- security expectation: no DNS mutation, no direct Zoom, no private member/classroom data, no payment action, and no external provider write

## Verification

- PASS `node --check server.js`
- PASS `node --test tests/one-time-focused-landing.test.js tests/rabbi-checkout-access.test.js tests/one-time-local-hardening-audit.test.js tests/watchdog-route-security.test.js`
- PASS `npm run watchdog:security`
- PASS Railway deployment `0ae3cb12-7f4f-4ae7-9bd9-7dd8f5a78be4` reached `SUCCESS`.
- PASS BNA root live smoke still serves the BNA homepage.
- BLOCKED `onetimeonetime.com` live smoke: apex is served by `Google Frontend`
  with legacy Rabbi preview content, not the Railway app.
- BLOCKED `www.onetimeonetime.com` live smoke: DNS returned `ENOTFOUND`.

## Remaining Domain Gate

The route code is deployed, but the real campaign domain is not reaching the
Railway app. DNS/hosting changes are external and were not authorized for Codex.
`REQ-20260701-601` remains blocked until the domain owner points
`onetimeonetime.com` and `www.onetimeonetime.com` to the deployed Railway app
and the live smoke passes.
