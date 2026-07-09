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

The next top provider/operator task is still `TASK-20260702-004`, but it is
now narrowed. Agents must not ask again for Railway, DB, join-domain,
Zoom/class-link, or Vimeo/Drive setup unless fresh readback contradicts the
current readiness report.

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

- Rabbi Stripe sandbox/test key and `$67/month` product/price aliases
- Whapi/WAPI instance and phone aliases

No longer needed as operator blockers:

- One Time Zoom session/join alias: hosted class link is present by redacted
  OneTime Railway readback.
- `VIMEO_ACCESS_TOKEN`: media setup is ready enough for current launch
  readiness; private upload testing remains a later explicit provider action.
- `ONE_TIME_DRIVE_DROP_FOLDER_ALIAS`: configured by current readiness
  readback.

## TASK-20260702-005 - Prepare Campaign Seed Requirements

Priority: 2
Owner: Shloimie
Visible lane: Pending

The deployed landing/signup link has passed live smoke. Provide final campaign
copy, exact recipient segment/list source, suppression/unsubscribe proof, and
seed approval for `sdratler@gmail.com`. No real campaign send is approved here.
