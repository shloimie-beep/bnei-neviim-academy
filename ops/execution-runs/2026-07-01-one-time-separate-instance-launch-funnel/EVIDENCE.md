# Evidence

- Raw source:
  `raw-input/RAW-20260701-007-one-time-separate-instance-launch-funnel-source.txt`.
- Raw metadata:
  `raw-input/RAW-20260701-007-one-time-separate-instance-launch-funnel.md`.
- Requirement register:
  `tasks-pending/2026-07-01-one-time-separate-instance-launch-funnel.md`.
- Decision record:
  `ops/one-time-mishnah/decisions/2026-07-01-one-time-separate-instance-decisions.md`.
- Product Quality drift report after repair:
  `ops/watchdog-audits/2026-07-02-product-quality-drift.md`.
- Existing single-tenant split source:
  `docs/architecture/onetime-single-tenant-split.md`.
- Existing One Time instance contract:
  `src/platform/instances/one-time.js`.
- Existing provider env Railway audit/propagation helpers:
  `scripts/provider-env-railway-audit.mjs` and
  `scripts/provider-env-railway-propagate.mjs`.
- One Time Railway target guard:
  `scripts/railway-target-guard.mjs`.
- One Time provisioning readiness check:
  `scripts/provision-onetime-railway-instance.mjs`.
- One Time database bootstrap readiness check:
  `scripts/bootstrap-onetime-database.mjs`.
- Focused provisioning test:
  `tests/one-time-separate-instance-provisioning.test.js`.
- Package scripts added:
  `one-time:railway-target:guard`,
  `one-time:railway-provision:check`,
  `one-time:railway-provision:apply`, and
  `one-time:db:bootstrap`.
- Safe provisioning readiness report:
  `ops/one-time-mishnah/provisioning/2026-07-01-separate-railway-db-readiness.md`
  and `.json`.
- Safe secret split report:
  `ops/one-time-mishnah/secrets/2026-07-01-one-time-secret-split.md`.

No secrets, raw contact rows, DNS writes, campaign sends, WhatsApp sends, live
Stripe payments, subscription changes, paid-user cancellations, GHL runtime
writes, or production media writes were performed while creating this run.

## RAW-20260702-002 Launch Unblocker

- Raw source:
  `raw-input/RAW-20260702-002-one-time-launch-unblocker.md`.
- Requirement update:
  `tasks-pending/2026-07-02-one-time-launch-unblocker.md`.
- Launch-unblocker readiness:
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-launch-unblocker-readiness.md`
  and `.json`.
- Operator external setup checklist:
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-operator-external-setup-checklist.md`
  and `.json`.
- Post-setup deploy/live-smoke packet:
  `ops/prompt-packets/2026-07-02-one-time-post-setup-live-closeout/00-railway-db-join-domain-deploy-live-smoke.md`
  and `ops/prompt-packets/2026-07-02-one-time-post-setup-live-closeout/manifest.json`.
- No-secret external setup readiness checker:
  `scripts/check-onetime-external-setup-readiness.mjs`.
- Latest external setup readiness report:
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-external-setup-readiness-check.md`
  and `.json`.
- Local launch smoke:
  `ops/local-smokes/2026-07-02T06-47-35-826Z-one-time-launch-safe-local-smoke.md`.

This update locally verified no-card 30-day signup/access, member/admin
workspace contracts, parent/student portal basics, click-tracked
attendance/progress contracts, draft-only email/campaign controls, and the
current deployment blocker set. It performed no live campaign send, live
payment, DNS mutation, provider mutation, real WhatsApp send, hard delete,
GHL/LeadConnector runtime write, or privacy-sensitive export.

`REQ-20260701-701` is blocked only for the external apply/bootstrap work:
exact One Time Railway service target, separate One Time database URL/alias, and
approved One Time environment values are still required before any external
Railway/database mutation.

## RAW-20260702-003 Launch Execution Update

- Raw intake:
  `raw-input/RAW-20260702-003-one-time-launch-execution-worktree-external-setup.md`.
- Requirement register:
  `tasks-pending/2026-07-02-one-time-launch-execution-worktree-external-setup.md`.
- Top visible operator tasks:
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-top-visible-operator-tasks.md`
  and
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-top-visible-operator-tasks.json`.
- GoDaddy join-only DNS instructions:
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-godaddy-join-subdomain-instructions.md`.
- Worktree reconciliation:
  `ops/worktree-reconciliation/2026-07-02-one-time-launch-execution/report.md`
  and
  `ops/worktree-reconciliation/2026-07-02-one-time-launch-execution/report.json`.
- Rabbi WhatsApp setup message draft, no send:
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-rabbi-whatsapp-setup-message.md`
  and
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-rabbi-whatsapp-setup-message.json`.
- Updated no-secret setup readiness report:
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-external-setup-readiness-check.md`
  and
  `ops/one-time-mishnah/launch-unblocker/2026-07-02-external-setup-readiness-check.json`.

The setup checker reports `0/8` external setup areas ready. It performed no
external write, provider mutation, DNS mutation, email send, WhatsApp send,
live payment, or secret value print.

## REQ-20260701-705 Free Signup And 30 Day Access

- Trial/referral smoke:
  `npm run app:smoke:one-time-trial-referral`.
- Payment/access/class-link smoke:
  `npm run app:smoke:one-time-payment-access-class-links`.
- Focused local contracts:
  `tests/one-time-local-beta-product-contract.test.js`,
  `tests/one-time-stripe-local-beta.test.js`,
  `tests/one-time-focused-landing.test.js`,
  `tests/one-time-product-system.test.js`, and
  `tests/rabbi-checkout-access.test.js`.

Local proof confirms no-card 30-day trial behavior, referral capture, no
checkout creation, no live charge, no external write, and scoped One Time
access contracts. Final Done remains blocked on deploy/live smoke against the
separate One Time service/database.

## REQ-20260701-706 Member/Admin Workspace And Portal Basics

- Focused portal and role contracts:
  `tests/one-time-external-user-portal.test.js`,
  `tests/one-time-role-auth-model.test.js`,
  `tests/one-time-announcements-first-community.test.js`, and
  `tests/one-time-class-course-ingestion.test.js`.
- Media/class pipeline contracts:
  `tests/one-time-media-local-pipeline.test.js`,
  `tests/one-time-drive-dropoff-email-watch.test.js`, and
  `tests/provider-api-usage-readiness.test.js`.

Local proof confirms member/admin workspace, private questions/community,
class/course/video references, role-scoped portals, and parent/student scope
contracts. Final live proof still depends on the selected One Time service and
final Zoom/session/content details.

## REQ-20260701-707 Attendance V1 Link Click Tracking

- Progress and attendance contracts:
  `tests/one-time-progress-rewards-local-beta.test.js`,
  `tests/one-time-media-local-pipeline.test.js`, and
  `npm run app:smoke:one-time-payment-access-class-links`.

Local proof confirms attendance/progress/class-link smoke behavior without
manual attendance or external writes. Final Done remains blocked on deployed
member class-link smoke.

## REQ-20260701-709 Email Confirmation And Reminder Readiness

- Local no-send email/outbox contracts:
  `tests/one-time-resend-local-outbox.test.js`,
  `tests/assistant-campaign-control-contract.test.js`,
  `tests/communications-integrations-contract.test.js`,
  `tests/resend-client.test.js`,
  `tests/resend-inbound-crm.test.js`, and
  `tests/resend-inbound-webhook.test.js`.

Local proof confirms draft-only email workflow/outbox, suppression/consent
policy, and campaign controls. Real seed/campaign send remains blocked until
the final live join link, exact recipient segment/list, suppression proof,
final copy, and an explicit campaign packet exist.

## REQ-20260701-703 Host Routing

- Server host gate:
  `server.js`.
- Member canonical URL normalization:
  `public/js/rabbi-member.js`.
- Route registry:
  `ops/route-registry.json`.
- Focused route/landing contract:
  `tests/one-time-focused-landing.test.js`.
- Rabbi member compatibility contract:
  `tests/rabbi-checkout-access.test.js`.

The route code now claims only `join.onetimeonetime.com` for campaign-host
behavior. The older apex/root `onetimeonetime.com` and `www.onetimeonetime.com`
are not app-level campaign host targets in this batch.

## REQ-20260701-704 Landing/Signup

- Landing page:
  `public/one-time/index.html`.
- Focused landing contract:
  `tests/one-time-focused-landing.test.js`.
- Product/signup contract:
  `tests/one-time-product-system.test.js`.
- Static local screenshot report:
  `ops/playwright-smokes/2026-07-01-one-time-join-landing-local/report.md`
  and `.json`.
- Screenshot evidence:
  `ops/playwright-smokes/2026-07-01-one-time-join-landing-local/desktop-1440.png`,
  `tablet-1024.png`, `tablet-768.png`, `mobile-430.png`, and
  `mobile-390.png`.

The page now includes the campaign bar/top navigation, hero, Rabbi/video
preview, primary CTA, child benefits, live class/attendance section, video
library/replays, private questions, parent progress basics, how-it-works, FAQ,
final CTA, member login link, required signup fields, and hidden UTM/campaign
metadata.

## REQ-20260701-711 Whapi/WAPI Setup

- Redacted WAPI diagnostics:
  `server.js`.
- Example safe environment labels:
  `.env.example`.
- Operations WhatsApp setup panel:
  `public/operations.html`.
- No-send/scoping/diagnostics tests:
  `tests/whapi-log-sync-contract.test.js`,
  `tests/wapi-phonebook-report.test.js`, and
  `tests/provider-integrations-secret-storage.test.js`.

The panel maps spoken `Wappy` to the repo's existing Whapi/WAPI connector,
shows provider account, phone, token, instance, webhook, send-enabled, and last
test status by safe status/fingerprint only, and keeps safe-test send/reminder
actions disabled. No WhatsApp message, broadcast, external CRM write, provider
mutation, GHL/LeadConnector runtime, secret print, or cross-workspace contact
merge was performed.

## REQ-20260701-712 Buffer/Social Setup

- One Time Buffer draft/schedule guard:
  `server.js`.
- One Time Social Scheduler Setup panel:
  `public/operations.html`.
- Contract coverage:
  `tests/communications-integrations-contract.test.js`.
- Readiness report:
  `ops/one-time-mishnah/social/2026-07-01-buffer-social-draft-approval-readiness.md`
  and `.json`.

One Time can save local first-party social drafts, but provider Buffer draft
creation is blocked until a future approved packet supplies
`APPROVE_ONE_TIME_BUFFER_DRAFT`; schedule confirmation remains blocked until
`APPROVE_ONE_TIME_BUFFER_SCHEDULE`. No Buffer draft, schedule, publish, media
attach, ad spend, provider mutation, email send, WhatsApp send, or external CRM
write was performed.

## REQ-20260701-715 Existing Paying Users Audit

- Migration audit packet:
  `ops/prompt-packets/2026-07-01-one-time-paying-users-migration/01-existing-paying-users-audit.md`.
- Same-day aggregate audit source:
  `ops/one-time-mishnah/funnel/2026-07-01-paying-users-migration-audit.md`
  and `.json`.
- Payment/access no-write tests:
  `tests/one-time-paying-users-migration-audit-packet.test.js`,
  `tests/rabbi-checkout-access.test.js`,
  `tests/one-time-stripe-local-beta.test.js`,
  `tests/integrations/w4-onetime-readiness.test.js`, and
  `tests/int05-integrations-closeout.test.js`.

The packet uses aggregate counts only, classifies the required migration lanes,
and includes a draft-only platform update email. It contains no raw names,
emails, phones, customer IDs, checkout sessions, payment URLs, invoice URLs, or
raw payment rows.

## REQ-20260701-716 Task View Sorting And Scoped Visibility

- Operations UI sorting/filtering:
  `public/operations.html`.
- Server task ordering:
  `server.js`.
- Contract coverage:
  `tests/workspace-task-no-stale-agent.test.js`,
  `tests/operations-task-queue-visibility.test.js`,
  `tests/operations-task-comments-and-dictation.test.js`, and
  `tests/one-time-operations-ui-smoke.test.js`.
- Readiness report:
  `ops/one-time-mishnah/task-view/2026-07-01-task-view-sorting-filtering-readiness.md`
  and `.json`.

The task view now puts newest active work ahead of stale/terminal history,
keeps workspace/project/owner signals visible on cards and details, keeps
Shloimie/super-admin filters broad, and hides internal tech-only Codex/system
cards from project-scoped Rabbi provider users unless explicitly shared or
provider-actionable. Deploy/live smoke was not run.
