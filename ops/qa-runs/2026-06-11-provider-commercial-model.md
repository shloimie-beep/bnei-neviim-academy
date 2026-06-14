# Provider Commercial Model QA - 2026-06-11

## Summary

Result: passed and deployed.

Implemented the provider commercial packaging layer for BNA Operations:

- Free Provider Listing, Paid Managed Provider Setup, School / Micro-school Workspace, and Revenue-Share Partner plans.
- Provider commercial fields: `provider_status`, `commercial_model`, `entitlement_plan`, `source_of_truth`, `integration_status`, setup package, managed services, public listing/signup/claim flags, internal owner, and commercial notes.
- Provider entitlement, integration, and access-checklist tables plus computed fallback rows for records that do not yet have persisted enrichment.
- Rabbi Elie Scheller modeled as an active revenue-share service provider, not a school, with Replit/Vimeo external delivery pending access.
- Public provider onboarding page at `/providers/join`.
- Operations provider commercial settings, plans/entitlements, onboarding, access checklist, and integration audit surfaces.
- Parent/provider portal safe provider views and CTA handling.

## Environment

- Date: 2026-06-11
- Branch: `master`
- Ref tested: `484563b` with local working-tree changes
- Production app: `https://bneineviimacademy.org`
- Final Railway deployment: `ddc13990-3e9c-4b4a-872c-3cc498b25dc7`
- Final live smoke report: `ops/live-smokes/2026-06-11T05-15-53-989Z-live-app-smoke.md`

## Commands Run

- `node --check server.js` - passed
- Operations/portal inline script parse - passed for `public/operations.html`, `public/parent.html`, `public/provider.html`, and `public/providers-join.html`
- `npm test` - passed 225/225
- `npm run screenshot` - passed; no horizontal scroll at 360, 390, 430, 768, or 1440 widths
- `npm run lighthouse` - wrote `lighthouse-report.html`; command exited 1 after report write because Windows Chrome temp-profile cleanup hit `EPERM`
- `npm run railway:redeploy` - final deployment `ddc13990-3e9c-4b4a-872c-3cc498b25dc7`
- `npm run railway:doctor` - passed, final deployment `SUCCESS`
- `npm run app:smoke` - passed

## Screenshots

- Repo screenshot sweep:
  - `screenshots/mobile-360.png`
  - `screenshots/mobile-390.png`
  - `screenshots/mobile-430.png`
  - `screenshots/tablet-768.png`
  - `screenshots/desktop-1440.png`
- Focused local provider screenshots:
  - `tmp/qa-runs/provider-commercial-local/screenshots/provider-join-active-filter-desktop.png`
  - `tmp/qa-runs/provider-commercial-local/screenshots/operations-provider-commercial-active-filter-desktop.png`
  - `tmp/qa-runs/provider-commercial-local/screenshots/operations-provider-commercial-active-filter-mobile.png`
- Focused production provider screenshots:
  - `tmp/qa-runs/provider-commercial-live/screenshots/live-provider-join-desktop.png`
  - `tmp/qa-runs/provider-commercial-live/screenshots/live-operations-provider-commercial-desktop.png`
  - `tmp/qa-runs/provider-commercial-live/screenshots/live-operations-provider-commercial-mobile.png`

## Route Matrix

- `/api/provider-plans` - passed; returned four plan keys: `free_listing`, `managed_provider`, `school_workspace`, `revenue_share_partner`.
- `/api/bna/service-providers?approved_only=false` - passed; Rabbi Sheller active with `commercial_model = revenue_share` and `entitlement_plan = revenue_share_partner`.
- `/providers/join` - passed desktop visual check and live browser submit workflow.
- `/operations?view=service_providers&section=commercial` - passed desktop/mobile; one active provider shown.
- `/operations?view=service_providers&section=plans` - passed locally; four-plan comparison renders.
- `/operations?view=service_providers&section=access_checklist` - passed; Rabbi access checklist renders.
- `/operations?view=service_providers&section=integration_audit` - passed; pending external-system questions render.
- Parent/provider portal provider model surfaces - covered by tests.

## Workflow Matrix

- Provider plan model readback - passed.
- Rabbi Sheller partner/revenue-share state - passed.
- Active-provider filtering - passed; archived/hidden QA and smoke records do not show in commercial setup.
- Public provider onboarding browser workflow - passed on final deployment:
  - Report: `tmp/qa-runs/provider-commercial-live/provider-onboarding-browser-final-live.json`
  - Response time: 1767 ms
  - Created provider `16`, pipeline card `16`, review task `446`
  - Cleanup: provider archived/hidden, pipeline archived, review task deleted
- Public provider onboarding direct POST - passed on final deployment:
  - Report: `tmp/qa-runs/provider-commercial-live/provider-onboarding-final-live.json`
  - Response time: 1126 ms
  - Created provider `15`, pipeline card `15`, review task `445`
  - Cleanup: provider archived/hidden, pipeline archived, review task deleted
- Final active-provider cleanup check - passed; 15 provider records total, only Rabbi Elie Scheller active.

## Button / Action Audit

- Operations commercial plan buttons exist for Free Listing, Managed Setup, School Workspace, and Revenue Share and route through typed PATCH updates.
- Public `Submit For Review` button was exercised in browser on production and returned the success state.
- Public onboarding does not publish listings, send email, open WhatsApp, publish social posts, or charge payments.
- Not-configured/integration-dependent surfaces stay visibly disabled or pending instead of faking connector status.

## Bugs Found And Fixed

- Archived provider smoke/QA records appeared in active commercial setup counts. Fixed active-provider filtering and changed setup subnav counts to use active providers only.
- Commercial panel exposed noisy archived/hidden record counts. Replaced with a generic archived/hidden note.
- Public provider onboarding waited on internal enrichment work. Fixed by returning after the provider/service commit and creating pipeline cards, review tasks, and commercial enrichment as background follow-ups.
- Public provider records without persisted entitlement/checklist rows now receive computed fallback rows on read, so admin/provider views remain coherent.
- Local restart attempt loaded the placeholder `.env.local` `DATABASE_URL`; local DB route checks were not trusted after that. Production Railway checks were used for real database verification.

## Remaining Blockers

- Rabbi Sheller backend/Replit/Vimeo access is still pending, so database/member/video/payment/analytics sync remains blocked.
- Google Calendar/Classroom verification remains connector-later work and does not block the internal system.
- Payment links, Publer/social posting, WhatsApp API, and external app sync are structured but not live-connected unless credentials/access are provided.

## Next Recommended Work

- Build Rabbi Sheller Launch Control Room on top of this provider model.
- Add provider public profile route/detail page beyond the join form and parent portal index.
- Inspect Rabbi Sheller backend when access is granted and decide integrate, embed, sync, or replace.
- Add a small cleanup/admin view for archived provider QA records if archived count ever matters operationally.
