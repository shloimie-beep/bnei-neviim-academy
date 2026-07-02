# One Time Launch Top Visible Operator Tasks

Generated: 2026-07-02
Source: `RAW-20260702-006`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Railway provisioning is no longer the top human task. Codex ran the guarded
Railway apply and reused/verified:

- Railway project: `one-time-production`
- Web service: `one-time-web`
- Database service: `one-time-postgres`
- Non-secret One Time runtime variables
- `DATABASE_URL` service reference for the web service
- Railway custom domain attachment for `join.onetimeonetime.com`

No DNS record was changed by Codex. No deploy, email, WhatsApp, Stripe, Vimeo,
Zoom, production data delete, or campaign send occurred.

## Current Next Task

The next task at the top should be `TASK-20260702-003`: add the GoDaddy DNS
records for `join.onetimeonetime.com`.

## TASK-20260702-001 - Separate One Time Railway Target

Status: Done by guarded Codex apply
Evidence: `ops/one-time-mishnah/onetime-railway-provisioning-report.json`

Result: `one-time-production`, `one-time-web`, and `one-time-postgres` are
present/linked. Non-secret variables were set. Secrets, deploy, and DNS were
skipped during the first apply.

## TASK-20260702-002 - Separate One Time Database Service / Reference

Status: Service/reference ready
Evidence: `ops/one-time-mishnah/onetime-railway-provisioning-report.json`

Result: `one-time-postgres` exists and `one-time-web` has `DATABASE_URL` set to
the Railway service reference. Database bootstrap dry-run passed. Applying
bootstrap/mock review data still waits for the safe One Time DB runtime/alias.

## TASK-20260702-003 - Add GoDaddy DNS Records For `join.onetimeonetime.com`

Priority: 1
Owner: Shloimie / domain owner
Visible lane: Pending

Add these records in GoDaddy DNS for `onetimeonetime.com`:

| Type | Host | Value |
| --- | --- | --- |
| CNAME | `join` | `awaz36ln.up.railway.app` |
| TXT | `_railway-verify.join` | `railway-verify=73e92e55cb07e5a0abdb0a72f204d437d915c3134e844af12f419407632a97d6` |

Do not touch apex/root `onetimeonetime.com`, `www`, nameservers, or forwarding.

Codex verification after DNS:

- `npm run one-time:setup:check -- --write-report`
- post-setup deploy/live-smoke packet after remaining provider secrets are
  configured

Detailed handoff:

- `ops/domain-readbacks/2026-07-02-join-onetimeonetime-domain-task.md`
- `ops/one-time-mishnah/launch-unblocker/2026-07-02-godaddy-join-subdomain-instructions.md`

## TASK-20260702-004 - Provide Zoom Session Alias

Priority: 2
Owner: Shloimie / Rabbi
Visible lane: Pending

Provide a keyholder/private-storage alias for the Zoom session details, plus
class date/time, member-facing display label, rotation policy, and fallback
message. Do not commit or expose the raw Zoom link.

## TASK-20260702-005 - Provide Vimeo And Drive Intake Aliases

Priority: 3
Owner: Shloimie / Vimeo account owner
Visible lane: Pending

Provide the Vimeo access token alias/path and Drive intake/drop folder alias.
Safe smoke found Vimeo client fields but no `VIMEO_ACCESS_TOKEN`.

## TASK-20260702-006 - Provide Rabbi Stripe Sandbox Setup

Priority: 4
Owner: Shloimie / Rabbi
Visible lane: Pending

Provide Rabbi Stripe test credential alias/path and `$67/month` sandbox
product/price ID or alias. The current smoke detected a live Stripe key and
correctly refused sandbox API calls.

## TASK-20260702-007 - Provide Rabbi Whapi/WAPI Setup

Priority: 5
Owner: Shloimie / Rabbi
Visible lane: Pending

Provide Rabbi Whapi/WAPI token alias, instance ID, sending phone number, and
safe Rabbi recipient phone. The prepared setup message remains blocked; no
WhatsApp send occurred.

## TASK-20260702-008 - Prepare Campaign Seed Requirements

Priority: 6
Owner: Shloimie
Visible lane: Pending

Wait until `join.onetimeonetime.com` is live, then provide final campaign copy,
exact recipient segment/list source, suppression/unsubscribe proof, and seed
approval for `sdratler@gmail.com`. No real campaign send is approved here.
