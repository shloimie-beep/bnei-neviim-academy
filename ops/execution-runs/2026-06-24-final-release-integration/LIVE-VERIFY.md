# Live Verification

Recorded: `2026-06-24T18:58:00+03:00`

## Merge And Deployment

- PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/16`
- PR state: `MERGED`
- PR merge commit / merged master SHA:
  `c14507ab121daa221689ba285c203605bf2d64bf`
- Railway project/service: `skillful-motivation` / `skillful-motivation`
- Railway deployment:
  `e26fec62-1a08-43a8-abb9-1b030b0ea786`
- Railway deployed commit:
  `c14507ab121daa221689ba285c203605bf2d64bf`
- Railway status: `SUCCESS`
- Public app: `https://bneineviimacademy.org`

Railway auto-deployed the GitHub `master` merge commit after PR #16 merged.
No second local upload was performed.

## Verification Commands

- PASS `railway service status --service skillful-motivation --environment production`
- PASS `npm run railway:doctor`
- PASS `npm run app:smoke`
- PASS `npm run app:smoke:public-privacy`
- PASS `railway run npm run app:smoke:student-auth`
- PASS `railway run npm run app:smoke:operator-setup`
- PASS `railway run npm run app:smoke:provider-classroom-settings`
- PASS `railway run npm run app:smoke:class-upload-trace`
- PASS `railway run npm run app:smoke:one-time-payment-access-class-links`
- PASS `railway run npm run app:smoke:one-time-shared-review`
- PASS generated final-release negative route smoke
- PASS `node --check scripts/smoke-class-upload-trace-live.mjs`
- PASS `node --check scripts/smoke-one-time-shared-review-live.mjs`

## Live Smoke Reports

The detailed smoke reports are generated under ignored `ops/live-smokes/`
runtime evidence. Tracked summary evidence is this file.

- `ops/live-smokes/2026-06-24T15-41-49-356Z-live-app-smoke.md`
- `ops/live-smokes/2026-06-24T15-41-59-671Z-public-route-privacy-smoke.md`
- `ops/live-smokes/2026-06-24T15-44-50-267Z-student-auth-policy-live-smoke.md`
- `ops/live-smokes/2026-06-24T15-43-35-427Z-operator-setup-live-smoke.md`
- `ops/live-smokes/2026-06-24T15-43-35-404Z-provider-classroom-settings-live-smoke.md`
- `ops/live-smokes/2026-06-24T15-48-56-513Z-class-upload-trace-live-smoke.md`
- `ops/live-smokes/2026-06-24T15-43-35-411Z-one-time-payment-access-class-links-live-smoke.md`
- `ops/live-smokes/2026-06-24T15-49-47-953Z-one-time-shared-review-live-smoke.md`
- `ops/live-smokes/2026-06-24T15-52-27-795Z-final-release-negative-route-smoke.md`

## Coverage

- Public homepage/routes, parent/student/provider/One Time public shells, and
  protected anonymous rejection paths passed.
- Operations login, session, protected API reads, task comment lifecycle,
  signup dry-run validation, Buffer diagnostics, and Drive website image lane
  passed.
- Student invalid-code and invalid-password failures store sanitized audit rows.
- Operator setup package creation/download remains safe, one-time, and
  secret-free.
- Provider classroom settings, Rabbi moderation markers, and no-write provider
  classroom setup markers are live.
- Class upload trace for content job `#78` is live and readback-safe:
  `status=transcribed`, `drive_stage=04 Parsed`, transcript text exists, no
  transcript body is written to reports, and no parse/backfill/apply action was
  performed.
- Stripe/payment readiness is live-read as no-charge/no-payment-link/no-access
  grant automation.
- One Time shared review passed across `mobile390`, `tablet768`, and
  `desktop1440` for landing, provider, parent, student, classroom, email, and
  Operations routes; Vimeo manual/sample references render without upload or
  public publication.
- Negative route smoke passed for missing public route, missing API route, and
  anonymous member support/question API refusal paths.

## Guardrails

No production database migration, class backfill, Stripe charge/refund/
subscription, access grant, Vimeo upload/publication, email/WhatsApp/Telegram/
social send, DNS change, credential copy/rotation, secret exposure, external
CRM/GHL runtime, or external connector write was performed.

Class backfill remains blocked under `REQ-20260624-028` because current Prompt
04/class-lane evidence is `safe_to_apply=false`, with zero approved candidate
jobs and no row-level write plan.

