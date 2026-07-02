# One Time Launch Top Visible Operator Tasks

Generated: 2026-07-02T15:42:42+03:00
Source: `RAW-20260702-007`
Workspace/project: `rabbi_sheller_provider` / `one_time_mishnah_class`

Railway provisioning, the separate database service reference, and
`join.onetimeonetime.com` DNS are no longer the top human task.

Codex completed or verified:

- Railway project: `one-time-production`
- Web service: `one-time-web`
- One Time database service reference on `one-time-web`
- `join.onetimeonetime.com` CNAME/TXT DNS
- Resend, Zoom credential, and Vimeo client credential env propagation to
  `one-time-web` by safe keyholder fingerprint readback

No apex/root DNS mutation, deploy, email, WhatsApp, Stripe payment, Vimeo
upload, Zoom mutation, production data delete, or campaign send occurred.

## Current Next Task

The next top provider/operator task is `TASK-20260702-004`: provide or label
the remaining One Time provider aliases needed for live class/media/payment/
WhatsApp readiness.

## TASK-20260702-001 - Separate One Time Railway Target

Status: Done by guarded Codex apply
Evidence: `ops/one-time-mishnah/onetime-railway-provisioning-report.json`

## TASK-20260702-002 - Separate One Time Database Service / Reference

Status: Done service-reference ready
Evidence: `ops/one-time-mishnah/launch-unblocker/2026-07-02-external-setup-readiness-check.md`

Local DB bootstrap apply is blocked because Railway Postgres resolves to an
internal host from this machine. Run bootstrap from inside the deployed Railway
service after deployment.

## TASK-20260702-003 - Verify `join.onetimeonetime.com`

Status: Done
Evidence: `ops/domain-readbacks/2026-07-02-join-onetimeonetime-domain-task.md`

DNS verified:

| Type | Host | Value |
| --- | --- | --- |
| CNAME | `join` | `awaz36ln.up.railway.app` |
| TXT | `_railway-verify.join` | `railway-verify=73e92e55cb07e5a0abdb0a72f204d437d915c3134e844af12f419407632a97d6` |

## TASK-20260702-004 - Provide Remaining Provider Aliases

Priority: 1
Owner: Shloimie / provider account owners
Visible lane: Pending

Needed:

- One Time Zoom session/join alias
- `VIMEO_ACCESS_TOKEN`
- `ONE_TIME_DRIVE_DROP_FOLDER_ALIAS`
- Rabbi Stripe sandbox/test key and `$67/month` product/price aliases
- Whapi/WAPI instance and phone aliases

## TASK-20260702-005 - Prepare Campaign Seed Requirements

Priority: 2
Owner: Shloimie
Visible lane: Pending

After the deployed landing/signup link passes live smoke, provide final
campaign copy, exact recipient segment/list source, suppression/unsubscribe
proof, and seed approval for `sdratler@gmail.com`. No real campaign send is
approved here.
