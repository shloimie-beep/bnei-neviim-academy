# Evidence

Initial evidence:

- `raw-input/RAW-20260712-004-onetime-crm-portal-production-correction-source.txt`
- `raw-input/RAW-20260712-004-onetime-crm-portal-production-correction.md`
- `tasks-pending/2026-07-12-onetime-crm-portal-production-correction.md`
- `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/source-statement-matrix.json`
- `ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/MANIFEST.md`
- `ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/00-control-tower.product-quality.json`
- `ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/01-current-state-visual-audit.product-quality.json`
- `ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/report.md`
- `ops/surface-maps/2026-07-12-onetime-crm-portal-surface-map.md`
- `ops/product-quality-compiler/validation/latest-product-quality-validation.md`
- `ops/product-quality-compiler/validation/latest-product-quality-validation.json`

Validation evidence:

- PASS `npm run pqc:validate` for `00-control-tower.product-quality.json` and
  `01-current-state-visual-audit.product-quality.json`.
- PASS `npm run bna:run:validate`.

REQ-20260712-102 regenerated current-state audit evidence:

- `ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/report.md`
- `ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/authenticated-current-state-attempt/report.md` - 35 redacted screenshots; Operations login and admin-provider session were available.
- `ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/rabbi-current-state/report.md` - 80 screenshots across 16 routes and five viewports; 5 VQ findings.
- `ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/parallel-frontend-current-state/report.md` - 45 checks and 140 screenshots/crops; 28 VQ findings.
- `ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/operations-ui-local/report.md`
- `ops/ui-audits/2026-07-12-onetime-crm-portal-production-correction/final-ui-local/qa-harness-local-report.md`
- `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/report.md`
- `ops/ui-audits/2026-07-09-onetime-provider-crm-layout-local/report.md`
- `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/live-performance-baseline/report.md`

REQ-20260712-102 residual limitations:

- Original six source PNG files from `/workspace/scratch/ffef2e71fe52/upload/` remain unavailable for direct before/after comparison.
- Regenerated browser evidence is untrusted evidence and does not approve sends, payments, access grants, DNS/account/provider writes, production data mutation, or protocol changes.
- Some live captures show loading or permission-gated states. Focused implementation smokes must prove the relevant populated state before downstream UI requirements are Done.

REQ-20260712-103 local implementation evidence:

- `server.js` - signed View-as Rabbi token verification now requires `ONE_TIME_PROJECT_KEY`; view-as requests are applied before normal admin auth; conflicting workspace/project hints return 403; non-read methods return 403; `opsScopeProjectKey(req)` returns the One Time project while view-as is active; `/api/bna/auth/me` returns the view-as Rabbi identity.
- `public/provider.html` - provider-page API requests forward `X-One-Time-View-As-Token` when the signed view-as token is present.
- `tests/one-time-view-as-scope-contract.test.js` - contract coverage for the server-side view-as scoping/read-only path and frontend token forwarding.

REQ-20260712-103 release evidence still required:

- Scoped commit/push.
- Deploy through the approved release path.
- Live smoke/readback for view-as `/api/bna/auth/me`, cross-workspace denial, and read-only mutation denial.

REQ-20260712-104 local implementation evidence:

- `src/lib/bna/crm-contact-model.js` - internal CRM table/source keys are mapped to human labels before reaching cards/filter options.
- `tests/crm-contact-model.test.js` - verifies source label mapping hides `bna_*` table names.
- `tests/rabbi-scheller-tenant-isolation-contract.test.js` - pins CRM contacts, timelines, and communications to explicit workspace/project scope and rejects same-email broadening as a query strategy.
- `ops/crm-scope-reports/2026-07-12-onetime-crm-isolation-local.md`
- `ops/crm-scope-reports/2026-07-12-onetime-crm-isolation-local.json`

REQ-20260712-104 release evidence still required:

- Scoped commit/push.
- Deploy through the approved release path.
- Live redacted CRM list/detail/timeline scope smoke.

REQ-20260712-105 local implementation evidence:

- `server.js` - CRM list route now passes `limit`/`cursor`; source fetches are capped by cursor window; selected-contact timeline remains separate.
- `src/lib/bna/crm-contact-model.js` - default/max page size, base64url cursor encode/decode, page metadata, and page-sized card return.
- `tests/crm-contact-model.test.js` - verifies default 50, max 100, cursor paging, and a 10,000-contact fixture returning 50 cards.
- `tests/rabbi-scheller-tenant-isolation-contract.test.js` - pins bounded API route/source query contract.
- `ops/crm-scope-reports/2026-07-12-onetime-crm-api-pagination-local.md`
- `ops/crm-scope-reports/2026-07-12-onetime-crm-api-pagination-local.json`

REQ-20260712-105 release evidence still required:

- Production-like database `EXPLAIN`/readback for the scoped One Time CRM list.
- Live first-page, next-cursor, and selected-contact timeline smoke.
- Scoped commit/push/deploy.

REQ-20260712-106 local implementation evidence:

- `ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/02-crm-frontend-performance.product-quality.json` - focused Product Quality Compiler packet validated before implementation.
- `public/operations.html` - monolith fallback CRM list/detail loader now uses abortable CRM API calls, debounced search, scoped panel refresh, a 50-card frontend cap, query cache, and lazy legacy review table construction.
- `public/js/operations-shell.js` - split `/operations` shell has the same CRM list/detail loader behavior and the shell-local helper coverage needed for the actual production route.
- `scripts/smoke-onetime-operations-crm-workbench-local.mjs` - synthetic local smoke now covers both split shell and monolith across five viewports, records CRM request/card/root-render/debounce/lazy-table metrics, and performs no external writes.
- `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/report.md`
- `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/report.json`

REQ-20260712-106 release/performance evidence still required:

- Scoped commit/push/deploy and authenticated live smoke remain under `REQ-20260712-112`.
- The Operations split-shell byte-budget assertion is pre-existing (`HEAD` is about 1.211 MB against a 1.2 MB ceiling; this local batch is about 1.227 MB) and remains performance-budget work under `REQ-20260712-111`.

REQ-20260712-107 local implementation evidence:

- `ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/03-crm-inbox-ui.product-quality.json` - focused Product Quality Compiler packet validated before implementation.
- `public/operations.html` - monolith fallback now renders CRM as contact list, activity/conversation, and profile panes with mobile selected-contact Back flow and locked safe action controls.
- `public/js/operations-shell.js` - split `/operations` shell has matching CRM panes, Back flow, disabled/no-send controls, and the missing split-shell `rerenderOperationsApp()` helper needed by the scoped inbox path.
- `public/js/operations-deferred-renderers.js` - scoped One Time Inbox shows selected CRM contact context, Rabbi/One Time scope, provider/project metadata, and send gates.
- `public/css/operations-shell.css` - split-shell CRM pane/mobile selected state styling.
- `ops/action-registry/actions.json` - registry rows for Back to contacts, Open scoped inbox, locked reply draft, locked internal note, and locked task preview.
- `scripts/smoke-onetime-operations-crm-workbench-local.mjs` - smoke asserts three CRM panes, mobile Back flow, disabled write controls, scoped One Time Inbox context, and no external writes.
- `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/report.md`
- `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/report.json`
- `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/split-shell-desktop-1024-one-time-inbox.png`

REQ-20260712-107 release/performance evidence still required:

- Scoped commit/push/deploy and authenticated live smoke remain under `REQ-20260712-112`.
- The Operations split-shell byte-budget assertion remains performance-budget work under `REQ-20260712-111`.

REQ-20260712-108 local implementation evidence:

- `ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/04-portal-shell-preview.product-quality.json` - focused Product Quality Compiler packet validated before portal implementation.
- `public/css/one-time-portal-shell.css` - shared preview banner, real menu button, mobile menu/backdrop, and pseudo-hamburger suppression styles.
- `public/js/one-time-portal-shell.js` - shared UI-only portal shell normalizer for Family Portal labels, parent setup/reset labels, TEST preview banner, review-link preservation, menu button, Escape close, and focus return.
- `public/rabbi-member.html`, `public/js/rabbi-member.js`, `public/member-library.html`, `public/one-time-classroom.html`, `public/one-time-parent.html`, `public/one-time-parent-review.html`, and `public/student.html` - portal label, shell, review-mode, and script/style wiring.
- `ops/action-registry/actions.json` - registry rows for the shared portal menu toggle and Exit Preview action.
- `scripts/smoke-onetime-portal-shell-local.mjs` - local static/browser smoke using TEST/example.test fixture data and a local One Time instance-config response.
- `ops/ui-audits/2026-07-12-onetime-portal-shell-local/report.md`
- `ops/ui-audits/2026-07-12-onetime-portal-shell-local/report.json`
- Screenshots: `family-preview-1440.png`, `library-preview-1024.png`, `classroom-preview-768.png`, `parent-setup-430.png`, `student-preview-390.png`, and `family-preview-mobile-menu-390.png`.

REQ-20260712-108 release/performance evidence still required:

- Scoped commit/push/deploy and live portal smoke remain under `REQ-20260712-112`.
- Bundle/performance budgets remain under `REQ-20260712-111`.

REQ-20260712-109 local implementation evidence:

- `ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/05-landing-whatsapp-launcher.product-quality.json` - focused Product Quality Compiler packet validated before editing the public landing launcher.
- `ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/05-landing-whatsapp-launcher.md`
- `public/one-time/index.html` - removes the public BNA helper scripts and adds one accessible same-origin WhatsApp launcher.
- `ops/action-registry.json` - archives the public helper action from the landing action set and records the active runtime WhatsApp launcher action.
- `tests/one-time-brand-helper-isolation.test.js` - covers public helper removal, direct launcher contract, action registry status, no hard-coded `wa.me`, and server no-send/readiness expectations.
- `scripts/smoke-onetime-landing-whatsapp-local.mjs` - local static/browser smoke using a fake smoke WhatsApp number only.
- `ops/ui-audits/2026-07-12-onetime-landing-whatsapp-local/report.md`
- `ops/ui-audits/2026-07-12-onetime-landing-whatsapp-local/report.json`
- Screenshots: `landing-whatsapp-1440.png`, `landing-whatsapp-1024.png`, `landing-whatsapp-768.png`, `landing-whatsapp-430.png`, and `landing-whatsapp-390.png`.

REQ-20260712-109 release evidence still required:

- Scoped commit/push/deploy and live public landing smoke remain under `REQ-20260712-112`.
- Live/public environment readback for `ONE_TIME_PUBLIC_WHATSAPP_NUMBER` readiness and redirect behavior remains under `REQ-20260712-112`.

REQ-20260712-110 local implementation evidence:

- `src/lib/bna/provider-lead-bot.js` - deterministic templates are warmer and more natural while safety guardrails remain explicit.
- `tests/service-provider-lead-bot.test.js` - covers natural greeting/unknown/tech/class-link-denial replies plus deterministic safety guardrails.
- `ops/crm-scope-reports/2026-07-12-onetime-whatsapp-assistant-natural-local.md`
- `ops/crm-scope-reports/2026-07-12-onetime-whatsapp-assistant-natural-local.json`

REQ-20260712-110 release evidence still required:

- Scoped commit/push/deploy.
- Live/readback proof that WAPI remains approval-gated and no unapproved send was performed.

REQ-20260712-111 local implementation evidence:

- `ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/06-performance-budgets.product-quality.json` - focused Product Quality Compiler packet validated before performance implementation.
- `ops/prompt-packets/2026-07-12-onetime-crm-portal-production-correction/06-performance-budgets.md`
- `scripts/split-operations-shell.mjs` - split generator deindents generated JS and keeps only startup-safe shared helpers in the shell.
- `public/operations-bootstrap.html`, `public/css/operations-shell.css`, `public/js/operations-shell.js`, and `public/js/operations-deferred-renderers.js` - generated split delivery artifacts. Latest split output: bootstrap 1,688 bytes, shell JS 1,059,582 bytes, deferred JS 820,475 bytes, CSS 221,457 bytes.
- `public/member-library.html` - Vimeo Player API now loads lazily only after a playable Vimeo item is opened, and review/API payloads preserve `vimeo_id`.
- `scripts/smoke-onetime-portal-shell-local.mjs` - local smoke now uses a playable Vimeo fixture and asserts zero Vimeo iframes/requests before Play Video, then `player.vimeo.com` loading after Play Video.
- `ops/performance-audits/2026-07-12-onetime-performance-budget-local/report.md`
- `ops/performance-audits/2026-07-12-onetime-performance-budget-local/report.json`
- `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/report.md`
- `ops/ui-audits/2026-07-10-onetime-crm-workbench-local/report.json`
- `ops/ui-audits/2026-07-12-onetime-portal-shell-local/report.md`
- `ops/ui-audits/2026-07-12-onetime-portal-shell-local/report.json`

REQ-20260712-111 release evidence still required:

- Production Brotli/gzip and `Vary: Accept-Encoding` readback for One Time/BNA domains.
- Live static/fingerprinted cache readback.
- Scoped commit/push/deploy, exact SHA verification, and live app-visible smoke remain under `REQ-20260712-112`.

REQ-20260712-112 release-gate blocker evidence:

- `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/release-gate-dry-run/report.json`
- `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/release-gate-dry-run/report.md`
- `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/release-lane-scope-audit/report.json`
- `ops/execution-runs/2026-07-12-onetime-crm-portal-production-correction/release-lane-scope-audit/report.md`

Release gate dry-run result:

- BLOCKED current HEAD `d68e3f9a3de25c831d18dd42e7b1d3882bd43f2a` is not confirmed pushed to `origin/master`.
- BLOCKED branch `master` is `0` commits ahead and `54` commits behind `origin/master`; the One Time correction work is uncommitted on a stale local base.
- BLOCKED working tree has 100 dirty/untracked paths, so deploy from this mixed worktree is forbidden.
- BLOCKED Railway and Drive external readback gates are not ready.
- No deploy, production mutation, external write, or live verification was performed.

Superseding clean release-lane evidence:

- Release branch `codex/onetime-crm-portal-release-20260712` was created from current `origin/master`.
- Scoped One Time changes were committed and pushed as implementation commit `833cac222`.
- PASS `npm run bna:release-gate -- --expected-branch codex/onetime-crm-portal-release-20260712`: ready, dry-run mode, HEAD pushed yes, dirty files 0, production mutation performed no.
- REMAINING BLOCKER: production deploy/live verification was not run. It requires explicit release-gate confirmation tokens and Railway/Drive readback completion or approved deferral.
