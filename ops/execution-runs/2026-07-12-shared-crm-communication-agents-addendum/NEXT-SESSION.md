# Next Session - One Time Final Integration Launch

Active source: `RAW-20260713-010`

Current requirement: `REQ-20260713-937` - Reconcile Stripe Billing V2 and PR #132 into current master safely.

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

Continue with `REQ-20260713-937` deploy/live verification. The safe PR #132 Billing V2 slice is locally reconciled and sandbox-verified, but it is not Done until the scoped commit is pushed, One Time is deployed at the intended SHA, and exact-SHA live smokes/readbacks pass.

REQ-937 local evidence:

- PR #132 audit: `ops/audits/2026-07-14-onetime-billing-pr132-reconciliation-audit.md`.
- Sandbox E2E verifier: `ops/verifier-runs/2026-07-14-onetime-billing-sandbox-e2e/latest.md`.
- Focused tests: `node --test tests/stripe-billing-lifecycle.test.js tests/one-time-stripe-local-beta.test.js tests/one-time-parent-trial-invite.test.js tests/one-time-billing-sandbox-e2e-verifier.test.js tests/owner-review-role-flow-contract.test.js` passed `25/25`.
- Guardrail: `npm run watchdog:workspace-scope` passed.
- No live charge, refund, subscription, checkout, billing notice send, email/WhatsApp send, provider mutation, access mutation, or external write was performed.

Validated PQC splitter: `ops/prompt-packets/2026-07-13-onetime-final-integration-launch/01-current-state-to-implementation.product-quality.json`.

Blocked/gated items remain:

- Public WhatsApp approval is granted by `DEC-20260713-008`, but activation remains blocked until secure canary destinations and technical gates pass.
- Stripe sandbox/test work is authorized by `DEC-20260713-009`; no live charge/refund/subscription/access mutation is authorized.
- PR #132 must not be merged wholesale.
- No deploy/live Done until One Time live SHA matches the intended current source and live smokes pass.
