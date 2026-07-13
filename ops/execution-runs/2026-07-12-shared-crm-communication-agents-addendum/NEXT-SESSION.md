# Next Session - One Time Final Integration Launch

Active source: `RAW-20260713-010`

Current requirement: `REQ-20260713-934` - Fix One Time identity, navigation, CRM/content, mobile, and performance issues.

Start with child packet `PKT-20260713-934A`: member portal performance repair only. Evidence from `ops/ui-audits/2026-07-13-onetime-final-launch-current-state/report.md` shows `/rabbi-member` exceeded the 22-second capture deadline at 1440, 1024, 768, 430, and 390. Do not broaden into the whole parent ramble.

Validated PQC splitter: `ops/prompt-packets/2026-07-13-onetime-final-integration-launch/01-current-state-to-implementation.product-quality.json`.

Blocked/gated items remain:

- Operations read-only audit credentials returned 401, so authenticated CRM readback and admin-provider session proof require valid read-only auth/session setup before those slices can be closed.
- Public WhatsApp approval is granted by `DEC-20260713-008`, but activation remains blocked until secure canary destinations and technical gates pass.
- Stripe sandbox/test work is authorized by `DEC-20260713-009`; no live charge/refund/subscription/access mutation is authorized.
- PR #132 must not be merged wholesale.
- No deploy/live Done until One Time live SHA matches the intended current source and live smokes pass.
