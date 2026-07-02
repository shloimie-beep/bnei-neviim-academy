# Test Results

Preflight:

- PASS `git status --short` captured dirty worktree without
  reset/clean/revert.
- PASS `git branch --show-current`: `codex/closeout-vimeo-media-20260624`.
- PASS `git rev-parse HEAD`:
  `6f57d91037d559faa171c71565e6403e62126407`.
- PASS `npm run bna:run:status` on previous run: validation passed; work
  remained.
- PASS `npm run bna:run:next` on previous run: no unblocked executable batch.
- FAIL then PASS `npm run pqc:all`: initial drift in old campaign/seed packets
  repaired; final run passed.

Separate-instance provisioning readiness:

- PASS `node --check scripts\railway-target-guard.mjs
  scripts\provision-onetime-railway-instance.mjs
  scripts\bootstrap-onetime-database.mjs`.
- PASS `node --test tests\one-time-separate-instance-provisioning.test.js
  tests\provider-env-railway-audit.test.js
  tests\provider-env-railway-propagate.test.js`.
- PASS `npm run one-time:railway-provision:check -- --write-report`.
- PASS `npm run one-time:db:bootstrap`.
- EXPECTED BLOCKED `npm run one-time:railway-target:guard`: missing exact One
  Time Railway service target and required One Time environment values; no
  external write was performed.

Run validation passed after marking the provisioning apply work blocked.

Launch-unblocker local verification from `RAW-20260702-002`:

- PASS `npm run app:smoke:one-time-trial-referral`.
- PASS `npm run app:smoke:one-time-payment-access-class-links`.
- PASS `node --test tests\one-time-local-beta-product-contract.test.js
  tests\one-time-stripe-local-beta.test.js
  tests\one-time-class-course-ingestion.test.js
  tests\one-time-announcements-first-community.test.js
  tests\one-time-progress-rewards-local-beta.test.js`.
- PASS `node --test tests\one-time-focused-landing.test.js
  tests\rabbi-checkout-access.test.js tests\one-time-product-system.test.js
  tests\one-time-external-user-portal.test.js
  tests\one-time-role-auth-model.test.js`.
- PASS `npm run app:smoke:one-time-launch-safe-local`.
- PASS `node --test tests\one-time-drive-dropoff-email-watch.test.js
  tests\one-time-media-local-pipeline.test.js
  tests\provider-api-usage-readiness.test.js
  tests\one-time-launch-readiness.test.js`.
- PASS `node --test tests\one-time-resend-local-outbox.test.js
  tests\assistant-campaign-control-contract.test.js
  tests\communications-integrations-contract.test.js
  tests\resend-client.test.js tests\resend-inbound-crm.test.js
  tests\resend-inbound-webhook.test.js`.
- PASS `npm run one-time:railway-provision:check -- --write-report`.
- PASS `npm run one-time:db:bootstrap` as no-write readiness with missing DB
  URL recorded as a blocker.
- EXPECTED BLOCKED `npm run one-time:setup:check`: no-secret readiness checker
  reported 0/8 external setup areas ready and wrote
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-external-setup-readiness-check.md`.
- PASS `npm run railway:doctor` for the current BNA production service. This
  does not clear the separate One Time target blocker.

Host routing and route consolidation:

- PASS `node --test tests\one-time-focused-landing.test.js
  tests\rabbi-checkout-access.test.js tests\one-time-product-system.test.js
  tests\public-route-privacy-contract.test.js`.
- PASS `node --check server.js`.
- PASS `ops/route-registry.json` JSON parse.
- PASS legacy apex/www campaign host gate removed from `server.js` and focused
  route contract.
- NOT RUN live `join.onetimeonetime.com` smoke because the separate One Time
  Railway target, custom domain, and DNS are not ready yet; this remains under
  `REQ-20260701-717`.

Landing/signup launch offer:

- PASS `node --test tests\one-time-focused-landing.test.js
  tests\one-time-product-system.test.js tests\rabbi-checkout-access.test.js`.
- PASS `node --check server.js`.
- PASS static local Playwright screenshots for 1440, 1024, 768, 430, and 390
  viewports.
- PASS landing page contains no raw Zoom URL, Rabbi checkout API call, Stripe
  checkout copy, GreenInvoice checkout copy, GHL, or LeadConnector.
- NOT RUN deployed join-domain landing/signup smoke because the separate One
  Time Railway target, custom domain, and DNS are not ready yet.

Whapi/WAPI setup panel and scoping:

- PASS `node --test tests\whapi-log-sync-contract.test.js
  tests\wapi-phonebook-report.test.js
  tests\provider-integrations-secret-storage.test.js
  tests\outbound-text-safety.test.js`.
- PASS `node --check server.js`.
- PASS `ops/route-registry.json` and `ops/action-registry.json` JSON parse.
- PASS diagnostics expose configured booleans, redacted fingerprints,
  provider alias/status, and no secret values.
- PASS Operations setup panel keeps safe test send and reminders disabled until
  future explicit setup/approval.
- PASS no WhatsApp send, broadcast, external CRM write, GHL/LeadConnector
  runtime, provider mutation, secret print, or cross-workspace contact merge
  was performed.

Buffer/social draft approval setup:

- PASS `node --check server.js`.
- PASS `node --test tests\communications-integrations-contract.test.js
  tests\provider-integrations-secret-storage.test.js
  tests\operations-settings-dashboard-consolidation.test.js
  tests\operations-module-scoping.test.js`.
- PASS `ops/route-registry.json` and `ops/action-registry.json` JSON parse.
- PASS One Time provider Buffer draft creation is blocked with future
  `APPROVE_ONE_TIME_BUFFER_DRAFT` gate.
- PASS One Time Buffer schedule confirmation remains blocked with future
  `APPROVE_ONE_TIME_BUFFER_SCHEDULE` gate.
- PASS no Buffer draft, schedule, publish, media attach, ad spend, provider
  mutation, deploy, live smoke, email send, WhatsApp send, or external CRM
  write was performed.

Existing paying-users migration audit:

- PASS `node --check tests\one-time-paying-users-migration-audit-packet.test.js`.
- PASS `node --test tests\one-time-paying-users-migration-audit-packet.test.js
  tests\rabbi-checkout-access.test.js
  tests\one-time-stripe-local-beta.test.js
  tests\integrations\w4-onetime-readiness.test.js
  tests\int05-integrations-closeout.test.js`.
- PASS strict privacy scan found no raw emails, customer IDs, checkout session
  IDs, payment URLs, invoice URLs, or Stripe key patterns in the audit
  packet/evidence.
- PASS packet guardrails confirm existing users are not canceled and the
  migration email is draft-only.
- PASS no Stripe/Green Invoice API call, checkout, charge, payment link,
  subscription change, cancellation, refund, access migration, email send,
  WhatsApp send, external CRM write, or GHL/LeadConnector runtime was
  performed.

Task view sorting/filtering/scoped visibility:

- PASS `node --check server.js`.
- PASS `node --test tests\workspace-task-no-stale-agent.test.js
  tests\operations-task-queue-visibility.test.js
  tests\operations-task-comments-and-dictation.test.js
  tests\one-time-operations-ui-smoke.test.js`.
- PASS `ops/route-registry.json` and `ops/action-registry.json` JSON parse.
- PASS task cards sort newest active work first, terminal/history rows move
  below active work, and workspace/project/owner scope is visible.
- PASS project-scoped provider views hide One Time internal tech-only cards
  unless explicitly shared or provider-actionable.
- NOT RUN deploy/live smoke for Operations UI because the release target/live
  smoke path is not available in this packet.

Closeout hygiene:

- PASS `npm run bna:run:validate`.
- PASS `npm run bna:run:source-coverage` with 0 unmapped executable source
  statements.
- PASS `npm run bna:run:stale-evidence`.
- PASS `npm run secrets:audit`.
- PASS `npm run pqc:all`.
- PASS `git diff --check`; only line-ending warnings were emitted.
- PASS `npm run bna:run:next` reports no unblocked executable batch remains.

## 2026-07-02 Dirty Worktree Cleanup, Push, Deploy, Live Smoke

- PASS `git status --short` after reconciliation showed a clean publish
  branch before deployment.
- PASS committed intentional cleanup/protocol/One Time launch work on
  `codex/one-time-launch-cleanup-20260702-no-workflow`.
- PASS pushed branch to GitHub and opened draft PR #62:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/62`.
- PASS `npm run railway:doctor` before deploy for
  `skillful-motivation / production`.
- PASS `npm run railway:redeploy` uploaded the current local app bundle.
- PASS `npm run railway:doctor` after deploy reported deployment
  `7af5568c-6fcd-4201-98e2-3fc350388c4b` as `SUCCESS`.
- PASS `npm run app:smoke`.
- PASS `npm run app:smoke:rabbi-onetime-landing`.
- PASS `npm run app:smoke:public-privacy`.
- EXPECTED BLOCKED `npm run one-time:setup:check -- --write-report` still
  reports `0/8` external setup areas ready. No external write, provider
  mutation, DNS mutation, email send, WhatsApp send, live payment, or secret
  print occurred.

## RAW-20260702-003 Setup And Worktree Checks

- PASS: `npm run bna:run:blockers` listed remaining external blockers with
  owners and next actions.
- EXPECTED BLOCKED: `npm run one-time:setup:check -- --write-report` reports
  `0/8` external setup areas ready. No external write, provider mutation, DNS
  mutation, email send, WhatsApp send, live payment, or secret print occurred.
- EXPECTED BLOCKED: `npm run one-time:railway-target:guard` reports missing
  explicit One Time Railway service target and required env labels.
- PASS NO-WRITE: `npm run one-time:railway-provision:check -- --write-report`
  wrote the readiness report and performed no Railway mutation.
- PASS NO-WRITE: `npm run one-time:db:bootstrap` reports missing separate One
  Time database alias and performed no database mutation.
