# Next Session - One Time Final Integration Launch

Active source: `RAW-20260713-010`

Current requirement: `REQ-20260713-934` - Fix One Time identity, navigation, CRM/content, mobile, and performance issues.

`PKT-20260713-934A` member portal performance is locally implemented and verified. Commit/push it, then deploy/live-smoke before claiming app-visible Done. Do not redo the 934A root-cause repair unless verification regresses.

934A local evidence:

- Implementation: `public/rabbi-member.html`, `public/js/rabbi-member.js`, `scripts/smoke-onetime-member-performance-local.mjs`, `tests/app-select-dropdown.test.js`, `package.json`.
- Report: `ops/performance-audits/2026-07-13-onetime-member-performance-local/report.md`.
- Result: screenshot-ready DCL at 22ms, 15ms, 46ms, 54ms, and 15ms across 1440/1024/768/430/390; deferred Helper click still opens the `one_time_member` assistant.

Continue with child packets `PKT-20260713-934B` and `PKT-20260713-934C` after the 934A commit/push step. Keep the scope narrow; do not broaden into the whole parent ramble.

Validated PQC splitter: `ops/prompt-packets/2026-07-13-onetime-final-integration-launch/01-current-state-to-implementation.product-quality.json`.

Blocked/gated items remain:

- Operations read-only audit credentials returned 401, so authenticated CRM readback and admin-provider session proof require valid read-only auth/session setup before those slices can be closed.
- Public WhatsApp approval is granted by `DEC-20260713-008`, but activation remains blocked until secure canary destinations and technical gates pass.
- Stripe sandbox/test work is authorized by `DEC-20260713-009`; no live charge/refund/subscription/access mutation is authorized.
- PR #132 must not be merged wholesale.
- No deploy/live Done until One Time live SHA matches the intended current source and live smokes pass.
