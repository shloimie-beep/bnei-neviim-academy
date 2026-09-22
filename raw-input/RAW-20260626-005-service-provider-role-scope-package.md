# RAW-20260626-005 - Service Provider Role Scope Implementation Package

Source channel: `codex_chat`
Captured at: `2026-06-26T18:00:00+03:00`
Parse status: `implemented, deployed, live-verified`
Workspace/project: `bna_platform`, `rabbi_sheller_provider`, `one_time_mishnah_class`

## Raw Operator Request

> Check the downloads folder. There you're going to find a user role scope implementation package. Merge this update with the entire scope of the package.

## Located Package

- `C:\Users\User\Downloads\bna-service-provider-scopes-implementation-2026-06-26.zip`
- Extracted for inspection at `C:\Users\User\Documents\Codex\2026-06-26\service-provider-scopes-package\bna_service_provider_scopes_implementation_2026_06_26`

## Parsed Requirements

- `REQ-20260626-121`: Import the package's pure entitlement, CRM contact, and assistant-scope policy modules and tests.
- `REQ-20260626-122`: Apply the additive service-provider scopes/CRM migration in a PostgreSQL-safe form.
- `REQ-20260626-123`: Wire Operations account-scope and first-party CRM routes with tenant/workspace/provider scoping.
- `REQ-20260626-124`: Wire provider portal free-vs-Plus scope, inquiry inbox, draft-only reply, calendar readback, paid portal upgrade states, and assistant scope planning.
- `REQ-20260626-125`: Update Operations/provider UI and action/route registries for the new scope package.
- `REQ-20260626-126`: Preserve package decisions in durable memory/docs and record verification evidence before PR/merge/deploy.

## Implementation Status

Local verification passed on branch `codex/service-provider-scopes-merge-20260626`.
PR #43 was merged to `master`, Railway deployment
`112ef3b5-0ce7-45e3-9c55-368f783ccd1d` reached `SUCCESS`, and live
Operations/provider scope smoke checks passed. See
`tasks-pending/2026-06-26-service-provider-scopes-crm.md` for final evidence.
