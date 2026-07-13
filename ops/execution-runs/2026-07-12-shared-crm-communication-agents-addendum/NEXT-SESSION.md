# Next Session - One Time Final Integration Launch

Active source: `RAW-20260713-010`

Current requirement: none unblocked. `REQ-20260713-939`, `REQ-20260713-940`, and `REQ-20260713-941` are blocked by the `REQ-20260713-936` owner/canary gate plus campaign seed approvals.

`REQ-20260713-935` landing/signup/assets/responsive is Done. One Time deployment `39b4820d-fe5a-456c-bdc1-ccc30befa1d5` serves exact SHA `11e5ba0d4da6ae8897294be81a567bb519943ab2`; responsive report `ops/ui-audits/2026-07-13-onetime-landing-signup-responsive-live/REPORT.md`, signup matrix `ops/live-smokes/2026-07-13T20-50-12-287Z-one-time-signup-form-matrix-live.md`, and interest dry-run `ops/live-smokes/2026-07-13T20-50-12-079Z-one-time-interest-dry-run-live-smoke.md` passed. Do not redo the landing/signup campaign-policy repair unless verification regresses.

`PKT-20260713-934A` member portal performance is locally implemented, verified, committed, pushed, deployed, and live-smoked. One Time deployment `c00813df-2dc8-47e3-97b2-c5152c20402d` serves exact SHA `20307e2638988b6fe5d10b8a649d87ed8a8522cb`; do not redo the 934A root-cause repair unless verification regresses.

934A local evidence:

- Implementation: `public/rabbi-member.html`, `public/js/rabbi-member.js`, `scripts/smoke-onetime-member-performance-local.mjs`, `tests/app-select-dropdown.test.js`, `package.json`.
- Report: `ops/performance-audits/2026-07-13-onetime-member-performance-local/report.md`.
- Result: screenshot-ready DCL at 22ms, 15ms, 46ms, 54ms, and 15ms across 1440/1024/768/430/390; deferred Helper click still opens the `one_time_member` assistant.

934A live evidence:

- `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com --expected-sha 20307e2638988b6fe5d10b8a649d87ed8a8522cb` passed.
- `ops/performance-audits/2026-07-13-onetime-member-performance-live/report.md` passed with exact SHA headers and warm DCL values of 998ms, 756ms, 712ms, 827ms, and 719ms across 1440/1024/768/430/390. It preserves one immediately post-deploy cold 3604ms desktop sample as context.
- `ops/performance-audits/2026-07-13-onetime-performance-regression-gates/report.md` passed at exact SHA.

`PKT-20260713-934B` / `PKT-20260713-934C` live evidence:

- One Time deployment `86bbbea8-246e-4c03-8bdd-83d677406f31` serves exact SHA `e973ce50b86e7566034faf8a604133a4870e4d7b`.
- `ops/ui-audits/2026-07-13-onetime-auth-admin-context-live/report.md` passed with scoped Operations auth, provider-session start/readback, read-only CRM contacts, provider-admin CRM route clean, and student-login route clean.
- The real `/student/login` screen no longer sends the startup session probe and no longer shows the `TEST PREVIEW / SAMPLE DATA / NO WRITES` banner.
- `REQ-20260713-934` is Done. Do not reopen 934A/934B/934C unless verification regresses.

`REQ-20260713-937` Billing V2 / PR #132 reconciliation is Done. Do not merge PR #132 wholesale or redo the Billing V2 slice unless verification regresses.

REQ-937 evidence:

- PR #132 audit: `ops/audits/2026-07-14-onetime-billing-pr132-reconciliation-audit.md`.
- Sandbox E2E verifier: `ops/verifier-runs/2026-07-14-onetime-billing-sandbox-e2e/latest.md`.
- Focused tests: `node --test tests/stripe-billing-lifecycle.test.js tests/one-time-stripe-local-beta.test.js tests/one-time-parent-trial-invite.test.js tests/one-time-billing-sandbox-e2e-verifier.test.js tests/owner-review-role-flow-contract.test.js` passed `25/25`.
- Guardrail: `npm run watchdog:workspace-scope` passed.
- Source SHA `050170d3ce5e9d0ea8e0db5ca0fa96b369bff0b5` was pushed and deployed to One Time deployment `15280d13-3e12-4c72-8460-10e0c6e99b3e`.
- Live `/api/deploy-info` returned exact SHA `050170d3ce5e9d0ea8e0db5ca0fa96b369bff0b5`.
- Exact-SHA separate-instance smoke passed.
- Parent-facing no-trial campaign smoke passed: `ops/live-smokes/2026-07-13T21-42-33-620Z-rabbi-onetime-landing-smoke.md`.
- Operations promotional billing/referral no-write smoke passed: `ops/live-smokes/2026-07-13T21-44-55-248Z-one-time-trial-referral-live-smoke.md`; it recorded `trial_days=0`, `stripe_trial_enabled=false`, renewal `6700`, and referral trigger `first_successful_paid_cycle`.
- No live charge, refund, subscription, checkout, billing notice send, email/WhatsApp send, provider mutation, access mutation, or external write was performed.

`REQ-20260713-938` Media / Classroom / Zoom truth is Done. Do not redo it unless verification regresses.

REQ-938 evidence:

- Truth audit: `ops/audits/2026-07-14-onetime-media-classroom-zoom-truth.md`.
- Local suite: consolidated Drive/Vimeo/transcript/classroom/Zoom tests passed `83/83`.
- Live no-write smokes at deployed One Time SHA `050170d3ce5e9d0ea8e0db5ca0fa96b369bff0b5`:
  `ops/live-smokes/2026-07-13T21-58-08-470Z-one-time-transcript-privacy-live-smoke.md`,
  `ops/live-smokes/2026-07-13T21-58-09-287Z-one-time-zoom-attendance-live-smoke.md`,
  `ops/live-smokes/2026-07-13T21-58-34-161Z-one-time-metadata-review-live-smoke.md`, and
  `ops/live-smokes/2026-07-13T21-58-34-168Z-one-time-classroom-library-readonly-live-smoke.md`.
- Guardrail: no Vimeo upload, Drive write/move, Google Classroom write, Zoom meeting/registrant/webhook write, member publication, access mutation, send, payment, DNS, credential, provider, or production-data mutation occurred.

Dependency-aware release preflight for `REQ-20260713-939` has run. Do not redo it unless a blocker changes.

REQ-939 / 940 / 941 release-tail blocker evidence:

- `npm run one-time:target:guard` passed for the canonical One Time public target and Railway target.
- `npm run one-time:setup:check` is blocked only on `SETUP-ONETIME-CAMPAIGN-001`: `final_campaign_copy`, `exact_recipient_segment_or_list`, `suppression_unsubscribe_proof`, and `explicit_seed_packet_approval`.
- `npm run one-time:owner-test:readiness` wrote `ops/watchdog-audits/2026-07-13T22-13-41-897Z-onetime-owner-test-readiness.md` and is blocked on missing secure owner-test email and WhatsApp aliases.
- No-write public launch smoke evidence is refreshed at `ops/production-readiness/2026-07-12-no-write-live-smoke-readback.md`.
- `npm run production:readiness:gate -- --json` is blocked as expected until owner/canary aliases and campaign seed approvals are configured; the dirty-tree blocker should clear after this closeout commit is pushed.

Validated PQC splitter: `ops/prompt-packets/2026-07-13-onetime-final-integration-launch/01-current-state-to-implementation.product-quality.json`.

Blocked/gated items remain:

- Public WhatsApp approval is granted by `DEC-20260713-008`, but activation remains blocked until secure canary destinations and technical gates pass.
- Stripe sandbox/test work is authorized by `DEC-20260713-009`; no live charge/refund/subscription/access mutation is authorized.
- PR #132 must not be merged wholesale.
- No deploy/live Done until One Time live SHA matches the intended current source and live smokes pass.
- Next safe action after operator/secret update: rerun `npm run one-time:owner-test:readiness`, `npm run one-time:setup:check`, `npm run production:readiness:gate -- --json`, and `npm run bna:run:next`.
