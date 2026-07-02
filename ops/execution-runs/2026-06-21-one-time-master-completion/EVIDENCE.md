# Evidence

## Batch 0

- Source pointer:
  `raw-input/RAW-20260621-001-one-time-master-completion-goal.md`
- Prior run preserved:
  `ops/execution-runs/2026-06-19-onetime-local-beta-hardening/`
- Successor run:
  `ops/execution-runs/2026-06-21-one-time-master-completion/`
- Preflight live smoke:
  `ops/live-smokes/2026-06-21T07-57-58-409Z-live-app-smoke.md`
- Preflight live smoke machine output:
  `ops/live-smokes/2026-06-21T07-57-58-409Z-live-app-smoke.json`
- Successor-run validation:
  `npm run bna:run:validate` passed on 2026-06-21T11:11:03+03:00.
- Secret audit:
  `node scripts/audit-secrets.mjs` passed with 0 tracked secret-risk files.
- Diff hygiene:
  `git diff --check` passed with LF/CRLF warnings only.

## Batch 1

- Protocol docs and templates:
  `AGENTS.md`, `BNA-START-HERE.md`, `docs/BNA-RAMBLE-TO-DONE.md`,
  `templates/BNA-CODEX-IMPLEMENTATION-PROMPT.md`,
  `templates/BNA-CODEX-VERIFICATION-PROMPT.md`,
  `tasks-pending/_template-ramble-intake.md`,
  `tasks-pending/_template-goal-mode-correction-output.md`, and
  `tasks-pending/2026-06-16-prompt-intake-register.md`.
- Execution runner and schema:
  `scripts/bna-execution-run.mjs`,
  `ops/execution-runs/requirements.schema.json`, and
  `tests/bna-execution-run.test.js`.
- Intake schema:
  `src/lib/bna/intake-schema.js`.
- Task lifecycle pointer:
  `TASKS.md`.

<!-- batch-2:start -->
## Batch 2 Evidence

- Reconciliation Markdown: `ops/one-time-mishnah/master-backlog-reconciliation.md`
- Reconciliation JSON: `ops/one-time-mishnah/master-backlog-reconciliation.json`
- Current source rows: 99
- Legacy statement rows preserved: 1164
- Visible Tasks created: 0
- Visible Decisions created: 0
- Production mutations: 0
- External writes: 0
<!-- batch-2:end -->

<!-- batch-3:start -->
## Batch 3 Evidence

- Live Task/Decision production census:
  `ops/one-time-mishnah/task-decision-production-census.md`
- Live Task/Decision production census machine output:
  `ops/one-time-mishnah/task-decision-production-census.json`
- Reversible cleanup dry-run/apply report:
  `ops/one-time-mishnah/task-decision-production-cleanup.md`
- Reversible cleanup machine output:
  `ops/one-time-mishnah/task-decision-production-cleanup.json`
- Applied cleanup summary:
  `ops/one-time-mishnah/task-decision-production-cleanup-applied-summary.md`
- Applied cleanup summary machine output:
  `ops/one-time-mishnah/task-decision-production-cleanup-applied-summary.json`

Live cleanup applied through existing authenticated Task APIs:

- Wave 1: 144 planned, 144 applied, 0 failed.
- Wave 2: 1 planned, 1 applied, 0 failed.
- Total applied: 145 reversible task-row actions.
- Action counts: 5 One Time re-scopes, 1 internal handoff quarantine, 139 duplicate archives.
- Hard deletes: 0.
- Parent/student/payment/communication record mutations: 0.
- Final isolation: 0 BNA records in One Time and 0 One Time records in BNA.
- Deployed commit: `f8a2fd62`
- Railway deployment: `89967278-38dc-49f3-a70d-4536c59f82f6`
- Standard live smoke:
  `ops/live-smokes/2026-06-21T09-19-35-834Z-live-app-smoke.md`
- Focused Batch 3 live smoke:
  `ops/live-smokes/2026-06-21T09-19-39-131Z-task-decision-batch3-live-smoke.md`
<!-- batch-3:end -->

<!-- batch-4:start -->
## Batch 4 Evidence

Local workspace users/roles and cross-channel control-plane scope evidence:

- Existing One Time role model:
  `src/lib/bna/one-time-role-model.js`
- Existing scoped helper permission tests:
  `tests/one-time-rbac-negative-isolation.test.js`,
  `tests/workspace-rbac-negative-isolation.test.js`, and
  `tests/one-time-role-auth-model.test.js`
- New shared control-plane policy module:
  `src/platform/assistant/control-plane.js`
- New cross-channel scope-policy test:
  `tests/universal-control-plane-scope-policy.test.js`
- Architecture anchor updated:
  `docs/architecture/workspace-community-provider-role-map.md`
- Operations task-lane label aligned to the repo convention:
  `public/operations.html`
- Task/Decision census label contract aligned:
  `scripts/task-decision-census.mjs`,
  `ops/task-decision-census/latest.json`,
  `ops/one-time-mishnah/task-decision-production-census.json`, and
  `ops/one-time-mishnah/task-decision-production-census.md`

What the local batch proves:

- Telegram and website assistant normalize into the same policy shape.
- One Time owner/admin/manager roles normalize to a service-provider workspace
  scope for `rabbi_sheller_provider` / `one_time_mishnah_class`.
- Parent chart/dashboard control is limited to linked children and cannot use
  admin-only categories.
- Student assistant actions are own-record scoped.
- Super-admin drip/campaign/deployment actions require typed actions,
  previews, approvals, and no browser-click substitution.
- Existing One Time helper and route tests still pass.
- Full local Node test suite passes with 1028 tests.

Clean deploy path:

- Clean worktree:
  `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane`
- Branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `bcb0e153aac41bf5452c80f83bf184e972c979d2`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Railway deployment:
  `641ac75e-d6d7-4379-a27c-4f7a4d9d3dbf`

Deployment/live proof:

- Standard live smoke:
  `ops/live-smokes/2026-06-23T15-59-34-390Z-live-app-smoke.md`
- Focused Batch 4 control-plane live smoke:
  `ops/live-smokes/2026-06-23T16-00-48-379Z-batch4-control-plane-live-smoke.md`
- Operations workspace taxonomy live smoke from the clean branch:
  `ops/live-smokes/2026-06-23T16-01-39-450Z-operations-workspace-taxonomy-live-smoke.md`

No live sends, publishes, charges, DNS writes, account grants, provider
onboarding writes, external connector writes, or production data mutation were
performed. Deployment changed the web app bundle only.
<!-- batch-4:end -->

<!-- batch-5:start -->
## Batch 5 Evidence

Visible action registry and dead-button coverage evidence:

- Canonical registry rows:
  `ops/action-registry.json`
- Generated One Time action coverage report:
  `ops/action-registry/one-time-action-coverage.md`
- Generated One Time action coverage machine output:
  `ops/action-registry/one-time-action-coverage.json`
- Coverage generator:
  `scripts/generate-one-time-action-coverage.mjs`
- Operations UI action annotations:
  `public/operations.html`
- Watchdog coverage test:
  `tests/watchdog-action-registry.test.js`
- Watchdog action audit:
  `ops/watchdog-audits/2026-06-23T16-28-watchdog-action-audit.md`

What the batch proves:

- The report preserves the existing action registry as the canonical registry.
- Legacy One Time product controls remain covered in the product coverage
  matrix.
- Registry-backed Operations controls are linked to `data-action-id` source
  tokens.
- External/app-visible write controls, including publish, live Zoom send, and
  parent setup sends, remain preview/confirmation/approval gated.
- No live send, publish, charge, DNS write, account grant, real meeting
  creation, real Vimeo upload, or production data mutation was performed.

Clean deploy path:

- Clean worktree:
  `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane`
- Branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `e22bd90db50190a26c9a4536b8ec7ae6cb4dd0b1`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Railway deployment:
  `c93a9311-4eb0-4982-8c14-b5f7a9cd5c8e`

Deployment/live proof:

- Focused Batch 5 action coverage live smoke:
  `ops/live-smokes/2026-06-23T16-37-19-965Z-batch5-action-coverage-live-smoke.md`
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T16-39-27-702Z-live-app-smoke.md`
- Operations workspace taxonomy live smoke from the clean branch:
  `ops/live-smokes/2026-06-23T16-39-50-955Z-operations-workspace-taxonomy-live-smoke.md`
<!-- batch-5:end -->

<!-- batch-6:start -->
## Batch 6 Evidence

Operations UI/design-system correction evidence from the clean PR branch:

- Operations UI implementation:
  `public/operations.html`
- One Time UI design delta audit generator:
  `scripts/one-time-ui-design-delta-audit.mjs`
- One Time UI design delta audit test:
  `tests/one-time-ui-design-delta-audit.test.js`
- Passing audit report:
  `ops/ui-audits/2026-06-19-one-time-ui-design-delta/audit.md`
- Passing audit machine output:
  `ops/ui-audits/2026-06-19-one-time-ui-design-delta/audit.json`
- Regenerated action coverage:
  `ops/action-registry/one-time-action-coverage.md`
- Regenerated action coverage machine output:
  `ops/action-registry/one-time-action-coverage.json`
- Local Playwright UI smoke report:
  `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.md`
- Local Playwright UI smoke machine output:
  `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/report.json`
- Desktop screenshot:
  `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/desktop.png`
- Mobile screenshot:
  `ops/playwright-smokes/2026-06-19-one-time-operations-ui-local/mobile-agents.png`

What the batch proves:

- One Time Operations uses one module sidebar and one current-module top filter
  rail; duplicate top rail navigation is guarded by the audit.
- Horizontal filters scroll instead of forcing page overflow.
- Topbar status chips stay in one horizontal row instead of stacking.
- Automation permissions and identity review details no longer expose raw JSON
  as the normal UI.
- Local desktop and mobile screenshots were captured and visually inspected.
- No external send, publish, charge, DNS write, real Zoom/Vimeo action, account
  grant, authenticated mutation, or production data mutation was performed.

Clean deploy path:

- Clean worktree:
  `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane`
- Branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Railway deployment:
  `e9949680-4330-454c-9b1c-b61dce2d475b`

Deployment/live proof:

- Standard live app smoke:
  `ops/live-smokes/2026-06-23T16-59-39-550Z-live-app-smoke.md`
- Authenticated Operations workspace taxonomy live smoke:
  `ops/live-smokes/2026-06-23T17-00-15-340Z-operations-workspace-taxonomy-live-smoke.md`
- Focused Batch 6 Operations UI live smoke:
  `ops/live-smokes/2026-06-23T17-01-12-970Z-batch6-operations-ui-live-smoke.md`
<!-- batch-6:end -->

<!-- batch-7:start -->
## Batch 7 Evidence

First-party communications evidence from the deployed clean PR branch:

- WhatsApp and Email/Resend Operations UI:
  `public/operations.html`
- First-party communication and WAPI/Whapi server routes:
  `server.js`
- Resend client and webhook verifier:
  `src/lib/integrations/resend-client.js`
- WAPI/WhatsApp no-GHL plan and guardrails:
  `ops/communications/wapi-crm-audit-and-plan.md`
- WhatsApp/email workspace contract:
  `tests/one-time-communications-workspace.test.js`
- Resend mock/send/webhook contract:
  `tests/resend-client.test.js`
- Communications integration contract:
  `tests/communications-integrations-contract.test.js`
- Assistant/portal communications contract:
  `tests/assistant-portal-communications-contract.test.js`
- WAPI phonebook/report contract:
  `tests/wapi-phonebook-report.test.js`

What the batch proves:

- WhatsApp has the required desktop three-pane workspace and mobile back
  navigation.
- WhatsApp/WAPI readback is workspace-scoped and hides raw provider payloads by
  default.
- WhatsApp send/broadcast/external CRM actions remain disabled behind explicit
  confirmation gates.
- Email has a draft/edit workspace with reply-to, template, related-record, and
  HTML/body fields.
- Resend provider connection, sender identity, and domain readiness are shown
  separately.
- Resend domains/status and webhook event readback are visible or safely
  blocked without exposing raw provider payloads or secrets.
- Resend webhook code is covered with mocked Svix verification/storage tests.
- The sender/domain Decision remains the one blocker for real outbound email
  production readiness, not for the no-send UX requirement.

Clean deploy path:

- Clean worktree:
  `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane`
- Branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Railway deployment:
  `e9949680-4330-454c-9b1c-b61dce2d475b`

Deployment/live proof:

- Railway doctor:
  deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status `SUCCESS`
- WhatsApp UX live smoke:
  `ops/live-smokes/2026-06-23T17-09-51-981Z-whatsapp-ux-live-smoke.md`
- Email/Resend UX live smoke:
  `ops/live-smokes/2026-06-23T17-09-52-093Z-email-resend-ux-live-smoke.md`
- Communications screening live smoke:
  `ops/live-smokes/2026-06-23T17-10-27-503Z-communications-screening-live-smoke.md`
<!-- batch-7:end -->

<!-- batch-9:start -->
## Batch 9 Evidence

Product/schedule/booking/portal/billing evidence from the deployed clean PR
branch:

- One Time product system helper:
  `src/lib/bna/one-time-product-system.js`
- One Time product migration:
  `railway-migration-2026-06-16-one-time-product-system.sql`
- Server/API integration:
  `server.js`
- Operations UI:
  `public/operations.html`
- Public One Time draft route:
  `public/one-time/index.html`
- Portal surfaces:
  `public/parent.html`, `public/student.html`, `public/provider.html`
- Focused product test:
  `tests/one-time-product-system.test.js`
- Product booking live smoke:
  `scripts/smoke-one-time-product-booking-live.mjs`
- Payment/access/class-link live smoke:
  `scripts/smoke-one-time-payment-access-class-links-live.mjs`
- Shared review live smoke:
  `scripts/smoke-one-time-shared-review-live.mjs`

What the batch proves:

- Product offers are readable without publishing checkout/payment links or
  silently finalizing pricing/entitlements.
- Schedule/availability foundations and the 7:00 PM Israel rule are readable.
- Internal class-event and appointment-intent records can be created for One
  Time without Zoom, external calendar, send, payment, or access writes.
- Parent, student, and provider portal foundations are readable and scoped.
- Payment/access/class-link readiness stays no-write: no checkout session,
  payment link, charge, invoice, subscription, automated access grant, raw Zoom
  join URL, or host/start URL is exposed.
- Shared review surfaces render on mobile, tablet, and desktop for landing,
  provider, parent, student, classroom, email, and Operations paths.

Clean deploy path:

- Clean worktree:
  `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane`
- Branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Railway deployment:
  `e9949680-4330-454c-9b1c-b61dce2d475b`

Deployment/live proof:

- Railway doctor:
  deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status `SUCCESS`
- One Time Product Booking live smoke:
  `ops/live-smokes/2026-06-23T17-16-03-089Z-one-time-product-booking-live-smoke.md`
- One Time Payment Access/Class Links live smoke:
  `ops/live-smokes/2026-06-23T17-16-03-292Z-one-time-payment-access-class-links-live-smoke.md`
- One Time Shared Review live smoke:
  `ops/live-smokes/2026-06-23T17-16-03-566Z-one-time-shared-review-live-smoke.md`
<!-- batch-9:end -->

<!-- batch-12:start -->
## Batch 12 Evidence

Zoom meeting and attendance foundation evidence from the deployed clean PR
branch:

- Zoom integration helper:
  `src/lib/integrations/zoom.js`
- Protected server/API preview endpoints and blocked live meeting creation:
  `server.js`
- Operations Live Classes readiness panel:
  `public/operations.html`
- Zoom integration docs:
  `docs/integrations/ZOOM.md`,
  `docs/integrations/zoom-setup.md`
- Route registry entries:
  `ops/route-registry.json`
- Focused Zoom automation contract:
  `tests/one-time-zoom-attendance-automation.test.js`
- Live class infrastructure regression coverage:
  `tests/live-class-infrastructure.test.js`
- Zoom attendance live smoke:
  `scripts/smoke-one-time-zoom-attendance-live.mjs`

What the batch proves:

- Zoom API readiness, token cache scaffolding, and request builders are present
  without exposing secrets or host start URLs.
- Meeting creation remains blocked in production during this closeout pass.
- Registrant and join-link flows are staged as preview contracts and do not
  expose raw Zoom join URLs to students.
- Webhook processing requires signature verification, replay protection, and
  idempotency keys.
- Dashboard clicks are not counted as attendance; attendance reconciliation is
  based on participant join/leave evidence.
- Attendance corrections are review-only drafts unless a future explicit
  approval enables writes.
- Operations shows the no-write readiness panel on desktop and mobile.

Clean deploy path:

- Clean worktree:
  `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane`
- Branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Railway deployment:
  `e9949680-4330-454c-9b1c-b61dce2d475b`

Deployment/live proof:

- Railway doctor:
  deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status `SUCCESS`
- One Time Zoom Attendance live smoke:
  `ops/live-smokes/2026-06-23T17-23-08-813Z-one-time-zoom-attendance-live-smoke.md`

Guardrails:

- No Zoom meeting, registrant, webhook attendance write, attendance
  correction, recording read, transcript read, summary read, external send,
  portal publish, participant invite, host start URL exposure, or raw Zoom join
  URL exposure was performed.
<!-- batch-12:end -->

<!-- batch-11-13:start -->
## Batch 11/13 Evidence

Vimeo/member-library/recording pipeline evidence from the deployed clean PR
branch:

- Video hosting/recording helper:
  `src/lib/integrations/video-hosting.js`
- Vimeo adapter:
  `src/lib/integrations/vimeo.js`
- Server/API integration:
  `server.js`
- Operations One Time Library UI:
  `public/operations.html`
- Public member library:
  `public/member-library.html`
- Vimeo integration docs:
  `docs/integrations/VIMEO.md`
- Route registry entries:
  `ops/route-registry.json`
- Focused recording/Vimeo contract:
  `tests/one-time-recording-vimeo-pipeline.test.js`
- Member-library contract:
  `tests/one-time-member-library.test.js`
- Content library workspace contract:
  `tests/one-time-content-library-workspace.test.js`
- Provider integration redaction/readiness contract:
  `tests/provider-integrations-secret-storage.test.js`
- Vimeo/member-library live smoke:
  `scripts/smoke-one-time-vimeo-member-library-live.mjs`

What the batch proves:

- Manual Vimeo URLs are validated and normalized into Vimeo IDs.
- Class package metadata, transcript/summary readiness, source-sheet assets,
  and member-preview state are stored through first-party One Time APIs.
- Approval-gated publish, rollback, and archive states work for the member
  library.
- Automated Vimeo API upload is disabled behind setup and account-owner
  readiness.
- Recording webhooks are preview-only and cannot publish directly.
- Retention/delete remains blocked until explicit future approval gates pass.
- Operations One Time Library and public member-library UI render at desktop
  and mobile widths.

Clean deploy path:

- Clean worktree:
  `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane`
- Branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Railway deployment:
  `e9949680-4330-454c-9b1c-b61dce2d475b`

Deployment/live proof:

- Railway doctor:
  deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status `SUCCESS`
- One Time Vimeo Member Library live smoke:
  `ops/live-smokes/2026-06-23T17-28-42-169Z-one-time-vimeo-member-library-live-smoke.md`

Guardrails:

- The smoke created temporary internal One Time class/library records,
  published a smoke-scoped item, rolled it back, and archived the temporary
  class.
- No Vimeo upload, provider publish/unpublish/delete, email, WhatsApp,
  payment, Zoom meeting, participant invite, real member access grant,
  external portal write, DNS change, or duplicate connector/action system was
  created.
<!-- batch-11-13:end -->

<!-- batch-14:start -->
## Batch 14 Evidence

Transcript privacy and knowledge-scope evidence from the deployed clean PR
branch:

- Transcript privacy helper:
  `src/lib/bna/transcript-privacy.js`
- Public helper retrieval guardrails:
  `src/lib/bna/public-helper-retrieval.js`
- Server/API integration:
  `server.js`
- Operations One Time Library readiness panel:
  `public/operations.html`
- Parent/student portal scoped payload surfaces:
  `public/parent.html`, `public/student.html`
- Route registry entry:
  `ops/route-registry.json`
- Focused transcript privacy contract:
  `tests/one-time-transcript-privacy.test.js`
- Public helper privacy/context contracts:
  `tests/public-helper-context.test.js`,
  `tests/public-helper-privacy.test.js`
- Transcript privacy live smoke:
  `scripts/smoke-one-time-transcript-privacy-live.mjs`

What the batch proves:

- Transcript versions and segment metadata exist without returning raw
  transcript bodies.
- Privacy classes cover provider/cohort general, student private,
  parent-visible, staff-private, excluded, and needs-review states.
- Student/private transcript mapping requires enrollment/registrant context,
  accepted match method, confidence threshold, and reviewer approval.
- Guessed speaker identity is never treated as reviewed student data.
- Parent-visible content requires reviewed feedback or Rabbi-approved text.
- Public helper retrieval is bounded to reviewed safe snippets, not exhaustive
  raw transcript training.
- Student and parent retrieval cannot cross into another student private
  segment.

Clean deploy path:

- Clean worktree:
  `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane`
- Branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Railway deployment:
  `e9949680-4330-454c-9b1c-b61dce2d475b`

Deployment/live proof:

- Railway doctor:
  deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status `SUCCESS`
- One Time Transcript Privacy live smoke:
  `ops/live-smokes/2026-06-23T17-33-56-257Z-one-time-transcript-privacy-live-smoke.md`

Guardrails:

- Live smoke checked 14 classes and 14 segments through the body-free
  readiness API.
- No transcript content write, student record write, public-helper corpus
  write, portal data write, raw transcript body, staff-private note,
  cross-student private segment, send, charge, Zoom/Vimeo/Google/DNS mutation,
  external CRM/GHL write, or secret exposure was performed.
<!-- batch-14:end -->

<!-- batch-15:start -->
## Batch 15 Evidence

Gamification and badge audit evidence from the deployed clean PR branch:

- Gamification helper:
  `src/lib/bna/gamification.js`
- Server/API integration:
  `server.js`
- Operations Community ledger readiness panel:
  `public/operations.html`
- Public One Time classroom participation display:
  `public/one-time-classroom.html`
- Parent/student portal scoped progress surfaces:
  `public/parent.html`, `public/student.html`
- Route registry entries:
  `ops/route-registry.json`
- Gamification event/unit contract:
  `tests/gamification-events.test.js`
- Badge audit contract:
  `tests/one-time-gamification-badge-audit.test.js`
- WS11/community and parent privacy regression coverage:
  `tests/ws11-community-model-contract.test.js`,
  `tests/parent-progress-privacy.test.js`
- Gamification live smoke:
  `scripts/smoke-one-time-gamification-live.mjs`

What the batch proves:

- Server-side event types and default point values are stable.
- Automatic badge candidates use thresholds, existing badge state, and stable
  idempotency keys.
- Rabbi-awarded badge drafts require evidence and are parent-safe.
- Manual badge reversal requires a reason and audit evidence.
- The readiness endpoint exposes implemented badge pipelines without writing
  awards or reversals.
- Parent/student visible gamification data remains approved and scoped.
- Public One Time classroom does not render a ranked public individual
  leaderboard.

Clean deploy path:

- Clean worktree:
  `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane`
- Branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Railway deployment:
  `e9949680-4330-454c-9b1c-b61dce2d475b`

Deployment/live proof:

- Railway doctor:
  deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status `SUCCESS`
- One Time Gamification live smoke:
  `ops/live-smokes/2026-06-23T17-38-46-447Z-one-time-gamification-live-smoke.md`

Guardrails:

- Live smoke confirmed 11 automatic badge definitions and 6 Rabbi-awarded
  badge definitions through the read-only readiness API.
- No gamification event creation, badge award, badge reversal, notification,
  access grant, prize/credit change, public individual leaderboard,
  negative-point action, external CRM/GHL write, send, charge,
  Zoom/Vimeo/Google/DNS mutation, or secret exposure was performed.
<!-- batch-15:end -->

<!-- batch-16:start -->
## Batch 16 Evidence

Community/moderation evidence from the deployed clean PR branch:

- Community moderation helper:
  `src/lib/bna/community-moderation.js`
- Platform community service:
  `src/platform/community/index.js`
- Server/API integration:
  `server.js`
- Operations Community/One Time readiness panel:
  `public/operations.html`
- Public One Time classroom:
  `public/one-time-classroom.html`
- Route registry entry:
  `ops/route-registry.json`
- Focused community moderation contract:
  `tests/one-time-community-moderation-workflow.test.js`
- WS11/community and provider classroom contracts:
  `tests/ws11-community-model-contract.test.js`,
  `tests/provider-classroom-settings-contract.test.js`
- Community live smoke:
  `scripts/smoke-one-time-community-live.mjs`

What the batch proves:

- Private questions and classroom replies remain private-first and submitted
  for review.
- Parent-visible, staff-only, cohort-visible, private, public-anonymized, and
  archived states are distinct.
- Report/flag flow catches contact info, direct-chat requests, unsafe
  language, and private identifiers.
- Private-to-public promotion requires reviewer-edited anonymized text and
  linked original/published version metadata.
- Edit/delete history is modeled instead of silent purge.
- Operations ships the community moderation readiness panel.
- Unrestricted student-to-student private messaging is disabled.

Clean deploy path:

- Clean worktree:
  `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane`
- Branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Railway deployment:
  `e9949680-4330-454c-9b1c-b61dce2d475b`

Deployment/live proof:

- Railway doctor:
  deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status `SUCCESS`
- One Time Community live smoke:
  `ops/live-smokes/2026-06-23T17-43-01-034Z-one-time-community-live-smoke.md`

Guardrails:

- The live smoke was read-only and saw 0 threads, 0 messages, and 0 pending
  moderation rows through the readiness API.
- No thread creation, message creation, approval, public post, parent-visible
  message, staff note, notification, delete/purge action, unrestricted
  student-to-student messaging, unreviewed publication, public promotion write,
  external notification, send, charge, Zoom/Vimeo/Google/DNS mutation, external
  CRM/GHL write, or secret exposure was performed.
<!-- batch-16:end -->

<!-- batch-17:start -->
## Batch 17 Evidence

Sefaria/study-assistant readiness evidence from the deployed clean PR branch:

- Study assistant readiness helper:
  `src/lib/bna/study-assistant-readiness.js`
- Server/API integration:
  `server.js`
- Operations Sefaria / Study Assistant readiness panel:
  `public/operations.html`
- Private no-write route registry entry:
  `ops/route-registry.json`
- Focused readiness contract:
  `tests/one-time-study-assistant-readiness.test.js`
- Privacy and public-helper guardrail contracts:
  `tests/one-time-transcript-privacy.test.js`,
  `tests/public-helper-context.test.js`,
  `tests/public-helper-privacy.test.js`
- Study assistant live smoke:
  `scripts/smoke-one-time-study-assistant-live.mjs`

What the batch proves:

- Source versions are modeled as approved metadata with hashes, scopes, review
  state, and permission state.
- Readiness previews do not return source bodies, raw transcripts, or
  unrestricted retrieval content.
- Restricted sources, raw sources, and cross-student/private sources are
  blocked.
- Licensing, citation verification, transcript privacy, Rabbi approval, and
  audit release gates remain required.
- Study assistant chat, answer generation, arbitrary version ingestion,
  arbitrary translation merge, source corpus mutation, and portal publishing
  remain disabled.
- Operations ships the readiness panel without enabling the assistant.

Clean deploy path:

- Clean worktree:
  `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane`
- Branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Railway deployment:
  `e9949680-4330-454c-9b1c-b61dce2d475b`

Deployment/live proof:

- Railway doctor:
  deployment `e9949680-4330-454c-9b1c-b61dce2d475b` status `SUCCESS`
- One Time Study Assistant live smoke:
  `ops/live-smokes/2026-06-23T17-48-36-925Z-one-time-study-assistant-live-smoke.md`

Guardrails:

- The live smoke was read-only and saw 10 source-version metadata records with
  0 assistant-ready sources.
- No Sefaria/API ingestion, source corpus mutation, portal publishing, answer
  generation, chat session creation, arbitrary version ingestion, arbitrary
  translation merge, raw transcript retrieval, raw source body return,
  cross-student retrieval, external send, charge, Zoom/Vimeo/Google/DNS
  mutation, external CRM/GHL write, or secret exposure was performed.
<!-- batch-17:end -->

<!-- batch-19:start -->
## Batch 19 Evidence

Final verification and release evidence:

- Clean worktree:
  `C:/Users/User/Documents/Codex/2026-06-23/one-time-batch4-control-plane`
- Branch: `codex/one-time-batch4-control-plane-20260623`
- Commit: `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Remote branch:
  `refs/heads/codex/one-time-batch4-control-plane-20260623` at
  `2291d03a47ab0d9ec39b78561bc8e41361d959db`
- Draft PR: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13`
- Railway deployment:
  `e9949680-4330-454c-9b1c-b61dce2d475b`

Verification proof:

- Full clean-worktree test suite: 1071/1071 passed.
- Tracked secret audit: 4100 tracked paths checked, 0 tracked secret-risk
  files found.
- Action watchdog:
  `ops/watchdog-audits/2026-06-23T17-54-watchdog-action-audit.md` with 0
  findings.
- Railway doctor: deployment
  `e9949680-4330-454c-9b1c-b61dce2d475b` status `SUCCESS`.
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T17-55-00-705Z-live-app-smoke.md`
- Final register surfaces live smoke:
  `ops/live-smokes/2026-06-23T17-55-27-727Z-final-register-surfaces-live-smoke.md`
- Operations workspace taxonomy live smoke:
  `ops/live-smokes/2026-06-23T17-55-27-745Z-operations-workspace-taxonomy-live-smoke.md`

What the final batch proves:

- The clean branch is pushed and matches the remote branch.
- The deployed Railway app is healthy and still running the PR #13 bundle.
- All unblocked active-run work has local verification plus live-smoke evidence.
- Only `REQ-20260619-313` remains as a terminal external decision for separate
  paid infrastructure, ownership, and DNS.

Guardrails:

- No live external send, billing charge, DNS mutation, real Zoom meeting
  creation, real Vimeo upload/publication, hard delete, live badge award or
  reversal write, prize/credit issuance, access grant, public leaderboard
  exposure, unreviewed community publication, unrestricted student messaging,
  transcript publication, vector corpus mutation, Sefaria/API ingestion, answer
  generation, separate One Time infrastructure provisioning, PR merge, external
  CRM/GHL write, or secret exposure was performed.
<!-- batch-19:end -->

<!-- addendum-req-011:start -->
## REQ-20260623-011 Evidence

Shared assistant control-plane contract evidence:

- Architecture document:
  `docs/architecture/telegram-control-plane.md`
- Shared policy/contract export:
  `src/platform/assistant/control-plane.js`
- Regression coverage:
  `tests/universal-control-plane-scope-policy.test.js`

What the batch proves:

- Telegram, website assistant, Operations helper, provider portal assistant,
  parent portal assistant, student portal assistant, and future approved
  channels are adapters over one canonical control plane.
- Shared layers include identity, workspace/role, conversation state, source
  envelope, file/media intake, action registry, action planner, permission
  engine, previews, approvals, audit, drafts/templates/versions, reminders,
  ticketing, Agent Work handoff, and progress/completion state.
- Adapter-only responsibilities are transport/rendering behaviors, not
  business logic.
- Duplicate Telegram architecture, website-bot action system, action registry,
  intake pipeline, agent queue, provider onboarding system, provider page
  builder, and browser-click substitution are explicitly forbidden.

Verification:

- `node --check src/platform/assistant/control-plane.js` passed.
- `node --test tests/universal-control-plane-scope-policy.test.js` passed 8/8.
<!-- addendum-req-011:end -->

<!-- addendum-req-012:start -->
## REQ-20260623-012 Evidence

Shared assistant data model evidence:

- Canonical model export:
  `src/platform/assistant/control-plane.js`
- Idempotent startup schema and protected readiness route:
  `server.js`
- Route/privacy inventory:
  `ops/route-registry.json`
- Regression coverage:
  `tests/assistant-control-plane-data-model.test.js`

What the batch proves:

- One canonical assistant schema covers channels, identities, conversations,
  messages, context objects, action plans/runs, previews, approvals,
  drafts/versions, templates, saved views, reminders, notifications,
  onboarding sessions, delivery outbox, and dead letters.
- Channel-specific metadata remains adapter-scoped and does not create a
  separate Telegram or website-bot business model.
- The live readiness route exposes only table/index counts, missing names, and
  no-write guard metadata.

Deployment/live proof:

- PR #13 commits: `ee2fe192`, `7d351b6f`
- Railway deployment:
  `04756fab-bd9c-4f6b-869a-39668f64c419` status `SUCCESS`
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T18-25-13-013Z-live-app-smoke.md`
- Assistant readiness live smoke:
  `ops/live-smokes/2026-06-23T18-26-39-444Z-assistant-control-plane-readiness-live-smoke.md`
  with 18/18 tables and 17/17 indexes present.

Guardrail:

- No assistant rows, external sends, publish actions, charges, DNS changes,
  OAuth actions, connector calls, secret values, or row payloads were returned
  or mutated.
<!-- addendum-req-012:end -->

<!-- addendum-req-013:start -->
## REQ-20260623-013 Evidence

Single action parity source evidence:

- Universal parity generator:
  `scripts/generate-universal-action-parity.mjs`
- Universal parity artifacts:
  `ops/action-registry/universal-action-parity.json` and
  `ops/action-registry/universal-action-parity.md`
- Refreshed One Time coverage artifacts:
  `ops/action-registry/one-time-action-coverage.json` and
  `ops/action-registry/one-time-action-coverage.md`
- Regression gate:
  `tests/watchdog-action-registry.test.js`

What the batch proves on the clean PR branch:

- UI buttons, Telegram requests, website assistant requests, Operations helper
  requests, automation actions, and Agent Work handoffs are classified from the
  existing root and detailed action registries.
- 133 registry rows and 22 visible controls are inventoried.
- 22/22 visible controls are classified.
- Missing contracts, missing handlers, missing tests, and risky actions without
  approval are all 0.
- Browser-click substitution is explicitly not a parity source.

Deployment/live proof:

- PR #13 commit: `19a85636ed60f9d1b148abdbc3df2e49f6fb9e4d`
- Railway deployment:
  `e4b035db-e309-4402-b19c-4a26774aab8d` status `SUCCESS`
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T18-41-53-481Z-live-app-smoke.md`

Guardrail:

- No duplicate registry, browser-click substitution, external send, publish,
  charge, DNS mutation, OAuth action, connector call, hard delete, or secret
  exposure was performed.
<!-- addendum-req-013:end -->

<!-- addendum-req-014:start -->
## REQ-20260623-014 Evidence

Shared planner/runner evidence:

- Planner/runner contract:
  `src/platform/assistant/action-planner.js`
- Regression gate:
  `tests/assistant-action-planner-contract.test.js`
- Canonical systems reused:
  `src/lib/actions/registry.js`, `src/lib/actions/permissions.js`, and
  `src/lib/actions/runner.js`

What the batch proves on the clean PR branch:

- Telegram and website assistant requests are planned against the same
  role/workspace-scoped action schema.
- Unknown action IDs and permission-denied requested actions are rejected
  before any runner call.
- Parent problem reports become support tickets; super-admin technical
  implementation requests can become approval-gated Codex Agent Work.
- Missing inputs are returned as focused questions instead of creating
  incomplete actions.
- Planned execution calls only the canonical `runAction` runner with dry-run,
  approval, actor, workspace, source, and audit context.

Deployment/live proof:

- PR #13 commit: `12a586f0`
- Railway deployment:
  `d61bbb67-c6bd-409a-89a1-c0e9c63e11e6` status `SUCCESS`
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T18-53-31-401Z-live-app-smoke.md`

Guardrail:

- No duplicate planner business logic, external send, publish, charge, DNS
  mutation, OAuth action, connector call, browser-click substitution, hard
  delete, or secret exposure was performed.
<!-- addendum-req-014:end -->

<!-- addendum-req-015:start -->
## REQ-20260623-015 Evidence

Shared drafts/templates/previews/versioning evidence:

- Contract module:
  `src/platform/assistant/draft-versioning.js`
- Regression gate:
  `tests/assistant-draft-versioning-contract.test.js`
- Existing schema reused:
  `assistant_drafts`, `assistant_draft_versions`, `assistant_templates`, and
  `assistant_previews`

What the batch proves:

- One reusable draft/version model covers the required communication, website,
  chart, worksheet, course, onboarding, automation, and support macro object
  types.
- Versions carry object identity, parent version, editor, channel, audience,
  prompt/instruction, content/config, change summary, approval state, active
  state, scheduled/use state, rollback relationship, and created time.
- Previews carry real/sample data flags, audience/workspace scope, blockers,
  external-action risk, status, and payload.
- Provider website-section drafts reuse the Service Provider Studio path.
- Parent chart drafts are linked-child scoped and cannot become email campaign
  drafts.
- Rollback creates a new version linked to the target version instead of
  mutating history.
- Raw code/CSS injection is rejected before version/template/preview creation.

Deployment/live proof:

- PR #13 commit: `bc4c6348`
- Railway deployment:
  `be818786-b5ab-416a-bbb3-0818c79cfc76` status `SUCCESS`
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T19-05-47-613Z-live-app-smoke.md`

Guardrail:

- No duplicate versioning system, external send, publish, charge, DNS mutation,
  OAuth action, connector call, browser-click substitution, hard delete, or
  secret exposure was performed.
<!-- addendum-req-015:end -->

<!-- addendum-req-016:start -->
## REQ-20260623-016 Evidence

Unified file/media intake evidence:

- Contract module:
  `src/platform/assistant/file-media-intake.js`
- Regression gate:
  `tests/assistant-file-media-intake-contract.test.js`
- Existing source-envelope foundation reused:
  `src/platform/ingestion/intake-source.js`
- Existing Telegram routing regression retained:
  `tests/telegram-media-routing.test.js`

What the batch proves:

- Telegram and website uploads share content fingerprints and idempotency keys
  for the same asset/checksum.
- Source envelopes preserve adapter metadata while normalizing website uploads
  into the existing canonical source-provider model.
- Upload safety checks cover type, size, blocked executable/script extensions,
  blocked MIME patterns, and virus-scan-required state.
- Privacy classification flags group chats, forwarded private context,
  secret-like content, and student/family-sensitive context.
- Class recordings, worksheets, screenshots, contact notes, provider logos,
  and voice notes map to planned outcomes without external writes.
- Ambiguous child/person matching requires human review before auto-parse.
- Parent relationship and provider workspace checks reuse the shared
  control-plane policy.
- Duplicate intake detection uses stable idempotency and content fingerprints.

Deployment/live proof:

- PR #13 commit: `be1383a2`
- Railway deployment:
  `6a3c0cfe-44bb-4154-8f1c-00bcf6f9a169` status `SUCCESS`
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T19-14-56-082Z-live-app-smoke.md`

Guardrail:

- No duplicate intake pipeline, external send, publish, charge, DNS mutation,
  OAuth action, connector call, browser-click substitution, hard delete, or
  secret exposure was performed.
<!-- addendum-req-016:end -->

<!-- addendum-req-017:start -->
## REQ-20260623-017 Evidence

Assistant-led provider onboarding evidence:

- Contract module:
  `src/platform/assistant/provider-onboarding-studio.js`
- Regression gate:
  `tests/assistant-provider-onboarding-studio-contract.test.js`
- Shared contracts reused:
  `src/platform/assistant/draft-versioning.js` and
  `src/platform/assistant/file-media-intake.js`
- Existing provider surfaces retained:
  `tests/service-provider-directory.test.js` and
  `tests/universal-assistant-contract.test.js`

What the batch proves:

- Provider onboarding stages cover secure start, identity/business, offer,
  brand/website, classroom/community, communications, integrations, review,
  and launch.
- The same session can continue across Telegram and website assistant.
- Service Provider Studio remains the canonical creation/editing system.
- Profile/listing, website, brand assets, course/community, communications,
  previews, and launch gate are generated as draft/review contracts only.
- Legacy provider forms are adapter capture only, not a competing onboarding
  forum or page builder.
- Publish remains false and operator approval is always required.
- Integration blockers become launch gate blockers rather than silent publish
  permissions.

Deployment/live proof:

- PR #13 commit: `a1186d5c`
- Railway deployment:
  `24301b82-8b71-45e4-b0a9-aa3d2f236cad` status `SUCCESS`
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T19-25-10-625Z-live-app-smoke.md`

Guardrail:

- No duplicate provider onboarding system, page builder, intake pipeline,
  external send, publish, charge, DNS mutation, OAuth action, connector call,
  browser-click substitution, hard delete, or secret exposure was performed.
<!-- addendum-req-017:end -->

<!-- addendum-req-018:start -->
## REQ-20260623-018 Evidence

Parent natural-language self-service evidence:

- Contract module:
  `src/platform/assistant/parent-self-service.js`
- Regression gate:
  `tests/assistant-parent-self-service-contract.test.js`
- Shared contracts reused:
  `src/platform/assistant/control-plane.js` and
  `src/platform/assistant/draft-versioning.js`

What the batch proves:

- Parent assistant context keeps the selected child, linked child IDs,
  current layout, pending preview/approval state, and parent capability list
  in one shared control-plane shape.
- Parent chart layouts create `chart_layout` drafts and previews through the
  shared draft/versioning contract instead of a separate chart builder.
- Approved parent display sections and metric visibility are validated, while
  admin notes, provider-private notes, billing state, official scores, and
  official attendance fields are rejected.
- Natural-language layout edits create a new version linked to the prior
  version and preserve `official_data_mutated: false`.
- Home-practice updates are submitted as review plans, and official attendance
  or score corrections become review/correction plans without mutating the
  official record.
- Parent tickets and reminders are child-scoped, dedupable, and mark sensitive
  billing/group-chat contexts as private-reply required.

Deployment/live proof:

- PR #13 commit: `c77501e1`
- Railway deployment:
  `c8abec9b-5f50-481d-8d5c-7c39714ffa3a` status `SUCCESS`
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T19-37-26-570Z-live-app-smoke.md`

Guardrail:

- No duplicate parent assistant system, chart builder, action registry, intake
  pipeline, external send, official attendance/score write, publish, charge,
  DNS mutation, OAuth action, connector call, browser-click substitution, hard
  delete, or secret exposure was performed.
<!-- addendum-req-018:end -->

<!-- addendum-req-019:start -->
## REQ-20260623-019 Evidence

Natural-language chart/dashboard configuration evidence:

- Contract module:
  `src/platform/assistant/chart-dashboard-config.js`
- Parent self-service now consumes the shared model:
  `src/platform/assistant/parent-self-service.js`
- Regression gate:
  `tests/assistant-chart-dashboard-config-contract.test.js`

What the batch proves:

- Chart/dashboard configurations use one canonical payload containing
  `chart_definition`, `chart_template`, `dashboard_layout`,
  `layout_version`, `metric_visibility`, `role_scope`, `workspace_scope`,
  `student_scope`, `date_range`, `display_preferences`, and `approval_state`.
- Natural-language requests compile to structured patches for section order,
  chart type, date range, simple/grandparent view, saved view name, and
  rollback intent.
- Parent, student, service-provider, and super-admin templates share the same
  model, including parent weekly summary, attendance-first, progress-first,
  course completion, milestones/achievements, provider class overview, and
  super-admin operations dashboard.
- Parent relationship scope, service-provider workspace scope, and super-admin
  all-workspace scope all reuse shared `actionPolicy`.
- Previews identify real/sample data, role/audience/workspace, responsive
  frames, accessible alternatives, and external-action risk.
- Compare/rollback/saved-view helpers preserve version history without
  mutating underlying official data.
- Raw code/CSS/HTML/script injection and official attendance/score mutation
  requests are rejected.

Deployment/live proof:

- PR #13 commit: `f68e9d3d`
- Railway deployment:
  `5196fc2f-1e56-4a6f-a1ff-e44649831540` status `SUCCESS`
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T19-51-57-448Z-live-app-smoke.md`

Guardrail:

- No duplicate chart builder, parent assistant system, action registry, intake
  pipeline, external send, official attendance/score write, publish, charge,
  DNS mutation, OAuth action, connector call, browser-click substitution, hard
  delete, or secret exposure was performed.
<!-- addendum-req-019:end -->

<!-- addendum-req-020:start -->
## REQ-20260623-020 Evidence

Super-admin campaign and drip-sequence control evidence:

- Contract module:
  `src/platform/assistant/campaign-control.js`
- Registry/planner integration:
  `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`, and
  `src/platform/assistant/action-planner.js`
- Regression gate:
  `tests/assistant-campaign-control-contract.test.js`
- Parity artifacts:
  `ops/action-registry/universal-action-parity.md` and
  `ops/action-registry/universal-action-parity.json`

What the batch proves:

- Super-admin campaign requests can preview audience segments with consent,
  suppression, exclusions, sendable count, idempotency, and approval metadata.
- Drip/nurture sequence drafts create versioned email-message draft packages
  and previews through the shared draft/versioning model.
- Email campaign drafts produce desktop/mobile previews and remain
  `external_send_performed: false`.
- Registry-visible actions now cover segment preview, email campaign draft,
  and drip sequence draft.
- The shared planner routes natural language such as a six-email sequence for
  1,000 opted-in leads to `draft_drip_sequence`.
- Parents are denied campaign actions; providers are workspace-scoped; live
  send attempts without explicit approval are rejected.
- The parity report remains green with 22/22 visible controls classified,
  133 registry rows, 0 missing contracts, 0 missing handlers, 0 missing tests,
  and 0 risky actions without approval.

Deployment/live proof:

- PR #13 commit: `8a7c1c66`
- Railway deployment:
  `b796a1b9-8de7-43ea-90fb-0f9a87a9304b` status `SUCCESS`
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T20-05-05-992Z-live-app-smoke.md`

Guardrail:

- No external send, campaign execution, live schedule enablement,
  contact-list write, suppression write, connector call, DNS mutation, billing
  action, browser-click substitution, hard delete, or secret exposure was
  performed.
<!-- addendum-req-020:end -->

<!-- addendum-req-021:start -->
## REQ-20260623-021 Evidence

Natural-language automation builder evidence:

- Contract module:
  `src/platform/assistant/automation-builder.js`
- Registry/planner integration:
  `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`, and
  `src/platform/assistant/action-planner.js`
- Regression gate:
  `tests/assistant-automation-builder-contract.test.js`
- Parity artifacts:
  `ops/action-registry/actions.json`,
  `ops/action-registry/universal-action-parity.md`, and
  `ops/action-registry/universal-action-parity.json`

What the batch proves:

- Authorized super-admin and service-provider users can describe automations
  in natural language and get a typed `automation` draft, version, preview,
  readable step list, Mermaid diagram, and sample-event dry-run.
- The compiler emits only known triggers, conditions, delays, and actions.
  Unknown trigger/action nodes and raw code/CSS/HTML/script fields are
  rejected.
- Automation drafts reuse the shared draft/version/preview model instead of a
  new automation builder or website-bot action system.
- The shared planner routes automation wording to `draft_automation`, and the
  canonical action runner returns a dry-run preview through
  `communications.draftAutomation`.
- Parents are denied automation drafting; providers are scoped to their
  workspace/project; live enable attempts remain explicit-approval gated.
- The detailed action registry now includes the campaign actions from
  `REQ-20260623-020` and the new `draft_automation` action, with parity green
  at 22/22 visible controls classified, 137 registry rows, 0 missing
  contracts, 0 missing handlers, 0 missing tests, and 0 risky actions without
  approval.

Deployment/live proof:

- PR #13 commit: `6137985a`
- Railway deployment:
  `8006f53f-d12b-4a38-9233-26b9f217d26b` status `SUCCESS`
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T20-19-39-519Z-live-app-smoke.md`

Guardrail:

- No automation was enabled, no external send occurred, no connector call,
  schedule activation, contact-list write, official data mutation, publish,
  charge, DNS mutation, OAuth action, browser-click substitution, hard delete,
  or secret exposure was performed.
<!-- addendum-req-021:end -->

<!-- addendum-req-022:start -->
## REQ-20260623-022 Evidence

Natural-language ticketing and problem-resolution evidence:

- Contract module:
  `src/platform/assistant/problem-resolution.js`
- Existing action integration:
  `src/lib/actions/registry.js` and
  `src/lib/actions/actions/operations.js`
- Regression gate:
  `tests/assistant-problem-resolution-contract.test.js`
- Parity artifacts:
  `ops/action-registry/actions.json`,
  `ops/action-registry/universal-action-parity.md`, and
  `ops/action-registry/universal-action-parity.json`

What the batch proves:

- Telegram, website assistant, portal assistant, and Operations helper problem
  reports can produce one canonical problem-resolution plan with actor,
  workspace, route/object, device/viewport, source message, forwarded/file
  context, classification, dedupe key, safe help, and progress state.
- Parent, provider, and super-admin scopes reuse shared `actionPolicy`.
  Parents stay on ticket/review paths; super-admin technical requests can
  preview approval-gated Agent Work routing.
- Technical bugs prepare an Agent Work package with acceptance criteria but do
  not create a Codex task from model text. Parent/student problem reports do
  not become personal Pending cards.
- Sensitive billing/security reports in group contexts require private reply.
- Duplicate open tickets are detected by stable dedupe key and returned as an
  existing ticket instead of duplicate work.
- Ticket closure requires evidence or explicit user confirmation.
- Existing `create_ticket` and `create_report_problem_ticket` actions now
  include the shared `problem_resolution` contract in their preview/result
  payloads.
- The parity report remains green with 22/22 visible controls classified,
  137 registry rows, 0 missing contracts, 0 missing handlers, 0 missing tests,
  and 0 risky actions without approval.

Deployment/live proof:

- PR #13 commit: `75c91c72`
- Railway deployment:
  `7cc4fbe0-2d98-4496-b44f-f38e3a4c87e0` status `SUCCESS`
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T20-31-58-654Z-live-app-smoke.md`

Guardrail:

- No duplicate ticketing system, personal Pending card, Codex task execution,
  external send, connector call, official data mutation, publish, charge, DNS
  mutation, OAuth action, browser-click substitution, hard delete, or secret
  exposure was performed.
<!-- addendum-req-022:end -->

<!-- addendum-req-023:start -->
## REQ-20260623-023 Evidence

Unified reminders and proactive-notification evidence:

- Contract module:
  `src/platform/assistant/reminder-notifications.js`
- Registry/planner/runner integration:
  `src/lib/actions/registry.js`,
  `src/lib/actions/actions/operations.js`, and
  `src/platform/assistant/action-planner.js`
- Regression gate:
  `tests/assistant-reminder-notifications-contract.test.js`
- Parity/watchdog artifacts:
  `ops/action-registry/actions.json`,
  `ops/action-registry/universal-action-parity.md`,
  `ops/action-registry/universal-action-parity.json`, and
  `ops/watchdog-audits/2026-06-23T20-42-watchdog-action-audit.md`

What the batch proves:

- Telegram, website assistant, parent/provider portal assistants, and
  Operations helper can create one canonical reminder/notification plan via
  the typed `schedule_assistant_reminder` action.
- Reminder plans preserve actor, audience, workspace/project, timezone,
  recurrence, trigger type, quiet hours, consent state, dedupe key, retry
  policy, notification payload, delivery-outbox rows, pause/cancel support,
  and status metadata.
- Time reminders, event/threshold notifications, class reminders, and payment
  failure alerts compile from natural language into structured trigger data.
- External delivery channels are consent-gated; in-app delivery remains
  available by default; blocked channels are represented as cancelled outbox
  rows with `consent_required`.
- Pause, cancel, and resume are typed state-transition previews, not sends.
- The shared planner now routes reminder/notify/alert language to
  `schedule_assistant_reminder` instead of accidentally drafting automations.
- The parity report remains green with 22/22 visible controls classified,
  138 registry rows, 0 missing contracts, 0 missing handlers, 0 missing tests,
  and 0 risky actions without approval.

Deployment/live proof:

- PR #13 commit: `1acdb699`
- Railway deployment:
  `a811771e-60e1-43f9-902c-70b0865d78ed` status `SUCCESS`
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T20-44-13-808Z-live-app-smoke.md`

Guardrail:

- No reminder was delivered, no external send occurred, no connector call,
  live schedule activation, official data mutation, publish, charge, DNS
  mutation, OAuth action, browser-click substitution, hard delete, or secret
  exposure was performed.
<!-- addendum-req-023:end -->

<!-- addendum-req-024:start -->
## REQ-20260623-024 Evidence

Role/workspace security evidence:

- Policy module: `src/platform/assistant/control-plane.js`
- Regression gate: `tests/universal-control-plane-scope-policy.test.js`
- Watchdog evidence:
  `ops/watchdog-audits/2026-06-23T20-51-watchdog-action-audit.md`

What the batch proves:

- BNA/family, One Time, service-provider, parent, student, and super-admin
  scopes reuse the shared control-plane policy.
- Family parent scope is isolated from BNA scope.
- One Time provider scope is isolated from BNA and from other providers.
- Parents remain linked-child scoped; students remain own-record scoped.
- Guessed IDs require review before scoped actions.
- Private actions in Telegram group/supergroup/channel contexts are rejected
  for non-super-admin actors.
- Private forwarded content requires human review before file intake/support
  actions can proceed.
- External/risky actions continue to require typed preview/approval and browser
  click substitution remains forbidden.

Deployment/live proof:

- PR #13 commit: `dd905201`
- Railway deployment:
  `6620b95b-0771-4e38-9fb9-1e6c4921e2bd` status `SUCCESS`
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T20-53-13-014Z-live-app-smoke.md`

Guardrail:

- No data was exposed, no permission bypass was added, no external send,
  connector call, official data mutation, publish, charge, DNS mutation,
  OAuth action, browser-click substitution, hard delete, or secret exposure
  was performed.
<!-- addendum-req-024:end -->

<!-- addendum-req-025:start -->
## REQ-20260623-025 Evidence

Operations Assistant Control Center evidence:

- Snapshot builder: `src/platform/assistant/control-center.js`
- Protected route: `server.js` at `/api/bna/assistant/control-center`
- Operations panel: `public/operations.html`
- Regression gate: `tests/assistant-control-center-contract.test.js`
- Watchdog evidence:
  `ops/watchdog-audits/2026-06-23T21-03-watchdog-action-audit.md`

What the batch proves:

- Super Admin has one read-only Assistant Control Center over the shared
  assistant model, not a new action queue or bot framework.
- The snapshot reports conversations, action plans/runs, previews, approvals,
  drafts/versions, reminders, notifications, onboarding sessions, delivery
  outbox, dead letters, registry coverage, blockers, and management prompts.
- Recent rows are redacted by key/status metadata only; raw message bodies,
  payloads, content, secrets, and token-like fields are not returned.
- The existing Operations Universal Assistant panel shows Control Center counts
  and blockers alongside Codex queue status.
- The route is Super Admin only and has explicit no-write guards.

Deployment/live proof:

- PR #13 commit: `296a276a`
- Railway deployment:
  `02944240-4c1b-477b-a57f-5f6140e80400` status `SUCCESS`
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T21-07-46-763Z-live-app-smoke.md`
- Focused live endpoint readback:
  `/api/bna/assistant/control-center` returned status 200,
  `requirement_id=REQ-20260623-025`, registry coverage, status counts, and
  no-write guards.

Guardrail:

- No action execution, no queue mutation, no raw body/payload exposure, no
  external send, connector call, official data mutation, publish, charge, DNS
  mutation, OAuth action, browser-click substitution, hard delete, or secret
  exposure was performed.
<!-- addendum-req-025:end -->

<!-- addendum-req-026:start -->
## REQ-20260623-026 Evidence

Final cross-channel QA and return-packet evidence:

- Provider onboarding doc:
  `docs/product/provider-telegram-onboarding.md`
- Telegram system truth audit:
  `ops/audits/2026-06-24-telegram-system-truth.md`
  and `ops/audits/2026-06-24-telegram-system-truth.json`
- Telegram/action parity audit:
  `ops/audits/2026-06-24-telegram-action-parity.md`
  and `ops/audits/2026-06-24-telegram-action-parity.json`
- End-to-end QA run:
  `ops/qa-runs/2026-06-24-telegram-end-to-end.md`
  and `ops/qa-runs/2026-06-24-telegram-end-to-end.json`
- Final ChatGPT return packet:
  `.runtime/telegram-audit/CHATGPT-RETURN-PACKET.md`
  and `.runtime/telegram-audit/CHATGPT-RETURN-PACKET.json`

What the final QA proves:

- Telegram and the website assistant are documented and verified as adapters
  over one shared control plane, action registry, planner, permissions,
  previews, approvals, audit, file/media intake, reminders, notifications,
  ticketing, and Agent Work handoff.
- Service-provider onboarding is routed through the assistant-led onboarding
  session plus Service Provider Studio, not a duplicate provider form or
  Telegram page builder.
- Parent, student, service-provider, One Time, family, and super-admin scopes
  are covered by the shared policy and contract tests.
- Campaigns, drip sequences, automations, reminders, tickets, file intake,
  previews, draft/versioning, chart layouts, and Control Center readback have
  typed-action or contract coverage without browser-click substitution.
- The required final response sections were generated in the return packet:
  website assistant parity, service-provider self-service, parent natural
  language control, super-admin automation, and cross-channel tests.

Deployment/live proof:

- PR #13 commit: `6560b8f0`
- Railway deployment:
  `359bd3c5-8cdc-4b70-a2eb-535e03f8d62e` status `SUCCESS`
- Standard live app smoke:
  `ops/live-smokes/2026-06-23T21-16-19-796Z-live-app-smoke.md`
- Focused live endpoint readback:
  `/api/bna/assistant/control-center` returned status 200 with
  `total_actions=79`, `telegram_ready=79`, `website_ready=79`,
  `blocker_count=0`, and no-write guards.
- Final execution-run validation:
  `npm run bna:run:validate` passed with 35 done and 1
  `needs_operator_decision`; `npm run bna:run:source-coverage` passed with
  0 unmapped executable statements; `npm run bna:run:next` selected no
  unblocked executable batch.

Remaining external blocker:

- `REQ-20260619-313` remains terminal as `needs_operator_decision` for the
  separate One Time paid infrastructure, ownership, and DNS path. It does not
  block the completed Telegram plus website-assistant addendum implementation.

Guardrail:

- No external send, publish, charge, DNS mutation, OAuth/account-owner action,
  real Zoom meeting creation, Vimeo upload/publication, hard delete, secret
  exposure, browser-click substitution, duplicate action registry, duplicate
  intake pipeline, duplicate agent queue, or duplicate provider onboarding
  system was created or executed.
<!-- addendum-req-026:end -->

<!-- integration-navigation-owner-review:start -->
## RAW-20260624-001 Registration Evidence

Registration evidence:

- Raw source:
  `raw-input/RAW-20260624-001-integration-navigation-owner-review-closeout.md`
- Daily memory capture:
  `memory/2026-06-24.md`
- Requirement register:
  `tasks-pending/2026-06-24-integration-navigation-owner-review-closeout.md`
- Active run requirements:
  `REQ-20260624-001` through `REQ-20260624-011` appended to
  `ops/execution-runs/2026-06-21-one-time-master-completion/requirements.json`
- Queue/changelog:
  `TASKS.md`, `ops/agent-task-ledger.jsonl`, and
  `ops/agent-changelog.md`

Implementation evidence is pending. No credential, production, deployment,
send, publish, upload, charge, DNS, OAuth/account-owner, or secret action has
been performed.
<!-- integration-navigation-owner-review:end -->

<!-- integration-navigation-req-001-002:start -->
## REQ-20260624-001 / REQ-20260624-002 Evidence

Integration branch evidence:

- Worktree:
  `C:\Users\User\Documents\Codex\2026-06-24\integration-navigation-owner-review`
- Branch:
  `codex/integration-navigation-owner-review-20260624`
- Base:
  `origin/master` `a9528b2d9467174d76d4c25bfb028f9308f24b4f`
- PR #12 source:
  `codex/issue-8-complete-system-reconciliation`
  `428ee78682a201b233b2f3da71bf0205b48812ad`
- PR #13 source:
  `codex/one-time-batch4-control-plane-20260623`
  `6560b8f02580e5f182a95df84ad8d5383403d887`
- Release-candidate SHA:
  `fc4d88145276ff18465214c926cb90c4020b4be0`
- Draft owner-review PR:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/14`
- PR #12 superseded comment:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/12#issuecomment-4785588642`
- PR #13 superseded comment:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/13#issuecomment-4785588651`

Validation evidence:

- `npm ci` passed.
- `npm test` passed 1202/1202.
- `npm run secrets:audit` passed.
- `node --test tests/watchdog-action-registry.test.js` passed 5/5.
- `npm run watchdog:links` passed with 0 findings:
  `ops/watchdog-audits/2026-06-24T03-22-watchdog-link-audit.md`
- `npm run watchdog:actions` passed with 0 findings:
  `ops/watchdog-audits/2026-06-24T03-22-watchdog-action-audit.md`
- `npm run watchdog:security` passed with 0 findings:
  `ops/watchdog-audits/2026-06-24T03-22-watchdog-security-routes.md`

Fix included in release-candidate SHA:

- `ops/route-registry.json` now registers `/parent.html`, `/student.html`,
  and `/one-time-classroom.html` as private static aliases with canonical
  targets.
- `ops/action-registry/one-time-action-coverage.*` and
  `ops/action-registry/universal-action-parity.*` were regenerated after
  branch integration.

Blocked evidence:

- Push with `.github/workflows/credential-free-ci.yml` was rejected by GitHub:
  the current OAuth app lacks `workflow` scope. This blocks independent CI
  status-check creation, not local credential-free implementation.
<!-- integration-navigation-req-001-002:end -->

<!-- integration-navigation-req-003:start -->
## REQ-20260624-003 Evidence

Route inventory evidence on PR #14 branch
`codex/integration-navigation-owner-review-20260624`:

- Commit:
  `094ca7c6634b3ade13d158e15b0716907c367d3a`
- Draft owner-review PR:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/14`
- Generator:
  `scripts/generate-owner-review-route-inventory.mjs`
- NPM entry:
  `npm run owner-review:routes`
- Regression test:
  `tests/owner-review-route-inventory.test.js`
- Route matrix:
  `docs/owner-review/ROUTE-INVENTORY.csv`
- Machine-readable inventory:
  `docs/owner-review/ROUTE-INVENTORY.json`
- Canonical sitemap:
  `docs/owner-review/CANONICAL-SITEMAP.md`
- Navigation graph:
  `docs/owner-review/NAVIGATION-GRAPH.md`
- Orphan/duplicate report:
  `docs/owner-review/ORPHAN-AND-DUPLICATE-PAGES.md`

The generated matrix discovers public HTML, server UI/API routes, aliases,
redirects, literal anchors, JavaScript location/fetch/generated-navigation
helpers, form actions, manifest start/scope/id routes, service-worker entries,
public static targets, and assistant/API deep-link style destinations. It is a
credential-free local artifact and performs no production readback, deploy,
external send, publish, upload, charge, DNS, OAuth/account-owner action, or
secret request.

Latest generated counts: 689 route rows, 34 HTML pages, 753 server route
declarations, 584 API routes, 71 linked destinations, 182 client edges, 9
manifest edges, 13 service-worker edges, 92 forms without explicit actions, 0
missing implementation rows, 44 customer-facing orphan-review rows, and 26
duplicate implementation groups.
<!-- integration-navigation-req-003:end -->

<!-- integration-navigation-req-004:start -->
## REQ-20260624-004 Evidence

Navigation repair evidence on PR #14 branch
`codex/integration-navigation-owner-review-20260624`:

- Commit:
  `e4378c31c7d70f7d3c2c8505d3907ff29d7e2a5f`
- Draft owner-review PR:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/14`
- Route matrix:
  `docs/owner-review/ROUTE-INVENTORY.csv`
- Machine-readable inventory:
  `docs/owner-review/ROUTE-INVENTORY.json`
- Canonical sitemap:
  `docs/owner-review/CANONICAL-SITEMAP.md`
- Navigation graph:
  `docs/owner-review/NAVIGATION-GRAPH.md`
- Orphan/duplicate report:
  `docs/owner-review/ORPHAN-AND-DUPLICATE-PAGES.md`

Implementation evidence:

- `public/js/bna-site-nav.js` adds One Time to primary navigation and moves the
  provider-join CTA to `/providers/join?onboard=provider`.
- `public/js/bna-helper-knowledge.js`, `public/index.html`,
  `public/service-providers.html`, and `public/provider.html` use the same
  canonical provider join route.
- `public/rabbi.html`, `public/rabbi-member.html`,
  `public/member-library.html`, `public/one-time-classroom.html`, and
  `public/provider-participant.html` expose consistent One Time/member/library/
  classroom/support/return navigation.
- `public/parents.html` links the parent handbook route.
- `scripts/generate-owner-review-route-inventory.mjs` now distinguishes
  aliases/internal route variants from duplicate customer-facing canonical
  implementations.

Latest generated counts after repair: 689 route rows, 34 HTML pages, 753 server
route declarations, 584 API routes, 74 linked destinations, 207 client edges, 9
manifest edges, 13 service-worker edges, 92 forms without explicit actions, 0
missing implementation rows, 0 customer-facing orphan-review rows, and 0
duplicate implementation groups.
<!-- integration-navigation-req-004:end -->

<!-- integration-navigation-req-005:start -->
## REQ-20260624-005 Evidence

Canonical One Time journey evidence on PR #14 branch
`codex/integration-navigation-owner-review-20260624`:

- Commit:
  `3375c9fe33e3eb7efe6e0333067265e6d3429756`
- Draft owner-review PR:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/14`
- Canonical path:
  `/one-time` -> `/rabbi-member` -> `/member-library` ->
  `/one-time-classroom` -> `/rabbi-member#support` ->
  `/rabbi-member?logout=1` -> `/`
- Desktop/mobile local browser evidence on the PR branch:
  `ops/playwright-smokes/2026-06-24-one-time-canonical-journey-local/`

Implementation evidence:

- `server.js` redirects `/one-time/member-login`, `/member`, and
  `/member-portal` to `/rabbi-member`, and generated live member links now
  target `/member-library?code=...`.
- `public/one-time/index.html` sends member-login CTAs to `/rabbi-member`.
- `public/rabbi-member.html`, `public/member-library.html`,
  `public/one-time-classroom.html`, and `public/provider-participant.html`
  expose One Time home, member home, library, classroom/live class,
  questions/support, account/logout, and return-to-public navigation.
- `public/js/rabbi-member.js` and member page inline handlers clear shared
  One Time member state on logout without a server write.
- `ops/route-registry.json` classifies `/member`, `/member-portal`,
  `/member.html`, and `/one-time/member-login` as canonical aliases or legacy
  static entry points instead of competing customer-facing destinations.
- `scripts/smoke-one-time-canonical-journey-local.mjs` and
  `tests/one-time-canonical-journey.test.js` cover the canonical flow.

Guardrail: all verification was local and credential-free. No production
readback, database mutation, deploy, live smoke, external send, publish, upload,
charge, DNS, OAuth/account-owner action, or secret request was performed.
<!-- integration-navigation-req-005:end -->

<!-- integration-navigation-req-006:start -->
## REQ-20260624-006 Evidence

Information architecture repair evidence on PR #14 branch
`codex/integration-navigation-owner-review-20260624`:

- Commit:
  `ca49a1404ab619dc37319ad2f6108049e9c2f347`
- Draft owner-review PR:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/14`
- Route inventory after repair:
  689 routes, 34 HTML pages, 0 orphan-review rows

Implementation evidence:

- `public/js/bna-site-nav.js` exposes direct public navigation for School,
  Families, Provider Directory, One Time, Blog, FAQ, Portal Login, and
  Register; Operations remains absent from consumer navigation.
- `public/parent.html` adds stable Parent home and Assistant/help links while
  retaining public-site return, Families, and Student login recovery.
- `public/student.html` adds stable Student home and Assistant/help links while
  retaining public-site return, Families, and Parent login recovery.
- `public/provider.html` adds a stable Provider home link while retaining
  public-site return, Directory, Join, and scoped workspace labeling.
- `tests/ui-01-public-operations-shell.test.js` and
  `tests/public-route-privacy-contract.test.js` enforce the public IA and
  portal topbar contract.
- `ops/action-registry/universal-action-parity.*` and owner-review route docs
  were regenerated after visible navigation changes.

Guardrail: all verification was local and credential-free. No production
readback, database mutation, deploy, live smoke, external send, publish, upload,
charge, DNS, OAuth/account-owner action, or secret request was performed.
<!-- integration-navigation-req-006:end -->

<!-- integration-navigation-req-007:start -->
## REQ-20260624-007 Evidence

Shared website assistant visibility evidence on PR #14 branch
`codex/integration-navigation-owner-review-20260624`:

- Commit:
  `d853b9205626e6ea50bd3b639b7718b1f374040d`
- Draft owner-review PR:
  `https://github.com/shloimie-beep/bnei-neviim-academy/pull/14`
- Route inventory after repair:
  689 routes, 34 HTML pages, 0 orphan-review rows

Implementation evidence:

- `public/js/bna-bot-widget.js` now recognizes One Time member surfaces and
  sends them through the shared `/api/bna/assistant/chat` widget with
  `surface=one_time_member`.
- The shared widget exposes `window.BNAAssistant.open()` and a
  `data-bna-assistant-open` launcher hook so page chrome can open the same
  assistant instead of creating page-specific bot code.
- Parent, student, and provider topbars now open the shared assistant widget
  while preserving their safe public return/login navigation.
- One Time member home, member library, classroom, and provider-participant
  pages load the shared helper knowledge/widget scripts and expose a visible
  Assistant/help entry.
- Operations remains on its existing BNA Helper drawer and does not load a
  second public widget.
- `server.js` normalizes One Time member assistant surfaces to
  `one_time_member` for durable thread metadata.
- Assistant, route privacy, and portal communication contract tests now gate
  the shared launcher and One Time member scoping.
- Owner-review route inventory, One Time action coverage, and universal action
  parity artifacts were regenerated after the visible assistant changes.

Guardrail: all verification was local and credential-free. No production
readback, database mutation, deploy, live smoke, external send, publish, upload,
charge, DNS, OAuth/account-owner action, or secret request was performed.
<!-- integration-navigation-req-007:end -->
