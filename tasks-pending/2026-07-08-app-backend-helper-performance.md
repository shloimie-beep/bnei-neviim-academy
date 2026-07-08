# Ramble Intake - 2026-07-08 - App Backend And Helper Performance

## Raw Intake

Source raw record:
`raw-input/RAW-20260708-022-app-backend-helper-performance.md`

## Raw Queue Record

| Field | Value |
|---|---|
| Raw ID | RAW-20260708-022 |
| Source | codex_chat |
| Parse status | registered |
| Requirement register | tasks-pending/2026-07-08-app-backend-helper-performance.md |

## Router Result

Classification: `PRODUCT_QUALITY`, `BUG_REPORT`, `PERFORMANCE`,
`UI_VISUAL_AUDIT`, `BACKEND_API`, `HELPER_BOT`, `DEPLOY_RELEASE`.

This is a performance launch-readiness packet. Current-state measurement is
mandatory before product code changes. The first implementation batch should fix
the highest-confidence latency source that does not require credentials or an
external provider mutation.

## Parsed Requirements

| ID | Requirement | Source IDs | Workspace/project | Owner | Category | Priority | Batch | Dependencies | Acceptance criteria | Implementation files | Deploy/live required | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| REQ-20260708-078 | Diagnose and reduce app/backend navigation latency across Operations and OneTime role surfaces. | RAW-20260708-022 | `bna_platform` / `one_time_mishnah_class` | Codex | performance | P0 | 1 | REQ-20260708-080 | Audit records route/API/browser click timings and identifies the top fix; app-visible fix improves measured latency or removes a verified bottleneck without weakening auth/scope/security. | `server.js`, `public/*.html`, `public/js/*.js`, scripts/tests as needed | yes | Done |
| REQ-20260708-079 | Diagnose helper/bot response latency and make safe fast paths faster without reducing reliability or reasoning quality. | RAW-20260708-022 | `bna_platform` / `one_time_mishnah_class` | Codex | helper-performance | P0 | 1 | REQ-20260708-080 | Helper audit records deterministic planner time and AI planner wait time; fixes must prefer deterministic routing, caching, timeout/UX feedback, or model-call avoidance for simple commands, not lower-quality answers. | `server.js`, `src/lib/bna/helper/planner.js`, helper tests/smokes as needed | yes if server-visible | Done |
| REQ-20260708-080 | Create current-state app/backend/helper latency audit evidence before implementation. | RAW-20260708-022 | `bna_platform` / `one_time_mishnah_class` | Codex | audit-first | P0 | 0 | none | Report includes API timings, browser navigation/click timings, helper plan timings, console/network errors, and first-fix recommendation. | `ops/prompt-packets/2026-07-08-app-backend-helper-performance/`, `ops/performance-audits/2026-07-08-app-backend-helper-performance/` | no | Done |
| REQ-20260708-086 | Split the 2.35MB Operations shell and fast-pass Rabbi / One Time overview hydration. | RAW-20260708-024 | `bna_platform` / `one_time_mishnah_class` | Codex | performance | P0 | 2 | REQ-20260708-078 | `/operations` serves a tiny bootstrap plus separately cacheable shell CSS/JS; Rabbi / One Time Program overview first pass skips full launch/content/communication hydration and queues background hydration; same performance audit records before/after. | `public/operations.html`, `public/operations-bootstrap.html`, `public/css/operations-shell.css`, `public/js/operations-shell.js`, `server.js`, `scripts/split-operations-shell.mjs`, tests/evidence | yes | Committed/pushed; deploy/live-smoke pending |

## Decisions

| ID | Decision | Missing information | Owner | Recommended option | Alternatives | Consequences | Exact action required | Blocks requirements | Status |
|---|---|---|---|---|---|---|---|---|
| DEC-20260708-014 | Helper speed versus answer depth policy. | None for initial audit; user explicitly said do not reduce reliability/brain power when the bot really needs to think. | Codex | Keep high-quality reasoning for complex requests, but avoid AI calls for deterministic navigation/status/task commands and add measured fast paths where safe. | Lower model quality or shorter thinking for all requests. | Global downgrades may make the helper less reliable and less safe. | Implement only measured fast-path or UX/timeout improvements unless Shloimie explicitly approves a lower-quality helper mode. | REQ-20260708-079 | Resolved for first audit |

## Product Quality Packet

| Packet | Role | Status | Purpose |
|---|---|---|---|
| `00-current-state-performance-audit.product-quality.json` | VISUAL_AUDITOR | Validated | Compile the vague slowness report into measurable route/API/helper latency checks before code edits. |

## Implementation Map

| ID | Files/routes/components | Plan | Verification | Commit | Pushed commit | Deployment/live-smoke |
|---|---|---|---|---|---|---|
| REQ-20260708-080 | Operations, OneTime public/role pages, helper plan endpoints | Created and validated PQC packet; ran live baseline latency audit. | PASS `npm run pqc:validate -- ops/prompt-packets/2026-07-08-app-backend-helper-performance/00-current-state-performance-audit.product-quality.json`; baseline saved as `before-report.*`. | Pending | Pending | Not required for audit |
| REQ-20260708-078 | `/operations`, `/operations.html`, Operations browser shell | Changed both Operations shell entry points from `no-store` to `private, no-cache, max-age=0, must-revalidate` so browsers may store and revalidate the 2.35MB shell instead of discarding it every time. | PASS local readback; PASS live readback; PASS focused tests; PASS OneTime live smoke. | `9c3a18dd` | `2941eeff` | Railway `one-time-web` deployment `17147745-74f0-4b5d-a627-48903de33382` SUCCESS; live report saved in `report.md`. |
| REQ-20260708-079 | `src/lib/bna/helper/planner.js`, helper plan endpoint | Added deterministic support-ticket fast path for `slow`, `slowness`, `lag`, `laggy`, `performance`, `takes forever`, and `loading forever`; audit wording now tests raw slowness language without saying "create support ticket." | PASS helper planner tests; PASS local performance audit; PASS live performance audit: raw slowness message planned `create_support_ticket` deterministically in about 260ms. | `9c3a18dd` | `2941eeff` | Railway `one-time-web` deployment `17147745-74f0-4b5d-a627-48903de33382` SUCCESS; live report saved in `report.md`. |
| REQ-20260708-086 | `/operations`, Rabbi / One Time Operations Program overview | Generated split Operations delivery from the existing source shell: `/operations` now serves `operations-bootstrap.html` (1,688 bytes) and loads `operations-shell.css` / `operations-shell.js` as separately cacheable static assets. Added a OneTime Program overview fast-pass that renders with workspace/branding/provider data first, then queues full launch/content/communications hydration in the background. | PASS focused syntax/tests; PASS local before/after performance audit. Before local split: `/operations` 2,356,672 bytes, median 8ms, browser nav 3,554ms. After local split: `/operations` 1,688 bytes, median 2ms, browser nav 3,028ms. | `e9de9ec5`, `2a17f67b`, register closeout commit | `codex/rabbi-helper-tool-scope-20260708` pushed with latest closeout commit in branch history | Deploy/live smoke still required before Done; release gate is blocked by unrelated dirty Rabbi/helper/setup work in this shared worktree. |

## Final Audit

| ID | Status | Evidence | Files changed | Verification | Remaining issue |
|---|---|---|---|---|---|
| REQ-20260708-080 | Done | `ops/performance-audits/2026-07-08-app-backend-helper-performance/before-report.md`; `ops/prompt-packets/2026-07-08-app-backend-helper-performance/00-current-state-performance-audit.product-quality.json` | `scripts/audit-app-helper-performance.mjs`; PQC packet | PASS PQC validation; baseline live audit recorded `/operations` median 1156ms, 2,357,206 bytes, `Cache-Control: no-store`; helper paths were deterministic and sub-400ms on live baseline. | None for audit. |
| REQ-20260708-078 | Done | `ops/performance-audits/2026-07-08-app-backend-helper-performance/report.md`; `ops/performance-audits/2026-07-08-app-backend-helper-performance/local-after-report.md`; live header readback | `server.js`; `tests/bna-helper-tools.test.js`; `scripts/railway-redeploy.ps1`; `scripts/release-captain.mjs` | PASS `node --check server.js`; PASS `node --test tests/bna-helper-tools.test.js`; PASS `npm run one-time:target:guard`; PASS `npm run app:smoke:onetime-separate-instance -- https://join.onetimeonetime.com`; PASS live readback for `/operations` and `/operations.html`; PASS live performance audit. | The first fix is live, but `/operations` remains the slowest measured path because the shell is still 2.35MB. Next batch: split/lazy-load the Operations shell. |
| REQ-20260708-079 | Done | `ops/performance-audits/2026-07-08-app-backend-helper-performance/report.md`; `ops/performance-audits/2026-07-08-app-backend-helper-performance/local-after-report.md` | `src/lib/bna/helper/planner.js`; `scripts/audit-app-helper-performance.mjs`; `tests/bna-helper-tools.test.js` | PASS `node --check src/lib/bna/helper/planner.js`; PASS `node --check scripts/audit-app-helper-performance.mjs`; PASS helper tests; PASS live audit with raw slowness wording. | None for this safe fast path. Do not downgrade helper reasoning/model quality; keep optimizing deterministic routing and measured UX waits. |
| REQ-20260708-086 | Committed/pushed; deploy pending | `ops/performance-audits/2026-07-08-app-backend-helper-performance/local-before-split-report.md`; `ops/performance-audits/2026-07-08-app-backend-helper-performance/local-after-split-report.md`; `ops/performance-audits/2026-07-08-app-backend-helper-performance/report.md` | `public/operations.html`; `public/operations-bootstrap.html`; `public/css/operations-shell.css`; `public/js/operations-shell.js`; `server.js`; `scripts/split-operations-shell.mjs`; `tests/operations-shell-navigation-contract.test.js`; `tests/operations-pwa-login.test.js`; `tests/bna-helper-tools.test.js` | PASS `node --check server.js`; PASS `node --check public/js/operations-shell.js`; PASS `node --check scripts/split-operations-shell.mjs`; PASS `node --test tests/operations-shell-navigation-contract.test.js tests/bna-helper-tools.test.js`; PASS `node --test tests/operations-pwa-login.test.js tests/pwa-separation-contract.test.js tests/one-time-operations-ui-smoke.test.js`; PASS `npm run watchdog:protocol-drift`; `npm run one-time:target:guard` live readbacks passed but release gate blocked deploy because the worktree is intentionally dirty during local verification. | Cold browser load still downloads/parses the 2.10MB external JS; next true lazy-module batch should split view modules from `operations-shell.js`. Deploy/live smoke still required before Done. |
