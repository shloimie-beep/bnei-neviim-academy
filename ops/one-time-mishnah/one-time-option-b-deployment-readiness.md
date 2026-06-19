# One Time Option B Deployment Readiness

Date: 2026-06-19

Requirement: `REQ-20260619-313`

Status: `needs_operator_decision`

Mode: local readiness only. No deployment, Railway resource creation, database
creation, DNS/domain change, production data mutation, live smoke, external
send, or external connector write was performed.

## Target Architecture

Option B remains the recommended production boundary for One Time:

- Shared BNA/My Academy codebase.
- Separate One Time client deployment.
- Separate One Time production variables.
- Separate One Time domain.
- Separate One Time production database when approved.
- Separate staging and production environments.
- No reliance on BNA production credentials.

This is a launch boundary, not permission to create paid infrastructure. The
operator/domain owner must approve ownership, budget, account, database,
domain, and launch-window decisions before any live action.

## Required Decision

| ID | Decision | Blocks |
|---|---|---|
| `DEC-20260619-300` | Approve or revise Option B boundaries for One Time deployment/database/domain ownership. | New Railway project/service, new database, domain/DNS changes, production launch. |
| `Q-20260619-300` | Is Option B formally approved for One Time production architecture? | Asset ownership, Railway cost acceptance, production environment creation. |

## Deployment Profile

| Field | Draft value | Status |
|---|---|---|
| Codebase | Current BNA Express/static app | Draft ready |
| Project key | `one_time_mishnah_class` | Existing local contract |
| Workspace key | `rabbi_sheller_provider` | Existing local contract |
| Railway builder | Nixpacks via `railway.json` | Existing local config |
| Start command | `npm start`, which runs `scripts/railway-start.mjs` | Existing local config |
| Web process | `BNA_RAILWAY_PROCESS=web` starts `node server.js` | Existing local config |
| Worker processes | Academy/Rabbi Telegram process map exists but should not be enabled for One Time client launch unless separately approved | Needs operator decision |
| Production variables | Separate One Time-specific values, not copied blindly from BNA production | Needs operator decision |
| Production database | Separate One Time database when approved | Needs operator decision |
| Domain | Separate One Time domain/subdomain | Needs operator/domain decision |

## Identity Map

| Identity | Intended owner | Launch note |
|---|---|---|
| BNA/My Academy codebase | BNA/My Academy operator | Shared code stays in this repo unless a future split is approved. |
| One Time client deployment | Operator-approved client/agency account | Must be named and budget-approved before creation. |
| One Time database | Operator-approved client/agency account | Must not reuse BNA private production data as the client boundary. |
| Domain/DNS | Operator/domain owner | DNS records require explicit owner approval. |
| Sender domain | Pending communications decision | Must align with Resend/domain decision before sends. |
| Zoom/Vimeo/payment accounts | Pending provider decisions | Keep no-write until each account path is approved. |

## Database Identity Guard

Before any One Time database bootstrap:

1. Confirm the target database URL points to the approved One Time database.
2. Record a redacted fingerprint of the target connection, not the secret.
3. Confirm `project_key=one_time_mishnah_class` and
   `workspace_key=rabbi_sheller_provider` seeds are intended for this database.
4. Run schema/bootstrap steps separately from client-specific seed/content
   imports.
5. Refuse bootstrap if the database fingerprint matches the active BNA
   production database unexpectedly.

## Schema vs Client Seed Separation

Schema bootstrap may include tables, indexes, constraints, and generic
workspace/project support.

Client seed bootstrap may include the One Time project/workspace identities,
Rabbi/provider branding, approved tiers, schedules, classes, and content
metadata only after owner approval.

Never mix schema migration, client seed data, payment/provider credentials,
member imports, source-content ingestion, or notification sends into one
irreversible launch step.

## Railway Runbook

Allowed before approval:

- Inspect `railway.json`.
- Inspect `package.json` scripts.
- Inspect `scripts/railway-start.mjs`.
- Run local syntax/tests/validators.
- Prepare this readiness packet.

Blocked until explicit approval:

- Create a new paid Railway project/service.
- Attach/create a production database.
- Write Railway variables.
- Run `railway up` or redeploy for this launch.
- Run Railway doctor against a new One Time service.
- Mark the launch deployed or live-smoked.

After approval, record:

- Railway project/service name.
- Railway deployment id.
- Database target fingerprint.
- Variable set fingerprint/coverage, without secrets.
- Smoke report path.
- Rollback target deployment/domain.

## Cost Worksheet

| Cost item | Decision needed |
|---|---|
| Railway service/project | Approve owner account and recurring budget. |
| Postgres database | Approve owner account, backup/retention tier, and data boundary. |
| Domain/DNS | Confirm domain owner, registrar/DNS host, and launch record set. |
| Email sender/domain | Confirm sender domain, DNS records, and Resend account path. |
| Zoom/Vimeo/payment providers | Confirm provider accounts before live integrations. |

## Asset Ownership Register

| Asset | Owner required before launch |
|---|---|
| Railway project/service | Yes |
| Production database | Yes |
| Domain/DNS zone | Yes |
| Sender domain | Yes |
| Zoom account | Yes |
| Vimeo/video hosting account | Yes |
| Payment processor account | Yes |
| Backup/export location | Yes |
| Smoke-test identities | Yes |

## Domain / DNS Checklist

Do not change DNS until the owner approves:

- Exact domain or subdomain.
- DNS provider and account owner.
- Railway target/service.
- Required records.
- TTL/change window.
- Rollback target.
- Verification path after propagation.

## Backup Plan

Before production launch:

- Export or snapshot the target One Time database.
- Store the export/snapshot in an approved owner-controlled location.
- Record fingerprint/path metadata without committing secrets or private data.
- Verify that restore/readback is possible before destructive cleanup or launch
  migration steps.

## Rollback Plan

Rollback must identify:

- Previous Railway deployment id or previous service target.
- Previous domain/DNS target and TTL.
- Database rollback/snapshot target.
- Feature flags or environment toggles to disable member/portal exposure.
- Communication/no-send state if launch fails after notifications are staged.

## Staging Smoke Plan

After approval and before production launch:

- Run syntax checks.
- Run focused One Time tests.
- Run execution-run validation.
- Run secret audit.
- Run diff checks.
- Run local app smoke.
- Run staging Operations smoke.
- Run owner/admin smoke.
- Run parent/student portal smoke with approved test identities.
- Run privacy smoke for public, parent, student, transcript, community, and
  assistant boundaries.

## Production Launch Plan

After approval and staging pass:

1. Confirm backup and rollback evidence.
2. Deploy the approved app bundle to the approved One Time target.
3. Run Railway doctor.
4. Run production health smoke.
5. Run Operations smoke.
6. Run One Time owner/admin smoke.
7. Run platform Super Admin smoke.
8. Run parent portal smoke with approved test identity.
9. Run student portal smoke with approved test identity.
10. Run public privacy smoke.
11. Record deployment id, domain target, smoke report paths, blockers, and next
    action.

## Final Batch 13 Status

`REQ-20260619-313` remains `needs_operator_decision`. The local readiness
packet is complete enough for the operator to approve, revise, or reject the
Option B launch boundary. It is not deployed, live-smoked, or externally
executed.
