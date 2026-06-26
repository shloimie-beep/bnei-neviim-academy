# Service Provider Scopes + First-Party CRM Package

Source: `RAW-20260626-005`
Package: `C:\Users\User\Downloads\bna-service-provider-scopes-implementation-2026-06-26.zip`
Branch: `codex/service-provider-scopes-merge-20260626`
Pull request: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/43`
Status: `draft PR opened; pending review/merge, deploy, and live smoke`

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
| `REQ-20260626-121` | Local verified | Imported `src/lib/bna/account-scope-entitlements.js`, `src/lib/bna/crm-contact-model.js`, `src/lib/bna/assistant-scope-policy.js`, and matching tests. `node --test tests/account-scope-entitlements.test.js tests/crm-contact-model.test.js tests/assistant-scope-policy.test.js` passed. |
| `REQ-20260626-122` | Local verified | Added `railway-migration-2026-06-26-service-provider-scopes-crm.sql`; corrected invalid expression unique constraints to deployable `project_key TEXT NOT NULL DEFAULT ''` uniqueness. Migration loads during server DB startup. |
| `REQ-20260626-123` | Local verified | Added `/api/bna/account-scope/summary`, `/api/bna/crm/contacts`, `/api/bna/crm/contacts/:id/timeline`, and `/api/bna/assistant/scope-plan` with scoped allowlist entries. `tests/service-provider-scope-routes.test.js` passed. |
| `REQ-20260626-124` | Local verified | Added provider scope session, inquiries, draft-only response, calendar readback, and assistant scope-plan endpoints; provider payload now returns scope/provider sections/assistant capabilities. Route contract test passed. |
| `REQ-20260626-125` | Local verified | Updated `public/provider.html`, `public/operations.html`, `ops/action-registry.json`, and `ops/route-registry.json`; regenerated One Time action coverage and universal action parity artifacts. `npm run watchdog:actions` passed with 0 findings. |
| `REQ-20260626-126` | Local verified | Added `docs/product/service-provider-scopes-crm.md`, `MEMORY.md` entry, raw intake, this register, changelog, and ledger records. |

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

## Deployment

No deployment or live smoke has been run for this package branch yet. The package itself says not to deploy without explicit approval for the final integrated branch.

Next step: review/merge PR #43, deploy the merged branch, and run live Operations/provider smoke checks before marking app-visible requirements fully done.
