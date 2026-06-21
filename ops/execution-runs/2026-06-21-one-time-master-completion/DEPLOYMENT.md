# Deployment

## Baseline

- Pre-run Railway deployment: `f9921a2d-d614-44df-88c0-392d810ddebd`
- Pre-run Railway doctor: PASS
- Pre-run live smoke:
  `ops/live-smokes/2026-06-21T07-57-58-409Z-live-app-smoke.md`

## Batch 3

- Deployment ID: `89967278-38dc-49f3-a70d-4536c59f82f6`
- Deployed commit: `f8a2fd62`
- Service/environment: `skillful-motivation / production`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T09-19-35-834Z-live-app-smoke.md`
- Focused Task/Decision live smoke: PASS,
  `ops/live-smokes/2026-06-21T09-19-39-131Z-task-decision-batch3-live-smoke.md`

Prior failed checks during the same batch:

- Deployment `fbf13644-a344-4fd0-8a23-0276b2faff0c` exposed an ambiguous
  `project_key` SQL reference for `task_view=one_time_tasks`; fixed in
  `a28a9332`.
- Deployment `1b174b4f-4492-4ecf-b307-55a1b990031d` allowed text-matched BNA
  rows into the One Time task filter; fixed in `f8a2fd62`.
- `npm run app:smoke:operations-workspace-taxonomy` failed on the unrelated
  pre-existing `Family Directory` HTML expectation. The focused Batch 3 smoke
  passed after the scoping fix.

## Batch 4

- Deployment ID: `04fde749-fca1-4e54-a7c4-f2ece847847b`
- Deployed commit: `c8d93646`
- Service/environment: `skillful-motivation / production`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T09-51-25-585Z-live-app-smoke.md`
- Focused workspace-user live smoke: PASS,
  `ops/live-smokes/2026-06-21T09-53-03-531Z-workspace-user-role-live-smoke.md`

Prior failed checks during the same batch:

- Initial deploy command in the clean PR worktree failed before upload because
  `.secrets/railway-token.txt` is intentionally not present there. The deploy
  was rerun with `RAILWAY_TOKEN` loaded from the main repo local secret file
  without printing the token.
- First focused workspace-user smoke queried `/health`; the deployed app uses
  `/api/health`. The smoke was corrected and rerun successfully.

## Batch 5

- Deployment ID: `9c31c21f-143e-46f3-b95d-2b458a848d9f`
- Deployed commit: `90da952bf3a0c57ce60b4532e193f869a677df47`
- Service/environment: `skillful-motivation / production`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T10-10-19-366Z-live-app-smoke.md`
- Focused visible-action live smoke: PASS,
  `ops/live-smokes/2026-06-21T10-11-36-599Z-one-time-visible-actions-live-smoke.md`

Focused live smoke verified production health, task/decision action controls,
One Time class/session/appointment/video setup controls, integration setup
controls, and removal of the old generic placeholder handlers.

## Batch 6

- Deployment ID: `d6c09c49-8372-42d7-8b3b-a049ab24ad63`
- Deployed commit: `c98c06d7735ec19dec1684684a594de0636064c7`
- Service/environment: `skillful-motivation / production`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T10-56-35-826Z-live-app-smoke.md`
- Production after-audit capture: PASS, 141 screenshots, 0 errors,
  `ops/ui-audits/2026-06-21-batch6-after-prod/ui-audit-report.md`
- Focused Operations filter-rail live smoke: PASS,
  `ops/live-smokes/2026-06-21T11-06-48-694Z-operations-filter-rail-live-smoke.md`

Focused live smoke verified production health, Operations login, deployed
bundle markers for the top filter rail, absence of the old module toolbar,
single-row mobile filter rails at 430px/390px/360px, and no page-level
horizontal overflow at those mobile widths.

Prior failed checks during the same batch:

- `ops/live-smokes/2026-06-21T11-03-20-126Z-operations-filter-rail-live-smoke.md`
  failed because the smoke expected the Blocked filter ID to be `blocked`; the
  live app's stable ID is `pending`.
- `ops/live-smokes/2026-06-21T11-04-55-135Z-operations-filter-rail-live-smoke.md`
  failed because the smoke used `networkidle` on an Operations page that stays
  active after DOM readiness. The successful rerun used explicit selector
  waits.

## Batch 7

- Deployment ID: `3265d380-9a93-488d-844f-f523367aa4e2`
- Deployed commit: `b3f5a1e2135a35e001c4eeaeeb4c392d19100d0f`
- Service/environment: `skillful-motivation / production`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T11-33-08-112Z-live-app-smoke.md`
- Focused/repeatable WhatsApp UX live smoke: PASS,
  `ops/live-smokes/2026-06-21T11-47-26-966Z-whatsapp-ux-live-smoke.md`

Focused live smoke verified production health, Operations login, scoped WAPI
phonebook report, sanitized WhatsApp messages with raw payloads hidden by
default, deployed Operations WhatsApp bundle markers, desktop/mobile rendering,
disabled send readiness, no page-level horizontal overflow, and no
GHL/GoHighLevel/LeadConnector UI terms. No WhatsApp send or external write was
performed.

Prior focused smoke-script failures during the same batch:

- `ops/live-smokes/2026-06-21T11-32-25-063Z-live-app-smoke.md`
  failed the standard live smoke because scoped One Time credentials did not
  establish an `/api/bna/auth/me` session. The passing rerun used standard
  Operations `OPS_*` credentials.
- `ops/live-smokes/2026-06-21T11-31-29-921Z-whatsapp-ux-live-smoke.md`
  did not load credentials from the main local keyholder env file.
- `ops/live-smokes/2026-06-21T11-33-10-414Z-whatsapp-ux-live-smoke.md`
  and `ops/live-smokes/2026-06-21T11-34-54-870Z-whatsapp-ux-live-smoke.md`
  expected a legacy `success` wrapper on `/api/bna/whatsapp/messages`.
- `ops/live-smokes/2026-06-21T11-35-53-288Z-whatsapp-ux-live-smoke.md`
  assumed zero WhatsApp messages should force an empty phonebook view.
- `ops/live-smokes/2026-06-21T11-41-52-261Z-whatsapp-ux-live-smoke.md`
  used a visible-state wait on the responsive pane. The successful rerun
  asserted the actual guardrail copy, disabled send gate, no external write
  flag, sanitized API readback, and desktop/mobile DOM state.
- `ops/live-smokes/2026-06-21T11-45-19-349Z-whatsapp-ux-live-smoke.md`
  repeated the visible-state wait issue before the attached-state rerun passed.

## Batch 8

- Deployment ID: `3ec03a01-2141-401f-988f-a734176a778c`
- Deployed commit: `847649198dfaf9f12fd69db958c3f927b460ecd8`
- Service/environment: `skillful-motivation / production`
- Railway doctor/poll after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T12-12-08-310Z-live-app-smoke.md`
- Focused Email/Resend UX live smoke: PASS,
  `ops/live-smokes/2026-06-21T12-10-31-966Z-email-resend-ux-live-smoke.md`

Focused live smoke verified production health, Resend provider/sender/domain
readiness separation, live `RESEND_API_KEY` readback (`configured: true`),
domain endpoint readback with one connected domain, webhook event readback with
raw payload hidden by default, Communications > Email and Communications >
Settings rendering at 1024px and 390px, disabled send controls, and no
page-level horizontal overflow. No email send, DNS verification/mutation,
Resend domain mutation, or provider send was performed.

Prior focused smoke failure during the same batch:

- `ops/live-smokes/2026-06-21T12-03-06-468Z-email-resend-ux-live-smoke.md`
  failed because Communications > Settings still rendered the placeholder lane.
  The deployed UI was corrected to render the real communications integration
  panel there, then redeployed and smoke-tested successfully.
- `ops/live-smokes/2026-06-21T12-06-50-692Z-email-resend-ux-live-smoke.md`
  passed the UI/no-send contract before `RESEND_API_KEY` propagation; the final
  post-propagation deployment and smoke above verified the live key readback.

## Batch 9/10

- Deployment ID: `8c20ae67-9acc-43f2-b77d-c10fcd425d73`
- Deployed commit: `45ed36787ca519819a1adfb8f372267d96330a64`
- Service/environment: `skillful-motivation / production`
- Railway doctor/poll after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T12-36-43-923Z-live-app-smoke.md`
- Focused One Time product/booking live smoke: PASS,
  `ops/live-smokes/2026-06-21T12-38-45-981Z-one-time-product-booking-live-smoke.md`

Focused live smoke verified production product-offer readback, availability
readback, portal foundation readback, internal class-event creation, internal
appointment-intent creation, Operations schedule rendering at 1440px and 390px,
and no page-level horizontal overflow. No payment, invoice, email, WhatsApp,
Zoom meeting, access grant, participant invite, upload, or external calendar
write was performed.

Prior focused smoke-script failures during the same batch:

- `ops/live-smokes/2026-06-21T12-36-42-823Z-one-time-product-booking-live-smoke.md`
  failed because the smoke expected a native enhanced select to remain visible.
- `ops/live-smokes/2026-06-21T12-38-15-716Z-one-time-product-booking-live-smoke.md`
  failed because the smoke over-flagged an unrelated in-app `Send` control.

## Batch 9A

- Deployment ID: `c1623618-a00c-46d0-8be9-5a8e4102b376`
- Deployed commit: `efe1d86d194cef483f5d6d9d418a769e20800989`
- Service/environment: `skillful-motivation / production`
- Railway doctor/poll after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T13-21-50-721Z-live-app-smoke.md`
- Focused source-envelope parser live smoke: PASS,
  `ops/live-smokes/2026-06-21T13-22-11-379Z-source-envelope-parser-live-smoke.md`

Focused live smoke verified the deployed `/api/bna/intake/parse` dry-run path
with a synthetic Dratler-family filename, required source-envelope fields,
default `family_meeting` / `dratler_family` classification, and embedded
`Operations task:` override to `internal_super_admin` / `bna_operations`. No
parse apply, task filing, external send, billing, Zoom, Vimeo, Buffer, DNS,
CRM/GHL, or external-account write was performed.

## Batch 9B

- Railway deployment: not required for this blocked trace closeout.
- App-visible runtime code changes: none.
- Committed QA command: `72b5723a` (`test: add class upload trace live smoke`)
- Live production data mutation: content job `#78` was marked `blocked` with a
  sanitized Batch 9B blocker note after hosted transcription returned
  `401 invalid_credential`.
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T13-37-11-961Z-live-app-smoke.md`
- Focused class-upload trace live smoke: PASS / `blocked_verified`,
  `ops/live-smokes/2026-06-21T13-37-45-376Z-class-upload-trace-live-smoke.md`

No deploy ran because no app-visible runtime bundle changed. The focused live
smoke verified source readback, sanitized blocker notes, zero transcript chars,
and no parse run for source `content_recording` / `78`.

## Batch 9C

- Railway deployment: not required.
- App-visible runtime code changes: none.
- Implementation commit: `0e1f586b7e7880ca9a2d65f57339d88e15794179`
- Live smoke: not required for local Downloads inventory.
- Production data mutation: none.

Batch 9C generated only redacted local inventory artifacts under
`ops/one-time-mishnah/` and a repeatable local inventory command. No raw
spreadsheet rows, contact values, private exports, import writes, external
sends, billing actions, DNS/account changes, GHL runtime, or deployment action
was performed.

## Batch 9D

- Deployment ID: `4919c095-6301-4806-a712-0d64b4d01850`
- Deployed commit: `aedb04aade8d518427b9f4df011c8b5a9d07f306`
- Service/environment: `skillful-motivation / production`
- Railway doctor/poll after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T14-03-28-563Z-live-app-smoke.md`
- Focused One Time CRM import/dedupe live smoke: PASS,
  `ops/live-smokes/2026-06-21T14-03-47-316Z-one-time-crm-import-dedupe-live-smoke.md`

Deployment was run from a clean detached worktree at
`aedb04aade8d518427b9f4df011c8b5a9d07f306` so the unrelated uncommitted blog
data files in the main worktree were not included in the bundle.

Focused live smoke verified the deployed read-only readiness route, Operations
CRM Import Preview panel, authenticated preview route with synthetic `.invalid`
rows, metadata-only source inventory reference `DL-SHEET-f93f34d98e`, One Time
scope, scoped dedupe keys, no raw `source_row` echo, `commit_blocked: true`,
no-send, no local write, no external write, no external CRM write, and
GHL/LeadConnector forbidden runtime guardrails. No contact, tag, email,
WhatsApp, external CRM, GHL/LeadConnector, billing, or local import write was
performed.

## Batch 9E

- Deployment ID: `bf53e21c-a793-4af8-8630-a0e855d857c7`
- Deployed commit: `35db6c0e876243e61e7bce2f94db787a44626f06`
- Service/environment: `skillful-motivation / production`
- Railway doctor/poll after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T14-25-34-360Z-live-app-smoke.md`
- Focused One Time CRM Contacts UX live smoke: PASS,
  `ops/live-smokes/2026-06-21T14-25-06-483Z-one-time-crm-contacts-ux-live-smoke.md`

Deployment was run from a clean detached worktree so the unrelated
uncommitted blog JSON files in the main worktree were not included in the
bundle. An initial deploy at `b2371cdc5a58fabb70ba1e764ead9dbe3d0eb7e8`
reached Railway deployment `b3d9d893-a719-402d-a279-c9f4ed53b620`; after the
branch advanced to `35db6c0e876243e61e7bce2f94db787a44626f06`, the app was
redeployed and live-smoked again. The final active deployment is
`bf53e21c-a793-4af8-8630-a0e855d857c7`.

Focused live smoke verified the scoped parent-leads API, scoped contact
communications API, CRM Contacts UX marker and requirement ID, no-send
guardrail copy, private-BNA-data guardrail copy, dedupe/review state, and
scoped parent-lead fetch marker. It recorded only scoped counts and UI markers;
no raw contact bodies or private notes were written to the report.

No email send, WhatsApp send, payment write, external CRM write, GHL,
GoHighLevel, LeadConnector, DNS mutation, billing write, bulk campaign, or
external-account write was performed.

## Batch 9F

- Deployment ID: `12249b2b-f11c-44b0-b9fa-ba75c511c633`
- Deployed app-visible commit: `32708bfa5aa1d673a44ed5765178081ad57dc3de`
- Service/environment: `skillful-motivation / production`
- Railway doctor after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T14-50-14-514Z-live-app-smoke.md`
- Focused One Time trial/referral live smoke: PASS,
  `ops/live-smokes/2026-06-21T14-50-38-537Z-one-time-trial-referral-live-smoke.md`

Focused live smoke verified production trial/referral route readback, 30-day
trial, `$67` renewal, card-required rule, one-intro-trial-per-household rule,
first-paid-cycle referral trigger, `bna_one_time_policy_acceptances`, three
promotion policies, Operations panel markers, and no live charges, invoice
credits, sends, access grants, external CRM writes, GHL/LeadConnector runtime,
DNS mutation, or secret exposure.

Prior standard smoke attempt during the same batch:

- `ops/live-smokes/2026-06-21T14-49-04-951Z-live-app-smoke.md` failed after
  login because `/api/bna/auth/me` did not return success. The final standard
  smoke rerun passed at
  `ops/live-smokes/2026-06-21T14-50-14-514Z-live-app-smoke.md`.

Deployment was run from a clean detached worktree at
`32708bfa5aa1d673a44ed5765178081ad57dc3de` so the unrelated uncommitted blog
JSON files in the main worktree were not included in the bundle. The later evidence-only commits were not redeployed because they do not change the app bundle.

## Batch 9G

- Initial manual deployment ID:
  `a0b6dcb5-a593-41f9-9743-bcc717d41730`
- Final active deployment ID:
  `ec7724a3-76b9-4858-85e2-370af327759a`
- Deployed app-visible commit:
  `53c66d204604ac94801a33bfa4c29306bdedb83b`
- Service/environment: `skillful-motivation / production`
- Railway doctor/poll after deploy: PASS, final deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T15-10-55-665Z-live-app-smoke.md`
- Focused One Time payment/access/class-link live smoke: PASS,
  `ops/live-smokes/2026-06-21T15-11-14-543Z-one-time-payment-access-class-links-live-smoke.md`

Deployment was run from a clean detached worktree at
`53c66d204604ac94801a33bfa4c29306bdedb83b` so the unrelated uncommitted blog
JSON files in the main worktree were not included in the bundle. Manual upload
first reached deployment `a0b6dcb5-a593-41f9-9743-bcc717d41730`; a later
Railway status check showed deployment
`ec7724a3-76b9-4858-85e2-370af327759a` active at `SUCCESS`, so standard and
focused live smokes were rerun against that final active deployment and passed.

Focused live smoke verified the production readiness endpoint, Operations
Payment / Access / Class Links panel, disabled Grant Access and Reveal Join
Link blockers, approved-local-test-event access gate, relationship-scoped
class-link state, member portal protected join blocker, and no live charges,
checkout sessions, payment links, subscriptions, access grants, email/WhatsApp
sends, external CRM writes, Zoom meeting/registrant writes, raw member Zoom
URLs, host/start URLs, DNS mutation, or secret exposure.

## Batch 9H

- Railway deployment ID: `977430a7-fa56-480d-9289-5abbd6536658`
- Deployed commit: `b71b14c5252ca2145b738e11fe4ab547bb412c3a`
- Core support-flow implementation commit:
  `98b293d9b8957ec4567d8ede45f3e0d05bb1178b`
- Service/environment: `skillful-motivation / production`
- Railway doctor/poll after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T15-38-11-038Z-live-app-smoke.md`
- Focused One Time authenticated support live smoke: PASS,
  `ops/live-smokes/2026-06-21T15-38-32-390Z-one-time-authenticated-support-live-smoke.md`

Deployment was run from a clean detached worktree at
`b71b14c5252ca2145b738e11fe4ab547bb412c3a`, so the unrelated uncommitted blog
JSON files and older browser-smoke artifact changes in the main worktree were
not included in the bundle.

Focused live smoke verified member portal question/support controls, logged-out
API rejection, dry-run member session creation, `OT-SUP` ticket creation,
project-visible staff reply readback, hidden internal notes/source context,
`OT-Q` private question creation, sanitized own-row lists, and ticket close
without external-send notification.

Guardrails: no email send, WhatsApp send, SMS send, Telegram send, public forum
post, member-feed publish, payment/billing write, access grant, external CRM
write, GHL/LeadConnector runtime, Google/Zoom write, DNS mutation, or secret
exposure was performed.

## Batch 9I

- Railway deployment ID: `5751098c-2095-4d24-97db-712aba136915`
- Deployed commit: `f741fa91a909db89a79a33b6de5193c6c481732c`
- Service/environment: `skillful-motivation / production`
- Railway doctor/poll after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T15-52-36-326Z-live-app-smoke.md`
- Focused One Time test identities live smoke: PASS,
  `ops/live-smokes/2026-06-21T15-53-01-681Z-one-time-test-identities-live-smoke.md`

Deployment was run from a clean detached worktree at
`f741fa91a909db89a79a33b6de5193c6c481732c`, so the unrelated uncommitted blog
JSON files and older browser-smoke artifact changes in the main worktree were
not included in the bundle.

Focused live smoke verified the production preview endpoint, TEST-prefixed
example.test identities, mock CRM/payment/access/class-link/question/support
coverage, twelve negative authorization cases, cleanup readiness, Operations
panel rendering, disabled Apply Mock Data and Cleanup TEST Records blockers,
and no real private exports, production records, sends, billing, Zoom, Vimeo,
Google, DNS, external CRM, or secret exposure.

## Batch 12

- Deployment ID: `b2d02f20-64a8-4183-9dba-3587d0449ef7`
- Deployed commit: `7685133a6e675db6883135eb775ae4cae6b44ad2`
- Service/environment: `skillful-motivation / production`
- Railway doctor/poll after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T12-55-46-834Z-live-app-smoke.md`
- Focused One Time Zoom/attendance live smoke: PASS,
  `ops/live-smokes/2026-06-21T12-56-08-966Z-one-time-zoom-attendance-live-smoke.md`

Focused live smoke verified production Zoom status/readiness readback, session
automation preview, webhook attendance preview, blocked meeting creation,
Operations Live Classes rendering at 1440px and 390px, and no page-level
horizontal overflow. No Zoom meeting, registrant, webhook attendance write,
attendance correction, recording read, transcript read, summary read, external
send, portal publish, participant invite, or host-start URL exposure was
performed.

Prior focused smoke-script failure during the same batch:

- `ops/live-smokes/2026-06-21T12-54-52-064Z-one-time-zoom-attendance-live-smoke.md`
  failed because the smoke over-flagged safe Zoom status field names as secret
  exposure. The final smoke checks actual secret-like values and Zoom
  start-token patterns.

## Batch 11/13

- Deployment ID: `38393641-ee8e-46ed-8daf-16e67b1cde2a`
- Deployed commit: `23e16a126f6e7461858b5701f2dbd2ba719a35c7`
- Service/environment: `skillful-motivation / production`
- Railway doctor/poll after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T13-37-16-293Z-live-app-smoke.md`
- Focused One Time Vimeo/member-library live smoke: PASS,
  `ops/live-smokes/2026-06-21T13-37-41-388Z-one-time-vimeo-member-library-live-smoke.md`
- Source-envelope parser regression smoke on the same deployed bundle: PASS,
  `ops/live-smokes/2026-06-21T13-38-09-230Z-source-envelope-parser-live-smoke.md`

Focused live smoke verified production video-hosting status/readiness with
Vimeo selected, manual fallback ready, automated upload disabled, no
secret-like values, temporary class package creation with Vimeo metadata,
source asset attachment, package preview, member preview, approval,
smoke-scoped publish, library rollback, member-library smoke rollback,
temporary class archive, Operations rendering at 1440px and 390px, and public
member-library filter/grouping/progress rendering at 1440px and 390px. No
Vimeo upload, provider publish/unpublish/delete, OAuth exchange, email,
WhatsApp, payment, Zoom meeting, participant invite, real member access grant,
DNS, or external portal write was performed.

Prior focused smoke-script failures during the same batch:

- `ops/live-smokes/2026-06-21T13-21-13-527Z-one-time-vimeo-member-library-live-smoke.md`
  failed because the smoke omitted the smoke-tier access context.
- `ops/live-smokes/2026-06-21T13-21-36-456Z-one-time-vimeo-member-library-live-smoke.md`
  failed because the smoke targeted the legacy content section.

## Batch 9J

- Railway deployment ID: `b006acf0-41d5-458c-b661-2b673d8de1f7`
- Deployed commit: `6c45c4a4f5be60ae8b5dcceee66087f3d54430ae`
- Service/environment: `skillful-motivation / production`
- Railway doctor/poll after deploy: PASS, deployment status `SUCCESS`
- Standard live smoke: PASS,
  `ops/live-smokes/2026-06-21T16-05-41-875Z-live-app-smoke.md`
- Focused Agent Mode acceptance live smoke: PASS,
  `ops/live-smokes/2026-06-21T16-06-05-717Z-one-time-agent-mode-acceptance-live-smoke.md`

Deployment was run from a clean detached worktree at
`6c45c4a4f5be60ae8b5dcceee66087f3d54430ae`, so the unrelated uncommitted blog
JSON files and older browser-smoke artifact changes in the main worktree were
not included in the bundle.

Focused live smoke verified the production Agent Mode acceptance route,
Operations acceptance panel, active evidence/status controls, disabled live-run
blocker, six credential-free acceptance stages, and explicit external blockers.
No real Agent Mode external write run, charge, send, external CRM/GHL write,
Zoom/Vimeo/Google/DNS mutation, production private-data export, or secret
exposure was performed.

