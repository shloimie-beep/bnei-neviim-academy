# Next Session

Continue `REQ-20260619-306`: product, schedule, booking, portals, and
billing/access foundations. Batch 8 Email/Resend UX is deployed and
live-verified without live email sends.
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
