# Next Session

Current release candidate branch: `codex/launch-consolidation-20260712`.
Current active run: `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/`

Open requirements:

- `REQ-20260712-101`: Done - intake/control artifacts validate.
- `REQ-20260712-102`: Done - authenticated/current-state regeneration captured Operations, CRM, inbox, provider, landing, parent/student, classroom/library, email review, and mobile states with screenshots and VQ findings. The original source PNGs remain unavailable only as a direct comparison limitation.
- `REQ-20260712-103`: Done locally - server/view-as scoping tests pass. Release/live-smoke remains under `REQ-20260712-112`.
- `REQ-20260712-104`: Done locally - CRM isolation/source-label tests pass and redacted local report exists. Release/live-smoke remains under `REQ-20260712-112`.
- `REQ-20260712-105`: Done locally - CRM pagination/cursor/source fetch cap tests pass, including 10,000-contact fixture. DB EXPLAIN/live-smoke remains under `REQ-20260712-112`.
- `REQ-20260712-106`: Done locally - CRM frontend loader/detail flow uses scoped panel refresh, AbortController-backed list/timeline requests, debounced search, 50-card cap, query cache, split-shell parity, and lazy legacy review table construction. Release/live-smoke remains under `REQ-20260712-112`; shell byte-budget work remains under `REQ-20260712-111`.
- `REQ-20260712-107`: Done locally - CRM/inbox UI now has three-pane desktop layout, mobile selected-contact Back flow, disabled/no-send reply/note/task controls, scoped One Time Inbox selected-contact context, action registry rows, and local split-shell/monolith smoke proof. Release/live-smoke remains under `REQ-20260712-112`; shell byte-budget work remains under `REQ-20260712-111`.
- `REQ-20260712-108`: Done locally - portal shell/preview work now covers Family Portal labels, parent setup/reset labels, shared One Time portal shell, TEST preview banner, preserved review links, accessible mobile menu, action registry rows, and screenshots at 1440/1024/768/430/390 widths. Release/live-smoke remains under `REQ-20260712-112`; bundle/performance work remains under `REQ-20260712-111`.
- `REQ-20260712-109`: Done locally - public landing Robot/helper widget assets are removed from the served page, one accessible same-origin WhatsApp launcher is present, action registry coverage is updated, and local screenshots cover 1440/1024/768/430/390 widths. Public-number live readback/release/live-smoke remains under `REQ-20260712-112`.
- `REQ-20260712-110`: Done locally - WhatsApp assistant natural deterministic replies and WAPI safety gates pass local tests. WAPI live/no-unapproved-send proof remains under `REQ-20260712-112`.
- `REQ-20260712-111`: Done locally - split shell is under the 1.2 MB budget, CRM metrics pass locally, cache policy contract passes, and member-library Vimeo loads only after Play Video. Production compression/cache/header readback remains under `REQ-20260712-112`.
- `REQ-20260712-112`: Blocked - no deploy/mutation/live verification was performed. Production readiness remains blocked by Stripe sandbox/campaign setup fields, Rabbi Telegram live-smoke proof, Agent Mode terminal proof, and exact clean-tree push/merge/deploy/readback requirements. WAPI provider setup/auto-reply and Rabbi Telegram token/chat runtime are ready by redacted readback.

Next safe commands:

```bash
npm run pqc:validate ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/00-control-tower.product-quality.json ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/01-current-state-visual-audit.product-quality.json
npm run bna:run:validate
npm run bna:run:next
```

If validation passes, the next unblocked batch should be none until
`REQ-20260712-112` is unblocked by Stripe/campaign setup clearance or approved
deferral, Rabbi Telegram live-smoke proof/approval, saved Agent Mode terminal
proofs, and a pushed/merged exact release commit.
Use the regenerated audit findings before touching broad UI files. Downstream UI packets still need focused Product Quality Compiler
Definition of Ready and action/route registry checks.

Resolved audit blocker / remaining limitation:

- `DEC-20260712-101`: six source screenshots from `/workspace/scratch/ffef2e71fe52/upload/` remain unavailable locally, but authenticated/current-state regeneration has now been performed. Do not wait on the missing PNGs unless direct before/after comparison is specifically needed.
- `REQ-20260712-103` through `REQ-20260712-111`: release verification is open under `REQ-20260712-112`. After scoped staging is safe, commit/push/deploy and run live view-as, CRM scope/API/frontend/inbox/portal/landing, public WhatsApp readiness, WAPI no-unapproved-send, production compression/cache/header, and exact SHA smokes before closing the run.
- `DEC-20260712-112`: release gate blocked by Stripe/campaign setup fields,
  Rabbi Telegram live-smoke proof, Agent Mode terminal proof, and exact
  push/merge/deploy/readback requirements. WAPI provider setup/auto-reply and
  Rabbi Telegram token/chat runtime are ready by redacted readback. Recommended
  next action: clear or explicitly defer the remaining blockers through the
  approved release policy, push/merge the exact clean release commit, then rerun
  the release gate and approved deploy/live verification.

Do not run yet:

- No deploy/live-smoke until scoped implementation and release gates pass.
- No email/WhatsApp sends, payment/access changes, DNS/provider writes, uploads, production hard deletes, or external CRM/GHL writes from this packet.
