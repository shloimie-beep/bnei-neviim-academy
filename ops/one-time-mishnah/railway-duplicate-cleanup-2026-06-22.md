# Railway Duplicate Project Cleanup

Date: 2026-06-22
Requirement: `REQ-20260619-313`

## Summary

The operator reported three duplicate `one-time-production` Railway projects in
the Railway dashboard. CLI account access was available at cleanup time.

## What Was Found

`railway list --json` showed three projects named `one-time-production`, all in
workspace `sdratler's Projects`, all with zero services:

- Kept: `ce55ef20-1418-4ad3-aafa-f877fb992dc8`
  - Created: `2026-06-22T06:37:02.726Z`
  - Services: `0`
- Deleted duplicate: `6ae05dfe-fba5-4fb1-8230-67e9fa1c6eb9`
  - Created: `2026-06-22T06:41:04.257Z`
  - Services: `0`
- Deleted duplicate: `7f431f5c-7ba7-4f8d-b2f2-e4b7604a1adb`
  - Created: `2026-06-22T10:30:37.794Z`
  - Services: `0`

No project with services was deleted. `skillful-motivation`,
`satisfied-imagination`, and other projects were not changed.

## Commands Run

```powershell
railway delete --project 7f431f5c-7ba7-4f8d-b2f2-e4b7604a1adb --yes --json
railway delete --project 6ae05dfe-fba5-4fb1-8230-67e9fa1c6eb9 --yes --json
railway list --json
npm run one-time:railway-provision:check -- --json
```

## Guardrail Fix

The duplicate was traced to a script-risk in the provisioning helpers: the
Railway project list was truncated before JSON parsing. With a longer Railway
project list, that could make automation miss the existing `one-time-production`
project and create another duplicate.

Fixed:

- `scripts/preflight-onetime-railway-provisioning.mjs` now parses full
  `railway list --json` output internally while still exposing only a redacted
  summary.
- `scripts/provision-onetime-railway-instance.mjs` now parses full Railway list
  output and supports `--project-id` / `ONE_TIME_RAILWAY_PROJECT_ID` so future
  provisioning can be pinned to the kept project:

```powershell
npm run one-time:railway-provision:apply -- --project-id ce55ef20-1418-4ad3-aafa-f877fb992dc8 --apply --confirm PROVISION_ONE_TIME_INSTANCE
```

## Current State

After cleanup, exactly one `one-time-production` project remains:

`ce55ef20-1418-4ad3-aafa-f877fb992dc8`

It is still empty. No Railway service, Postgres database, variable write,
deployment, custom domain, DNS record, email send, billing action, Zoom meeting,
Vimeo upload, or production database write was performed.

The plan remains one canonical codebase and UI. BNA and One Time should be
separate deployments/databases, not separate places to edit the UI.
