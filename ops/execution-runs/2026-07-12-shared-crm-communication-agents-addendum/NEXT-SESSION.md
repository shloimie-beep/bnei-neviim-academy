# Next Session - One Time Final Integration Launch

Active source: `RAW-20260713-010`

Current requirement: `REQ-20260713-935` - Verify and repair One Time landing/signup/assets/responsive launch path.

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

Continue with `REQ-20260713-935`. Keep the scope narrow; do not broaden into the whole parent ramble.

Validated PQC splitter: `ops/prompt-packets/2026-07-13-onetime-final-integration-launch/01-current-state-to-implementation.product-quality.json`.

Blocked/gated items remain:

- Public WhatsApp approval is granted by `DEC-20260713-008`, but activation remains blocked until secure canary destinations and technical gates pass.
- Stripe sandbox/test work is authorized by `DEC-20260713-009`; no live charge/refund/subscription/access mutation is authorized.
- PR #132 must not be merged wholesale.
- No deploy/live Done until One Time live SHA matches the intended current source and live smokes pass.
