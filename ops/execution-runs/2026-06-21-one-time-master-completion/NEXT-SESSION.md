# Next Session

Batches 0-8, Batch 9/10 base slice, Batch 9A, Batch 9C, Batch 9D, Batch 9E,
Batch 11/13, and Batch 12 are deployed/live-verified or locally verified as
appropriate on PR #5. Batch 9B is terminal blocked on hosted transcription
credentials. Run the execution runner after this closeout commit is pushed and
continue with the next unblocked open requirement it selects:
`REQ-20260621-906` / Batch 9F warm-lead trial and referral configuration.
Exact next command:

```powershell
npm run bna:run:next
```

Do not run external sends, billing, DNS, real Zoom meeting creation, real Vimeo
upload/publication, hard deletes, or PR merge.

<!-- batch-2:start -->
## Batch 2 Handoff

Batch 2 is locally verified. Continue with `REQ-20260619-302` / `batch-3`: production Task and Decision census, backup/export, dry-run cleanup plan, reversible archive/quarantine workflow, scoped default views, and tests.

Exact next command:

```powershell
npm run bna:run:next
```
<!-- batch-2:end -->

<!-- batch-3:start -->
## Batch 3 Handoff

Production cleanup has already been applied through reversible task APIs:

- 5 One Time records re-scoped into One Time.
- 1 internal handoff card quarantined.
- 139 non-private duplicate One Time pending fan-out records archived against a canonical task.
- Final live census shows workspace isolation passed.

Batch 3 is deployed and live-verified. Continue to Batch 4.
<!-- batch-3:end -->

<!-- batch-4:start -->
## Batch 4 Handoff

Workspace user and role implementation is deployed and live-verified:

- Implementation/deployed commit: `c8d93646`
- Railway deployment: `04fde749-fca1-4e54-a7c4-f2ece847847b`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T09-51-25-585Z-live-app-smoke.md`
- Focused workspace-user live smoke:
  `ops/live-smokes/2026-06-21T09-53-03-531Z-workspace-user-role-live-smoke.md`

Continue automatically with Batch 6 Operations UI/design correction.
<!-- batch-4:end -->

<!-- batch-5:start -->
## Batch 5 Handoff

Visible action coverage is deployed and live-verified.

- Implementation/pushed commit:
  `90da952bf3a0c57ce60b4532e193f869a677df47`
- Railway deployment:
  `9c31c21f-143e-46f3-b95d-2b458a848d9f`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T10-10-19-366Z-live-app-smoke.md`
- Focused visible-action live smoke:
  `ops/live-smokes/2026-06-21T10-11-36-599Z-one-time-visible-actions-live-smoke.md`

Next exact batch: Batch 6 / `REQ-20260619-304`. Use the existing UI audit
harness, fix Operations side-panel/top-filter separation, horizontal filter
rails, sticky module toolbars, button consistency, cards/lists, and responsive
behavior, then capture before/after evidence.
<!-- batch-5:end -->

<!-- batch-6:start -->
## Batch 6 Handoff

Operations UI/design correction is deployed and live-verified.

- Requirement: `REQ-20260619-304`
- Implementation status: `verified_live`
- Implementation/pushed/deployed commit:
  `c98c06d7735ec19dec1684684a594de0636064c7`
- Railway deployment:
  `d6c09c49-8372-42d7-8b3b-a049ab24ad63`
- Before-audit evidence:
  `ops/ui-audits/2026-06-21-batch6-before-prod/ui-audit-report.md`
- After-audit evidence:
  `ops/ui-audits/2026-06-21-batch6-after-prod/ui-audit-report.md`
- Local Playwright smoke:
  `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.md`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T10-56-35-826Z-live-app-smoke.md`
- Focused Operations filter-rail live smoke:
  `ops/live-smokes/2026-06-21T11-06-48-694Z-operations-filter-rail-live-smoke.md`
- Focused local test result: 41 passed, 0 failed.

Next exact action:

```powershell
npm run bna:run:next
```

Continue automatically with Batch 7 / `REQ-20260621-503` WhatsApp UX.
<!-- batch-6:end -->

<!-- batch-7:start -->
## Batch 7 Handoff

WhatsApp UX is deployed and live-verified.

- Requirement: `REQ-20260621-503`
- Implementation status: `verified_live`
- Implementation/pushed/deployed commit:
  `b3f5a1e2135a35e001c4eeaeeb4c392d19100d0f`
- Railway deployment:
  `3265d380-9a93-488d-844f-f523367aa4e2`
- Key files:
  `public/operations.html`, `server.js`,
  `src/lib/bna/wapi-phonebook-report.js`
- Focused communications tests: 30 passed, 0 failed.
- Operations runtime smoke: 10 passed, 0 failed.
- Local audit smoke: PASS `npm run ops:audit -- smoke-login`.
- Standard live smoke:
  `ops/live-smokes/2026-06-21T11-33-08-112Z-live-app-smoke.md`
- Focused/repeatable WhatsApp UX live smoke:
  `ops/live-smokes/2026-06-21T11-47-26-966Z-whatsapp-ux-live-smoke.md`

Next exact action:

```powershell
npm run bna:run:next
```

Continue automatically with Batch 8 / `REQ-20260621-504` Email and Resend UX.
Do not send live email.
<!-- batch-7:end -->

<!-- batch-8:start -->
## Batch 8 Handoff

Email and Resend UX is deployed and live-verified.

- Requirement: `REQ-20260621-504`
- Implementation status: `verified_live`
- Implementation commit:
  `fdd39bf327356675f8006bcc4ce04425061ef57e`
- Final pushed/deployed commit:
  `847649198dfaf9f12fd69db958c3f927b460ecd8`
- Railway deployment:
  `3ec03a01-2141-401f-988f-a734176a778c`
- Key files:
  `public/operations.html`, `server.js`,
  `src/lib/integrations/resend-client.js`,
  `scripts/provider-env-railway-propagate.mjs`,
  `scripts/smoke-email-resend-ux-live.mjs`,
  `docs/integrations/RESEND.md`
- Sender/domain Decision:
  `ops/one-time-mishnah/resend-sender-domain-decision.md`
- Focused Email/Resend tests: 19 passed, 0 failed.
- Standard live smoke:
  `ops/live-smokes/2026-06-21T12-12-08-310Z-live-app-smoke.md`
- Focused Email/Resend UX live smoke:
  `ops/live-smokes/2026-06-21T12-10-31-966Z-email-resend-ux-live-smoke.md`
- Resend API-key propagation reports:
  `ops/qa-runs/2026-06-21T12-08-03-312Z-provider-env-railway-propagation.md`
  and
  `ops/qa-runs/2026-06-21T12-08-11-738Z-provider-env-railway-propagation.md`

Next exact action:

```powershell
npm run bna:run:next
```

Continue automatically with Batch 9/10 / `REQ-20260619-306` product,
schedule, booking, portals, and billing/access foundations. Do not create live
charges, payment links, access grants, bulk emails, or external account writes.
<!-- batch-8:end -->

<!-- batch-9-10:start -->
## Batch 9/10 Handoff

Product, scheduling, booking, and portal foundations are deployed and
live-verified.

- Requirement: `REQ-20260619-306`
- Implementation status: `verified_live`
- Implementation/pushed/deployed commit:
  `45ed36787ca519819a1adfb8f372267d96330a64`
- Railway deployment:
  `8c20ae67-9acc-43f2-b77d-c10fcd425d73`
- Key files:
  `src/lib/bna/one-time-product-system.js`, `server.js`,
  `public/operations.html`,
  `railway-migration-2026-06-16-one-time-product-system.sql`,
  `tests/one-time-product-system.test.js`,
  `scripts/smoke-one-time-product-booking-live.mjs`
- Focused Batch 9/10 tests: 47 passed, 0 failed.
- Standard live smoke:
  `ops/live-smokes/2026-06-21T12-36-43-923Z-live-app-smoke.md`
- Focused One Time product/booking live smoke:
  `ops/live-smokes/2026-06-21T12-38-45-981Z-one-time-product-booking-live-smoke.md`
- Guardrails: no live charges, payment links, invoices, access grants, Zoom
  meetings, participant invites, email sends, WhatsApp sends, uploads, or
  external calendar writes.

Next exact actions:

```powershell
npm run bna:run:next
```

Continue automatically with Batch 11 / `REQ-20260619-308` Vimeo and
member-library pipeline. Do not perform a real Vimeo upload without user-level
authorization and token.
<!-- batch-9-10:end -->

<!-- batch-12:start -->
## Batch 12 Handoff

Zoom meeting and attendance foundation is deployed and live-verified.

- Requirement: `REQ-20260619-307`
- Implementation status: `verified_live`
- Implementation/pushed/deployed commit:
  `7685133a6e675db6883135eb775ae4cae6b44ad2`
- Railway deployment:
  `b2d02f20-64a8-4183-9dba-3587d0449ef7`
- Key files:
  `src/lib/integrations/zoom.js`, `server.js`, `public/operations.html`,
  `ops/route-registry.json`,
  `railway-migration-2026-06-16-one-time-product-system.sql`,
  `tests/one-time-zoom-attendance-automation.test.js`,
  `scripts/smoke-one-time-zoom-attendance-live.mjs`
- Focused Batch 12 tests: 25 passed, 0 failed.
- Standard live smoke:
  `ops/live-smokes/2026-06-21T12-55-46-834Z-live-app-smoke.md`
- Focused One Time Zoom/attendance live smoke:
  `ops/live-smokes/2026-06-21T12-56-08-966Z-one-time-zoom-attendance-live-smoke.md`
- Guardrails: no real Zoom meeting, registrant, webhook attendance write,
  attendance correction, recording read, transcript read, summary read, external
  send, portal publish, participant invite, or host-start URL exposure.

Next exact actions:

```powershell
npm run bna:run:next
```

Then continue with `REQ-20260621-902` / Batch 9B today's class-upload trace
from `RAW-20260621-002`.
<!-- batch-12:end -->

<!-- batch-9A:start -->
## Batch 9A Handoff

Source-envelope and mixed-context parser v2 is deployed and live-verified.

- Requirement: `REQ-20260621-901`
- Implementation status: `verified_live`
- Implementation/pushed/deployed commit:
  `efe1d86d194cef483f5d6d9d418a769e20800989`
- Railway deployment:
  `c1623618-a00c-46d0-8be9-5a8e4102b376`
- Key files:
  `src/platform/ingestion/intake-source.js`,
  `src/platform/ingestion/canonical-parser.js`,
  `src/lib/bna/intake-parser.js`, `server.js`,
  `scripts/smoke-source-envelope-parser-live.mjs`
- Focused Batch 9A tests: 13/13 W3/parser tests and 38/38 parser/media-routing
  regressions passed.
- Standard live smoke:
  `ops/live-smokes/2026-06-21T13-21-50-721Z-live-app-smoke.md`
- Focused source-envelope parser live smoke:
  `ops/live-smokes/2026-06-21T13-22-11-379Z-source-envelope-parser-live-smoke.md`
- Guardrails: focused live smoke used a synthetic dry-run parse only; no parse
  apply, task filing, external send, billing, Zoom, Vimeo, Buffer, DNS,
  CRM/GHL, or external-account write.

Known unrelated caveat:

- `tests/one-time-intake-api-readback.test.js` still has a HEAD owner-name
  spelling mismatch (`Rabbi Ellie Scheller` vs `Rabbi Elie Scheller`).

Next exact actions:

```powershell
npm run bna:run:next
```

Continue automatically with `REQ-20260621-902` / Batch 9B today's class-upload
trace.
<!-- batch-9A:end -->

<!-- batch-9B:start -->
## Batch 9B Handoff

Today's class-upload trace is terminal as blocked, with live blocker proof.

- Requirement: `REQ-20260621-902`
- Implementation status: `blocked_transcription_credential`
- Focused smoke command commit:
  `72b5723a`
- Live content job:
  `#78` / `Drive Class Sunday balak`
- Source:
  `google_drive`, project `bna`, drive stage `02 Ingesting`
- Current live job status:
  `blocked`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T13-37-11-961Z-live-app-smoke.md`
- Focused class-upload trace live smoke:
  `ops/live-smokes/2026-06-21T13-37-45-376Z-class-upload-trace-live-smoke.md`
- Guardrails: no transcript body committed, no parse run applied, no task
  filing, no external send, no billing, no Zoom/Vimeo/Buffer/DNS/CRM/GHL,
  WhatsApp, email, or external-account write.

Blocker:

- Hosted transcription credential returns `401 invalid_credential`. The live
  content-job note was sanitized and focused smoke verified no secret-like
  credential material remains.

Next exact actions after the credential is fixed:

```powershell
node scripts/telegram-kimi-bridge.mjs --profile bna reprocess-drive-job 78 --parse
npm run app:smoke:class-upload-trace -- 78
```

Batch 9C is now complete; continue current master run with the next unblocked
requirement:
`REQ-20260621-904` / Batch 9D CRM import and deduplication.
<!-- batch-9B:end -->

<!-- batch-9C:start -->
## Batch 9C Handoff

Downloads spreadsheet inventory is complete and verified locally.

- Requirement: `REQ-20260621-903`
- Implementation status: `verified_local`
- Implementation/pushed commit:
  `0e1f586b7e7880ca9a2d65f57339d88e15794179`
- Key files:
  `scripts/inventory-download-spreadsheets.mjs`,
  `tests/downloads-spreadsheet-inventory.test.js`,
  `ops/one-time-mishnah/downloads-spreadsheet-inventory.json`,
  `ops/one-time-mishnah/downloads-spreadsheet-inventory.md`
- Inventory result:
  203 spreadsheet-like files, 56 import candidates.
- Highest-priority import candidate:
  `Rabbi Scheller Followers.xlsx`.
- Guardrails:
  no spreadsheet rows, raw contact values, raw headers, private exports,
  production import, GHL runtime, external send, billing, deploy, or
  external-account write.

Next exact action:

```powershell
npm run bna:run:next
```

Continue automatically with `REQ-20260621-904` / Batch 9D CRM import and
deduplication, using the inventory IDs/hashes as source references instead of
raw spreadsheet dumps.
<!-- batch-9C:end -->

<!-- batch-9D:start -->
## Batch 9D Handoff

CRM import and deduplication is deployed and live-verified.

- Requirement: `REQ-20260621-904`
- Implementation status: `verified_live`
- Implementation/pushed/deployed commit:
  `aedb04aade8d518427b9f4df011c8b5a9d07f306`
- Railway deployment:
  `4919c095-6301-4806-a712-0d64b4d01850`
- Key files:
  `server.js`, `public/operations.html`, `package.json`,
  `scripts/smoke-one-time-crm-import-dedupe-live.mjs`,
  `tests/communications-screening-import-ui.test.js`,
  `tests/one-time-product-system.test.js`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T14-03-28-563Z-live-app-smoke.md`
- Focused One Time CRM import/dedupe live smoke:
  `ops/live-smokes/2026-06-21T14-03-47-316Z-one-time-crm-import-dedupe-live-smoke.md`
- Guardrails:
  readiness route is read-only, Operations Apply Import is disabled,
  metadata-only source inventory refs, synthetic live smoke rows only, no raw
  spreadsheet row echo, warm leads no-send until approval, commit blocked, no
  local import write, no external CRM write, no GHL/LeadConnector runtime, no
  email/WhatsApp send, and no billing write.

Next exact action:

```powershell
npm run bna:run:next
```

Continue automatically with `REQ-20260621-905` / Batch 9E CRM Contacts UX.
<!-- batch-9D:end -->

<!-- batch-9E:start -->
## Batch 9E Handoff

CRM Contacts UX is deployed and live-verified.

- Requirement: `REQ-20260621-905`
- Implementation status: `verified_live`
- Implementation commit:
  `b2371cdc5a58fabb70ba1e764ead9dbe3d0eb7e8`
- Final pushed/deployed commit:
  `35db6c0e876243e61e7bce2f94db787a44626f06`
- Railway deployment:
  `bf53e21c-a793-4af8-8630-a0e855d857c7`
- Key files:
  `public/operations.html`, `server.js`, `package.json`,
  `scripts/smoke-one-time-crm-contacts-ux-live.mjs`,
  `tests/operations-contacts-intake-cleanup.test.js`,
  `tests/operations-module-scoping.test.js`,
  `tests/one-time-communications-workspace.test.js`
- Focused Batch 9E tests: 15 passed, 0 failed.
- Action watchdog: PASS.
- Standard live smoke:
  `ops/live-smokes/2026-06-21T14-24-23-135Z-live-app-smoke.md`
- Focused One Time CRM Contacts UX live smoke:
  `ops/live-smokes/2026-06-21T14-24-22-149Z-one-time-crm-contacts-ux-live-smoke.md`
- Guardrails:
  One Time parent leads are selected-workspace scoped; private BNA
  goals/check-ins/admin notes/school-only data are absent; CRM rows remain
  no-send/gated; no email, WhatsApp, payment, external CRM, GHL/LeadConnector,
  DNS, billing, bulk campaign, or external-account write occurred.

Known unrelated test caveat:

- Full `npm test` still fails stale/unrelated assertions in
  `tests/agent-control-center.test.js`,
  `tests/developer-tester-ticket-capture.test.js`, and
  `tests/ui-01-public-operations-shell.test.js`. Do not treat those as Batch
  9E blockers unless the next batch explicitly owns those areas.

Next exact action:

```powershell
npm run bna:run:next
```

Continue automatically with `REQ-20260621-906` / Batch 9F warm-lead trial and
referral configuration. Do not perform live charges, invoice credits, or
campaign sends.
<!-- batch-9E:end -->

<!-- batch-11-13:start -->
## Batch 11/13 Handoff

Vimeo, member-library, recording, transcript, and publication pipeline is
deployed and live-verified.

- Requirement: `REQ-20260619-308`
- Implementation status: `verified_live`
- Implementation/pushed commit:
  `37ef4c3a2b585c0bc7792a8c93cfbec4e417cc92`
- Current deployed commit:
  `23e16a126f6e7461858b5701f2dbd2ba719a35c7`
- Railway deployment:
  `38393641-ee8e-46ed-8daf-16e67b1cde2a`
- Key files:
  `src/lib/integrations/video-hosting.js`, `server.js`,
  `public/operations.html`, `public/member-library.html`,
  `railway-migration-2026-06-16-one-time-product-system.sql`,
  `docs/integrations/VIMEO.md`,
  `docs/integrations/onetime-vimeo-zoom-resend-readiness.md`,
  `tests/one-time-recording-vimeo-pipeline.test.js`,
  `tests/one-time-member-library.test.js`,
  `scripts/smoke-one-time-vimeo-member-library-live.mjs`
- Focused Batch 11/13 tests: 25 passed, 0 failed.
- Standard live smoke:
  `ops/live-smokes/2026-06-21T13-37-16-293Z-live-app-smoke.md`
- Focused One Time Vimeo/member-library live smoke:
  `ops/live-smokes/2026-06-21T13-37-41-388Z-one-time-vimeo-member-library-live-smoke.md`
- Source-envelope parser regression smoke on the same deployed bundle:
  `ops/live-smokes/2026-06-21T13-38-09-230Z-source-envelope-parser-live-smoke.md`
- Guardrails: no Vimeo upload, provider publish/unpublish/delete, OAuth
  exchange, email send, WhatsApp send, payment, Zoom meeting, participant
  invite, real member access grant, DNS, or external portal write.

Remaining external Vimeo account action:

- Automated Vimeo upload remains disabled until an authenticated Vimeo user,
  account owner, plan/quota, upload scope/capability, folder, privacy default,
  allowed embed domains, callback URL, and user-level token are approved and
  installed.

Next exact action:

```powershell
npm run bna:run:next
```
<!-- batch-11-13:end -->
