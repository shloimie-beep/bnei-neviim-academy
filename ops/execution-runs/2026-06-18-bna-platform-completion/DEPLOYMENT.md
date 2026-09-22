# Deployment

2026-06-19 approved release deployment:

- Operator approval was given for production env propagation, deployment,
  focused live smoke, and release closeout for the already implemented recovery
  work.
- Deployed commit:
  `22fcff0d9665cb9638e4835a20cd8a962d79a4a8`.
- Railway service/environment:
  `skillful-motivation` / `production`.
- First deployment:
  `43e590dd-934d-4ba1-98aa-02845b15b6bf`.
  Result: `CRASHED`. Root cause: clean deploy omitted the previously untracked
  runtime helper `src/lib/bna/telegram-runtime-status.js`, while `server.js`
  required it at startup.
- Fix commit:
  `22fcff0d Include Telegram runtime status helper in release`.
- Successful deployment:
  `f9921a2d-d614-44df-88c0-392d810ddebd`.
  Result: Railway `SUCCESS`; `scripts/railway-doctor.ps1` passed.
- Production env propagation completed before deploy for existing local
  keyholder secrets only: `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`,
  `ZOOM_CLIENT_SECRET`, `VIMEO_CLIENT_ID`, and `VIMEO_CLIENT_SECRET`.
  Propagation used secret-redacted output and Railway `--skip-deploys`.
- Not propagated or still blocked:
  Resend API key/from/domain/DNS values and Vimeo user-level upload/library
  access token or approved manual upload policy.
- No DNS change, email send, Zoom meeting creation, Vimeo upload, production
  DB mutation, broad crawl, watch loop, or agent-fleet loop was performed in
  this closeout.

Earlier deployment note:

2026-06-19 One Time Master Recovery Batch 14 note:

- Safe local final verification was completed for `REQ-20260619-314`.
- This batch was not committed, pushed, PR-updated, deployed, Railway-doctored,
  or live-smoked.
- Local smoke with env-file loading disabled was blocked before server start by
  missing `DATABASE_URL`, `OPS_USERNAME`, and `OPS_PASSWORD`.
- Do not stage/commit/push, update the PR, deploy the final app bundle, run
  Railway doctor, run production health/privacy/Operations/One Time owner/admin/
  platform/parent/student/provider smokes, capture live screenshots, mutate
  production data, change DNS/domain/Railway variables, or run external
  connector actions until Shloimie explicitly approves the exact release scope
  and test identities/environment.

2026-06-19 One Time Master Recovery Batch 13 note:

- Local readiness artifacts were added for the Option B deployment/domain plan
  under `REQ-20260619-313`.
- This batch was not deployed and no live smoke was run.
- Do not create a new Railway project/service, create or attach a production
  database, write Railway variables, change DNS/domain records, run Railway
  doctor against a new One Time service, run live smoke against a new domain,
  deploy the final app bundle, or mutate production data until Shloimie
  explicitly approves Option B ownership, Railway cost/budget, database/domain
  ownership, production variable boundaries, backup/rollback plan, and launch
  window.

2026-06-19 One Time Master Recovery Batch 12 note:

- Local implementation was added for the Sefaria/study-assistant readiness
  contract under `REQ-20260619-312`.
- This batch was not deployed and no live smoke was run.
- Do not deploy, ingest Sefaria/API or licensed source content, merge
  arbitrary translations, mutate a source/vector/helper corpus, enable
  assistant answer generation, publish portal study-assistant access, enable
  raw transcript retrieval, enable cross-student retrieval, or mutate
  production data until Shloimie explicitly approves the exact release/live-
  smoke, licensing, citation, privacy, Rabbi approval, and retrieval readback
  scope.

2026-06-19 One Time Master Recovery Batch 11 note:

- Local implementation was added for the community/moderation workflow
  contract under `REQ-20260619-311`.
- This batch was not deployed and no live smoke was run.
- Do not deploy, publish public/member community posts, send external
  community notifications, purge/delete records, enable unrestricted student
  messaging, or mutate production data until Shloimie explicitly approves the
  exact release/live-smoke and community visibility/audit readback scope.

2026-06-19 One Time Master Recovery Batch 10 note:

- Local implementation was added for the gamification/badge audit contract
  under `REQ-20260619-310`.
- This batch was not deployed and no live smoke was run.
- Do not deploy, run production badge migrations/writes, award badges, reverse
  badges, send parent/student notifications, grant access, issue prizes,
  coupons, discounts, credits, or expose a public/member leaderboard until
  Shloimie explicitly approves the exact release/live-smoke and badge readback
  scope.

2026-06-19 One Time Master Recovery Batch 9 note:

- Local implementation was added for the transcript privacy/knowledge-scope
  preview contract under `REQ-20260619-309`.
- This batch was not deployed and no live smoke was run.
- Do not deploy, import raw transcripts, publish transcripts, mutate a
  vector/public-helper transcript corpus, enable cross-student retrieval,
  publish portal transcript access, or mutate production data until Shloimie
  explicitly approves the exact release/live-smoke and transcript privacy
  readback scope.

2026-06-19 One Time Master Recovery Batch 8 note:

- Local implementation was added for the recording/transcript/summary/Vimeo
  preview contract under `REQ-20260619-308`.
- This batch was not deployed and no live smoke was run.
- Do not deploy, accept provider recording webhooks, fetch provider recordings,
  upload to Vimeo, publish, unpublish, delete source recordings, expose member
  visibility, write watch progress, send notifications, publish portal changes,
  or mutate production data until Shloimie explicitly approves the exact
  release/live-smoke and Vimeo/provider external-action scope.

2026-06-19 One Time Master Recovery Batch 7 note:

- Local implementation was added for the Zoom attendance/session automation
  preview contract under `REQ-20260619-307`.
- This batch was not deployed and no live smoke was run.
- Do not deploy, create Zoom meetings, create Zoom registrants, accept live
  webhooks, expose live join redirects, mutate attendance from Zoom events,
  publish portal changes, send email/WhatsApp/Telegram, or mutate production
  data until Shloimie explicitly approves the exact release/live-smoke and
  Zoom external-action scope.

2026-06-19 One Time Master Recovery Batch 6 note:

- Local implementation was added for the One Time product readiness helper,
  product-system API payload, Operations readiness panel, and focused tests
  under `REQ-20260619-306`.
- This batch was not deployed and no live smoke was run.
- Do not deploy, run production migrations, create checkout/payment links,
  create Zoom meetings, publish portal changes, send email/WhatsApp/Telegram,
  or mutate production data until Shloimie explicitly approves the exact
  release/live-smoke and external-action scope.

2026-06-19 Agent Control Center note:

- Local implementation was added for Agent Control Center schema/API/UI/tests.
- This is not deployed.
- Do not deploy, run production migrations, or mutate production data until
  local DB/API/browser acceptance passes and Shloimie explicitly approves
  release/deployment.
- Because several Agent Control Center requirements are app-visible and marked
  `live_required`, they remain `needs_verification` or open rather than closed.
