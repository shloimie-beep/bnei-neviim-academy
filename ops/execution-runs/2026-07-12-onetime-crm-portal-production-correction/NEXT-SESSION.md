# Next Session

Current release branch: `codex/onetime-crm-portal-release-20260712`
Current active run: `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/`

Release-lane state as of 2026-07-12T21:14:00+03:00:

- A clean worktree was created from current `origin/master`.
- Scoped One Time CRM/portal correction work was reapplied without unrelated dirty lanes.
- Implementation commit `833cac222` was pushed to `origin/codex/onetime-crm-portal-release-20260712`.
- Draft PR `#131` is open and mergeable/clean: `https://github.com/shloimie-beep/bnei-neviim-academy/pull/131`.
- GitHub currently reports no status checks on the PR branch.
- Local validation, focused tests, screenshots/smokes, protocol drift watchdog, audit governance, and release-gate dry-run all completed on the release branch.
- No production deployment, production mutation, external send, provider write, payment/access/DNS change, or live verification was performed.

Open requirements:

- `REQ-20260712-101`: Done - intake/control artifacts validate.
- `REQ-20260712-102`: Done - authenticated/current-state regeneration captured Operations, CRM, inbox, provider, landing, parent/student, classroom/library, email review, and mobile states with screenshots and VQ findings. The original source PNGs remain unavailable only as a direct comparison limitation.
- `REQ-20260712-103`: Done locally - server/view-as scoping tests pass. Release/live-smoke remains under `REQ-20260712-112`.
- `REQ-20260712-104`: Done locally - CRM isolation/source-label tests pass and redacted local report exists. Release/live-smoke remains under `REQ-20260712-112`.
- `REQ-20260712-105`: Done locally - CRM pagination/cursor/source fetch cap tests pass, including 10,000-contact fixture. DB EXPLAIN/live-smoke remains under `REQ-20260712-112`.
- `REQ-20260712-106`: Done locally - CRM frontend loader/detail flow uses scoped panel refresh, AbortController-backed list/timeline requests, debounced search, 50-card cap, query cache, split-shell parity, and lazy legacy review table construction. Release/live-smoke remains under `REQ-20260712-112`.
- `REQ-20260712-107`: Done locally - CRM/inbox UI now has three-pane desktop layout, mobile selected-contact Back flow, disabled/no-send reply/note/task controls, scoped One Time Inbox selected-contact context, action registry rows, and local split-shell/monolith smoke proof. Release/live-smoke remains under `REQ-20260712-112`.
- `REQ-20260712-108`: Done locally - portal shell/preview work now covers Family Portal labels, parent setup/reset labels, shared One Time portal shell, TEST preview banner, preserved review links, accessible mobile menu, action registry rows, and screenshots at 1440/1024/768/430/390 widths. Release/live-smoke remains under `REQ-20260712-112`.
- `REQ-20260712-109`: Done locally - public landing Robot/helper widget assets are removed from the served page, one accessible same-origin WhatsApp launcher is present, action registry coverage is updated, and local screenshots cover 1440/1024/768/430/390 widths. Public-number live readback/release/live-smoke remains under `REQ-20260712-112`.
- `REQ-20260712-110`: Done locally - WhatsApp assistant natural deterministic replies and WAPI safety gates pass local tests. WAPI live/no-unapproved-send proof remains under `REQ-20260712-112`.
- `REQ-20260712-111`: Done locally - split shell is under the 1.2 MB budget, CRM metrics pass locally, cache policy contract passes, and member-library Vimeo loads only after Play Video. Production compression/cache/header readback remains under `REQ-20260712-112`.
- `REQ-20260712-112`: Blocked / needs operator release decision - scoped branch is clean, pushed, draft PR `#131` is open and mergeable/clean, and release-gate dry-run reports ready. Production deploy/live verification still requires PR review/release approval, explicit release-gate confirmation, and either completion or approved deferral of external Railway/Drive readbacks.

Next safe commands:

```bash
npm run bna:run:validate
npm run bna:release-gate -- --expected-branch codex/onetime-crm-portal-release-20260712
```

Production deploy and live verification require explicit approval tokens and should only run after PR review/release approval and operator confirmation of the production release path:

```bash
node scripts/bna-production-closeout-gate.mjs --deploy --confirm-deploy DEPLOY_BNA_PRODUCTION_CLOSEOUT --expected-branch codex/onetime-crm-portal-release-20260712
node scripts/bna-production-closeout-gate.mjs --live-verify --confirm-live VERIFY_BNA_LIVE_CLOSEOUT --expected-branch codex/onetime-crm-portal-release-20260712
```

If Railway/Drive readback is intentionally deferred, use only the approved release-gate defer flags after production deploy approval is present.

Resolved release-lane blocker / remaining limitation:

- `DEC-20260712-112`: the stale local `master` / mixed dirty worktree blocker is superseded by the clean pushed release branch. Remaining blocker is approval and execution of production deploy/live verification, including exact SHA readback and live smokes.
- `REQ-20260712-103` through `REQ-20260712-111`: local implementation and verification are complete. Do not mark production Done until `REQ-20260712-112` has deploy/live-smoke proof.
- `DEC-20260712-101`: six source screenshots from `/workspace/scratch/ffef2e71fe52/upload/` remain unavailable locally, but authenticated/current-state regeneration has been performed. Do not wait on the missing PNGs unless direct before/after comparison is specifically needed.

Do not run without explicit approval:

- No deploy/live-smoke that mutates production release state.
- No email/WhatsApp sends, payment/access changes, DNS/provider writes, uploads, production hard deletes, or external CRM/GHL writes from this packet.
