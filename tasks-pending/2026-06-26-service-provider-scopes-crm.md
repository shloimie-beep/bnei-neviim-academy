# Service Provider Scopes + First-Party CRM Package

Source: `RAW-20260626-005`
Package: `C:\Users\User\Downloads\bna-service-provider-scopes-implementation-2026-06-26.zip`
Branch: `codex/service-provider-scopes-merge-20260626`
Pull request: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/43`
Status: `Done - merged, deployed, and live verified`

## Scope Decisions

- Tenant types stay `school`, `service_provider`, and `family`.
- `super_admin` is a role/context, not a tenant type.
- Shloimie is currently the only Super Admin.
- Free service providers get public listing/profile, listing comments/inquiries, setup help, provider calendar, support/help, and limited analytics.
- Provider Plus gets scoped first-party CRM, filters/timeline, parent/student portals, content/communications, automation previews, integrations readiness, and reporting.
- Rabbi Scheller remains a `service_provider` Plus/partner under `rabbi_sheller_provider` / `one_time_mishnah_class`.
- No web or portal assistant may route to Codex CLI, shell, deploy, migrations, secret-copy, Railway mutation, external sends, payment/access grants, or DNS changes.
- CRM means first-party BNA Operations CRM only; no GHL/GoHighLevel/LeadConnector runtime.

## Requirements

| ID | Status | Evidence |
| --- | --- | --- |
| `REQ-20260626-121` | Done | Imported `src/lib/bna/account-scope-entitlements.js`, `src/lib/bna/crm-contact-model.js`, `src/lib/bna/assistant-scope-policy.js`, and matching tests. Local package tests and full `npm test` passed. |
| `REQ-20260626-122` | Done | Added `railway-migration-2026-06-26-service-provider-scopes-crm.sql`; corrected invalid expression unique constraints to deployable `project_key TEXT NOT NULL DEFAULT ''` uniqueness. Railway deployment `112ef3b5-0ce7-45e3-9c55-368f783ccd1d` reached `SUCCESS`. |
| `REQ-20260626-123` | Done | Added `/api/bna/account-scope/summary`, `/api/bna/crm/contacts`, `/api/bna/crm/contacts/:id/timeline`, and `/api/bna/assistant/scope-plan` with scoped allowlist entries. Live targeted smoke passed in `ops/live-smokes/2026-06-26T11-12-12-747Z-service-provider-scopes-live-smoke.md`. |
| `REQ-20260626-124` | Done | Added provider scope session, inquiries, draft-only response, calendar readback, and assistant scope-plan endpoints; provider payload now returns scope/provider sections/assistant capabilities. Live smoke verified provider scope APIs reject anonymous access and provider bundle exposes the new scope surfaces. |
| `REQ-20260626-125` | Done | Updated `public/provider.html`, `public/operations.html`, `ops/action-registry.json`, and `ops/route-registry.json`; regenerated One Time action coverage and universal action parity artifacts. Watchdogs and live UI smokes passed. |
| `REQ-20260626-126` | Done | Added `docs/product/service-provider-scopes-crm.md`, `MEMORY.md` entry, raw intake, this register, changelog, ledger records, PR #43, deployment, and live-smoke evidence. |

## Verification Plan

- `node --check server.js`
- `node --check src/lib/bna/account-scope-entitlements.js`
- `node --check src/lib/bna/crm-contact-model.js`
- `node --check src/lib/bna/assistant-scope-policy.js`
- `node --test tests/account-scope-entitlements.test.js tests/crm-contact-model.test.js tests/assistant-scope-policy.test.js`
- `node --test tests/service-provider-scope-routes.test.js`
- `node --test tests/account-scope-entitlements.test.js tests/crm-contact-model.test.js tests/assistant-scope-policy.test.js tests/service-provider-scope-routes.test.js tests/watchdog-action-registry.test.js`
- `npm test` passed 1414/1414.
- `npm run watchdog:actions` passed with 0 findings; latest report `ops/watchdog-audits/2026-06-26T10-41-watchdog-action-audit.md`.
- `npm run watchdog:security` passed with 0 findings; latest report `ops/watchdog-audits/2026-06-26T10-41-watchdog-security-routes.md`.
- `npm run secrets:audit` passed with 4944 tracked paths checked and 0 findings.
- Clean-head final checks before merge:
  - `node --check server.js` and package modules passed.
  - Focused package/route/action tests passed 24/24.
  - `npm test` passed 1414/1414.
  - `npm run secrets:audit` passed with 4957 tracked paths checked and 0 findings.

## Deployment

PR #43 was marked ready and merged to `master` on 2026-06-26. Merge commit:
`5bea5891853d7e22eff2ce8f72aeac33a151ec1f`.

Railway production deployment:

- Project/service: `skillful-motivation`
- Environment: `production`
- Domain: `bneineviimacademy.org`
- Deployment: `112ef3b5-0ce7-45e3-9c55-368f783ccd1d`
- Status: `SUCCESS`

Live verification:

- `npm run railway:doctor` passed against BNA production.
- `npm run app:smoke` passed: `ops/live-smokes/2026-06-26T11-07-20-392Z-live-app-smoke.md`.
- `npm run app:smoke:rabbi-onetime-landing` passed: `ops/live-smokes/2026-06-26T11-07-17-297Z-rabbi-onetime-landing-smoke.md`.
- `npm run app:smoke:one-time-shared-review` passed: `ops/live-smokes/2026-06-26T11-07-17-573Z-one-time-shared-review-live-smoke.md`.
- `node scripts/smoke-rabbi-scheller-workspace-live.mjs` passed: `ops/live-smokes/2026-06-26T11-08-48-617Z-rabbi-scheller-workspace-live-smoke.md`.
- Targeted service-provider scopes live smoke passed: `ops/live-smokes/2026-06-26T11-12-12-747Z-service-provider-scopes-live-smoke.md`.
- `npm run app:smoke:public-privacy` passed: `ops/live-smokes/2026-06-26T11-13-01-422Z-public-route-privacy-smoke.md`.
- `npm run app:smoke:operations-workspace-taxonomy` passed: `ops/live-smokes/2026-06-26T11-13-18-505Z-operations-workspace-taxonomy-live-smoke.md`.
- `npm run app:smoke:operations-helper` passed: `ops/live-smokes/2026-06-26T11-13-18-510Z-operations-helper-live-smoke.md`.

Remaining: none.
